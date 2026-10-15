import { sqliteService } from './sqlite';
import { DocumentHistoryItem } from '../components/DocumentHistory';
import { DocumentType } from '../components/DocumentTypeSelector';
import { DocumentVersion } from '../components/VersionControl';

export interface SavedDocument {
  id: string;
  user_id?: string;
  type: DocumentType;
  title: string;
  content: string;
  facts: string;
  versions: DocumentVersion[];
  createdAt?: string | Date;
  lastModified?: string | Date;
}

const LOCAL_STORAGE_HISTORY_KEY = 'vakeel_saab_history';

export const documentService = {
  // Fetch history for current advocate (SQLite + Local fallback)
  async getHistory(advocateId?: string): Promise<DocumentHistoryItem[]> {
    if (advocateId) {
      try {
        const sqliteDocs = await sqliteService.getDocuments(advocateId);
        if (sqliteDocs.length > 0) {
          return sqliteDocs.map((d) => ({
            id: d.id,
            title: d.title,
            type: d.type as DocumentType,
            createdAt: new Date(d.createdAt),
            lastModified: new Date(d.lastModified),
            preview: (d.content || '').replace(/<[^>]*>/g, '').substring(0, 150),
          }));
        }
      } catch (e) {
        console.warn('Could not read from SQLite, falling back to local cache', e);
      }
    }

    // LocalStorage Fallback
    const saved = localStorage.getItem(LOCAL_STORAGE_HISTORY_KEY);
    if (!saved) return [];

    try {
      const parsed = JSON.parse(saved);
      return parsed.map((doc: any) => ({
        ...doc,
        createdAt: new Date(doc.createdAt),
        lastModified: new Date(doc.lastModified),
      }));
    } catch {
      return [];
    }
  },

  // Save single document to SQLite & Local cache
  async saveDocument(doc: SavedDocument, advocateId?: string): Promise<void> {
    // 1. Cache locally
    localStorage.setItem(`doc-${doc.id}`, JSON.stringify(doc));

    // 2. If logged in, save to SQLite database
    if (advocateId) {
      try {
        await sqliteService.saveDocument({
          id: doc.id,
          advocateId,
          type: doc.type,
          title: doc.title,
          content: doc.content,
          facts: doc.facts,
          versions: doc.versions,
          createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : undefined,
          lastModified: doc.lastModified ? new Date(doc.lastModified).toISOString() : undefined,
        });
      } catch (err) {
        console.warn('Failed to save to SQLite database:', err);
      }
    }
  },

  // Delete document
  async deleteDocument(docId: string, advocateId?: string): Promise<void> {
    localStorage.removeItem(`doc-${docId}`);

    if (advocateId) {
      try {
        await sqliteService.deleteDocument(docId, advocateId);
      } catch (err) {
        console.warn('Failed to delete from SQLite:', err);
      }
    }
  },

  // Sync all local drafts to user's SQLite database
  async syncLocalDraftsToSqlite(advocateId: string): Promise<number> {
    if (!advocateId) return 0;

    const savedHistory = localStorage.getItem(LOCAL_STORAGE_HISTORY_KEY);
    if (!savedHistory) return 0;

    try {
      const items: DocumentHistoryItem[] = JSON.parse(savedHistory);
      let syncedCount = 0;

      for (const item of items) {
        const fullDocData = localStorage.getItem(`doc-${item.id}`);
        if (fullDocData) {
          const parsed = JSON.parse(fullDocData);
          await sqliteService.saveDocument({
            id: item.id,
            advocateId,
            type: parsed.type || item.type,
            title: parsed.title || item.title,
            content: parsed.content || '',
            facts: parsed.facts || '',
            versions: parsed.versions || [],
            createdAt: item.createdAt ? new Date(item.createdAt).toISOString() : undefined,
            lastModified: item.lastModified ? new Date(item.lastModified).toISOString() : undefined,
          });
          syncedCount++;
        }
      }

      return syncedCount;
    } catch (e) {
      console.error('Error during local to SQLite sync:', e);
      return 0;
    }
  },

  // Download the SQLite database binary file
  downloadSqliteDatabase(): void {
    const binary = sqliteService.exportDatabaseBlob();
    if (!binary) {
      alert('SQLite database is initializing or empty.');
      return;
    }

    const blob = new Blob([binary], { type: 'application/x-sqlite3' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vakeel_saab_court_${new Date().toISOString().split('T')[0]}.sqlite`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },
};
