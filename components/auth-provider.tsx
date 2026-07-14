"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User } from "@/types";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { loadMockData, getCurrentUser, setCurrentUser } from "@/lib/services";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

function mapSupabaseUser(
  supabaseUser: { id: string; email?: string | null; user_metadata?: Record<string, unknown>; created_at: string },
  profile?: { name?: string | null; avatar_url?: string | null; bio?: string | null; role?: string; points?: number; level?: number; followers_count?: number; following_count?: number } | null
): User {
  const metadata = supabaseUser.user_metadata || {};
  return {
    id: supabaseUser.id,
    email: supabaseUser.email || "",
    name: profile?.name || (metadata.full_name as string | null) || supabaseUser.email || "Usuario",
    avatar_url: profile?.avatar_url || (metadata.avatar_url as string | null) || null,
    bio: profile?.bio || null,
    role: (profile?.role as User["role"]) || "user",
    points: profile?.points ?? 0,
    level: profile?.level ?? 1,
    followers_count: profile?.followers_count ?? 0,
    following_count: profile?.following_count ?? 0,
    created_at: supabaseUser.created_at,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load persisted mock data first (always safe, works without Supabase)
    loadMockData();

    if (!isSupabaseConfigured()) {
      // Demo mode: use mock current user when Supabase is not configured
      getCurrentUser().then((u) => {
        setUser(u);
        setCurrentUser(u);
        setIsLoading(false);
      });
      return;
    }

    const supabase = createClient();

    const loadUser = async (sessionUser: { id: string; email?: string | null; user_metadata?: Record<string, unknown>; created_at: string } | null) => {
      if (!sessionUser) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("name, avatar_url, bio, role, points, level, followers_count, following_count")
        .eq("id", sessionUser.id)
        .single();

      setUser(mapSupabaseUser(sessionUser, profile));
      setCurrentUser(mapSupabaseUser(sessionUser, profile));
      setIsLoading(false);
    };

    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      loadUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      loadUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    setCurrentUser(null);
    setUser(null);
    if (!isSupabaseConfigured()) {
      return;
    }
    const supabase = createClient();
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
