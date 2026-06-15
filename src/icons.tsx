// Hand-rolled Win95-style folder icon (manila folder), used on the desktop, the
// folder window title bar, and the Start menu. Drawn as an SVG so it stays crisp
// at any size with zero asset dependencies.

interface IconProps {
  size?: number;
}

export function FolderIcon({ size = 32 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" shapeRendering="crispEdges" aria-hidden>
      {/* back flap */}
      <path d="M2 7h10l3 3h15v4H2z" fill="#000" />
      <path d="M3 8h9l3 3h13v3H3z" fill="#ffdf6e" />
      {/* folder body */}
      <path d="M2 11h28v18H2z" fill="#000" />
      <path d="M3 12h26v16H3z" fill="#ffd34d" />
      {/* open-folder front face highlight */}
      <path d="M4 13h24l-3 13H4z" fill="#fff0b0" />
      <path d="M5 14h22l-2.6 11H5z" fill="#ffdf6e" />
    </svg>
  );
}

// A Win95-style Recycle Bin: a gray bin with vertical ridges, crumpled white
// papers poking out, and the blue recycle arrows on the front.
export function RecycleBinIcon({ size = 32 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
      {/* bin body */}
      <path d="M6 11 H26 L24 30 H8 Z" fill="#c6c6c6" stroke="#000" strokeWidth="1" strokeLinejoin="round" />
      {/* side shading */}
      <path d="M6 11 H8 L9.5 30 H8 Z" fill="#e6e6e6" />
      <path d="M24 11 H26 L24 30 H22.5 Z" fill="#9a9e9c" />
      {/* vertical ridges */}
      <g stroke="#8a8e8c" strokeWidth="1">
        <line x1="12" y1="13" x2="11" y2="29" />
        <line x1="16" y1="13" x2="16" y2="29" />
        <line x1="20" y1="13" x2="21" y2="29" />
      </g>
      {/* recycle arrows: three arrowheads pinwheeling around the bin face */}
      <g fill="#0a64c8" stroke="#063e7d" strokeWidth="0.4" strokeLinejoin="round">
        <path d="M16 17 L13.9 20 L18.1 20 Z" />
        <path d="M21.6 24.6 L20.05 21.3 L17.95 24.9 Z" />
        <path d="M10.4 24.6 L14.05 24.9 L11.95 21.3 Z" />
      </g>
      {/* rim + dark opening */}
      <ellipse cx="16" cy="11" rx="10" ry="3" fill="#b6b6b6" stroke="#000" strokeWidth="1" />
      <ellipse cx="16" cy="10.8" rx="7.6" ry="1.9" fill="#6e6e6e" />
      {/* crumpled papers sticking up out of the opening */}
      <path
        d="M10 11 L9.5 7 L11.5 8.5 L13 4 L15 8 L16.5 3.5 L18.5 8 L20 5.5 L21 8.5 L22 11 Z"
        fill="#fff"
        stroke="#8a8a8a"
        strokeWidth="0.7"
        strokeLinejoin="round"
      />
      <g stroke="#d0d0d0" strokeWidth="0.6">
        <line x1="13" y1="6.5" x2="13.5" y2="10.5" />
        <line x1="16.5" y1="6" x2="16.5" y2="10.5" />
        <line x1="19" y1="7.5" x2="18.7" y2="10.5" />
      </g>
    </svg>
  );
}

// A Win95-style text document: a white page with a folded top-right corner and
// gray lines of "text". Used for the desktop "Read Me" / Info file.
export function TextFileIcon({ size = 32 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" shapeRendering="crispEdges" aria-hidden>
      {/* page with a diagonally cut (folded) top-right corner */}
      <path d="M7 2 H20 L25 7 V30 H7 Z" fill="#fff" stroke="#000" strokeWidth={1} />
      {/* the folded corner */}
      <path d="M20 2 L25 7 H20 Z" fill="#c6c6c6" stroke="#000" strokeWidth={1} strokeLinejoin="round" />
      {/* lines of text */}
      <g fill="#404040">
        <rect x={10} y={12} width={11} height={1} />
        <rect x={10} y={15} width={11} height={1} />
        <rect x={10} y={18} width={11} height={1} />
        <rect x={10} y={21} width={11} height={1} />
        <rect x={10} y={24} width={7} height={1} />
      </g>
    </svg>
  );
}
