import { useState, useCallback } from 'react';

const API = `${import.meta.env.VITE_BACKEND_URL}/api/ai-explain`;
const cache = {};

export function useAIExplain() {
  const [loading, setLoading] = useState(false);

  const explain = useCallback(async (message) => {
    if (cache[message]) return cache[message];
    setLoading(true);
    try {
      const res  = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
      const data = await res.json();
      cache[message] = data.explanation;
      return data.explanation;
    } catch {
      return 'AI explanation unavailable. Check if backend is running.';
    } finally {
      setLoading(false);
    }
  }, []);

  return { explain, loading };
}
