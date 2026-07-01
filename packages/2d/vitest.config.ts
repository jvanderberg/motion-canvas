import markdownLiterals from '@motion-canvas/internal/vite/markdown-literals';
import {defineConfig} from 'vitest/config';

// Resolve `@motion-canvas/core` to its TypeScript source rather than the built
// `lib/`. This keeps the test run independent of build state (a clean checkout
// can `npm run check` without building core first) and lets the markdownLiterals
// plugin resolve core's `__logs__/*.md` imports from source. The `/lib/` subpath
// import maps onto the matching source path.
const coreSrc = new URL('../core/src', import.meta.url).pathname;

export default defineConfig({
  plugins: [markdownLiterals()],
  resolve: {
    alias: [
      {find: /^@motion-canvas\/core\/lib\/(.*)$/, replacement: `${coreSrc}/$1`},
      {find: /^@motion-canvas\/core$/, replacement: coreSrc},
    ],
  },
  test: {
    include: ['./src/lib/**/*.test.*'],
    environment: 'jsdom',
  },
});
