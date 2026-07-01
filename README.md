<br/>
<p align="center">
  <a href="https://motioncanvas.io">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://motion-canvas.github.io/img/logo_dark.svg">
      <img width="180" alt="Motion Canvas logo" src="https://motion-canvas.github.io/img/logo.svg">
    </picture>
  </a>
</p>
<p align="center">
  <a href="https://vitejs.dev"><img src="https://img.shields.io/badge/powered%20by-vite-646cff?style=flat" alt="powered by vite"></a>
  <a href="https://biomejs.dev"><img src="https://img.shields.io/badge/linted%20with-biome-60a5fa?style=flat" alt="linted with biome"></a>
</p>
<br/>

# Motion Canvas — CLI-render fork

A fork of [Motion Canvas](https://github.com/motion-canvas/motion-canvas) set up
for **file-based scenes** and **headless rendering**. It keeps the full editor
but adds a batteries-included workflow: drop `.tsx` scene files in a folder, open
the editor, and capture frames or render video from the command line.

> Motion Canvas is a TypeScript library for programming animations with
> generators, plus an editor that gives you a real-time preview. If you're new to
> it, start with the [official docs](https://motioncanvas.io/docs/).

## What this fork adds

| Feature | Description |
| ------- | ----------- |
| **Scene auto-discovery** | Every `.tsx` in `projects/` loads as one project — no manual project wiring. Switch scenes with the editor's dropdown. |
| **CLI render / capture** | `render.mjs` talks to the running editor over HTTP to grab single frames or trigger a full MP4 / PNG-sequence render, so agents and scripts can inspect output without a browser in the loop. |
| **`buildall` script** | One command builds every package the dev server needs (`core`, `2d`, `vite-plugin`, `ffmpeg`, `ui`) — all typecheck cleanly. |
| **Vite 8 + Vitest 4** | Upgraded build toolchain. |
| **Biome** | Replaces ESLint + Prettier for lint/format. |
| **Starter scene** | A committed example so a fresh clone shows something immediately. |

## Quick start

```bash
npm install
npm run buildall        # builds core, 2d, vite-plugin, ffmpeg, ui
npm run examples:dev    # dev server on http://localhost:9000
```

Open `http://localhost:9000`. **On a fresh clone this Just Works with no setup:**
you have no scenes of your own yet, so the dev server automatically falls back to
the bundled **starter scene** (`projects.example/starter.tsx`) and starts playing
it. There's no project picker and nothing to configure — the editor opens
straight onto a working animation.

### Add your own scenes

Create a `projects/` directory at the repo root and drop `.tsx` scene files in
it (it's git-ignored, so your work stays out of the fork's history):

```bash
mkdir -p projects
cp projects.example/starter.tsx projects/my-scene.tsx
```

The dev server picks it up on the next start. As soon as `projects/` has at least
one `.tsx` file, the starter scene steps aside. Each scene may have a matching
`.meta` file (time events + seed); one is created automatically if absent.

Point the server at any directory with:

```bash
PROJECTS=/path/to/scenes npm run examples:dev
```

## Rendering & frame capture

The editor exposes HTTP endpoints; `render.mjs` drives them. **The editor must be
open in a browser** — the browser does the actual rendering.

```bash
node render.mjs --status                       # { ready, frame, duration }
node render.mjs --frame 120 -o frame.png       # capture one frame to PNG
node render.mjs --render mp4                    # full MP4 render
node render.mjs --render png                    # PNG image sequence
node render.mjs --logs                          # recent editor errors/warnings
node render.mjs --help
```

- Frame number = seconds × fps (default 60fps → frame 120 = 2s in).
- Rendered output goes to `<projects-dir>/rendered/`.
- `--port` overrides the default dev-server port (9000).

After editing a scene, run `node render.mjs --logs` — many runtime errors
(bad imports, property access) only surface in the browser, never during
`vite build`.

## Before committing

```bash
npm run check           # Biome lint/format + tsc typecheck + unit tests
```

After changing **core** package source, rebuild with `npm run buildall`.

## Project layout

| Path | What it is |
| ---- | ---------- |
| `projects/` | Your scenes (git-ignored). Auto-discovered by the dev server. |
| `projects.example/` | The committed starter scene — fallback when `projects/` is empty. |
| `packages/examples/vite.config.ts` | Scans the projects dir and generates a single project module. |
| `render.mjs` | CLI render/capture client. |
| `packages/vite-plugin/src/partials/cliRemote.ts` | Editor-side of the CLI remote-control API. |
| `CLAUDE.md` | Agent instructions + skills for this repo. |

## Color palette

Split-complementary scheme anchored on ACCENT (200°):

| Role | Hex | Hue |
| ---- | --- | --- |
| ACCENT | `#38bdf8` | 200° |
| SUCCESS | `#27b990` | 160° |
| GOLD | `#e8ad18` | 45° |
| WARN | `#f07830` | 25° |
| DANGER | `#e04e4e` | 0° |

## Credits & license

This is a fork of [Motion Canvas](https://github.com/motion-canvas/motion-canvas)
by [Jacob Jackson (@aarthificial)](https://github.com/aarthificial) and
contributors. All credit for Motion Canvas itself goes to the upstream project.
Licensed under the [MIT License](./LICENSE).
