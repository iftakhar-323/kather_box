import { useEffect, useState, useCallback } from "react";

/**
 * usePagination — wraps a paginated API call.
 * Pass a fetcher that takes (page, pageSize) and returns { items, total }.
 * Returns: { page, pageSize, total, items, loading, error, next, prev, setPage, refresh }
 */
export function usePagination(fetcher, { pageSize = 12, initialPage = 1 } = {}) {
  const [page, setPage] = useState(initialPage);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refresh = useCallback(() => {
    setLoading(true);
    setError(null);
    fetcher(page, pageSize)
      .then((res) => {
        setItems(res.items || []);
        setTotal(res.total || 0);
      })
      .catch((e) => setError(e?.response?.data?.error || e.message))
      .finally(() => setLoading(false));
  }, [fetcher, page, pageSize]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  return {
    page,
    setPage,
    pageSize,
    total,
    totalPages,
    items,
    loading,
    error,
    next: () => setPage((p) => Math.min(p + 1, totalPages)),
    prev: () => setPage((p) => Math.max(p - 1, 1)),
    refresh,
  };
}
