// The shared Win95 window chrome: the react95 <Window> 3D frame wrapping a
// pixel-accurate caption bar (navy title + grouped minimize/maximize/close
// buttons) and the content. Supports dragging by the caption and resizing from
// any of the eight edges/corners. Both the "Old Games" folder and each game
// window render their content inside this; the shell owns this frame.

import type { CSSProperties, PointerEvent as ReactPointerEvent, ReactNode } from 'react';
import { Window } from 'react95';
import { CAPTION_H, FRAME_PAD, TASKBAR_H } from '../constants';
import type { ResizeEdge } from './WindowManager';
import { CloseGlyph, MaximizeGlyph, MinimizeGlyph, RestoreGlyph } from './captionGlyphs';

interface Props {
  title: string;
  icon?: string;
  x: number;
  y: number;
  z: number;
  width: number;
  height: number;
  active: boolean;
  maximized: boolean;
  minimized: boolean;
  onFocus: () => void;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onDragStart: (e: ReactPointerEvent) => void;
  onResizeStart: (edge: ResizeEdge, e: ReactPointerEvent) => void;
  /** Style applied to the content wrapper (e.g. padding: 0 for an iframe). */
  contentStyle?: CSSProperties;
  children: ReactNode;
}

// --- Caption bar --------------------------------------------------------

const captionStyle = (active: boolean): CSSProperties => ({
  height: CAPTION_H,
  display: 'flex',
  alignItems: 'center',
  padding: '0 2px 0 3px',
  background: active ? '#000080' : '#808080',
  color: '#fff',
  flexShrink: 0,
});

// A raised Win95 caption button: 16x14, classic two-tone bevel, square corners.
const capBtnStyle: CSSProperties = {
  width: 16,
  height: 14,
  padding: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: '#c6c6c6',
  color: '#0a0a0a',
  border: 0,
  boxShadow:
    'inset -1px -1px 0 #0a0a0a, inset 1px 1px 0 #fefefe, inset -2px -2px 0 #808080, inset 2px 2px 0 #c6c6c6',
};

function CaptionButton({
  onClick,
  title,
  marginLeft,
  children,
}: {
  onClick: () => void;
  title: string;
  marginLeft?: number;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      // Pressing a caption button must not start a window drag.
      onPointerDown={(e: ReactPointerEvent) => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
      style={{ ...capBtnStyle, marginLeft }}
      onPointerUp={(e) => (e.currentTarget.style.boxShadow = capBtnStyle.boxShadow as string)}
      onPointerLeave={(e) => (e.currentTarget.style.boxShadow = capBtnStyle.boxShadow as string)}
      onMouseDown={(e) =>
        (e.currentTarget.style.boxShadow =
          'inset 1px 1px 0 #0a0a0a, inset -1px -1px 0 #fefefe, inset 2px 2px 0 #808080')
      }
    >
      {children}
    </button>
  );
}

// --- Resize handles -----------------------------------------------------

const HANDLE = FRAME_PAD + 2; // grab width along an edge
const CORNER = HANDLE + 6; // larger grab zone at the corners

const edgeHandles: { edge: ResizeEdge; style: CSSProperties }[] = [
  { edge: 'n', style: { top: 0, left: CORNER, right: CORNER, height: HANDLE, cursor: 'ns-resize' } },
  { edge: 's', style: { bottom: 0, left: CORNER, right: CORNER, height: HANDLE, cursor: 'ns-resize' } },
  { edge: 'w', style: { left: 0, top: CORNER, bottom: CORNER, width: HANDLE, cursor: 'ew-resize' } },
  { edge: 'e', style: { right: 0, top: CORNER, bottom: CORNER, width: HANDLE, cursor: 'ew-resize' } },
  { edge: 'nw', style: { top: 0, left: 0, width: CORNER, height: CORNER, cursor: 'nwse-resize' } },
  { edge: 'se', style: { bottom: 0, right: 0, width: CORNER, height: CORNER, cursor: 'nwse-resize' } },
  { edge: 'ne', style: { top: 0, right: 0, width: CORNER, height: CORNER, cursor: 'nesw-resize' } },
  { edge: 'sw', style: { bottom: 0, left: 0, width: CORNER, height: CORNER, cursor: 'nesw-resize' } },
];

export function Window95(props: Props) {
  const { maximized } = props;
  const base: CSSProperties = {
    position: 'absolute',
    display: props.minimized ? 'none' : 'flex',
    flexDirection: 'column',
    padding: FRAME_PAD,
    zIndex: props.z,
  };
  const frameStyle: CSSProperties = maximized
    ? { ...base, left: 0, top: 0, width: '100%', height: `calc(100% - ${TASKBAR_H}px)` }
    : { ...base, left: props.x, top: props.y, width: props.width, height: props.height };

  return (
    <Window style={frameStyle} onPointerDown={props.onFocus}>
      <div
        style={captionStyle(props.active)}
        onPointerDown={props.onDragStart}
        onDoubleClick={props.onMaximize}
      >
        <span style={{ display: 'flex', alignItems: 'center', overflow: 'hidden', whiteSpace: 'nowrap', flex: 1 }}>
          {props.icon && (
            <img
              src={props.icon}
              alt=""
              width={16}
              height={16}
              style={{ marginRight: 4, imageRendering: 'pixelated' }}
              draggable={false}
            />
          )}
          <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', fontWeight: 'bold', fontSize: 11 }}>
            {props.title}
          </span>
        </span>
        <span style={{ display: 'flex', flexShrink: 0 }}>
          <CaptionButton onClick={props.onMinimize} title="Minimize">
            <MinimizeGlyph />
          </CaptionButton>
          <CaptionButton onClick={props.onMaximize} title={maximized ? 'Restore' : 'Maximize'}>
            {maximized ? <RestoreGlyph /> : <MaximizeGlyph />}
          </CaptionButton>
          {/* A 2px gap before Close, exactly like Win95. */}
          <CaptionButton onClick={props.onClose} title="Close" marginLeft={2}>
            <CloseGlyph />
          </CaptionButton>
        </span>
      </div>

      <div style={{ flex: '1 1 auto', minHeight: 0, marginTop: 1, ...props.contentStyle }}>{props.children}</div>

      {!maximized &&
        edgeHandles.map(({ edge, style }) => (
          <div
            key={edge}
            data-resize-edge={edge}
            onPointerDown={(e) => props.onResizeStart(edge, e)}
            style={{ position: 'absolute', zIndex: 10, ...style }}
          />
        ))}
    </Window>
  );
}
