import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabase';

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
  isSupabaseConfigured: boolean;
  isAuthModalOpen: boolean;
  authModalTab: 'login' | 'register' | 'forgot';
  openAuthModal: (tab?: 'login' | 'register' | 'forgot') => void;
  closeAuthModal: () => void;
  signInWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUpWithEmail: (email: string, password: string, metadata: SignUpMetadata) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null; message?: string }>;
  updateProfile: (updates: Partial<AdvocateProfile>) => Promise<{ error: Error | null }>;
}

const LOCAL_STORAGE_SESSION_KEY = 'vakeel_saab_current_user';
const LOCAL_STORAGE_USERS_KEY = 'vakeel_saab_registered_advocates';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [profile, setProfile] = useState<AdvocateProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register' | 'forgot'>('login');

  const openAuthModal = useCallback((tab: 'login' | 'register' | 'forgot' = 'login') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  // Helper to fetch or assemble advocate profile
  const fetchProfile = useCallback(async (userId: string, userEmail: string, metadata?: any) => {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (data && !error) {
          return {
            id: data.id,
            email: data.email || userEmail,
            fullName: data.full_name || metadata?.full_name || metadata?.fullName || userEmail.split('@')[0],
            barCouncilNo: data.bar_council_no || metadata?.bar_council_no || metadata?.barCouncilNo || '',
            courtJurisdiction: data.court_jurisdiction || metadata?.court_jurisdiction || metadata?.courtJurisdiction || 'High Court of Delhi',
            avatarUrl: data.avatar_url || metadata?.avatar_url,
            createdAt: data.created_at || new Date().toISOString(),
          };
        }
      } catch {
        // Fallback to metadata if table query fails
      }
    }

    // Default or Local Storage Profile
    return {
      id: userId,
      email: userEmail,
      fullName: metadata?.fullName || metadata?.full_name || (userEmail ? `Adv. ${userEmail.split('@')[0]}` : 'Advocate'),
      barCouncilNo: metadata?.barCouncilNo || metadata?.bar_council_no || 'D/2024/01',
      courtJurisdiction: metadata?.courtJurisdiction || metadata?.court_jurisdiction || 'High Court of Delhi',
      avatarUrl: metadata?.avatarUrl || metadata?.avatar_url || '',
      createdAt: new Date().toISOString(),
    };
  }, []);

  // Initialize Session
  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      try {
        // Check for Google OAuth hash callback
        if (window.location.hash && window.location.hash.includes('access_token')) {
          const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
          const accessToken = hashParams.get('access_token');
          if (accessToken) {
            try {
              const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${accessToken}` },
              });
              if (res.ok) {
                const gUser = await res.json();
                const googleProfile: AdvocateProfile = {
                  id: `google-${gUser.sub}`,
                  email: gUser.email,
                  fullName: gUser.name ? `Adv. ${gUser.name}` : (gUser.email ? `Adv. ${gUser.email.split('@')[0]}` : 'Advocate'),
                  barCouncilNo: '', // Real advocate can set their real Bar number in settings
                  courtJurisdiction: 'High Court of Delhi',
                  avatarUrl: gUser.picture || '',
                  createdAt: new Date().toISOString(),
                };
                if (isMounted) {
                  setUser({ id: googleProfile.id, email: googleProfile.email });
                  setProfile(googleProfile);
                  localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify(googleProfile));
                  window.history.replaceState(null, '', window.location.pathname + window.location.search);
                  setIsLoading(false);
                  return;
                }
              }
            } catch (err) {
              console.error('Error fetching Google userinfo:', err);
            }
          }
        }

        if (isSupabaseConfigured && supabase) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user && isMounted) {
            setUser({ id: session.user.id, email: session.user.email || '' });
            const prof = await fetchProfile(session.user.id, session.user.email || '', session.user.user_metadata);
            if (isMounted) setProfile(prof);
          }

          // Listen for Supabase auth state change
          const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
            if (!isMounted) return;
            if (newSession?.user) {
              setUser({ id: newSession.user.id, email: newSession.user.email || '' });
              const prof = await fetchProfile(newSession.user.id, newSession.user.email || '', newSession.user.user_metadata);
              setProfile(prof);
            } else {
              setUser(null);
              setProfile(null);
            }
          });

          return () => {
            authListener?.subscription.unsubscribe();
          };
        } else {
          // Local storage session fallback
          const localSession = localStorage.getItem(LOCAL_STORAGE_SESSION_KEY);
          if (localSession && isMounted) {
            try {
              const parsed = JSON.parse(localSession);
              // Clean up stale mock demo user if present
              if (parsed.email === 'advocate.counsel@gmail.com' || parsed.barCouncilNo === 'SC/2023/104') {
                localStorage.removeItem(LOCAL_STORAGE_SESSION_KEY);
                setUser(null);
                setProfile(null);
              } else {
                setUser({ id: parsed.id, email: parsed.email });
                setProfile(parsed);
              }
            } catch (e) {
              console.error('Failed to parse local session', e);
            }
          }
        }
      } catch (err) {
        console.error('Error initializing authentication:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    initAuth();

    return () => {
      isMounted = false;
    };
  }, [fetchProfile]);

  // Sign In with Email & Password
  const signInWithEmail = async (email: string, password: string): Promise<{ error: Error | null }> => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return { error };

        if (data.user) {
          const prof = await fetchProfile(data.user.id, data.user.email || email, data.user.user_metadata);
          setUser({ id: data.user.id, email: data.user.email || email });
          setProfile(prof);
          closeAuthModal();
        }
        return { error: null };
      } else {
        // Local mode sign in
        const existingUsersRaw = localStorage.getItem(LOCAL_STORAGE_USERS_KEY);
        const existingUsers: any[] = existingUsersRaw ? JSON.parse(existingUsersRaw) : [];
        const match = existingUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());

        let signedInProfile: AdvocateProfile;
        if (match) {
          signedInProfile = match;
        } else {
          // Allow seamless sign in with demo credentials
          signedInProfile = {
            id: `adv-${Date.now()}`,
            email,
            fullName: `Adv. ${email.split('@')[0]}`,
            barCouncilNo: 'D/2024/789',
            courtJurisdiction: 'High Court of Delhi',
            createdAt: new Date().toISOString(),
          };
          existingUsers.push(signedInProfile);
          localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(existingUsers));
        }

        setUser({ id: signedInProfile.id, email: signedInProfile.email });
        setProfile(signedInProfile);
        localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify(signedInProfile));
        closeAuthModal();
        return { error: null };
      }
    } catch (err: any) {
      return { error: err };
    } finally {
      setIsLoading(false);
    }
  };

  // Sign Up with Email, Password & Advocate Metadata
  const signUpWithEmail = async (
    email: string,
    password: string,
    metadata: SignUpMetadata
  ): Promise<{ error: Error | null }> => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: metadata.fullName,
              bar_council_no: metadata.barCouncilNo,
              court_jurisdiction: metadata.courtJurisdiction,
            },
          },
        });

        if (error) return { error };

        if (data.user) {
          // Attempt to create or upsert profile in public.profiles table if exists
          try {
            await supabase.from('profiles').upsert({
              id: data.user.id,
              full_name: metadata.fullName,
              bar_council_no: metadata.barCouncilNo,
              court_jurisdiction: metadata.courtJurisdiction,
              created_at: new Date().toISOString(),
            });
          } catch {
            // Profile table may not be configured yet, metadata remains in auth
          }

          const prof: AdvocateProfile = {
            id: data.user.id,
            email: data.user.email || email,
            fullName: metadata.fullName,
            barCouncilNo: metadata.barCouncilNo,
            courtJurisdiction: metadata.courtJurisdiction,
            createdAt: new Date().toISOString(),
          };
          setUser({ id: data.user.id, email: data.user.email || email });
          setProfile(prof);
          closeAuthModal();
        }
        return { error: null };
      } else {
        // Local mode sign up
        const newProfile: AdvocateProfile = {
          id: `adv-${Date.now()}`,
          email,
          fullName: metadata.fullName || `Adv. ${email.split('@')[0]}`,
          barCouncilNo: metadata.barCouncilNo || 'D/2024/001',
          courtJurisdiction: metadata.courtJurisdiction || 'High Court of Delhi',
          createdAt: new Date().toISOString(),
        };

        const existingUsersRaw = localStorage.getItem(LOCAL_STORAGE_USERS_KEY);
        const existingUsers: any[] = existingUsersRaw ? JSON.parse(existingUsersRaw) : [];
        existingUsers.push(newProfile);
        localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(existingUsers));

        setUser({ id: newProfile.id, email: newProfile.email });
        setProfile(newProfile);
        localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify(newProfile));
        closeAuthModal();
        return { error: null };
      }
    } catch (err: any) {
      return { error: err };
    } finally {
      setIsLoading(false);
    }
  };

  // Sign In with Google
  const signInWithGoogle = async (): Promise<{ error: Error | null }> => {
    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin,
          },
        });
        return { error };
      } else {
        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || localStorage.getItem('vakeel_saab_google_client_id');
        if (clientId) {
          const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` + new URLSearchParams({
            client_id: clientId,
            redirect_uri: window.location.origin,
            response_type: 'token',
            scope: 'openid email profile',
            prompt: 'select_account',
          }).toString();

          window.location.href = authUrl;
          return { error: null };
        } else {
          return {
            error: new Error('GOOGLE_CLIENT_ID_REQUIRED'),
          };
        }
      }
    } catch (err: any) {
      return { error: err };
    }
  };

  // Sign Out
  const signOut = async () => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        await supabase.auth.signOut();
      }
      localStorage.removeItem(LOCAL_STORAGE_SESSION_KEY);
      setUser(null);
      setProfile(null);
    } catch (err) {
      console.error('Error signing out:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset Password
  const resetPassword = async (email: string) => {
    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) return { error };
        return { error: null, message: 'Password reset link sent to your registered email.' };
      } else {
        return {
          error: null,
          message: 'Development Mode: Password reset instructions simulated for ' + email,
        };
      }
    } catch (err: any) {
      return { error: err };
    }
  };

  // Update Profile
  const updateProfile = async (updates: Partial<AdvocateProfile>) => {
    if (!user || !profile) return { error: new Error('User not authenticated') };

    const updatedProfile = { ...profile, ...updates };

    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.from('profiles').upsert({
          id: user.id,
          full_name: updatedProfile.fullName,
          bar_council_no: updatedProfile.barCouncilNo,
          court_jurisdiction: updatedProfile.courtJurisdiction,
          avatar_url: updatedProfile.avatarUrl,
          updated_at: new Date().toISOString(),
        });
        if (error) return { error };
      } else {
        localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify(updatedProfile));
      }

      setProfile(updatedProfile);
      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAuthenticated: Boolean(user),
        isLoading,
        isSupabaseConfigured,
        isAuthModalOpen,
        authModalTab,
        openAuthModal,
        closeAuthModal,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        signOut,
        resetPassword,
        updateProfile,
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
