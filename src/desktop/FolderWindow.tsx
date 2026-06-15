// The open "Old Games" folder: a Win95 window showing one large icon per game,
// with single-click selection, double-click to launch, and a right-click menu
// that links to each game's public source repo.

import { useState, type CSSProperties, type MouseEvent } from 'react';
import { MenuList, MenuListItem, Separator } from 'react95';
import { GAMES, type Game } from '../games';
import type { WindowManager, WinState } from '../windows/WindowManager';
import { Window95 } from '../windows/Window95';

interface Props {
  win: WinState;
  manager: WindowManager;
  openGame: (game: Game) => void;
}

const FOLDER_W = 460;

const menuBarStyle: CSSProperties = {
  display: 'flex',
  gap: 14,
  padding: '2px 6px 4px',
  fontSize: 13,
};

const wellStyle: CSSProperties = {
  flex: '1 1 auto',
  minHeight: 0,
  margin: '0 2px',
  padding: 10,
  background: '#fff',
  boxShadow: 'inset 1px 1px 0 #808080, inset -1px -1px 0 #dfdfdf, inset 2px 2px 0 #000',
  display: 'flex',
  flexWrap: 'wrap',
  alignContent: 'flex-start',
  gap: 6,
  overflow: 'auto',
};

const statusStyle: CSSProperties = {
  margin: '4px 2px 0',
  padding: '2px 6px',
  fontSize: 12,
  boxShadow: 'inset 1px 1px 0 #808080, inset -1px -1px 0 #fff',
};

export function FolderWindow({ win, manager, openGame }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [menu, setMenu] = useState<{ game: Game; x: number; y: number } | null>(null);

  const onContext = (e: MouseEvent, game: Game) => {
    e.preventDefault();
    setSelected(game.id);
    setMenu({ game, x: e.clientX, y: e.clientY });
  };

  return (
    <Window95
      title={win.title}
      icon={win.icon}
      x={win.x}
      y={win.y}
      z={win.z}
      width={win.maximized ? 0 : FOLDER_W}
      active={manager.isTop(win.id)}
      maximized={win.maximized}
      minimized={win.minimized}
      onFocus={() => manager.focus(win.id)}
      onClose={() => manager.close(win.id)}
      onMinimize={() => manager.minimize(win.id)}
      onMaximize={() => manager.toggleMaximize(win.id)}
      onDragStart={(e) => manager.startDrag(win.id, e)}
    >
      <div style={menuBarStyle}>
        <span><u>F</u>ile</span>
        <span><u>E</u>dit</span>
        <span><u>V</u>iew</span>
        <span><u>H</u>elp</span>
      </div>

      <div style={wellStyle} onPointerDown={() => setSelected(null)}>
        {GAMES.map((game) => (
          <FolderItem
            key={game.id}
            game={game}
            selected={selected === game.id}
            onSelect={() => setSelected(game.id)}
            onOpen={() => openGame(game)}
            onContext={(e) => onContext(e, game)}
          />
        ))}
      </div>

      <div style={statusStyle}>{GAMES.length} object(s)</div>

      {menu && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 10000 }}
            onPointerDown={() => setMenu(null)}
            onContextMenu={(e) => { e.preventDefault(); setMenu(null); }}
          />
          <MenuList style={{ position: 'fixed', left: menu.x, top: menu.y, zIndex: 10001 }}>
            <MenuListItem onClick={() => { openGame(menu.game); setMenu(null); }}>
              <span style={{ fontWeight: 'bold' }}>Open</span>
            </MenuListItem>
            <Separator />
            <MenuListItem onClick={() => { window.open(menu.game.repoUrl, '_blank', 'noopener'); setMenu(null); }}>
              View Source on GitHub
            </MenuListItem>
          </MenuList>
        </>
      )}
    </Window95>
  );
}

interface ItemProps {
  game: Game;
  selected: boolean;
  onSelect: () => void;
  onOpen: () => void;
  onContext: (e: MouseEvent) => void;
}

function FolderItem({ game, selected, onSelect, onOpen, onContext }: ItemProps) {
  const labelStyle: CSSProperties = selected
    ? { background: '#000080', color: '#fff', outline: '1px dotted #fff' }
    : { color: '#000' };
  return (
    <div
      role="button"
      title={game.title}
      onPointerDown={(e) => { e.stopPropagation(); onSelect(); }}
      onDoubleClick={onOpen}
      onContextMenu={onContext}
      style={{
        width: 88,
        padding: '8px 2px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        cursor: 'default',
      }}
    >
      <img
        src={game.icon}
        alt=""
        width={32}
        height={32}
        draggable={false}
        style={{ imageRendering: 'pixelated', marginBottom: 4, filter: selected ? 'opacity(0.7)' : 'none' }}
      />
      <span style={{ fontSize: 12, padding: '0 2px', ...labelStyle }}>{game.title}</span>
    </div>
  );
}
