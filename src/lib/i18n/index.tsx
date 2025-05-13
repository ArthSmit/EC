"use client";

import type React from 'react';
import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import enTranslations from './locales/en.json';
import ruTranslations from './locales/ru.json';

type Language = 'en' | 'ru';
type Translations = Record<string, string>;
type TranslationData = Record<Language, Translations>;

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const translationsData: TranslationData = {
  en: enTranslations,
  ru: ruTranslations,
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const storedLanguage = localStorage.getItem('language') as Language | null;
    if (storedLanguage && translationsData[storedLanguage]) {
      setLanguageState(storedLanguage);
      document.documentElement.lang = storedLanguage;
    } else {
      document.documentElement.lang = 'en';
    }
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
    document.documentElement.lang = lang;
  }, []);

  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    if (!isMounted) return key; 
    
    const currentTranslations = translationsData[language] || translationsData.en;
    let translation = currentTranslations[key] || key;

    if (params) {
      Object.entries(params).forEach(([paramKey, value]) => {
        translation = translation.replace(new RegExp(`{${paramKey}}`, 'g'), String(value));
      });
    }
    return translation;
  }, [language, isMounted]);

  const contextValue = useMemo(() => ({
    language,
    setLanguage,
    t,
  }), [language, setLanguage, t]);

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useAppTranslations = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useAppTranslations must be used within a LanguageProvider');
  }
  return context;
};
