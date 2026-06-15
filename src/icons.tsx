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
