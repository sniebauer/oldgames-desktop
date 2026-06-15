// The shared Win95 window chrome (react95 <Window> + title bar with
// minimize/maximize/close + drag). Both the "Old Games" folder and each game
// window render their content inside this. The shell owns this frame; embedded
// games draw only their menu bar + content.

import type { CSSProperties, PointerEvent as ReactPointerEvent, ReactNode } from 'react';
import { Window, WindowHeader, Button } from 'react95';
import { TASKBAR_H } from '../constants';

interface Props {
  title: string;
  icon?: string;
  x: number;
  y: number;
  z: number;
  width: number;
  active: boolean;
  maximized: boolean;
  minimized: boolean;
  onFocus: () => void;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onDragStart: (e: ReactPointerEvent) => void;
  /** Style applied to the WindowContent wrapper (e.g. padding: 0 for an iframe). */
  contentStyle?: CSSProperties;
  children: ReactNode;
}

const headerBtnStyle: CSSProperties = {
  width: 22,
  height: 22,
  marginLeft: 2,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 0,
};

const glyph = (style: CSSProperties): CSSProperties => ({
  display: 'inline-block',
  ...style,
});

export function Window95(props: Props) {
  const { maximized } = props;
  const base: CSSProperties = {
    position: 'absolute',
    display: props.minimized ? 'none' : 'flex',
    flexDirection: 'column',
    zIndex: props.z,
  };
  const frameStyle: CSSProperties = maximized
    ? { ...base, left: 0, top: 0, width: '100%', height: `calc(100% - ${TASKBAR_H}px)` }
    : { ...base, left: props.x, top: props.y, width: props.width };

  return (
    <Window
      style={frameStyle}
      onPointerDown={props.onFocus}
    >
      <WindowHeader
        active={props.active}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
        onPointerDown={(e: ReactPointerEvent) => props.onDragStart(e)}
        onDoubleClick={props.onMaximize}
      >
        <span style={{ display: 'flex', alignItems: 'center', overflow: 'hidden', whiteSpace: 'nowrap' }}>
          {props.icon && (
            <img
              src={props.icon}
              alt=""
              width={16}
              height={16}
              style={{ marginRight: 6, imageRendering: 'pixelated' }}
              draggable={false}
            />
          )}
          <span style={{ textOverflow: 'ellipsis', overflow: 'hidden' }}>{props.title}</span>
        </span>
        <span
          style={{ display: 'flex', flexShrink: 0 }}
          // Buttons must not start a window drag.
          onPointerDown={(e: ReactPointerEvent) => e.stopPropagation()}
        >
          <Button style={headerBtnStyle} onClick={props.onMinimize} title="Minimize">
            <span style={glyph({ width: 8, height: 3, background: 'currentColor', marginTop: 8 })} />
          </Button>
          <Button style={headerBtnStyle} onClick={props.onMaximize} title="Maximize">
            <span style={glyph({ width: 10, height: 9, border: '1.5px solid currentColor', borderTopWidth: 3 })} />
          </Button>
          <Button style={headerBtnStyle} onClick={props.onClose} title="Close">
            <span style={{ fontWeight: 'bold', fontSize: 14, lineHeight: 1, transform: 'translateY(-1px)' }}>×</span>
          </Button>
        </span>
      </WindowHeader>
      <div style={{ flex: '1 1 auto', minHeight: 0, padding: 4, ...props.contentStyle }}>{props.children}</div>
    </Window>
  );
}
