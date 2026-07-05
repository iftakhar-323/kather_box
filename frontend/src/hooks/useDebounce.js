import { useEffect, useState } from "react";

/**
 * useDebounce — returns a debounced value that updates after `delay` ms of stability.
 * Use it for search inputs to avoid hammering the API on every keystroke.
 */
export function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}
