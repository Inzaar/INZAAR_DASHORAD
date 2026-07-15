import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

i18n
  // load translation using http -> see /public/locales (i.e. https://github.com/i18next/react-i18next/tree/master/example/react/public/locales)
  // learn more: https://github.com/i18next/i18next-http-backend
  .use(Backend)
  // detect user language
  // learn more: https://github.com/i18next/i18next-browser-languageDetector
  .use(LanguageDetector)
  // pass the i18n instance to react-i18next.
  .use(initReactI18next)
  // init i18next
  // for all options read: https://www.i18next.com/overview/configuration-options
  .init({
    fallbackLng: 'en',
    debug: false,
    
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json?v=2.7',
    },

    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    }
  });

i18n.on('languageChanged', (lng) => {
  const isRtl = ['ar', 'ur'].includes(lng.split('-')[0]);
  document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
  document.documentElement.lang = lng;
});

const initialLng = window.localStorage.i18nextLng || 'en';
const isRtl = ['ar', 'ur'].includes(initialLng.split('-')[0]);
document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
document.documentElement.lang = initialLng;

export default i18n;
