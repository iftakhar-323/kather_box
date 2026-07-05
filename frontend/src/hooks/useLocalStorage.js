import { useEffect, useState, useCallback } from "react";

/**
 * useLocalStorage — typed-synced localStorage hook.
 * Pass a key and default value; returns [value, setValue, remove].
 * Cross-tab sync via the `storage` event.
 */
export function useLocalStorage(key, defaultValue) {
  const [value, setValue] = useState(() => {
    try {
      const raw = window.localStorage.getItem(key);
      return raw !== null ? JSON.parse(raw) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  const update = useCallback(
    (next) => {
      setValue((prev) => {
        const v = typeof next === "function" ? next(prev) : next;
        try {
          window.localStorage.setItem(key, JSON.stringify(v));
        } catch {}
        return v;
      });
    },
    [key]
  );

  const remove = useCallback(() => {
    setValue(defaultValue);
    try {
      window.localStorage.removeItem(key);
    } catch {}
  }, [key, defaultValue]);

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === key) {
        try {
          setValue(e.newValue ? JSON.parse(e.newValue) : defaultValue);
        } catch {
          setValue(defaultValue);
        }
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [key, defaultValue]);

  return [value, update, remove];
}
