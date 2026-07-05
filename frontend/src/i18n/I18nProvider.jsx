import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { LangStore } from "./LangStore";
import en from "./en.json";
import bn from "./bn.json";

const DICTS = { en, bn };

const I18nCtx = createContext({
  lang: "en",
  setLang: () => {},
  toggle: () => {},
  t: (k) => k,
  has: (k) => false,
});

function lookup(dict, path) {
  return path.split(".").reduce((acc, seg) => {
    if (acc && Object.prototype.hasOwnProperty.call(acc, seg)) return acc[seg];
    return undefined;
  }, dict);
}

function format(template, vars) {
  if (!template || !vars) return template || "";
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key) =>
    vars[key] != null ? String(vars[key]) : ""
  );
}

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(() => LangStore.get());

  // apply language attribute to <html> on mount and whenever it changes
  useEffect(() => {
    try {
      document.documentElement.setAttribute("lang", lang);
    } catch {}
  }, [lang]);

  const setLang = useCallback((next) => {
    if (!DICTS[next]) return;
    LangStore.set(next);
    setLangState(next);
  }, []);

  const toggle = useCallback(() => {
    setLang(lang === "en" ? "bn" : "en");
  }, [lang, setLang]);

  // Core translator: tries requested lang first, falls back to English,
  // and finally returns the key itself so missing strings are visible.
  const t = useCallback(
    (key, vars) => {
      let val = lookup(DICTS[lang], key);
      if (val === undefined) val = lookup(DICTS.en, key);
      if (val === undefined) return key;
      if (typeof val === "string") return format(val, vars);
      return val;
    },
    [lang]
  );

  const has = useCallback(
    (key) => lookup(DICTS[lang], key) !== undefined || lookup(DICTS.en, key) !== undefined,
    [lang]
  );

  const value = useMemo(
    () => ({ lang, setLang, toggle, t, has }),
    [lang, setLang, toggle, t, has]
  );

  return <I18nCtx.Provider value={value}>{children}</I18nCtx.Provider>;
}

export function useTranslation() {
  return useContext(I18nCtx);
}

export const SUPPORTED_LANGS = Object.keys(DICTS);
