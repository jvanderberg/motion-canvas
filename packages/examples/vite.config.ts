import * as fs from 'node:fs';
import * as path from 'node:path';
import ffmpeg from '@motion-canvas/ffmpeg';
import markdownLiterals from '@motion-canvas/internal/vite/markdown-literals';
import motionCanvas from '@motion-canvas/vite-plugin';
import {defineConfig} from 'vite';

// Scan a directory for .tsx scene files.
const listScenes = (dir: string): string[] =>
  fs.existsSync(dir)
    ? fs
        .readdirSync(dir)
        .filter(f => f.endsWith('.tsx'))
        .sort()
    : [];

// Resolve the projects directory. Priority:
//   1. PROJECTS env var, if set
//   2. ../../projects (repo root, git-ignored — where your own scenes live)
//   3. ../../projects.example (the committed starter scene, so a fresh clone
//      shows something immediately)
const primaryDir = path.resolve(
  import.meta.dirname,
  process.env.PROJECTS ?? '../../projects',
);
const exampleDir = path.resolve(import.meta.dirname, '../../projects.example');

const usingExample =
  !process.env.PROJECTS && listScenes(primaryDir).length === 0;
const projectsDir = usingExample ? exampleDir : primaryDir;

const sceneFiles = listScenes(projectsDir);

if (usingExample) {
  console.log(
    `No scenes in ${primaryDir} — using the starter scene from projects.example. ` +
      `Add a .tsx file to projects/ (or set PROJECTS) to load your own.`,
  );
} else if (sceneFiles.length === 0) {
  console.warn(`No .tsx scene files found in ${projectsDir}`);
}

const imports = sceneFiles
  .map((f, i) => {
    const abs = path.resolve(projectsDir, f);
    return `import scene${i} from '${abs}?scene';`;
  })
  .join('\n');

const names = sceneFiles.map((_, i) => `scene${i}`).join(', ');

// Pick an explicit project name so rendered files don't inherit the
// dot-prefixed name of the auto-generated module. With one scene, use the
// scene's basename — multi-scene projects fall back to "project".
const sceneBasenames = sceneFiles.map(f => f.replace(/\.tsx$/, ''));
const projectName = sceneBasenames.length === 1 ? sceneBasenames[0] : 'project';

const generated = `\
import {makeProject} from '@motion-canvas/core';
${imports}
export default makeProject({
  name: '${projectName}',
  scenes: [${names}],
});
`;

const generatedPath = path.resolve(
  import.meta.dirname,
  'src/.generated-project.ts',
);
fs.writeFileSync(generatedPath, generated);

export default defineConfig({
  server: {
    host: true,
    allowedHosts: true,
    fs: {
      allow: ['../..', projectsDir],
    },
  },
  plugins: [
    // Transform the `.md` log assets that @motion-canvas/core and /2d import
    // (e.g. experimental-features.md) into JS strings. core/2d are excluded
    // from dep optimization, so they're served through this transform pipeline.
    markdownLiterals(),
    motionCanvas({
      project: ['./src/.generated-project.ts'],
      output: path.join(projectsDir, 'rendered'),
    }),
    ffmpeg(),
  ],
  build: {
    rollupOptions: {
      output: {
        dir: '../docs/static/examples',
        entryFileNames: '[name].js',
      },
    },
  },
});
