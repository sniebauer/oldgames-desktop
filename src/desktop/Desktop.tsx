// The desktop background: teal wallpaper + desktop icons. The "Old Games" folder icon
// (re)opens the folder window. Open windows render as siblings on top of this.

import { useState, type CSSProperties } from 'react';
import { FolderIcon } from '../icons';

interface Props {
  onOpenFolder: () => void;
}

const deskStyle: CSSProperties = {
  position: 'absolute',
  inset: 0,
  background: '#008080',
  overflow: 'hidden',
};

export function Desktop({ onOpenFolder }: Props) {
  const [selected, setSelected] = useState(false);
  return (
    <div style={deskStyle} onPointerDown={() => setSelected(false)}>
      <DesktopIcon
        label="Old Games"
        selected={selected}
        onSelect={() => setSelected(true)}
        onOpen={onOpenFolder}
      />
    </div>
  );
}

interface IconProps {
  label: string;
  selected: boolean;
  onSelect: () => void;
  onOpen: () => void;
}

function DesktopIcon({ label, selected, onSelect, onOpen }: IconProps) {
  return (
    <div
      role="button"
      onPointerDown={(e) => { e.stopPropagation(); onSelect(); }}
      onDoubleClick={onOpen}
      style={{
        position: 'absolute',
        left: 16,
        top: 16,
        width: 80,
        padding: 6,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        cursor: 'default',
      }}
    >
      <FolderIcon size={40} />
      <span
        style={{
          marginTop: 4,
          fontSize: 12,
          color: '#fff',
          padding: '1px 3px',
          background: selected ? '#000080' : 'transparent',
          outline: selected ? '1px dotted #fff' : 'none',
          textShadow: '1px 1px #000',
        }}
      >
        {label}
      </span>
    </div>
  );
}
