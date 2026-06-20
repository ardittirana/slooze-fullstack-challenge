'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

const STORAGE_KEY = 'slooze:userId';

interface AuthContextValue {
  userId: string | null;
  /** Sets (or clears) the active mock user. Persists to localStorage. */
  setUserId: (id: string | null) => void;
  ready: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  userId: null,
  setUserId: () => {},
  ready: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userId, setUserIdState] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setUserIdState(localStorage.getItem(STORAGE_KEY));
    setReady(true);
  }, []);

  const setUserId = (id: string | null) => {
    if (id) {
      localStorage.setItem(STORAGE_KEY, id);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
    setUserIdState(id);
  };

  return <AuthContext.Provider value={{ userId, setUserId, ready }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
