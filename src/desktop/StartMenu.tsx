// The Start menu: launch each game, reopen the "Old Games" folder, or jump to the
// project source. Rendered above the taskbar when the Start button is toggled.

import type { CSSProperties } from 'react';
import { MenuList, MenuListItem, Separator } from 'react95';
import { GAMES, type Game } from '../games';
import { FolderIcon } from '../icons';
import { TASKBAR_H } from '../constants';

interface Props {
  onOpenGame: (game: Game) => void;
  onOpenFolder: () => void;
  onClose: () => void;
}

const SHELL_REPO = 'https://github.com/sniebauer/oldgames-desktop';

const bannerStyle: CSSProperties = {
  width: 28,
  background: 'linear-gradient(#000080, #1084d0)',
  color: '#c0c0c0',
  fontWeight: 'bold',
  fontSize: 18,
  writingMode: 'vertical-rl',
  transform: 'rotate(180deg)',
  textAlign: 'center',
  padding: '8px 4px',
  letterSpacing: 1,
};

export function StartMenu({ onOpenGame, onOpenFolder, onClose }: Props) {
  return (
    <MenuList
      style={{ position: 'absolute', left: 2, bottom: TASKBAR_H, zIndex: 9999, display: 'flex', padding: 0 }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div style={bannerStyle}>
        Old Games<span style={{ fontWeight: 'normal' }}>95</span>
      </div>
      <div style={{ padding: 2 }}>
        {GAMES.map((game) => (
          <MenuListItem
            key={game.id}
            onClick={() => { onOpenGame(game); onClose(); }}
            style={{ justifyContent: 'flex-start', gap: 8 }}
          >
            <img src={game.icon} alt="" width={24} height={24} style={{ imageRendering: 'pixelated' }} />
            {game.title}
          </MenuListItem>
        ))}
        <Separator />
        <MenuListItem onClick={() => { onOpenFolder(); onClose(); }} style={{ justifyContent: 'flex-start', gap: 8 }}>
          <span style={{ display: 'inline-flex', width: 24, justifyContent: 'center' }}><FolderIcon size={22} /></span>
          Old Games Folder
        </MenuListItem>
        <MenuListItem
          onClick={() => { window.open(SHELL_REPO, '_blank', 'noopener'); onClose(); }}
          style={{ justifyContent: 'flex-start', gap: 8 }}
        >
          <span style={{ display: 'inline-flex', width: 24, justifyContent: 'center' }}>{'</>'}</span>
          View Source on GitHub
        </MenuListItem>
      </div>
    </MenuList>
  );
}
