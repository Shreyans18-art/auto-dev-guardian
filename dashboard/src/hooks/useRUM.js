import { useState, useEffect, useCallback } from 'react';
import { useScan } from '../context/ScanContext.jsx';

const API = `${import.meta.env.VITE_BACKEND_URL}/api/rum`;

export function useRUM(pollInterval = 5000) {
  const { runtimeErrors, setRuntimeErrors } = useScan();
  const [loading, setLoading]   = useState(false);
  const [newError, setNewError] = useState(null);
  const prevCountRef = { current: 0 };

  const fetch_ = useCallback(async () => {
    try {
      const res  = await fetch(API);
      const data = await res.json();
      const errors = data.filter(d => d.type === 'error');

      if (errors.length > prevCountRef.current) {
        setNewError(errors[errors.length - 1]);
      }
      prevCountRef.current = errors.length;
      setRuntimeErrors(data);
    } catch {
      // backend not running — use empty
    }
  }, [setRuntimeErrors]);

  useEffect(() => {
    setLoading(true);
    fetch_().finally(() => setLoading(false));

    const id = setInterval(fetch_, pollInterval);
    return () => clearInterval(id);
  }, [fetch_, pollInterval]);

  return { runtimeErrors, loading, newError, refetch: fetch_ };
}
