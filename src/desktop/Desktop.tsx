// The desktop background: teal wallpaper + desktop icons. Double-clicking an
// icon opens its window. Open windows render as siblings on top of this.

import { useState, type CSSProperties, type ReactNode } from 'react';
import { FolderIcon, TextFileIcon } from '../icons';
import { useIsMobile } from '../useIsMobile';

interface Props {
  onOpenFolder: () => void;
  onOpenInfo: () => void;
  onOpenAbandonware: () => void;
}

const deskStyle: CSSProperties = {
  position: 'absolute',
  inset: 0,
  background: '#008080',
  overflow: 'hidden',
};

export function Desktop({ onOpenFolder, onOpenInfo, onOpenAbandonware }: Props) {
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
        <DesktopIcon
          id="abandonware"
          label="abandonware.online"
          selected={selected === 'abandonware'}
          onSelect={() => setSelected('abandonware')}
          onOpen={onOpenAbandonware}
        >
          <img
            src="/icons/abandonware.png"
            alt=""
            width={40}
            height={40}
            draggable={false}
            style={{ imageRendering: 'pixelated' }}
          />
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
  const isMobile = useIsMobile();
  return (
    <div
      role="button"
      onPointerDown={(e) => { e.stopPropagation(); onSelect(); }}
      onClick={isMobile ? onOpen : undefined}
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
