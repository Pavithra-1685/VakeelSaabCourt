import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  LogOut,
  ChevronDown,
  Award,
  Building2,
  Database,
  Download,
  Edit3,
  X
} from 'lucide-react';

interface UserProfileMenuProps {
  onSyncDrafts?: () => void;
  syncCount?: number;
  showJoinButton?: boolean;
}

export function UserProfileMenu({ onSyncDrafts, syncCount = 0, showJoinButton = false }: UserProfileMenuProps) {
  const {
    profile,
    isAuthenticated,
    openAuthModal,
    signOut,
    updateProfile,
    isSqliteReady,
    downloadSqliteBackup
  } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Edit profile states
  const [editName, setEditName] = useState('');
  const [editBarNo, setEditBarNo] = useState('');
  const [editJurisdiction, setEditJurisdiction] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const openEditModal = () => {
    if (profile) {
      setEditName(profile.fullName || '');
      setEditBarNo(profile.barCouncilNo || '');
      setEditJurisdiction(profile.courtJurisdiction || 'High Court of Delhi');
      setIsEditModalOpen(true);
      setIsOpen(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await updateProfile({
      fullName: editName,
      barCouncilNo: editBarNo,
      courtJurisdiction: editJurisdiction,
    });
    setIsSaving(false);
    setIsEditModalOpen(false);
  };

  // If not authenticated, render Sign In (and optionally Join Chambers) CTA buttons
  if (!isAuthenticated || !profile) {
    return (
      <div className="flex items-center gap-3">
        <button
          onClick={() => openAuthModal('login')}
          className="px-4 py-2 text-xs font-medium text-[var(--matte-black)] hover:text-[var(--gold-dark)] transition-colors border border-transparent hover:border-[var(--grey-300)]"
        >
          Sign In
        </button>
        {showJoinButton && (
          <button
            onClick={() => openAuthModal('register')}
            className="px-4 py-2 text-xs font-medium bg-[var(--matte-black)] text-[var(--pure-white)] border border-[var(--matte-black)] hover:bg-[var(--gold-dark)] hover:border-[var(--gold-dark)] transition-colors"
          >
            Join Chambers
          </button>
        )}
      </div>
    );
  }

  // Get initials from advocate name
  const initials = profile.fullName
    .replace(/^Adv\.?\s+/i, '')
    .split(' ')
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'AD';

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 p-1.5 pl-2 rounded border border-[var(--grey-300)] hover:border-[var(--matte-black)] bg-[var(--pure-white)] transition-all text-left"
      >
        <div className="w-8 h-8 rounded-full bg-[var(--matte-black)] text-[var(--gold)] flex items-center justify-center text-xs font-bold border border-[var(--gold)]/30 flex-shrink-0">
          {initials}
        </div>

        <div className="hidden sm:flex flex-col pr-1">
          <span className="text-xs font-medium text-[var(--matte-black)] leading-tight max-w-[140px] truncate">
            {profile.fullName}
          </span>
          <span className="text-[10px] text-[var(--grey-600)] leading-tight flex items-center gap-1">
            {profile.barCouncilNo ? profile.barCouncilNo : profile.courtJurisdiction || 'Advocate'}
          </span>
        </div>

        <ChevronDown className={`w-3.5 h-3.5 text-[var(--grey-600)] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Profile Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-[var(--pure-white)] border border-[var(--grey-300)] shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150">
          {/* Header Info */}
          <div className="p-4 border-b border-[var(--grey-300)] bg-[var(--grey-100)]/50">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-[var(--matte-black)]" style={{ fontFamily: 'var(--font-heading)' }}>
                  {profile.fullName}
                </p>
                <p className="text-xs text-[var(--grey-600)] mt-0.5">{profile.email}</p>
              </div>
              <span className="px-2 py-0.5 text-[9px] uppercase tracking-wider font-semibold bg-[var(--gold)]/20 text-[var(--gold-dark)] border border-[var(--gold)]/30 rounded">
                Verified
              </span>
            </div>

            <div className="mt-3 space-y-1.5 text-xs text-[var(--grey-600)] border-t border-[var(--grey-300)]/60 pt-2.5">
              <div className="flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-[var(--gold)] flex-shrink-0" />
                <span>Bar Enr: <strong>{profile.barCouncilNo || 'Not specified'}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-[var(--gold)] flex-shrink-0" />
                <span className="truncate">{profile.courtJurisdiction || 'High Court of Delhi'}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px]">
                <Database className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span className="text-emerald-700 font-medium">
                  {isSqliteReady ? 'In-Browser SQLite Active' : 'Initializing SQLite...'}
                </span>
              </div>
            </div>
          </div>

          {/* Action Links */}
          <div className="p-2 space-y-1">
            <button
              onClick={openEditModal}
              className="w-full px-3 py-2 text-xs text-[var(--matte-black)] hover:bg-[var(--grey-100)] flex items-center gap-2.5 transition-colors text-left"
            >
              <Edit3 className="w-4 h-4 text-[var(--grey-600)]" />
              Edit Chambers Details
            </button>

            {onSyncDrafts && (
              <button
                onClick={() => {
                  onSyncDrafts();
                  setIsOpen(false);
                }}
                className="w-full px-3 py-2 text-xs text-[var(--matte-black)] hover:bg-[var(--grey-100)] flex items-center justify-between transition-colors text-left"
              >
                <div className="flex items-center gap-2.5">
                  <Database className="w-4 h-4 text-[var(--gold)]" />
                  <span>Sync Drafts to SQLite</span>
                </div>
                {syncCount > 0 && (
                  <span className="px-1.5 py-0.5 bg-[var(--matte-black)] text-white text-[10px] rounded-full">
                    {syncCount}
                  </span>
                )}
              </button>
            )}

            <button
              onClick={() => {
                downloadSqliteBackup();
                setIsOpen(false);
              }}
              className="w-full px-3 py-2 text-xs text-[var(--matte-black)] hover:bg-[var(--grey-100)] flex items-center gap-2.5 transition-colors text-left"
            >
              <Download className="w-4 h-4 text-[var(--gold)]" />
              <span>Export SQLite DB (.sqlite)</span>
            </button>

            <div className="border-t border-[var(--grey-300)] my-1" />

            <button
              onClick={() => {
                signOut();
                setIsOpen(false);
              }}
              className="w-full px-3 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors text-left"
            >
              <LogOut className="w-4 h-4 text-red-600" />
              Sign Out of Chambers
            </button>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-sm bg-[var(--pure-white)] text-[var(--matte-black)] border border-[var(--grey-300)] shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--grey-300)]">
              <h3 className="font-medium text-base" style={{ fontFamily: 'var(--font-heading)' }}>
                Edit Chambers Credentials
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-[var(--grey-600)] hover:text-[var(--matte-black)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3.5 mt-4">
              <div>
                <label className="text-xs font-medium text-[var(--grey-600)]">Advocate Full Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-xs border border-[var(--grey-300)] focus:border-[var(--matte-black)] outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium text-[var(--grey-600)]">Bar Council Enrollment Number</label>
                <input
                  type="text"
                  value={editBarNo}
                  onChange={(e) => setEditBarNo(e.target.value)}
                  placeholder="e.g. D/1482/2016"
                  className="w-full mt-1 px-3 py-2 text-xs border border-[var(--grey-300)] focus:border-[var(--matte-black)] outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-[var(--grey-600)]">Primary Court Jurisdiction</label>
                <input
                  type="text"
                  value={editJurisdiction}
                  onChange={(e) => setEditJurisdiction(e.target.value)}
                  placeholder="e.g. High Court of Delhi"
                  className="w-full mt-1 px-3 py-2 text-xs border border-[var(--grey-300)] focus:border-[var(--matte-black)] outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-3 py-1.5 text-xs border border-[var(--grey-300)] hover:bg-[var(--grey-100)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-1.5 text-xs bg-[var(--matte-black)] text-white hover:bg-[var(--gold-dark)] transition-colors"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
