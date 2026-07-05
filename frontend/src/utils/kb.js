// =============================================================
// kb.js — localStorage-backed tiny stores used by the app.
// No backend required. Used for: theme, recently-viewed, compare,
// save-for-later, search history, onboarding state.
// =============================================================

const NS = "kb";
const k = (name) => `${NS}:${name}`;

const safeGet = (key) => {
  try { return localStorage.getItem(key); } catch { return null; }
};
const safeSet = (key, val) => {
  try { localStorage.setItem(key, val); } catch {}
};
const safeDel = (key) => {
  try { localStorage.removeItem(key); } catch {}
};
const read = (name, fallback) => {
  const raw = safeGet(k(name));
  if (!raw) return fallback;
  try { return JSON.parse(raw); } catch { return fallback; }
};
const write = (name, value) => safeSet(k(name), JSON.stringify(value));

// ---------- Theme ----------
export const ThemeStore = {
  get: () => read("theme", "light"),
  set: (val) => write("theme", val),
  apply: (val) => {
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", val);
    }
  },
};

// ---------- Recently viewed (max 8) ----------
export const RecentStore = {
  list: () => read("recent", []),
  push: (p) => {
    if (!p || p.ID == null) return;
    const cur = read("recent", []).filter((x) => x.ID !== p.ID);
    const slim = {
      ID: p.ID, name: p.name, price: p.price,
      category: p.category, subcategory: p.subcategory,
      emoji: emojiFor(p),
    };
    cur.unshift(slim);
    write("recent", cur.slice(0, 8));
  },
  clear: () => write("recent", []),
};

// ---------- Compare (max 4 slim items) ----------
export const CompareStore = {
  list: () => read("compare", []),
  has: (id) => read("compare", []).some((x) => x.ID === id),
  toggle: (p) => {
    const cur = read("compare", []);
    if (cur.some((x) => x.ID === p.ID)) {
      write("compare", cur.filter((x) => x.ID !== p.ID));
      return false;
    }
    if (cur.length >= 4) return "full";
    const slim = {
      ID: p.ID, name: p.name, price: p.price,
      category: p.category, subcategory: p.subcategory,
      stock: p.stock, indoor_outdoor: p.indoor_outdoor,
      emoji: emojiFor(p),
    };
    write("compare", [...cur, slim]);
    return true;
  },
  remove: (id) => write("compare", read("compare", []).filter((x) => x.ID !== id)),
  clear: () => write("compare", []),
};

// ---------- Save for later ----------
export const SaveForLaterStore = {
  list: () => read("saveforlater", []),
  add: (item) => {
    const cur = read("saveforlater", []);
    if (cur.some((x) => x.ID === item.ID)) return false;
    const slim = {
      ID: item.ID,
      name: item.product?.name || item.name,
      price: item.product?.price || item.price,
      category: item.product?.category || item.category,
      subcategory: item.product?.subcategory || item.subcategory,
      emoji: emojiFor(item.product || item),
    };
    write("saveforlater", [slim, ...cur].slice(0, 24));
    return true;
  },
  remove: (id) => write("saveforlater", read("saveforlater", []).filter((x) => x.ID !== id)),
  has: (id) => read("saveforlater", []).some((x) => x.ID === id),
  clear: () => write("saveforlater", []),
};

// ---------- Search history (max 8 terms) ----------
export const SearchStore = {
  list: () => read("search", []),
  push: (term) => {
    const t = (term || "").trim();
    if (!t) return;
    const cur = read("search", []).filter((x) => x.toLowerCase() !== t.toLowerCase());
    cur.unshift(t);
    write("search", cur.slice(0, 8));
  },
  remove: (term) => write("search", read("search", []).filter((x) => x !== term)),
  clear: () => write("search", []),
};

// ---------- Onboarding ----------
export const OnbStore = {
  done: () => read("onb-done", false),
  markDone: () => write("onb-done", true),
};

// ---------- Helpers ----------
export function emojiFor(p) {
  if (!p) return "🌿";
  if (p.category === "plant") return "🌿";
  if (p.category === "care") return "🧴";
  if (p.subcategory === "decor") return "🏺";
  return "🪵";
}

export function fmtBDT(n) {
  return "৳" + Number(n || 0).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

// Subscribe to storage changes from another tab/component
export function onStoreChange(keys, cb) {
  const handler = (e) => {
    if (keys.some((k2) => e.key && e.key.endsWith(k2))) cb();
  };
  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
}
