'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import type { Profile, UserRole } from '@/lib/supabase/types';

interface AuthContextType {
  user: { id: string; email: string } | null;
  profile: Profile | null;
  isLoading: boolean;
  isLocalMode: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: {
    fullName: string;
    email: string;
    password: string;
    phone: string;
    preferredLanguage: string;
    state: string;
    role: UserRole;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; message: string; error?: string }>;
  switchDemoRole?: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY_SESSION = 'agrocloud_local_session';
const LOCAL_STORAGE_KEY_USERS = 'agrocloud_local_users';

const DEFAULT_DEMO_PROFILE: Profile = {
  id: 'demo-farmer-001',
  full_name: 'Rajesh Kumar Gowda',
  email: 'farmer.rajesh@agrocloud.ai',
  phone: '9845012345',
  preferred_language: 'kn',
  state: 'Karnataka',
  role: 'Farmer',
  avatar_url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const supabase = createClient();
  const isLocalMode = !isSupabaseConfigured;

  // Initialize Auth State
  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      if (isSupabaseConfigured && supabase) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user && isMounted) {
            setUser({ id: session.user.id, email: session.user.email || '' });
            // Fetch profile
            const { data: userProfile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (userProfile && isMounted) {
              setProfile(userProfile);
            }
          }
        } catch (err) {
          console.warn('Supabase auth check failed:', err);
        }
      } else {
        // Local Development Mode: check localStorage session
        try {
          const storedSession = localStorage.getItem(LOCAL_STORAGE_KEY_SESSION);
          if (storedSession) {
            const parsed = JSON.parse(storedSession);
            if (isMounted) {
              setUser({ id: parsed.id, email: parsed.email });
              setProfile(parsed);
            }
          }
        } catch (e) {
          console.warn('Local session load error:', e);
        }
      }

      if (isMounted) {
        setIsLoading(false);
      }
    }

    initAuth();

    if (isSupabaseConfigured && supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          setUser({ id: session.user.id, email: session.user.email || '' });
          const { data: userProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          if (userProfile) setProfile(userProfile);
        } else {
          setUser(null);
          setProfile(null);
        }
      });

      return () => {
        isMounted = false;
        subscription.unsubscribe();
      };
    }

    return () => {
      isMounted = false;
    };
  }, [supabase]);

  // Login handler
  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return { success: false, error: error.message };
        if (data.user) {
          setUser({ id: data.user.id, email: data.user.email || '' });
          const { data: userProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();
          if (userProfile) setProfile(userProfile);
          return { success: true };
        }
        return { success: false, error: 'Authentication failed' };
      } catch (err: unknown) {
        return { success: false, error: err instanceof Error ? err.message : 'Login failed' };
      }
    } else {
      // Local development login
      try {
        const storedUsersRaw = localStorage.getItem(LOCAL_STORAGE_KEY_USERS);
        const storedUsers: Array<Profile & { password?: string }> = storedUsersRaw ? JSON.parse(storedUsersRaw) : [];

        // Check if matching registered user exists
        const matched = storedUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());

        let activeProfile: Profile;
        if (matched) {
          activeProfile = {
            id: matched.id,
            full_name: matched.full_name,
            email: matched.email,
            phone: matched.phone,
            preferred_language: matched.preferred_language,
            state: matched.state,
            role: matched.role,
            avatar_url: matched.avatar_url,
            created_at: matched.created_at,
            updated_at: matched.updated_at,
          };
        } else {
          // If demo credentials or any email provided in local development, create a demo profile
          activeProfile = {
            ...DEFAULT_DEMO_PROFILE,
            email: email,
            full_name: email.split('@')[0].replace(/[._]/g, ' ').toUpperCase(),
          };
        }

        setUser({ id: activeProfile.id, email: activeProfile.email });
        setProfile(activeProfile);
        localStorage.setItem(LOCAL_STORAGE_KEY_SESSION, JSON.stringify(activeProfile));
        return { success: true };
      } catch (e: unknown) {
        return { success: false, error: e instanceof Error ? e.message : 'Local login failed' };
      }
    }
  }, [supabase, isSupabaseConfigured]);

  // Register handler
  const register = useCallback(async (data: {
    fullName: string;
    email: string;
    password: string;
    phone: string;
    preferredLanguage: string;
    state: string;
    role: UserRole;
  }): Promise<{ success: boolean; error?: string }> => {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: authData, error } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: {
              full_name: data.fullName,
              phone: data.phone,
              preferred_language: data.preferredLanguage,
              state: data.state,
              role: data.role,
            },
          },
        });

        if (error) return { success: false, error: error.message };
        if (authData.user) {
          setUser({ id: authData.user.id, email: authData.user.email || '' });
          return { success: true };
        }
        return { success: true };
      } catch (err: unknown) {
        return { success: false, error: err instanceof Error ? err.message : 'Registration failed' };
      }
    } else {
      // Local development registration
      try {
        const newProfile: Profile = {
          id: `local-user-${Date.now()}`,
          full_name: data.fullName,
          email: data.email,
          phone: data.phone,
          preferred_language: data.preferredLanguage,
          state: data.state,
          role: data.role,
          avatar_url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const storedUsersRaw = localStorage.getItem(LOCAL_STORAGE_KEY_USERS);
        const storedUsers = storedUsersRaw ? JSON.parse(storedUsersRaw) : [];
        storedUsers.push(newProfile);
        localStorage.setItem(LOCAL_STORAGE_KEY_USERS, JSON.stringify(storedUsers));

        setUser({ id: newProfile.id, email: newProfile.email });
        setProfile(newProfile);
        localStorage.setItem(LOCAL_STORAGE_KEY_SESSION, JSON.stringify(newProfile));

        return { success: true };
      } catch (e: unknown) {
        return { success: false, error: e instanceof Error ? e.message : 'Local registration failed' };
      }
    }
  }, [supabase, isSupabaseConfigured]);

  // Logout handler
  const logout = useCallback(async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setProfile(null);
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY_SESSION);
    } catch {
      // ignore
    }
    router.push('/auth/login');
  }, [supabase, isSupabaseConfigured, router]);

  // Reset password
  const resetPassword = useCallback(async (email: string) => {
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        });
        if (error) return { success: false, message: '', error: error.message };
        return { success: true, message: 'Password recovery email sent. Please check your inbox.' };
      } catch (err: unknown) {
        return { success: false, message: '', error: err instanceof Error ? err.message : 'Request failed' };
      }
    } else {
      return {
        success: true,
        message: 'Local Mode Simulation: Password reset instructions sent to ' + email,
      };
    }
  }, [supabase, isSupabaseConfigured]);

  // Quick switch role in local development mode for testing
  const switchDemoRole = useCallback((role: UserRole) => {
    if (profile) {
      const updated = { ...profile, role };
      setProfile(updated);
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY_SESSION, JSON.stringify(updated));
      } catch {
        // ignore
      }
    }
  }, [profile]);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        isLocalMode,
        login,
        register,
        logout,
        resetPassword,
        switchDemoRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

