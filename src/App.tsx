// The desktop shell: composes the wallpaper, the open windows (the "Old Games"
// folder + game iframes), and the taskbar, and keeps the URL in sync with the
// top-most game window (so /chips-challenge deep-links straight into that game).

import { useCallback, useEffect } from 'react';
import { Routes, Route, useNavigate, useParams, useLocation } from 'react-router-dom';
import { gameById, type Game } from './games';
import { CHROME_H, CHROME_W, UI_SCALE } from './constants';
import { useWindowManager } from './windows/WindowManager';
import { GameWindow } from './windows/GameWindow';
import { FolderWindow } from './desktop/FolderWindow';
import { InfoWindow } from './desktop/InfoWindow';
import { Desktop } from './desktop/Desktop';
import { Taskbar } from './desktop/Taskbar';

const FOLDER_ID = 'folder';
const INFO_ID = 'info';

function Shell() {
  const manager = useWindowManager();
  // The manager object is recreated each render, but its methods are stable
  // (useCallback). Depend on the methods — never the manager — to avoid loops.
  const { open, focus, windows } = manager;
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams<{ gameId: string }>();

  const openFolder = useCallback(() => {
    open({ id: FOLDER_ID, kind: 'folder', title: 'Old Games', icon: '/icons/folder.svg', w: 460, h: 320, x: 110, y: 70 });
  }, [open]);

  const openInfo = useCallback(() => {
    open({ id: INFO_ID, kind: 'info', title: 'Read Me - Notepad', icon: '/icons/readme.svg', w: 540, h: 460, x: 150, y: 96 });
  }, [open]);

  const openGame = useCallback((game: Game) => {
    open({
      id: game.id,
      kind: 'game',
      gameId: game.id,
      title: game.title,
      icon: game.icon,
      w: game.width + CHROME_W,
      h: game.height + CHROME_H,
      // Keep the game from being resized below ~45% of native.
      minW: Math.round(game.width * 0.45) + CHROME_W,
      minH: Math.round(game.height * 0.45) + CHROME_H,
    });
  }, [open]);

  // Open the folder once on load.
  useEffect(() => { openFolder(); }, [openFolder]);

  // Deep link: opening or changing the /:gameId route opens (or focuses) that
  // game. Keyed on the route id only — NOT the window list — so closing a window
  // (which briefly leaves a stale id in the URL) doesn't immediately reopen it.
  // open() dedupes, so focusing an already-open game won't reset it.
  useEffect(() => {
    const id = params.gameId;
    if (!id) return;
    const game = gameById(id);
    if (game) openGame(game);
  }, [params.gameId, openGame]);

  // Keep the URL pointing at the top-most game window (or / when none is on top).
  const visible = windows.filter((w) => !w.minimized);
  const top = visible.length ? visible.reduce((a, b) => (b.z > a.z ? b : a)) : null;
  const desiredPath = top && top.kind === 'game' && top.gameId ? `/${top.gameId}` : '/';
  useEffect(() => {
    if (location.pathname !== desiredPath) navigate(desiredPath, { replace: true });
  }, [desiredPath, location.pathname, navigate]);

  // Focus the window whose game iframe just took keyboard focus.
  useEffect(() => {
    const onBlur = () => {
      window.setTimeout(() => {
        const el = document.activeElement as HTMLElement | null;
        if (el?.tagName === 'IFRAME' && el.dataset.winId) focus(el.dataset.winId);
      }, 0);
    };
    window.addEventListener('blur', onBlur);
    return () => window.removeEventListener('blur', onBlur);
  }, [focus]);

  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', zoom: UI_SCALE }}>
      <Desktop
        onOpenFolder={openFolder}
        onOpenInfo={openInfo}
        onOpenAbandonware={() => window.open('https://abandonware.online', '_blank', 'noopener')}
      />
      {windows.map((w) =>
        w.kind === 'folder' ? (
          <FolderWindow key={w.id} win={w} manager={manager} openGame={openGame} />
        ) : w.kind === 'info' ? (
          <InfoWindow key={w.id} win={w} manager={manager} />
        ) : (
          <GameWindow key={w.id} win={w} manager={manager} />
        ),
      )}
      <Taskbar manager={manager} openGame={openGame} openFolder={openFolder} openInfo={openInfo} />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/:gameId" element={<Shell />} />
      <Route path="/" element={<Shell />} />
    </Routes>
  );
}
