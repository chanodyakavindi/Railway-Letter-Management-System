import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { localizeDom, pickLanguageText, t as translate } from '../utils/i18n';

const LanguageContext = createContext(null);
const LANGUAGE_KEY = 'rlms_language';

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    const saved = localStorage.getItem(LANGUAGE_KEY);
    return saved === 'si' ? 'si' : 'en';
  });

  useEffect(() => {
    localStorage.setItem(LANGUAGE_KEY, lang);
    document.documentElement.setAttribute('lang', lang === 'si' ? 'si' : 'en');

    const root = document.getElementById('root');
    let rafId = 0;
    let rafId2 = 0;

    // Run after React paints so late-mounted UI (post-login) is included.
    const applyLanguage = () => {
      localizeDom(root, lang);
    };

    const scheduleApply = () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (rafId2) cancelAnimationFrame(rafId2);
      rafId = requestAnimationFrame(() => {
        rafId2 = requestAnimationFrame(applyLanguage);
      });
    };

    applyLanguage();
    scheduleApply();

    const observer = new MutationObserver(scheduleApply);

    if (root) {
      observer.observe(root, {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: true,
        attributeFilter: ['placeholder', 'title', 'aria-label'],
      });
    }

    return () => {
      observer.disconnect();
      if (rafId) cancelAnimationFrame(rafId);
      if (rafId2) cancelAnimationFrame(rafId2);
    };
  }, [lang]);

  const value = useMemo(
    () => ({
      lang,
      setLang,
      pick: (text) => pickLanguageText(text, lang),
      t: (enText, siText) => translate(lang, enText, siText),
    }),
    [lang]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
