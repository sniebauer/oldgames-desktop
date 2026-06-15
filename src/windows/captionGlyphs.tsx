// Pixel-accurate Windows 95 caption-button glyphs, drawn as crisp-edged SVGs so
// they match the originals exactly at 1x. They inherit the button's text color
// via `currentColor` (near-black on the gray button face, just like Win95).

const crisp = { shapeRendering: 'crispEdges' as const, display: 'block' as const };

// Minimize: a short bar resting on the bottom-left of the button.
export function MinimizeGlyph() {
  return (
    <svg width={11} height={9} viewBox="0 0 11 9" style={crisp} aria-hidden>
      <rect x={1} y={7} width={6} height={2} fill="currentColor" />
    </svg>
  );
}

// Maximize: a window outline with a thick (2px) title bar.
export function MaximizeGlyph() {
  return (
    <svg width={11} height={10} viewBox="0 0 11 10" style={crisp} aria-hidden>
      <rect x={0} y={0} width={11} height={10} fill="currentColor" />
      <rect x={1} y={3} width={9} height={6} fill="#c6c6c6" />
    </svg>
  );
}

// Restore: two overlapping windows (shown when the window is maximized).
export function RestoreGlyph() {
  return (
    <svg width={11} height={10} viewBox="0 0 11 10" style={crisp} aria-hidden>
      {/* back window */}
      <rect x={3} y={0} width={8} height={7} fill="currentColor" />
      <rect x={4} y={2} width={6} height={4} fill="#c6c6c6" />
      {/* front window (drawn over the back one) */}
      <rect x={0} y={3} width={8} height={7} fill="currentColor" />
      <rect x={1} y={5} width={6} height={4} fill="#c6c6c6" />
    </svg>
  );
}

// Close: the stair-stepped X, 8x7, exactly as Win95 renders it.
export function CloseGlyph() {
  // Each row is two 2px segments (left + mirrored right) marching toward the
  // center, meeting in a single 2px square at the middle row.
  const rows = [
    [0, 6],
    [1, 5],
    [2, 4],
    [3], // center
    [2, 4],
    [1, 5],
    [0, 6],
  ];
  return (
    <svg width={8} height={7} viewBox="0 0 8 7" style={crisp} aria-hidden>
      {rows.flatMap((xs, y) =>
        xs.map((x) => <rect key={`${x}-${y}`} x={x} y={y} width={2} height={1} fill="currentColor" />),
      )}
    </svg>
  );
}
