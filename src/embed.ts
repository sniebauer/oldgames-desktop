// Host side of the "oldgame" embed protocol. Each game (in its iframe) posts
// messages up to the shell so the shell's Win95 title bar can track the game's
// own title (e.g. "Chip's Challenge: LESSON 1"). Mirror of the game's src/embed.ts.

export interface GameMessage {
  source: 'oldgame';
  type: 'title' | 'ready';
  value?: string;
}

export function isGameMessage(data: unknown): data is GameMessage {
  return (
    !!data &&
    typeof data === 'object' &&
    (data as { source?: unknown }).source === 'oldgame' &&
    typeof (data as { type?: unknown }).type === 'string'
  );
}
