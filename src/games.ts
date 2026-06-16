// Registry of games hosted by the desktop. Each game is its own public repo and
// its own independently-deployed site, embedded here via an <iframe>.

export interface Game {
  id: string;
  title: string; // window / folder label
  icon: string; // /icons/<id>.png (the game's own program icon)
  src: string; // iframe source: the game's standalone deploy (localhost in dev)
  repoUrl: string; // public GitHub repo, surfaced as "View source"
  /** Native content size of the game, used to size its window. */
  width: number;
  height: number;
}

const DEV = import.meta.env.DEV;

export const GAMES: Game[] = [
  {
    id: 'chips-challenge',
    title: "Chip's Challenge",
    icon: '/icons/chips-challenge.png',
    src: DEV ? 'http://localhost:5173/' : 'https://chips-challenge.pages.dev/',
    repoUrl: 'https://github.com/sniebauer/chips-challenge-web',
    width: 518,
    height: 376,
  },
  {
    id: 'sink-sub',
    title: 'SinkSub',
    icon: '/icons/sink-sub.png',
    src: DEV ? 'http://localhost:5180/' : 'https://sink-sub-web.sniebauer.workers.dev/',
    repoUrl: 'https://github.com/sniebauer/sink-sub-web',
    width: 640,
    height: 476,
  },
];

export const gameById = (id: string): Game | undefined => GAMES.find((g) => g.id === id);

/** The origin of a game's iframe, used to validate incoming postMessages. */
export const gameOrigin = (game: Game): string => new URL(game.src).origin;
