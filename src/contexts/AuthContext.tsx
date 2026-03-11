"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

interface AuthUser {
  id: string;
  name: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  logout: () => void;
  refresh: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  logout: () => {},
  refresh: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  const refresh = useCallback(() => {
    try {
      const stored = localStorage.getItem("galaus_user");
      setUser(stored ? JSON.parse(stored) : null);
    } catch {
      setUser(null);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("galaus_user");
    setUser(null);
  }, []);

  useEffect(() => {
    refresh();

    // Keep in sync across tabs
    const onStorage = (e: StorageEvent) => {
      if (e.key === "galaus_user") refresh();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [refresh]);

  return (
    <AuthContext.Provider value={{ user, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
