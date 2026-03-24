import { useState, useEffect, useCallback, useRef } from 'react';
import { ipoService } from '../services/api';

const cache = new Map();
const CACHE_TTL = 30_000;

function getCached(key) {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.ts < CACHE_TTL) return entry.data;
  cache.delete(key);
  return null;
}

export function useIPOs(initialParams = {}) {
  const [ipos, setIPOs] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [params, setParams] = useState({ page: 1, limit: 20, ...initialParams });
  const debounceRef = useRef(null);

  const fetchIPOs = useCallback(async (fetchParams) => {
    const key = JSON.stringify(fetchParams);
    const cached = getCached(key);
    if (cached) {
      setIPOs(cached.data);
      setPagination(cached.pagination);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await ipoService.getAll(fetchParams);
      const { data, pagination } = res.data;
      cache.set(key, { data, pagination, ts: Date.now() });
      setIPOs(data);
      setPagination(pagination);
    } catch (err) {
      setError(err.message || 'Failed to load IPOs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchIPOs(params), params.search ? 400 : 0);
    return () => clearTimeout(debounceRef.current);
  }, [params, fetchIPOs]);

  const updateParams = useCallback((updates) => {
    setParams((prev) => ({ ...prev, ...updates, page: updates.page ?? 1 }));
  }, []);

  const refresh = useCallback(() => {
    cache.clear();
    fetchIPOs(params);
  }, [params, fetchIPOs]);

  return { ipos, pagination, loading, error, params, updateParams, refresh };
}

export function useIPOById(id) {
  const [ipo, setIPO] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    ipoService.getById(id)
      .then((res) => setIPO(res.data.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  return { ipo, loading, error };
}

export function useMarketOverview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ipoService.getMarketOverview()
      .then((res) => setData(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return { data, loading };
}

export function useIPOStats() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ipoService.getStats()
      .then((res) => setData(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return { data, loading };
}
