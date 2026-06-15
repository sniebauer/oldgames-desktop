// The desktop background: teal wallpaper + desktop icons. Double-clicking an
// icon opens its window. Open windows render as siblings on top of this.

import { useState, type CSSProperties, type ReactNode } from 'react';
import { FolderIcon, TextFileIcon } from '../icons';

interface Props {
  onOpenFolder: () => void;
  onOpenInfo: () => void;
}

const deskStyle: CSSProperties = {
  position: 'absolute',
  inset: 0,
  background: '#008080',
  overflow: 'hidden',
};

export function Desktop({ onOpenFolder, onOpenInfo }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <div style={deskStyle} onPointerDown={() => setSelected(null)}>
      <div style={{ position: 'absolute', left: 16, top: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <DesktopIcon
          id="folder"
          label="Old Games"
          selected={selected === 'folder'}
          onSelect={() => setSelected('folder')}
          onOpen={onOpenFolder}
        >
          <FolderIcon size={40} />
        </DesktopIcon>
        <DesktopIcon
          id="info"
          label="Read Me"
          selected={selected === 'info'}
          onSelect={() => setSelected('info')}
          onOpen={onOpenInfo}
        >
          <TextFileIcon size={40} />
        </DesktopIcon>
      </div>
    </div>
  );
}

interface IconProps {
  id: string;
  label: string;
  selected: boolean;
  onSelect: () => void;
  onOpen: () => void;
  children: ReactNode;
}

function DesktopIcon({ label, selected, onSelect, onOpen, children }: IconProps) {
  return (
    <div
      role="button"
      onPointerDown={(e) => { e.stopPropagation(); onSelect(); }}
      onDoubleClick={onOpen}
      style={{
        width: 80,
        padding: 6,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        cursor: 'default',
      }}
    >
      {children}
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
