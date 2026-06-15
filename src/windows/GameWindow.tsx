// A game window: the shared Win95 chrome wrapping an <iframe> that loads the
// game's standalone deploy. The iframe renders at the game's native resolution
// and is scaled with a CSS transform to fill the (resizable) window content
// area, preserving aspect ratio — so resizing the window resizes the game.
// Also listens for the game's postMessage title updates and pushes them into
// the window manager so the title bar tracks the level.

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gameById, gameOrigin } from '../games';
import { isGameMessage } from '../embed';
import type { WindowManager, WinState } from './WindowManager';
import { Window95 } from './Window95';

interface Props {
  win: WinState;
  manager: WindowManager;
}

/** Track an element's content box size (updates on window/content resize). */
function useElementSize<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ w: width, h: height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, size] as const;
}

export function GameWindow({ win, manager }: Props) {
  const game = gameById(win.gameId!);
  const frameRef = useRef<HTMLIFrameElement | null>(null);
  const [boxRef, box] = useElementSize<HTMLDivElement>();
  const { setTitle } = manager;

  useEffect(() => {
    if (!game) return;
    const origin = gameOrigin(game);
    const onMessage = (e: MessageEvent) => {
      // Only trust messages from this game's own frame + origin.
      if (e.source !== frameRef.current?.contentWindow) return;
      if (origin !== 'null' && e.origin !== origin) return;
      if (!isGameMessage(e.data)) return;
      if (e.data.type === 'title' && e.data.value) {
        setTitle(win.id, `${game.title}: ${e.data.value}`);
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [game, win.id, setTitle]);

  if (!game) return null;

  // Fit the native-resolution game into the content box, preserving aspect
  // ratio and centering any letterboxed remainder.
  const scale = box.w && box.h ? Math.min(box.w / game.width, box.h / game.height) : 1;
  const offX = Math.max(0, (box.w - game.width * scale) / 2);
  const offY = Math.max(0, (box.h - game.height * scale) / 2);

  return (
    <Window95
      title={win.title}
      icon={win.icon}
      x={win.x}
      y={win.y}
      z={win.z}
      width={win.w}
      height={win.h}
      active={manager.isTop(win.id)}
      maximized={win.maximized}
      minimized={win.minimized}
      onFocus={() => manager.focus(win.id)}
      onClose={() => manager.close(win.id)}
      onMinimize={() => manager.minimize(win.id)}
      onMaximize={() => manager.toggleMaximize(win.id)}
      onDragStart={(e) => manager.startDrag(win.id, e)}
      onResizeStart={(edge, e) => manager.startResize(win.id, edge, e)}
      contentStyle={{ padding: 0 }}
    >
      <div ref={boxRef} style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', background: '#000' }}>
        <iframe
          ref={frameRef}
          src={game.src}
          title={game.title}
          data-win-id={win.id}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: game.width,
            height: game.height,
            border: 0,
            display: 'block',
            transformOrigin: '0 0',
            transform: `translate(${offX}px, ${offY}px) scale(${scale})`,
            // While dragging/resizing any window, let pointer events pass to the
            // shell so the gesture isn't swallowed by the cross-origin iframe.
            pointerEvents: manager.dragging ? 'none' : 'auto',
          }}
          allow="autoplay; fullscreen"
        />
      </div>
    </Window95>
  );
}
