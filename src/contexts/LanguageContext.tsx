import { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';
import { pt } from '@/i18n/translations/pt';
import { en } from '@/i18n/translations/en';

type Language = 'pt' | 'en';
type TranslationKeys = keyof typeof pt;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKeys) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = { pt, en };

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
  const [language, setLanguage] = useState<Language>('pt');

  const t = useCallback(
    (key: TranslationKeys): string => {
      const translation = translations[language][key];
      if (!translation) {
        return key;
      }
      return translation;
    },
    [language]
  );

  const value = useMemo(
    () => ({ language, setLanguage, t }),
    [language, t]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
