import { useEffect, useRef } from 'react';

// Lightweight polling hook: calls `fn` every `intervalMs` until the
// component unmounts or `enabled` flips to false. Skips overlapping
// requests and swallows transient errors so the UI stays stable on
// transient backend hiccups (LogisticsPage relies on this).
export function usePolling(fn, intervalMs = 5000, enabled = true) {
  const fnRef = useRef(fn);
  fnRef.current = fn;

  useEffect(() => {
    if (!enabled) return undefined;
    let cancelled = false;
    let inFlight = false;

    const tick = async () => {
      if (cancelled || inFlight) return;
      inFlight = true;
      try {
        await fnRef.current();
      } catch (_) {
        // intentionally swallowed; UI keeps last good snapshot
      } finally {
        inFlight = false;
      }
    };

    tick();
    const t = setInterval(tick, intervalMs);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [intervalMs, enabled]);
}