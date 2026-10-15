import { supabase, isSupabaseConfigured } from './supabase';
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
  // Fetch history for current user (Cloud + Local fallback)
  async getHistory(userId?: string): Promise<DocumentHistoryItem[]> {
    if (isSupabaseConfigured && supabase && userId) {
      try {
        const { data, error } = await supabase
          .from('documents')
          .select('id, title, type, created_at, last_modified, content')
          .eq('user_id', userId)
          .order('last_modified', { ascending: false });

        if (!error && data && data.length > 0) {
          return data.map((d) => ({
            id: d.id,
            title: d.title,
            type: d.type as DocumentType,
            createdAt: new Date(d.created_at),
            lastModified: new Date(d.last_modified),
            preview: (d.content || '').replace(/<[^>]*>/g, '').substring(0, 150),
          }));
        }
      } catch (e) {
        console.warn('Could not fetch cloud history, falling back to local storage', e);
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

  // Save single document to Cloud & Local cache
  async saveDocument(doc: SavedDocument, userId?: string): Promise<void> {
    // 1. Cache locally
    localStorage.setItem(`doc-${doc.id}`, JSON.stringify(doc));

    // 2. If logged in with Supabase, sync to cloud
    if (isSupabaseConfigured && supabase && userId) {
      try {
        await supabase.from('documents').upsert({
          id: doc.id,
          user_id: userId,
          type: doc.type,
          title: doc.title,
          content: doc.content,
          facts: doc.facts,
          versions: doc.versions,
          last_modified: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('Failed to sync document to cloud:', err);
      }
    }
  },

  // Delete document
  async deleteDocument(docId: string, userId?: string): Promise<void> {
    localStorage.removeItem(`doc-${docId}`);

    if (isSupabaseConfigured && supabase && userId) {
      try {
        await supabase.from('documents').delete().eq('id', docId).eq('user_id', userId);
      } catch (err) {
        console.warn('Failed to delete cloud document:', err);
      }
    }
  },

  // Sync all local drafts to user's cloud account
  async syncLocalDraftsToCloud(userId: string): Promise<number> {
    if (!isSupabaseConfigured || !supabase || !userId) return 0;

    const savedHistory = localStorage.getItem(LOCAL_STORAGE_HISTORY_KEY);
    if (!savedHistory) return 0;

    try {
      const items: DocumentHistoryItem[] = JSON.parse(savedHistory);
      let syncedCount = 0;

      for (const item of items) {
        const fullDocData = localStorage.getItem(`doc-${item.id}`);
        if (fullDocData) {
          const parsed = JSON.parse(fullDocData);
          await supabase.from('documents').upsert({
            id: item.id,
            user_id: userId,
            type: parsed.type || item.type,
            title: parsed.title || item.title,
            content: parsed.content || '',
            facts: parsed.facts || '',
            versions: parsed.versions || [],
            created_at: item.createdAt ? new Date(item.createdAt).toISOString() : new Date().toISOString(),
            last_modified: item.lastModified ? new Date(item.lastModified).toISOString() : new Date().toISOString(),
          });
          syncedCount++;
        }
      }

      return syncedCount;
    } catch (e) {
      console.error('Error during local to cloud sync:', e);
      return 0;
    }
  },
};
