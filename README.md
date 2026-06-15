# Old Games — a Windows 95 desktop

A website that looks like a **Windows 95 desktop** with an open **"Old Games" folder**,
hosting a small collection of old Windows games (Microsoft Entertainment Pack style).
Each game is its own public repo and its own independently-deployed site; this shell
embeds each game in a Win95 window via an `<iframe>` and provides the desktop chrome.

Built with **React + Vite + [react95](https://github.com/react95-io/React95)** +
styled-components + react-router.

## Develop

```sh
npm install
npm run dev     # http://localhost:5174
```

Games are loaded from their own dev servers in development (e.g. Chip's Challenge at
`http://localhost:5173`). See `src/games.ts` for the registry and the dev/prod `src`
URLs.

```sh
npm run build   # typecheck + production build to dist/
npm run deploy  # build + wrangler pages deploy (Cloudflare Pages)
```

## Structure

```
src/
  main.tsx            React root: react95 ThemeProvider + BrowserRouter
  App.tsx             Desktop shell; syncs the URL with the top-most game window
  games.ts            Registry: [{ id, title, icon, src, repoUrl, width, height }]
  embed.ts            Host side of the postMessage embed protocol
  constants.ts        Shared layout constants (taskbar height)
  icons.tsx           Hand-drawn SVG folder icon
  desktop/            Desktop wallpaper, "Old Games" folder window, taskbar, Start menu
  windows/            Window manager (z-order/focus/min/max/drag) + the game iframe window
public/icons/         The folder icon + each game's program icon
```

## Adding a game

1. Build the game as its own standalone site/repo. It must:
   - render only its content + menu bar (no OS title bar — the shell owns that), and
   - implement the **embed protocol** below so the shell's title bar can track it.
2. Deploy it (its own Cloudflare Pages project / URL).
3. Add an entry to `GAMES` in `src/games.ts` (`id`, `title`, `icon`, `src`, `repoUrl`,
   native `width`/`height`).
4. Drop the game's program icon in `public/icons/<id>.png`.

The game is then reachable at `/<id>` (deep-linkable) and appears in the folder, the
Start menu, and the taskbar.

## Embed protocol

A tiny `postMessage` contract between a game (inside the iframe) and this shell:

```js
// game -> host, on load and whenever its title changes:
window.parent.postMessage({ source: 'oldgame', type: 'title', value: 'LESSON 1' }, '*')
window.parent.postMessage({ source: 'oldgame', type: 'ready' }, '*')
```

The host validates the message's origin against the game's registered `src` origin and
shows `"<game title>: <value>"` in that window's Win95 title bar. The game-side helper
lives in each game repo (see Chip's `src/embed.ts`); extract it to a shared
`@oldgames/embed` package once a second game lands.
