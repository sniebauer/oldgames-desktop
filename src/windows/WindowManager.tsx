// Open-window state for the desktop: tracks every open window (the "Old Games"
// folder + each game), their z-order, focus, minimize/maximize, and drag. Windows
// are keyed by a stable id (the folder uses 'folder'; a game uses its game id), so
// opening an already-open game just focuses it.

import { useCallback, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';

export type WinKind = 'folder' | 'game';

export interface WinState {
  id: string;
  kind: WinKind;
  gameId?: string;
  title: string;
  icon?: string;
  x: number;
  y: number;
  width: number;
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
  width: number;
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
        width: opts.width,
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
    const offX = e.clientX - win.x;
    const offY = e.clientY - win.y;
    setDragging(true);
    const onMove = (ev: PointerEvent) => {
      update(id, { x: Math.max(0, ev.clientX - offX), y: Math.max(0, ev.clientY - offY) });
    };
    const onUp = () => {
      setDragging(false);
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
  };
}
