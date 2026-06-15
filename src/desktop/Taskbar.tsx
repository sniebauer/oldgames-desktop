// The Win95 taskbar: Start button + the Start menu, one button per open window
// (click to focus / minimize), and a clock. Pinned to the bottom of the screen.

import { useEffect, useState, type CSSProperties } from 'react';
import { AppBar, Toolbar, Button, Frame } from 'react95';
import type { Game } from '../games';
import type { WindowManager } from '../windows/WindowManager';
import { StartMenu } from './StartMenu';
import { FolderIcon } from '../icons';
import { TASKBAR_H } from '../constants';
import { useIsMobile } from '../useIsMobile';

interface Props {
  manager: WindowManager;
  openGame: (game: Game) => void;
  openFolder: () => void;
  openInfo: () => void;
}

function useClock(): string {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 10000);
    return () => clearInterval(t);
  }, []);
  let h = now.getHours();
  const m = now.getMinutes().toString().padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
}

const taskBtnStyle = (active: boolean, isMobile: boolean): CSSProperties => ({
  // Fixed Win95 width on desktop; on mobile the buttons share the row.
  ...(isMobile ? { flex: '1 1 0', minWidth: 0, maxWidth: 160 } : { width: 160 }),
  marginRight: 4,
  justifyContent: 'flex-start',
  gap: 6,
  fontWeight: active ? 'bold' : 'normal',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
});

export function Taskbar({ manager, openGame, openFolder, openInfo }: Props) {
  const [startOpen, setStartOpen] = useState(false);
  const clock = useClock();
  const isMobile = useIsMobile();

  // Close the Start menu on any outside click.
  useEffect(() => {
    if (!startOpen) return;
    const onDown = () => setStartOpen(false);
    window.addEventListener('pointerdown', onDown);
    return () => window.removeEventListener('pointerdown', onDown);
  }, [startOpen]);

  const ordered = [...manager.windows].sort((a, b) => a.id.localeCompare(b.id));

  return (
    <>
      {startOpen && (
        <StartMenu
          onOpenGame={openGame}
          onOpenFolder={openFolder}
          onOpenInfo={openInfo}
          onClose={() => setStartOpen(false)}
        />
      )}
      <AppBar style={{ top: 'auto', bottom: 0, height: TASKBAR_H, zIndex: 9000 }}>
        <Toolbar style={{ justifyContent: 'space-between', height: '100%', padding: '2px 3px' }}>
          <div style={{ display: 'flex', alignItems: 'center', minWidth: 0, flex: 1 }}>
            <Button
              active={startOpen}
              onClick={() => setStartOpen((v) => !v)}
              onPointerDown={(e) => e.stopPropagation()}
              style={{ fontWeight: 'bold', marginRight: 6, gap: 4, flexShrink: 0 }}
            >
              <FolderIcon size={18} />
              Start
            </Button>
            <Frame variant="well" style={{ height: 26, width: 2, marginRight: 6, flexShrink: 0 }} />
            <div style={{ display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
              {ordered.map((w) => (
                <Button
                  key={w.id}
                  active={manager.isTop(w.id) && !w.minimized}
                  onClick={() => manager.toggleMinimize(w.id)}
                  style={taskBtnStyle(manager.isTop(w.id) && !w.minimized, isMobile)}
                >
                  {w.icon ? (
                    <img src={w.icon} alt="" width={16} height={16} style={{ imageRendering: 'pixelated' }} />
                  ) : (
                    <FolderIcon size={16} />
                  )}
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{w.title}</span>
                </Button>
              ))}
            </div>
          </div>
          {!isMobile && (
            <Frame
              variant="well"
              style={{ height: 26, display: 'flex', alignItems: 'center', padding: '0 8px', flexShrink: 0, fontSize: 13 }}
            >
              {clock}
            </Frame>
          )}
        </Toolbar>
      </AppBar>
    </>
  );
}
