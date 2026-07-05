// =============================================================
// LangStore — localStorage-backed language preference.
// Defaults to "en", supports "en" and "bn".
// =============================================================

const KEY = "kb:lang";

export const SUPPORTED = ["en", "bn"];

function safeGet(k) {
  try { return localStorage.getItem(k); } catch { return null; }
}
function safeSet(k, v) {
  try { localStorage.setItem(k, v); } catch {}
}

export const LangStore = {
  get() {
    const v = safeGet(KEY);
    return SUPPORTED.includes(v) ? v : "en";
  },
  set(v) {
    if (!SUPPORTED.includes(v)) return;
    safeSet(KEY, v);
    try {
      if (typeof document !== "undefined") {
        document.documentElement.setAttribute("lang", v);
        document.documentElement.setAttribute("dir", "ltr");
      }
    } catch {}
  },
  label(code) {
    if (code === "bn") return "বাংলা";
    return "English";
  },
  flag(code) {
    if (code === "bn") return "🇧🇩";
    return "🇬🇧";
  },
};
