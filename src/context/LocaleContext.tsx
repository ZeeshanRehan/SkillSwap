"use client";

import * as React from "react";
import type { Locale } from "@/lib/i18n";

type LocaleCtx = { locale: Locale; setLocale: (l: Locale) => void };
const LocaleContext = React.createContext<LocaleCtx | undefined>(undefined);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = React.useState<Locale>("en");

  React.useEffect(() => {
    const saved = typeof window !== "undefined" ? (localStorage.getItem("locale") as Locale | null) : null;
    if (saved === "en" || saved === "es") setLocale(saved);
  }, []);

  const set = React.useCallback((l: Locale) => {
    setLocale(l);
    if (typeof window !== "undefined") localStorage.setItem("locale", l);
  }, []);

  return <LocaleContext.Provider value={{ locale, setLocale: set }}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = React.useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}
