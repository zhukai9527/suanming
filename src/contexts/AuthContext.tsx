import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '../lib/localApi';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user on mount (one-time check)
  useEffect(() => {
    async function loadUser() {
      setLoading(true);
      try {
        const response = await supabase.auth.getUser();
        if (response.data?.user) {
          setUser(response.data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('加载用户信息失败:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    loadUser();

    // Set up auth listener - 本地API版本
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Auth methods
  async function signIn(email: string, password: string) {
    const response = await supabase.auth.signInWithPassword({ email, password });
    if (response.data?.user) {
      setUser(response.data.user);
    }
    return response;
  }

  async function signUp(email: string, password: string) {
    const response = await supabase.auth.signUp({ email, password });
    if (response.data?.user) {
      setUser(response.data.user);
    }
    return response;
  }

  async function signOut() {
    const response = await supabase.auth.signOut();
    setUser(null);
    return response;
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}