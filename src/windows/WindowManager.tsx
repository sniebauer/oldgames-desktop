// Open-window state for the desktop: tracks every open window (the "Old Games"
// folder + each game), their z-order, focus, minimize/maximize, and drag. Windows
// are keyed by a stable id (the folder uses 'folder'; a game uses its game id), so
// opening an already-open game just focuses it.

import { useCallback, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { CHROME_H, CHROME_W, MIN_H, MIN_W } from '../constants';

export type WinKind = 'folder' | 'game' | 'info';

/** The eight directions a window can be resized from. */
export type ResizeEdge = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

export interface WinState {
  id: string;
  kind: WinKind;
  gameId?: string;
  title: string;
  icon?: string;
  x: number;
  y: number;
  /** Outer window (frame) size, including the Win95 chrome. */
  w: number;
  h: number;
  /** Smallest this window may be resized to. */
  minW: number;
  minH: number;
  /** Content aspect ratio (width/height) to lock while resizing (game windows). */
  aspect?: number;
  z: number;
  minimized: boolean;
  maximized: boolean;
}

export interface OpenOpts {
  id: string;
  kind: WinKind;
  gameId?: string;
  title: string;
  icon?: string;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  aspect?: number;
  x?: number;
  y?: number;
}

export interface WindowManager {
  windows: WinState[];
  dragging: boolean;
  open: (opts: OpenOpts) => void;
  close: (id: string) => void;
  focus: (id: string) => void;
  isTop: (id: string) => boolean;
  minimize: (id: string) => void;
  toggleMinimize: (id: string) => void;
  toggleMaximize: (id: string) => void;
  setTitle: (id: string, title: string) => void;
  startDrag: (id: string, e: ReactPointerEvent) => void;
  startResize: (id: string, edge: ResizeEdge, e: ReactPointerEvent) => void;
}

// Effective CSS `zoom` applied to an element: the ratio of its rendered
// (client-space) width to its layout width. Used to convert pointer-event
// deltas — which live in zoomed client space — back into layout pixels.
function pointerScale(el: HTMLElement): number {
  const layoutW = el.offsetWidth;
  if (!layoutW) return 1;
  return el.getBoundingClientRect().width / layoutW || 1;
}

export function useWindowManager(): WindowManager {
  const [windows, setWindows] = useState<WinState[]>([]);
  const [dragging, setDragging] = useState(false);
  const ref = useRef<WinState[]>(windows);
  ref.current = windows;
  const topZ = useRef(10);

  const update = useCallback((id: string, patch: Partial<WinState>) => {
    setWindows((ws) => ws.map((w) => (w.id === id ? { ...w, ...patch } : w)));
  }, []);

  const focus = useCallback((id: string) => {
    topZ.current += 1;
    const z = topZ.current;
    setWindows((ws) => ws.map((w) => (w.id === id ? { ...w, z, minimized: false } : w)));
  }, []);

  const open = useCallback((opts: OpenOpts) => {
    topZ.current += 1;
    const z = topZ.current;
    // Dedupe inside the updater so React 18 StrictMode's double-invoke can't
    // create two windows with the same id; an already-open window just refocuses.
    setWindows((ws) => {
      if (ws.some((w) => w.id === opts.id)) {
        return ws.map((w) => (w.id === opts.id ? { ...w, z, minimized: false } : w));
      }
      const c = ws.length % 6;
      const win: WinState = {
        id: opts.id,
        kind: opts.kind,
        gameId: opts.gameId,
        title: opts.title,
        icon: opts.icon,
        x: opts.x ?? 96 + c * 26,
        y: opts.y ?? 60 + c * 26,
        w: opts.w,
        h: opts.h,
        minW: opts.minW ?? MIN_W,
        minH: opts.minH ?? MIN_H,
        aspect: opts.aspect,
        z,
        minimized: false,
        maximized: false,
      };
      return [...ws, win];
    });
  }, []);

  const close = useCallback((id: string) => {
    setWindows((ws) => ws.filter((w) => w.id !== id));
  }, []);

  const isTop = useCallback((id: string) => {
    const visible = ref.current.filter((w) => !w.minimized);
    if (!visible.length) return false;
    const top = visible.reduce((a, b) => (b.z > a.z ? b : a));
    return top.id === id;
  }, []);

  const minimize = useCallback((id: string) => update(id, { minimized: true }), [update]);

  const toggleMinimize = useCallback((id: string) => {
    const w = ref.current.find((x) => x.id === id);
    if (!w) return;
    if (w.minimized || !isTop(id)) focus(id);
    else update(id, { minimized: true });
  }, [focus, isTop, update]);

  const toggleMaximize = useCallback((id: string) => {
    const w = ref.current.find((x) => x.id === id);
    if (!w) return;
    update(id, { maximized: !w.maximized });
    focus(id);
  }, [focus, update]);

  const setTitle = useCallback((id: string, title: string) => update(id, { title }), [update]);

  const startDrag = useCallback((id: string, e: ReactPointerEvent) => {
    const win = ref.current.find((w) => w.id === id);
    if (!win || win.maximized) return;
    focus(id);
    // Pointer coords are in zoomed "client" space; convert deltas back to layout
    // px by the element's measured zoom so dragging tracks the cursor 1:1.
    const scale = pointerScale(e.currentTarget as HTMLElement);
    const startCX = e.clientX;
    const startCY = e.clientY;
    const startX = win.x;
    const startY = win.y;
    setDragging(true);
    const onMove = (ev: PointerEvent) => {
      const x = startX + (ev.clientX - startCX) / scale;
      const y = startY + (ev.clientY - startCY) / scale;
      update(id, { x: Math.max(0, x), y: Math.max(0, y) });
    };
    const onUp = () => {
      setDragging(false);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  }, [focus, update]);

  const startResize = useCallback((id: string, edge: ResizeEdge, e: ReactPointerEvent) => {
    const win = ref.current.find((w) => w.id === id);
    if (!win || win.maximized) return;
    e.stopPropagation();
    focus(id);
    const scale = pointerScale(e.currentTarget as HTMLElement);
    const start = { x: win.x, y: win.y, w: win.w, h: win.h, mx: e.clientX, my: e.clientY };
    const { minW, minH } = win;
    setDragging(true);
    document.body.style.cursor = `${edge}-resize`;

    const { aspect } = win;
    const onMove = (ev: PointerEvent) => {
      const dx = (ev.clientX - start.mx) / scale;
      const dy = (ev.clientY - start.my) / scale;
      let w = start.w;
      let h = start.h;
      if (edge.includes('e')) w = start.w + dx;
      if (edge.includes('w')) w = start.w - dx;
      if (edge.includes('s')) h = start.h + dy;
      if (edge.includes('n')) h = start.h - dy;

      if (aspect) {
        // Lock the CONTENT box to the game's aspect ratio (no letterboxing): a
        // horizontal drag drives width, a vertical-only drag drives height; the
        // other dimension follows. Keep both >= the minimum while staying locked.
        if (edge.includes('e') || edge.includes('w')) h = CHROME_H + (w - CHROME_W) / aspect;
        else w = CHROME_W + (h - CHROME_H) * aspect;
        if (w < minW) { w = minW; h = CHROME_H + (minW - CHROME_W) / aspect; }
        if (h < minH) { h = minH; w = CHROME_W + (minH - CHROME_H) * aspect; }
      } else {
        if (w < minW) w = minW;
        if (h < minH) h = minH;
      }

      // Anchor the opposite edge so west/north drags grow toward the cursor.
      let x = start.x;
      let y = start.y;
      if (edge.includes('w')) x = start.x + (start.w - w);
      if (edge.includes('n')) y = start.y + (start.h - h);

      update(id, { x: Math.max(0, x), y: Math.max(0, y), w, h });
    };
    const onUp = () => {
      setDragging(false);
      document.body.style.cursor = '';
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  }, [focus, update]);

  return {
    windows,
    dragging,
    open,
    close,
    focus,
    isTop,
    minimize,
    toggleMinimize,
    toggleMaximize,
    setTitle,
    startDrag,
    startResize,
  };
}
