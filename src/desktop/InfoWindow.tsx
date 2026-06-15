// The desktop "Read Me" file, shown in a Win95 Notepad-style window: a menu bar
// over a white, scrollable, selectable text area. Explains what the site is and
// how the games work (faithful browser rebuilds using the original assets — not
// emulators).

import type { CSSProperties } from 'react';
import type { WindowManager, WinState } from '../windows/WindowManager';
import { Window95 } from '../windows/Window95';

interface Props {
  win: WinState;
  manager: WindowManager;
}

const README = `                       Welcome to Old Games 95
  =================================================================

  WHAT IS THIS?

  Old Games 95 is a little corner of the web dressed up as a
  Windows 95 desktop. Open the "Old Games" folder and you'll find
  a collection of classic games you can play right here in your
  browser - no downloads, no plugins, no installers.


  THESE ARE NOT EMULATORS

  The games are NOT running in an emulator. There is no copy of
  Windows under the hood, no virtual machine, and no original
  .exe being interpreted.

  Instead, each game has been faithfully rebuilt from the ground
  up to run natively on the modern web (HTML5, Canvas and plain
  JavaScript). The game logic - movement, collisions, rules and
  timing - has been re-implemented so it behaves just like the
  original did.


  BUILT FROM THE ORIGINAL ASSETS

  What makes them feel authentic is that they use the ORIGINAL
  game assets: the actual sprites, tiles, fonts, sounds and level
  data from the games themselves. Nothing has been redrawn or
  approximated - the pixels you see are the pixels you remember.

  The result is the look, sound and feel of the originals, but as
  fast, lightweight web pages that run on anything with a browser
  - desktop, laptop, phone or tablet.


  OPEN SOURCE

  Every game is its own open-source project. Right-click any game
  in the Old Games folder and choose "View Source on GitHub" to
  see exactly how it was made.

  -----------------------------------------------------------------

  HOW TO USE

   * Double-click the "Old Games" folder to browse the collection.
   * Double-click a game to launch it in its own window.
   * Drag a window by its title bar to move it; drag any edge or
     corner to resize - the game scales right along with it.
   * Use the Start menu to jump straight to any game.

  Have fun. :)
`;

const menuBarStyle: CSSProperties = {
  display: 'flex',
  gap: 14,
  padding: '2px 6px 4px',
  fontSize: 13,
  flexShrink: 0,
};

const textAreaStyle: CSSProperties = {
  flex: '1 1 auto',
  minHeight: 0,
  margin: '0 2px 2px',
  padding: '4px 6px',
  border: 0,
  background: '#fff',
  color: '#000',
  resize: 'none',
  outline: 'none',
  fontFamily: 'inherit',
  fontSize: 14,
  lineHeight: 1.35,
  whiteSpace: 'pre',
  overflow: 'auto',
  boxShadow: 'inset 1px 1px 0 #808080, inset -1px -1px 0 #dfdfdf, inset 2px 2px 0 #000',
  userSelect: 'text',
};

export function InfoWindow({ win, manager }: Props) {
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
      contentStyle={{ display: 'flex', flexDirection: 'column', padding: 0 }}
    >
      <div style={menuBarStyle}>
        <span><u>F</u>ile</span>
        <span><u>E</u>dit</span>
        <span><u>S</u>earch</span>
        <span><u>H</u>elp</span>
      </div>
      <textarea readOnly value={README} style={textAreaStyle} spellCheck={false} />
    </Window95>
  );
}
