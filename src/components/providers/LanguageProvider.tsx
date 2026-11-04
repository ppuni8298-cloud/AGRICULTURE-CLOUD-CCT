'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE, LanguageConfig } from '@/i18n/languages';
import { getDictionary, translate } from '@/i18n';

interface LanguageContextType {
  language: string;
  languageConfig: LanguageConfig;
  setLanguage: (lang: string) => void;
  t: (path: string, fallback?: string) => string;
  supportedLanguages: LanguageConfig[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<string>(DEFAULT_LANGUAGE);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('agrocloud_language');
      if (stored && SUPPORTED_LANGUAGES.some((l) => l.code === stored)) {
        setLanguageState(stored);
      }
    } catch {
      // ignore
    }
    setMounted(true);
  }, []);

  const setLanguage = (newLang: string) => {
    if (SUPPORTED_LANGUAGES.some((l) => l.code === newLang)) {
      setLanguageState(newLang);
      try {
        localStorage.setItem('agrocloud_language', newLang);
      } catch {
        // ignore
      }
    }
  };

  const currentConfig =
    SUPPORTED_LANGUAGES.find((l) => l.code === language) ||
    SUPPORTED_LANGUAGES[0];

  const dict = getDictionary(language);

  const t = (path: string, fallback?: string) => {
    return translate(dict, path, fallback);
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        languageConfig: currentConfig,
        setLanguage,
        t,
        supportedLanguages: SUPPORTED_LANGUAGES,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

