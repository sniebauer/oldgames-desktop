---
name: port-old-game
description: >-
  Port a small old Windows/DOS game into a browser game for the "Old Games"
  desktop site (oldgames-desktop). Use when the user wants to add a new game
  from its original SOURCE CODE and/or a BINARY (abandonware EXE). Faithfully
  reimplements the game in the browser — a real port, never a VM/emulator —
  matching the original as closely as the source allows, then wires it into the
  site with the shared conventions: Win95 chrome, the W95FA font, the postMessage
  embed protocol, a "View Source on GitHub" menu link, its own public GitHub
  repo, and a Cloudflare Pages deploy. Mirrors exactly how Chip's Challenge was
  built (the reference implementation: github.com/sniebauer/chips-challenge-web).
---

# Port an old game to the "Old Games" site

You are adding ONE small old game to the Old Games desktop (a Win95-desktop site
that hosts each game in a draggable window via an `<iframe>`). The game becomes
its own standalone site + public repo, embedded by the shell. Match the
conventions established by **Chip's Challenge** — study that repo as the canonical
example whenever unsure.

Goal: a **faithful reimplementation**, not an emulator. Use the original source
to match behavior as closely as possible; verify with **multiple passes** that it
is legit (matches the source) and actually works in a real browser.

## Layout (where things live)

- **Shell / site:** `/Users/sniebauer/Code/sites/oldgames-desktop` (this repo).
  Registry: `src/games.ts`. Game icons: `public/icons/<id>.png`. The shell auto-
  deploys to Cloudflare Pages on push (Git integration). W95FA font lives at
  `src/fonts/w95fa.woff2` (SIL OFL, `src/fonts/w95fa-OFL.txt`).
- **Each game:** its OWN sibling repo at `/Users/sniebauer/Code/sites/<id>-web`,
  its own public GitHub repo `github.com/sniebauer/<id>-web`, its own Cloudflare
  Pages project `<id>` → `<id>.pages.dev`.
- **Reference game:** `/Users/sniebauer/Code/sites/chips-challenge-web` — copy its
  patterns (`src/embed.ts`, the renderer's device-res `fit()`, the W95FA loader,
  the `tools/extract-*.mjs` pipeline, `tools/` README links).

## Before you start — confirm with the user

Ask (briefly, in one message) for anything not already provided:
1. **Game name + id** (e.g. "Minesweeper" → `minesweeper`). The id is kebab-case;
   the repo is `<id>-web`, the deploy `<id>.pages.dev`.
2. **The source.** A path to the original game's **source code** (port it) and/or
   a **binary / abandonware** (extract assets, find a logic reference). Confirm
   the language (C, Pascal, BASIC, asm, JS, …) and roughly how big it is.
3. **Assets:** are graphics/sound embedded in the source, in a separate binary
   (EXE/resource), or do they need recreating?
4. Note the **copyright trade-off** is already accepted for this site (original
   game assets are bundled but kept swappable; originals + dev tools are
   gitignored). Don't re-litigate it; just follow the asset rules below.

## The rules — Definition of Done (every game must satisfy these)

A game is done when ALL of these hold (this is the Chip's Challenge checklist):

- [ ] **Faithful port.** Behavior matches the original source as closely as
      possible — a real reimplementation, no VM/emulator/recompiled binary.
- [ ] **Own public GitHub repo** `sniebauer/<id>-web`, with the repo **homepage**
      set to `https://<id>.pages.dev` and a README whose first line is
      `**▶ Play it: [<id>.pages.dev](https://<id>.pages.dev)**`.
- [ ] **In the site registry** (`oldgames-desktop/src/games.ts`) with
      `{ id, title, icon, src, repoUrl, width, height }`; the program **icon** at
      `oldgames-desktop/public/icons/<id>.png`.
- [ ] **No OS title bar** in the game — the shell draws the Win95 title bar. The
      game renders only its content (+ its own menu bar if it has one) and
      **reports its title** to the host via the embed protocol.
- [ ] **Embed protocol** implemented (`src/embed.ts`): posts
      `{source:'oldgame', type:'title', value}` (and `{type:'ready'}`) to the
      parent when framed; sets `document.title` when standalone.
- [ ] **"View Source on GitHub"** entry in the game's own menu, opening `repoUrl`.
- [ ] **W95FA font** used for the game's chrome (menus/dialogs) so it matches the
      Win95 look; bundle `assets/fonts/w95fa.woff2` (+ the OFL license).
- [ ] **Crisp at any size.** If canvas-based, render at **device resolution** so
      text stays sharp when the window resizes (see gotchas). Scale may go below
      1 so it fits small/mobile screens.
- [ ] **Mobile-friendly.** Fits the width; touch controls suit the game (on-screen
      buttons for action games, taps for point-and-click) — match how the original
      played. Grab keyboard focus on pointerdown (iframe focus, see gotchas).
- [ ] **Verified in a real browser** (chrome-devtools MCP), standalone AND embedded
      in the shell.
- [ ] **`npm run build` is clean** (tsc + bundle) and any tests pass.

## Workflow (phased, multi-pass — do not skip the verification passes)

### Phase 1 — Understand the original
Read the source end to end. Identify: the game loop / tick model, input handling,
the data model (board/entities/state), win/lose rules, RNG (port it bit-exactly if
the original is deterministic — see Chip's `random-ms.ts`), and where assets live.
Write a short model of how it works before coding. If only a binary exists, find a
public source reference for the logic (as Chip's used Tile World's `mslogic.c`).

### Phase 2 — Scaffold the game repo
Create `/Users/sniebauer/Code/sites/<id>-web`. Pick the **best internals for THIS
game** (Canvas+Vite for action/tile/arcade games like Chip's; DOM/SVG is fine for
card/text/board games) — but the shared conventions below are non-negotiable.
Mirror Chip's `package.json`, `tsconfig.json`, `vite.config`, `.gitignore`
(ignore `node_modules`, `dist`, `.src_game/`, dev soundfonts, and any
provenance-only asset copies). Put originals/binaries under `.src_game/`
(gitignored). Run the dev server on its own port (`vite --port <p> --strictPort`).

### Phase 3 — Assets
Build a `tools/extract-*.mjs` pipeline (committed; reads gitignored originals,
writes committed `assets/`). Two paths:
- **Embedded in source:** transcode inline sprite/level/sound data into
  `assets/` (PNG atlases, JSON, audio).
- **In a binary (Chip's path):** `wrestool`/`icotool` (icoutils) to pull bitmaps +
  the program icon from an EXE; `ffmpeg` to decode DIBs/sounds; `pngjs` to
  composite atlases. Copy the program icon to the shell's `public/icons/<id>.png`.
Keep assets swappable. Do NOT commit a full provenance copy of the source sheet
(gitignore it like Chip's `assets/fonts/source.png`).

### Phase 4 — Faithful engine port (MULTI-PASS)
Reimplement the logic in TypeScript. Then iterate:
1. **Port pass:** translate the source's algorithm structure, not a paraphrase.
2. **Diff pass:** re-read the original side-by-side; list every behavior the port
   gets wrong or omits; fix.
3. **Determinism pass:** if the original is deterministic, match RNG + tick order
   exactly. If the original ships recorded solutions/demos (rare, like Chip's
   `.tws`), build a **regression test** that replays them — that's your oracle.
Repeat 2–3 until you can't find divergences.

### Phase 5 — Win95 chrome + embed protocol + fonts
- Add `src/embed.ts` (copy Chip's): `reportTitle(value)` posts
  `{source:'oldgame', type:'title', value}` to `window.parent` when framed, else
  sets `document.title`; `reportReady()` posts `{type:'ready'}`. Call them when
  the level/screen/title changes and on load.
- Drop any OS title bar the game draws. Keep the menu bar / content.
- If the game has menus, render them Win95-style and use **W95FA** (load the woff2
  via the FontFace API for canvas, or `@font-face` for DOM). Add the **View Source
  on GitHub** menu item → `window.open(repoUrl, '_blank', 'noopener')`.

### Phase 6 — Mobile + responsive rendering
- Canvas games: render at **device resolution** (backing = displaySize × dpr,
  `ctx.setTransform`, `imageSmoothingEnabled=false`); allow the fit scale `<1`.
- On touch (`matchMedia('(pointer: coarse)')`): give the game a sensible
  touch layout (e.g. controls below the board, fit to width). Match the original's
  feel.

### Phase 7 — Verify in the browser (MULTI-PASS, chrome-devtools MCP)
- Run the dev server; load standalone; **playtest** the core loop, win, lose,
  restart, menus, the "View Source" link, resize (text stays crisp), and mobile
  (emulate a phone viewport).
- Then load it **embedded in the shell** (add a temporary dev registry entry) and
  confirm: opens in a window, title bar tracks the game's reported title,
  keyboard works after clicking, no black bars on resize.
- Re-pass: fix what's wrong, re-verify. (Gotcha: don't put long `await`s inside
  one `evaluate_script` — it blocks the rAF loop and the game looks frozen.)

### Phase 8 — Wire into the site
- Add the registry entry to `oldgames-desktop/src/games.ts`:
  `{ id, title, icon: '/icons/<id>.png', src: DEV ? 'http://localhost:<p>/' :
  'https://<id>.pages.dev/', repoUrl, width, height }` (width/height = the game's
  native content size). Drop the icon at `public/icons/<id>.png`.
- The shell handles the window, aspect-lock, and embedding — no other shell change
  is usually needed.

### Phase 9 — PAUSE, then publish (only on the user's go-ahead)
Stop and summarize what's built and verified. Publishing is outward-facing — do
NOT do it until the user confirms. Then:
1. `git init` the game repo (branch `main`), initial commit (Co-Authored-By
   trailer), verify no `node_modules`/`.src_game`/provenance files are staged.
2. `gh repo create sniebauer/<id>-web --public --source=. --remote=origin --push`;
   set the homepage: `gh repo edit --homepage https://<id>.pages.dev`.
3. Create + deploy the Pages project: `wrangler pages project create <id>
   --production-branch=main`, then `npm run build && wrangler pages deploy dist
   --project-name=<id> --branch=main`.
4. Confirm the prod registry `src`/`repoUrl` point at the real URLs, commit the
   shell change, push (the shell auto-deploys).
5. Verify the live site: standalone plays; the shell embeds the prod game; the
   title bar tracks; "View Source" opens the repo.

## Reference — the embed protocol (host ↔ game)

The game (in the iframe) posts up; the shell validates origin and shows the title.
Game side (`src/embed.ts`), mirror Chip's:

```ts
const SOURCE = 'oldgame';
const inIframe = () => { try { return window.parent != null && window.parent !== window; } catch { return true; } };
let last = '';
export function reportTitle(v: string): void {
  if (v === last) return; last = v;
  document.title = `<Game Name>: ${v}`;
  if (inIframe()) window.parent.postMessage({ source: SOURCE, type: 'title', value: v }, '*');
}
export function reportReady(): void {
  if (inIframe()) window.parent.postMessage({ source: SOURCE, type: 'ready' }, '*');
}
```

The host (shell `src/embed.ts` + `windows/GameWindow.tsx`) already listens, checks
`event.origin === gameOrigin(game)`, and sets the window title — you don't touch it.

## Hard-won gotchas (lessons from building Chip's)

- **Crisp fonts on resize:** a fixed-resolution canvas scaled up like a bitmap
  makes text blocky. Render the backing store at the displayed size × dpr with a
  context transform; keep `imageSmoothingEnabled=false` so sprites stay pixel-
  sharp while vector text antialiases. The shell must let the iframe FILL the
  window (it does) — never CSS-`transform: scale()` a native-size iframe.
- **`fit()` scale floor:** don't clamp to ≥1, or the game overflows small/mobile
  screens. Allow `<1`.
- **iframe keyboard focus:** clicking a (non-focusable) canvas in the shell leaves
  keyboard focus with the parent. Call `window.focus()` on the canvas pointerdown
  so keys reach the game.
- **Audio started muted:** if music/SFX can start muted, still load a source so
  un-muting actually plays (don't call `play()` on a source-less element).
- **chrome-devtools MCP:** long `await setTimeout` chains inside one
  `evaluate_script` freeze the page rAF — the game looks stuck but isn't. Use real
  `press_key` + short evals. If a full-page screenshot times out, grab the canvas
  via `canvas.toDataURL()` and decode it.
- **Dev servers** drop sometimes — restart with `npm run dev -- --port <p>
  --strictPort`. Close stale browser tabs (they confuse MCP screenshots).
- **Copyright:** bundle the game's own assets (accepted trade-off), keep them
  swappable; gitignore the raw originals (`.src_game/`), dev tools (soundfonts),
  and any full provenance copy. Use an OFL/permissive font (W95FA) — don't ship
  Microsoft's actual font.
- **Engine fidelity has a long tail.** Getting the last few % of frame-exact parity
  on a complex engine can require a from-scratch-faithful move loop and may not be
  worth it. Ship a fully-playable, close port; don't chase diminishing returns into
  regressions. (See Chip's: 121/141 recorded solutions replay — feature-complete.)

## Done

Report: the live URLs, the repo, what was verified (standalone + embedded), build
status, and any known fidelity gaps. Offer to record project notes in memory.
