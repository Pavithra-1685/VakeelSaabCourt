import initSqlJs, { Database } from 'sql.js';

export interface SQLiteAdvocate {
  id: string;
  email: string;
  fullName: string;
  barCouncilNo?: string;
  courtJurisdiction?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface SQLiteDocument {
  id: string;
  advocateId: string;
  type: string;
  title: string;
  content: string;
  facts: string;
  versions: any[];
  createdAt: string;
  lastModified: string;
}

const DB_IDB_STORE = 'vakeel_saab_sqlite_db_v1';
const DB_LOCAL_FALLBACK = 'vakeel_saab_sqlite_binary';

let dbInstance: Database | null = null;
let initPromise: Promise<Database> | null = null;

// IndexedDB Storage Helpers to persist the raw SQLite binary file
function saveBinaryToIndexedDB(binary: Uint8Array): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const request = indexedDB.open('VakeelSaabSQLite', 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('files')) {
          db.createObjectStore('files');
        }
      };
      request.onsuccess = () => {
        const db = request.result;
        const tx = db.transaction('files', 'readwrite');
        const store = tx.objectStore('files');
        store.put(binary, DB_IDB_STORE);
        tx.oncomplete = () => {
          resolve();
        };
        tx.onerror = () => reject(tx.error);
      };
      request.onerror = () => reject(request.error);
    } catch (e) {
      reject(e);
    }
  });
}

function loadBinaryFromIndexedDB(): Promise<Uint8Array | null> {
  return new Promise((resolve) => {
    try {
      const request = indexedDB.open('VakeelSaabSQLite', 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('files')) {
          db.createObjectStore('files');
        }
      };
      request.onsuccess = () => {
        const db = request.result;
        const tx = db.transaction('files', 'readonly');
        const store = tx.objectStore('files');
        const getReq = store.get(DB_IDB_STORE);
        getReq.onsuccess = () => {
          if (getReq.result instanceof Uint8Array) {
            resolve(getReq.result);
          } else {
            resolve(null);
          }
        };
        getReq.onerror = () => resolve(null);
      };
      request.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

// Simple hash for password demo storage
function simpleHash(pwd: string): string {
  let hash = 0;
  for (let i = 0; i < pwd.length; i++) {
    const char = pwd.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return 'h_' + Math.abs(hash).toString(16);
}

export const sqliteService = {
  async getDb(): Promise<Database> {
    if (dbInstance) return dbInstance;
    if (initPromise) return initPromise;

    initPromise = (async () => {
      const SQL = await initSqlJs({
        locateFile: () => '/sql-wasm.wasm',
      });

      // Try loading existing SQLite binary
      let savedBinary = await loadBinaryFromIndexedDB();
      if (!savedBinary) {
        // Fallback to localStorage check
        const base64 = localStorage.getItem(DB_LOCAL_FALLBACK);
        if (base64) {
          try {
            const binaryString = atob(base64);
            const len = binaryString.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
            savedBinary = bytes;
          } catch {
            // Ignore corrupted localstorage
          }
        }
      }

      const db = savedBinary ? new SQL.Database(savedBinary) : new SQL.Database();

      // Create Tables if not exists
      db.run(`
        CREATE TABLE IF NOT EXISTS advocates (
          id TEXT PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          full_name TEXT NOT NULL,
          bar_council_no TEXT,
          court_jurisdiction TEXT,
          avatar_url TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS legal_documents (
          id TEXT PRIMARY KEY,
          advocate_id TEXT NOT NULL,
          type TEXT NOT NULL,
          title TEXT NOT NULL,
          content TEXT NOT NULL,
          facts TEXT,
          versions_json TEXT DEFAULT '[]',
          created_at TEXT NOT NULL,
          last_modified TEXT NOT NULL
        );

        CREATE INDEX IF NOT EXISTS idx_documents_advocate ON legal_documents(advocate_id);
      `);

      dbInstance = db;
      await this.persist();
      return db;
    })();

    return initPromise;
  },

  async persist(): Promise<void> {
    if (!dbInstance) return;
    try {
      const binary = dbInstance.export();
      await saveBinaryToIndexedDB(binary);
    } catch (e) {
      console.warn('Could not persist to IndexedDB, fallback to localStorage', e);
      try {
        const binary = dbInstance.export();
        let binaryStr = '';
        for (let i = 0; i < binary.length; i++) {
          binaryStr += String.fromCharCode(binary[i]);
        }
        localStorage.setItem(DB_LOCAL_FALLBACK, btoa(binaryStr));
      } catch {
        // storage quota exceeded
      }
    }
  },

  // ── Advocate Authentication Operations ───────────────────

  async registerAdvocate(
    email: string,
    password: string,
    details: { fullName: string; barCouncilNo?: string; courtJurisdiction?: string }
  ): Promise<SQLiteAdvocate> {
    const db = await this.getDb();
    const cleanEmail = email.trim().toLowerCase();

    // Check if email exists
    const stmt = db.prepare('SELECT id FROM advocates WHERE lower(email) = ?');
    stmt.bind([cleanEmail]);
    const exists = stmt.step();
    stmt.free();

    if (exists) {
      throw new Error('An advocate account with this email already exists.');
    }

    const now = new Date().toISOString();
    const id = `adv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const passHash = simpleHash(password);

    db.run(
      `INSERT INTO advocates (id, email, password_hash, full_name, bar_council_no, court_jurisdiction, avatar_url, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        cleanEmail,
        passHash,
        details.fullName.trim(),
        details.barCouncilNo?.trim() || '',
        details.courtJurisdiction?.trim() || 'High Court of Delhi',
        '',
        now,
        now,
      ]
    );

    await this.persist();

    return {
      id,
      email: cleanEmail,
      fullName: details.fullName.trim(),
      barCouncilNo: details.barCouncilNo?.trim() || '',
      courtJurisdiction: details.courtJurisdiction?.trim() || 'High Court of Delhi',
      createdAt: now,
      updatedAt: now,
    };
  },

  async authenticateAdvocate(email: string, password: string): Promise<SQLiteAdvocate> {
    const db = await this.getDb();
    const cleanEmail = email.trim().toLowerCase();
    const passHash = simpleHash(password);

    const stmt = db.prepare('SELECT * FROM advocates WHERE lower(email) = ?');
    stmt.bind([cleanEmail]);

    if (!stmt.step()) {
      stmt.free();
      throw new Error('Invalid email or password. Please verify your credentials.');
    }

    const row: any = stmt.getAsObject();
    stmt.free();

    if (row.password_hash !== passHash) {
      throw new Error('Invalid password. Please try again.');
    }

    return {
      id: row.id,
      email: row.email,
      fullName: row.full_name,
      barCouncilNo: row.bar_council_no,
      courtJurisdiction: row.court_jurisdiction,
      avatarUrl: row.avatar_url,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  },

  async getAdvocateById(id: string): Promise<SQLiteAdvocate | null> {
    const db = await this.getDb();
    const stmt = db.prepare('SELECT * FROM advocates WHERE id = ?');
    stmt.bind([id]);

    if (!stmt.step()) {
      stmt.free();
      return null;
    }

    const row: any = stmt.getAsObject();
    stmt.free();

    return {
      id: row.id,
      email: row.email,
      fullName: row.full_name,
      barCouncilNo: row.bar_council_no,
      courtJurisdiction: row.court_jurisdiction,
      avatarUrl: row.avatar_url,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  },

  async updateAdvocateProfile(id: string, updates: Partial<SQLiteAdvocate>): Promise<SQLiteAdvocate> {
    const db = await this.getDb();
    const current = await this.getAdvocateById(id);
    if (!current) throw new Error('Advocate profile not found.');

    const fullName = updates.fullName ?? current.fullName;
    const barCouncilNo = updates.barCouncilNo ?? current.barCouncilNo ?? '';
    const courtJurisdiction = updates.courtJurisdiction ?? current.courtJurisdiction ?? '';
    const updatedAt = new Date().toISOString();

    db.run(
      `UPDATE advocates 
       SET full_name = ?, bar_council_no = ?, court_jurisdiction = ?, updated_at = ?
       WHERE id = ?`,
      [fullName, barCouncilNo, courtJurisdiction, updatedAt, id]
    );

    await this.persist();

    return {
      ...current,
      fullName,
      barCouncilNo,
      courtJurisdiction,
      updatedAt,
    };
  },

  async checkEmailExists(email: string): Promise<boolean> {
    const db = await this.getDb();
    const stmt = db.prepare('SELECT id FROM advocates WHERE lower(email) = ?');
    stmt.bind([email.trim().toLowerCase()]);
    const exists = stmt.step();
    stmt.free();
    return exists;
  },

  // ── Document Storage in SQLite ────────────────────────────

  async saveDocument(doc: {
    id: string;
    advocateId: string;
    type: string;
    title: string;
    content: string;
    facts: string;
    versions: any[];
    createdAt?: string;
    lastModified?: string;
  }): Promise<void> {
    const db = await this.getDb();
    const now = new Date().toISOString();
    const createdAt = doc.createdAt || now;
    const lastModified = doc.lastModified || now;
    const versionsJson = JSON.stringify(doc.versions || []);

    db.run(
      `INSERT INTO legal_documents (id, advocate_id, type, title, content, facts, versions_json, created_at, last_modified)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         title = excluded.title,
         content = excluded.content,
         facts = excluded.facts,
         versions_json = excluded.versions_json,
         last_modified = excluded.last_modified`,
      [
        doc.id,
        doc.advocateId,
        doc.type,
        doc.title,
        doc.content,
        doc.facts,
        versionsJson,
        createdAt,
        lastModified,
      ]
    );

    await this.persist();
  },

  async getDocuments(advocateId: string): Promise<SQLiteDocument[]> {
    const db = await this.getDb();
    const stmt = db.prepare('SELECT * FROM legal_documents WHERE advocate_id = ? ORDER BY last_modified DESC');
    stmt.bind([advocateId]);

    const docs: SQLiteDocument[] = [];
    while (stmt.step()) {
      const row: any = stmt.getAsObject();
      let versions: any[] = [];
      try {
        versions = JSON.parse(row.versions_json || '[]');
      } catch {
        versions = [];
      }

      docs.push({
        id: row.id,
        advocateId: row.advocate_id,
        type: row.type,
        title: row.title,
        content: row.content,
        facts: row.facts,
        versions,
        createdAt: row.created_at,
        lastModified: row.last_modified,
      });
    }
    stmt.free();
    return docs;
  },

  async deleteDocument(docId: string, advocateId: string): Promise<void> {
    const db = await this.getDb();
    db.run('DELETE FROM legal_documents WHERE id = ? AND advocate_id = ?', [docId, advocateId]);
    await this.persist();
  },

  // Export the raw .sqlite database file for download
  exportDatabaseBlob(): Uint8Array | null {
    if (!dbInstance) return null;
    return dbInstance.export();
  },

  downloadDatabase(filename = `vakeel_saab_${new Date().toISOString().split('T')[0]}.sqlite`): void {
    const binary = this.exportDatabaseBlob();
    if (!binary) {
      alert('SQLite database has not been initialized yet.');
      return;
    }
    const blob = new Blob([binary.buffer as ArrayBuffer], { type: 'application/x-sqlite3' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },
};
