"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import type { User as DbUser } from "@/types/database";

interface AuthUser {
  id: string;
  email: string;
  name?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  supabaseUser: SupabaseUser | null;
  loading: boolean;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  supabaseUser: null,
  loading: true,
  logout: async () => {},
  refresh: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setSupabaseUser(session.user);
        
        // Fetch or create user profile from our users table
        const { data: profile } = await supabase
          .from("users")
          .select("*")
          .eq("id", session.user.id)
          .single<DbUser>();

        if (profile) {
          setUser({
            id: profile.id,
            email: session.user.email!,
            name: profile.name,
          });
        } else {
          // Create user profile if doesn't exist
          const name = session.user.email?.split('@')[0] || 'User';
          const { data: newProfile } = await supabase
            .from("users")
            .insert({ id: session.user.id, name })
            .select()
            .single<DbUser>();

          if (newProfile) {
            setUser({
              id: newProfile.id,
              email: session.user.email!,
              name: newProfile.name,
            });
          }
        }
      } else {
        setUser(null);
        setSupabaseUser(null);
      }
    } catch (error) {
      console.error("Error refreshing auth:", error);
      setUser(null);
      setSupabaseUser(null);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSupabaseUser(null);
  }, [supabase]);

  useEffect(() => {
    refresh();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      refresh();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [refresh, supabase]);

  return (
    <AuthContext.Provider value={{ user, supabaseUser, loading, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
