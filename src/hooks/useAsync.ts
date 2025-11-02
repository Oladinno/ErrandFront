import React from 'react';

export function useAsync<T>(fn: () => Promise<T>, deps: React.DependencyList = []) {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);
  const [data, setData] = React.useState<T | null>(null);

  const run = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fn();
      setData(res);
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, deps);

  return { loading, error, data, run };
}