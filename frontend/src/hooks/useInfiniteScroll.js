import { useEffect, useState, useRef, useCallback } from "react";

/**
 * useInfiniteScroll — append pages on scroll near bottom.
 * Pass a fetcher(page) -> Promise<{ items, hasMore }>.
 * Returns: { items, loading, error, hasMore, loadMore, refresh, sentinelRef }
 */
export function useInfiniteScroll(fetcher, { rootMargin = "200px" } = {}) {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const sentinelRef = useRef(null);
  const inflight = useRef(false);

  const loadMore = useCallback(async () => {
    if (inflight.current || !hasMore) return;
    inflight.current = true;
    setLoading(true);
    try {
      const res = await fetcher(page);
      setItems((prev) => [...prev, ...(res.items || [])]);
      setHasMore(Boolean(res.hasMore));
      setPage((p) => p + 1);
    } catch (e) {
      setError(e?.response?.data?.error || e.message);
    } finally {
      setLoading(false);
      inflight.current = false;
    }
  }, [fetcher, page, hasMore]);

  const refresh = useCallback(() => {
    setItems([]);
    setPage(1);
    setHasMore(true);
    setError(null);
  }, []);

  // Re-trigger load when refresh clears the list
  useEffect(() => {
    if (items.length === 0 && hasMore && !loading) {
      loadMore();
    }
  }, [items.length, hasMore, loading, loadMore]);

  // IntersectionObserver for the sentinel
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [loadMore, rootMargin]);

  return { items, loading, error, hasMore, loadMore, refresh, sentinelRef };
}
