"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { User } from "@/types";

const fallbackUser: User = {
  id: "user-1",
  email: "santiago@rraliados.com",
  name: "Santiago Rueda",
  avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Santiago",
  bio: "CEO de RR ALIADOS. Constructor de comunidades.",
  role: "developer",
  points: 1250,
  level: 5,
  created_at: "2025-11-01T00:00:00Z",
  followers_count: 342,
  following_count: 12,
};

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  signIn: () => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(fallbackUser);
  const [isLoading, setIsLoading] = useState(false);

  const signIn = () => {
    setIsLoading(true);
    setTimeout(() => {
      setUser(fallbackUser);
      setIsLoading(false);
    }, 500);
  };

  const signOut = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
