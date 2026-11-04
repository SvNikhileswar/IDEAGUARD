import { useCallback, useEffect, useRef, useState } from "react";

export interface AsyncState<T> { data: T | null; error: string | null; loading: boolean; reload: () => void }

/** Runs `fn(signal)` on mount / when deps change; aborts on unmount; exposes reload(). */
export function useAsync<T>(fn: (signal: AbortSignal) => Promise<T>, deps: unknown[]): AsyncState<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);
  const fnRef = useRef(fn); fnRef.current = fn;
  useEffect(() => {
    const ctrl = new AbortController();
    setLoading(true); setError(null);
    fnRef.current(ctrl.signal).then(
      d => { if (!ctrl.signal.aborted) { setData(d); setLoading(false); } },
      e => { if (!ctrl.signal.aborted) { setError((e as Error).message || "Something went wrong."); setLoading(false); } },
    );
    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);
  return { data, error, loading, reload: useCallback(() => setTick(t => t + 1), []) };
}
