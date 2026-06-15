// A game window: the shared Win95 chrome wrapping an <iframe> that loads the
// game's standalone deploy. Listens for the game's postMessage title updates and
// pushes them into the window manager so the title bar tracks the level.

import { useEffect, useRef } from 'react';
import { gameById, gameOrigin } from '../games';
import { isGameMessage } from '../embed';
import type { WindowManager, WinState } from './WindowManager';
import { Window95 } from './Window95';

interface Props {
  win: WinState;
  manager: WindowManager;
}

export function GameWindow({ win, manager }: Props) {
  const game = gameById(win.gameId!);
  const frameRef = useRef<HTMLIFrameElement | null>(null);
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

  const iframeStyle = win.maximized
    ? { width: '100%', height: '100%', border: 0, display: 'block' as const }
    : { width: game.width, height: game.height, border: 0, display: 'block' as const, background: '#000' };

  return (
    <Window95
      title={win.title}
      icon={win.icon}
      x={win.x}
      y={win.y}
      z={win.z}
      width={win.maximized ? 0 : game.width + 8}
      active={manager.isTop(win.id)}
      maximized={win.maximized}
      minimized={win.minimized}
      onFocus={() => manager.focus(win.id)}
      onClose={() => manager.close(win.id)}
      onMinimize={() => manager.minimize(win.id)}
      onMaximize={() => manager.toggleMaximize(win.id)}
      onDragStart={(e) => manager.startDrag(win.id, e)}
      contentStyle={{ padding: 0 }}
    >
      <iframe
        ref={frameRef}
        src={game.src}
        title={game.title}
        data-win-id={win.id}
        style={{
          ...iframeStyle,
          // While dragging any window, let pointer events pass to the shell so the
          // drag isn't swallowed by the cross-origin iframe.
          pointerEvents: manager.dragging ? 'none' : 'auto',
        }}
        allow="autoplay; fullscreen"
      />
    </Window95>
  );
}
