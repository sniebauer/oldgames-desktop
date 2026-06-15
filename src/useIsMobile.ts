// True on small / touch screens. Drives "mobile mode": windows open full-screen,
// icons open on a single tap, and the taskbar lays out responsively. Uses
// useSyncExternalStore so the value is correct on the first client render (no
// desktop→mobile flash) and updates live on resize / orientation change.

import { useSyncExternalStore } from 'react';

const QUERY = '(max-width: 768px)';

function subscribe(cb: () => void): () => void {
  const mql = window.matchMedia(QUERY);
  mql.addEventListener('change', cb);
  return () => mql.removeEventListener('change', cb);
}

export function useIsMobile(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
}
