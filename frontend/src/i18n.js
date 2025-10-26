import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

// Translation resources for initial languages
import translationEN from './locales/en/translation.json';
import translationHI from './locales/hi/translation.json';
import translationTE from './locales/te/translation.json';
import translationTA from './locales/ta/translation.json';
import translationKN from './locales/kn/translation.json';

const resources = {
  en: { translation: translationEN },
  hi: { translation: translationHI },
  te: { translation: translationTE },
  ta: { translation: translationTA },
  kn: { translation: translationKN }
};

i18n
  // Load translation using http backend (for dynamic loading)
  .use(Backend)
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    resources,
    fallbackLng: 'en', // Default language
    debug: false,
    
    // Language detection options
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng'
    },

    interpolation: {
      escapeValue: false // React already does escaping
    },

    // Backend options for loading translations from server
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },

    react: {
      useSuspense: true
    }
  });

export default i18n;
