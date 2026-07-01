#!/usr/bin/env node
/**
 * Copy non-TypeScript log assets (`.md` files under `__logs__/` directories)
 * from `src/` into the compiled `lib/` output, preserving directory structure.
 *
 * The core/2d libraries import these markdown files directly (e.g.
 * `import msg from './__logs__/experimental-features.md'`). `tsc`/`tspc` only
 * emits `.js`/`.d.ts` and silently drops the `.md` files, so the built `lib`
 * would be missing them — leaving unresolved imports that break the dev server
 * and any consumer resolving the package via its `lib/` entry.
 *
 * The `.md` imports themselves are turned into JS by the `markdownLiterals`
 * Vite/Vitest plugin; this script only ensures the files are present to resolve.
 *
 * Run from a package directory, passing the source root that maps onto `lib/`
 * (the compiler's `rootDir`). Defaults to `src`:
 *   core: `node ../../scripts/copy-log-assets.mjs`         (rootDir = src)
 *   2d:   `node ../../scripts/copy-log-assets.mjs src/lib`  (rootDir = src/lib)
 */

import {cpSync, existsSync, statSync} from 'node:fs';
import {resolve} from 'node:path';

const cwd = process.cwd();
const srcBase = process.argv[2] ?? 'src';
const srcDir = resolve(cwd, srcBase);
const libDir = resolve(cwd, 'lib');

if (!existsSync(srcDir) || !existsSync(libDir)) {
  // Nothing to do (e.g. package has no compiled output).
  process.exit(0);
}

cpSync(srcDir, libDir, {
  recursive: true,
  // Copy directories (so we can recurse into them) and `.md` files only.
  filter: source => statSync(source).isDirectory() || source.endsWith('.md'),
});
