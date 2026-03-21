# Motion Canvas Animation Project

## Before Committing

Run `npm run check` before every commit. This runs Biome (lint + format), TypeScript type checking, and tests.
Do not commit code that fails `npm run check`.

**Important:** After modifying core package source, rebuild `lib/` with `npx tspc -p packages/core/tsconfig.build.json` so 2d tests can resolve `.md` imports.

## Editor Setup

The Vite dev server runs on port 9000. The editor must be open in a browser for
the CLI to work.

- Start server: `npx vite --port 9000`
- Open in browser:
  `/yolobox/scripts/yolobox-open-url http://animation-proto.local:9000`

The project uses a fork of Motion Canvas at `/workspace/motion-canvas`
(github.com/jvanderberg/motion-canvas) with CLI remote control baked in.

## Rendering / Frame Capture

The editor exposes HTTP endpoints for programmatic control. **Use these instead
of Playwright** for all frame inspection and rendering.

### Capture a single frame

```bash
node render.mjs --frame <N> --output /workspace/.artifacts/frame.png
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

1. Make changes to a scene file in `src/scenes/`
2. **Always check for errors first:** `node render.mjs --logs`
   - HMR delivers changes to the browser automatically — wait 2-3 seconds after
     saving
   - If errors appear, fix them before capturing frames
3. Capture key frames:
   `node render.mjs --frame 120 --output /workspace/.artifacts/check.png`
4. Read the PNG to inspect layout, text, colors
5. Repeat at different frame numbers to check different sections of the
   animation

**IMPORTANT:** Always run `node render.mjs --logs` after every scene file edit.
Runtime errors (missing imports, type errors, bad property access) only surface
in the browser, not during `vite build`.

## Project Structure

- `src/project.ts` — project config, active scenes, plugins
- `src/scenes/*.tsx` — animation scenes (makeScene2D)
- `src/scenes/*.meta` — scene metadata (timeEvents, seed)
- `cli-render-plugin.ts` — Vite plugin for HTTP endpoints (project-local
  fallback; fork has this built-in)
- `src/cli-plugin.ts` — Motion Canvas plugin for WebSocket listeners
  (project-local fallback; fork has this built-in)
- `render.mjs` — CLI script
- `vite.config.ts` — Vite config with motion-canvas + ffmpeg + cli-render
  plugins

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
node render.mjs --frame <FRAME_NUMBER> --output /workspace/.artifacts/<name>.png
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

- Vite dev server running on port 9000: `npx vite --port 9000`
- Editor open in browser:
  `/yolobox/scripts/yolobox-open-url http://animation-proto.local:9000`
- If `--status` returns `{"ready":false}` or times out, the browser tab needs to
  be open/refreshed
