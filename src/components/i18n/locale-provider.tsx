"use client";

import { createContext, useContext, useEffect, type ReactNode } from "react";
import { dictionaries, en, type Dictionary, type Locale } from "@/lib/i18n/dictionary";

const LocaleContext = createContext<Dictionary>(en);

export function LocaleProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return <LocaleContext.Provider value={dictionaries[locale]}>{children}</LocaleContext.Provider>;
}

export function useDictionary() {
  return useContext(LocaleContext);
}
