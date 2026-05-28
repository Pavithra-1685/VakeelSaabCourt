import { RotateCcw, X, Clock } from 'lucide-react';

export interface DocumentVersion {
  id: string;
  timestamp: Date;
  label: string;
  contentPreview: string;
}

interface VersionControlProps {
  versions: DocumentVersion[];
  currentVersionId?: string;
  onRestore: (version: DocumentVersion) => void;
  onClose: () => void;
}

function formatTimestamp(date: Date): string {
  // Ensure we have a Date object
  const d = new Date(date);
  return d.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function VersionControl({ versions, currentVersionId, onRestore, onClose }: VersionControlProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[var(--pure-white)] w-full max-w-3xl max-h-[80vh] flex flex-col border border-[var(--grey-300)]">
        <div className="p-6 border-b border-[var(--grey-300)] flex items-center justify-between">
          <div>
            <h2 style={{ fontFamily: 'var(--font-heading)' }} className="text-2xl text-[var(--matte-black)]">
              Version History
            </h2>
            <p className="text-sm text-[var(--grey-600)] mt-1">{versions.length} versions saved</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[var(--grey-100)] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {versions.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-12 h-12 text-[var(--grey-600)] mx-auto mb-3" strokeWidth={1.5} />
              <p className="text-[var(--grey-600)]">No version history yet</p>
              <p className="text-sm text-[var(--grey-600)] mt-1">Versions are saved automatically as you edit</p>
            </div>
          ) : (
            <div className="space-y-4">
              {versions.map((version, index) => {
                const isCurrent = version.id === currentVersionId;
                const isLatest = index === 0;

                return (
                  <div
                    key={version.id}
                    className={`border p-4 transition-colors ${
                      isCurrent
                        ? 'border-[var(--matte-black)] bg-[var(--grey-100)]'
                        : 'border-[var(--grey-300)] hover:border-[var(--grey-600)]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-[var(--matte-black)]">{version.label}</h3>
                          {isLatest && (
                            <span className="text-xs px-2 py-0.5 bg-[var(--matte-black)] text-[var(--pure-white)]">
                              Latest
                            </span>
                          )}
                          {isCurrent && (
                            <span className="text-xs px-2 py-0.5 bg-[var(--grey-600)] text-[var(--pure-white)]">
                              Current
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-[var(--grey-600)]">{formatTimestamp(version.timestamp)}</p>
                      </div>

                      {!isCurrent && (
                        <button
                          onClick={() => onRestore(version)}
                          className="flex items-center gap-2 px-4 py-2 border border-[var(--matte-black)] hover:bg-[var(--matte-black)] hover:text-[var(--pure-white)] transition-colors text-sm"
                        >
                          <RotateCcw className="w-4 h-4" />
                          Restore
                        </button>
                      )}
                    </div>

                    <div className="bg-[var(--pure-white)] border border-[var(--grey-300)] p-3 text-sm text-[var(--grey-600)] line-clamp-3">
                      {version.contentPreview}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
