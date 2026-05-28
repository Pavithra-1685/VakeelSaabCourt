import { FileText, Copy, Trash2, X, Search, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DocumentType } from './DocumentTypeSelector';

export interface DocumentHistoryItem {
  id: string;
  title: string;
  type: DocumentType;
  createdAt: Date;
  lastModified: Date;
  preview: string;
}

interface DocumentHistoryProps {
  documents: DocumentHistoryItem[];
  onOpen: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

function formatDate(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours === 0) {
      const minutes = Math.floor(diff / (1000 * 60));
      return minutes <= 1 ? 'Just now' : `${minutes}m ago`;
    }
    return `${hours}h ago`;
  }
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export function DocumentHistory({
  documents,
  onOpen,
  onDuplicate,
  onDelete,
  onClose,
}: DocumentHistoryProps) {
  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="h-full flex flex-col bg-[var(--pure-white)] border-l border-[var(--grey-300)] shadow-2xl"
    >
      <div className="p-6 border-b border-[var(--grey-300)] flex items-center justify-between">
        <h2 style={{ fontFamily: 'var(--font-heading)' }} className="text-xl font-medium">
          History
        </h2>
        <button 
          onClick={onClose} 
          className="p-2 hover:bg-[var(--grey-100)] rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4 border-b border-[var(--grey-300)]">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--grey-600)]" />
          <input
            type="text"
            placeholder="Search documents..."
            className="w-full pl-10 pr-4 py-2 bg-[var(--grey-100)] border-none text-sm focus:ring-1 focus:ring-[var(--matte-black)] rounded-sm"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {documents.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-3">
            <Clock className="w-10 h-10 text-[var(--grey-300)]" />
            <p className="text-sm text-[var(--grey-600)]">No history yet. Start drafting!</p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--grey-300)]">
            <AnimatePresence mode="popLayout">
              {documents.map((doc, index) => (
                <motion.div
                  key={doc.id}
                  layout
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.03 }}
                  className="p-4 hover:bg-[var(--grey-100)] transition-colors group cursor-pointer relative"
                  onClick={() => onOpen(doc.id)}
                >
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-medium text-sm text-[var(--matte-black)] truncate flex-1 pr-4">
                      {doc.title}
                    </h3>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDuplicate(doc.id);
                        }}
                        className="p-1.5 hover:bg-[var(--grey-300)] rounded transition-colors"
                        title="Duplicate"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(doc.id);
                        }}
                        className="p-1.5 hover:bg-red-50 text-red-600 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-[var(--grey-600)] line-clamp-2 mb-3 leading-relaxed">
                    {doc.preview || 'Empty draft...'}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-[var(--grey-600)] uppercase tracking-widest font-bold">
                    <span className="bg-[var(--grey-100)] px-1.5 py-0.5 rounded">{doc.type.replace('-', ' ')}</span>
                    <span>{formatDate(doc.lastModified)}</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
}
