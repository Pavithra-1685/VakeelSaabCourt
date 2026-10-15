import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { sqliteService, SQLiteAdvocate } from '../services/sqlite';

export interface AdvocateProfile {
  id: string;
  email: string;
  fullName: string;
  barCouncilNo?: string;
  courtJurisdiction?: string;
  avatarUrl?: string;
  createdAt: string;
}

interface SignUpMetadata {
  fullName: string;
  barCouncilNo?: string;
  courtJurisdiction?: string;
}

interface AuthContextType {
  user: { id: string; email: string } | null;
  profile: AdvocateProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isSqliteReady: boolean;
  isAuthModalOpen: boolean;
  authModalTab: 'login' | 'register' | 'forgot';
  openAuthModal: (tab?: 'login' | 'register' | 'forgot') => void;
  closeAuthModal: () => void;
  signInWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUpWithEmail: (email: string, password: string, metadata: SignUpMetadata) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null; message?: string }>;
  updateProfile: (updates: Partial<AdvocateProfile>) => Promise<{ error: Error | null }>;
  downloadSqliteBackup: () => void;
}

const LOCAL_STORAGE_SESSION_KEY = 'vakeel_saab_current_user';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [profile, setProfile] = useState<AdvocateProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSqliteReady, setIsSqliteReady] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register' | 'forgot'>('login');

  const openAuthModal = useCallback((tab: 'login' | 'register' | 'forgot' = 'login') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  // Initialize SQLite WebAssembly Engine & Session
  useEffect(() => {
    let isMounted = true;

    async function initSqliteAuth() {
      try {
        await sqliteService.getDb();
        if (isMounted) setIsSqliteReady(true);

        const localSession = localStorage.getItem(LOCAL_STORAGE_SESSION_KEY);
        if (localSession && isMounted) {
          try {
            const parsed = JSON.parse(localSession);
            // Verify from SQLite database
            const advocate = await sqliteService.getAdvocateById(parsed.id);
            if (advocate) {
              setUser({ id: advocate.id, email: advocate.email });
              setProfile({
                id: advocate.id,
                email: advocate.email,
                fullName: advocate.fullName,
                barCouncilNo: advocate.barCouncilNo,
                courtJurisdiction: advocate.courtJurisdiction,
                avatarUrl: advocate.avatarUrl,
                createdAt: advocate.createdAt,
              });
            } else {
              // Session invalid in SQLite, clear it
              localStorage.removeItem(LOCAL_STORAGE_SESSION_KEY);
              setUser(null);
              setProfile(null);
            }
          } catch (e) {
            console.error('Failed to parse SQLite session', e);
          }
        }
      } catch (err) {
        console.error('Error initializing SQLite database:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    initSqliteAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  // Sign In with SQLite Database
  const signInWithEmail = async (email: string, password: string): Promise<{ error: Error | null }> => {
    setIsLoading(true);
    try {
      const advocate = await sqliteService.authenticateAdvocate(email, password);
      const advocateProfile: AdvocateProfile = {
        id: advocate.id,
        email: advocate.email,
        fullName: advocate.fullName,
        barCouncilNo: advocate.barCouncilNo,
        courtJurisdiction: advocate.courtJurisdiction,
        avatarUrl: advocate.avatarUrl,
        createdAt: advocate.createdAt,
      };

      setUser({ id: advocate.id, email: advocate.email });
      setProfile(advocateProfile);
      localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify(advocateProfile));
      closeAuthModal();
      return { error: null };
    } catch (err: any) {
      return { error: err };
    } finally {
      setIsLoading(false);
    }
  };

  // Sign Up with SQLite Database
  const signUpWithEmail = async (
    email: string,
    password: string,
    metadata: SignUpMetadata
  ): Promise<{ error: Error | null }> => {
    setIsLoading(true);
    try {
      const advocate = await sqliteService.registerAdvocate(email, password, {
        fullName: metadata.fullName,
        barCouncilNo: metadata.barCouncilNo,
        courtJurisdiction: metadata.courtJurisdiction,
      });

      const advocateProfile: AdvocateProfile = {
        id: advocate.id,
        email: advocate.email,
        fullName: advocate.fullName,
        barCouncilNo: advocate.barCouncilNo,
        courtJurisdiction: advocate.courtJurisdiction,
        avatarUrl: advocate.avatarUrl,
        createdAt: advocate.createdAt,
      };

      setUser({ id: advocate.id, email: advocate.email });
      setProfile(advocateProfile);
      localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify(advocateProfile));
      closeAuthModal();
      return { error: null };
    } catch (err: any) {
      return { error: err };
    } finally {
      setIsLoading(false);
    }
  };

  // Sign Out
  const signOut = async () => {
    setIsLoading(true);
    try {
      localStorage.removeItem(LOCAL_STORAGE_SESSION_KEY);
      setUser(null);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset Password via SQLite
  const resetPassword = async (email: string) => {
    try {
      const exists = await sqliteService.checkEmailExists(email);
      if (!exists) {
        return { error: new Error('No registered advocate account found with this email in SQLite.') };
      }
      return {
        error: null,
        message: `SQLite: Password recovery instructions confirmed for registered counsel ${email}.`,
      };
    } catch (err: any) {
      return { error: err };
    }
  };

  // Update Advocate Profile in SQLite
  const updateProfile = async (updates: Partial<AdvocateProfile>) => {
    if (!user || !profile) return { error: new Error('User not authenticated') };

    try {
      const updated = await sqliteService.updateAdvocateProfile(user.id, {
        fullName: updates.fullName,
        barCouncilNo: updates.barCouncilNo,
        courtJurisdiction: updates.courtJurisdiction,
      });

      const updatedProfile: AdvocateProfile = {
        ...profile,
        fullName: updated.fullName,
        barCouncilNo: updated.barCouncilNo,
        courtJurisdiction: updated.courtJurisdiction,
      };

      setProfile(updatedProfile);
      localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify(updatedProfile));
      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  const downloadSqliteBackup = () => {
    const binary = sqliteService.exportDatabaseBlob();
    if (!binary) {
      alert('SQLite database has not been initialized yet.');
      return;
    }
    const blob = new Blob([binary], { type: 'application/x-sqlite3' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vakeel_saab_${new Date().toISOString().split('T')[0]}.sqlite`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAuthenticated: Boolean(user),
        isLoading,
        isSqliteReady,
        isAuthModalOpen,
        authModalTab,
        openAuthModal,
        closeAuthModal,
        signInWithEmail,
        signUpWithEmail,
        signOut,
        resetPassword,
        updateProfile,
        downloadSqliteBackup,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
