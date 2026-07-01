# Motion Canvas Animation Project

## Quick Start

```bash
npm install
npm run buildall        # builds core, 2d, vite-plugin, ui
npm run examples:dev    # starts dev server on port 9000
```

Then open `http://localhost:9000` in a browser.

## Before Committing

Run `npm run check` before every commit. This runs Biome (lint + format),
TypeScript type checking, and tests.
Do not commit code that fails `npm run check`.

**Important:** After modifying core package source, rebuild with
`npm run buildall`.

## Dev Server

```bash
npm run examples:dev    # starts dev server on port 9000
```

The dev server auto-discovers `.tsx` scene files from `projects/` (repo root).
All scenes load as a single project — no picker, use the editor's scene dropdown
to switch between them.

### Scene discovery & the starter-scene fallback

`packages/examples/vite.config.ts` resolves the scene directory at startup, in
this priority order:

1. `$PROJECTS` env var, if set (absolute or relative to `packages/examples`)
2. `projects/` at the repo root — where the user's own scenes live (git-ignored)
3. `projects.example/` — the committed **starter scene**, used as a fallback

So a **fresh clone with no `projects/` directory automatically loads the starter
scene** (`projects.example/starter.tsx`) — the editor opens onto a working
animation with zero setup. As soon as `projects/` contains at least one `.tsx`
file, that directory wins and the starter steps aside. (Verified: with `projects/`
absent and no `$PROJECTS`, the config logs "using the starter scene from
projects.example".)

`projects/` and `projects.example/` are **not linted** (they're git-ignored /
example content). The starter scene is the canonical, committed example — keep it
working; it's the first thing a new user sees.

To use a different directory:

```bash
PROJECTS=/path/to/scenes npm run examples:dev
```

## Build

`npm run buildall` builds everything needed for the dev server:

1. `core` — TypeScript compiler with path transforms
2. `2d` lib — the 2D rendering library (`build-lib`)
3. `vite-plugin` — the Motion Canvas Vite plugin (includes CLI remote control)
4. `ffmpeg` — the FFmpeg video exporter
5. `ui` — the editor UI (`tsc` typecheck + Vite build)

Every package typechecks cleanly. `buildall` builds everything needed to render
scenes and drive the editor from the CLI.

**Not built: the interactive `2d/editor` overlay** (click-to-select, node
inspector, scene-graph tab). Its plugin source targets a newer ui shortcuts API
(`makeShortcuts` / `useSurfaceShortcuts`) than this fork's ui (v3.17.2) exports,
so building it produces a plugin that fails to load. This fork's workflow is
code-first (edit `.tsx`, render via `render.mjs`), which doesn't use the overlay.
Restoring it would require porting the interactive-shortcuts subsystem into `ui`.
The upstream `bundle` scripts (npm publishing) are likewise not wired up.

## Rendering / Frame Capture

The editor exposes HTTP endpoints for programmatic control. **Use these instead
of Playwright** for all frame inspection and rendering.

### Capture a single frame

```bash
node render.mjs --frame <N> --output .artifacts/frame.png
```

Then read the PNG to visually inspect the animation at that frame.

### Check editor status

```bash
node render.mjs --status
```

Returns `{ ready, frame, duration }`.

### Trigger a full render

```bash
# MP4 video
node render.mjs --render mp4

# Image sequence (PNGs)
node render.mjs --render png
```

### How it works

- `render.mjs` makes HTTP requests to Vite dev server endpoints (`/__capture`,
  `/__render`, `/__status`)
- The Vite plugin relays these to the browser via WebSocket
- The editor's built-in listeners seek the player, render to a Stage, and return
  the frame data
- Requires the editor to be open in a browser (the browser does the actual
  rendering)

### Workflow for verifying animation changes

1. Make changes to a scene file in `projects/`
2. **Always check for errors first:** `node render.mjs --logs`
   - HMR delivers changes to the browser automatically — wait 2-3 seconds after
     saving
   - If errors appear, fix them before capturing frames
3. Capture key frames:
   `node render.mjs --frame 120 --output .artifacts/check.png`
4. Read the PNG to inspect layout, text, colors
5. Repeat at different frame numbers to check different sections of the
   animation

**IMPORTANT:** Always run `node render.mjs --logs` after every scene file edit.
Runtime errors (missing imports, type errors, bad property access) only surface
in the browser, not during `vite build`.

## Project Structure

- `projects/*.tsx` — animation scenes (makeScene2D), auto-discovered by dev
  server (gitignored, not linted)
- `projects/*.meta` — scene metadata (timeEvents, seed)
- `packages/examples/vite.config.ts` — Vite config, scans projects dir at
  startup
- `render.mjs` — CLI render/capture script
- `cli-render-plugin.ts` — standalone Vite plugin fallback (fork has this
  built-in via `packages/vite-plugin/src/partials/cliRemote.ts`)

## Color Palette

Split-complementary scheme anchored on ACCENT (200°):

| Role    | Hex       | Hue  |
| ------- | --------- | ---- |
| ACCENT  | `#38bdf8` | 200° |
| SUCCESS | `#27b990` | 160° |
| GOLD    | `#e8ad18` | 45°  |
| WARN    | `#f07830` | 25°  |
| DANGER  | `#e04e4e` | 0°   |

Panel tinted backgrounds derive from their semantic parent (same hue, S~25%,
L~6%).

## Agent Skills

### Snapshot: Capture a frame from the running animation

**When to use:** After modifying a scene file, to verify the visual output looks
correct.

```bash
node render.mjs --frame <FRAME_NUMBER> --output .artifacts/<name>.png
```

- Frame number = seconds × fps (default 60fps, so frame 120 = 2 seconds in)
- Always read the output PNG to actually inspect the result
- Check for: overlapping text, clipping, unreadable elements, layout issues
- Capture multiple frames across different sections to verify the full animation

### Export: Render the full animation to video or image sequence

**When to use:** When the user asks to render/export the animation.

```bash
# MP4 video (output goes to ./output/<project-name>.mp4)
node render.mjs --render mp4

# Image sequence (output goes to ./output/<project-name>/)
node render.mjs --render png
```

- The editor must be open in a browser and the Vite dev server must be running
- MP4 render timeout is 10 minutes; image sequence uses the default frame
  exporter
- Check `node render.mjs --status` first to confirm the editor is ready

### Check for errors: Fetch compilation/runtime errors from the editor

**When to use:** After modifying scene code, to check if the editor hit any
errors (before or instead of capturing a frame).

```bash
node render.mjs --logs
```

- Returns recent errors and warnings from the Motion Canvas logger
- Clears the log buffer after reading so you only see new errors on each call
- Run this after editing scene files to catch TypeScript/runtime errors that
  only surface in the browser
- A clean `vite build` is NOT sufficient — many errors only appear at runtime in
  the editor

### Prerequisites

- Build all packages: `npm run buildall`
- Vite dev server running on port 9000: `npm run examples:dev`
- Editor open in a browser at `http://localhost:9000`
- If `--status` returns `{"ready":false}` or times out, the browser tab needs to
  be open/refreshed
