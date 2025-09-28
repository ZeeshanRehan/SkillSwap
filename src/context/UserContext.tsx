"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import users from "@/data/users.json";

type User = (typeof users)[number];

type UserContextValue = {
  userId?: string;
  user?: User;
  setUserId: (id?: string) => void;
};

const UserContext = createContext<UserContextValue | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserIdState] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("userId") || undefined;
    if (stored) setUserIdState(stored);
  }, []);

  const setUserId = (id?: string) => {
    setUserIdState(id);
    if (typeof window !== "undefined") {
      if (id) localStorage.setItem("userId", id);
      else localStorage.removeItem("userId");
    }
  };

  const user = useMemo(() => users.find((u) => u.id === userId), [userId]);

  const value = useMemo(() => ({ userId, user, setUserId }), [userId, user]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
}
