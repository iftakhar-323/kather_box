import { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext(null);

let _id = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const show = useCallback((tone, msg, ttl = 2600) => {
    const id = ++_id;
    setToasts((t) => [...t, { id, tone, msg }]);
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, ttl);
  }, []);

  const value = {
    show,
    ok:  (m, ttl) => show("ok", m, ttl),
    err: (m, ttl) => show("err", m, ttl),
    info:(m, ttl) => show("info", m, ttl),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="kb-toast-wrap" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`kb-toast kb-toast-${t.tone}`} role="status">
            <span className="ic" aria-hidden="true">
              {t.tone === "ok" ? "✓" : t.tone === "err" ? "✕" : "ℹ"}
            </span>
            <span>{t.msg}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Fallback no-op so it never crashes if used outside provider
    return {
      show: () => {},
      ok: () => {},
      err: () => {},
      info: () => {},
    };
  }
  return ctx;
}
