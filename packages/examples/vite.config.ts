import * as fs from 'node:fs';
import * as path from 'node:path';
import ffmpeg from '@motion-canvas/ffmpeg';
import motionCanvas from '@motion-canvas/vite-plugin';
import {defineConfig} from 'vite';

// Resolve the projects directory: PROJECTS env var or default to ../../projects
const projectsDir = path.resolve(
  import.meta.dirname,
  process.env.PROJECTS ?? '../../projects',
);

// Scan for .tsx scene files and generate a single project module
const sceneFiles = fs.existsSync(projectsDir)
  ? fs
      .readdirSync(projectsDir)
      .filter(f => f.endsWith('.tsx'))
      .sort()
  : [];

if (sceneFiles.length === 0) {
  console.warn(`No .tsx scene files found in ${projectsDir}`);
}

const imports = sceneFiles
  .map((f, i) => {
    const abs = path.resolve(projectsDir, f);
    return `import scene${i} from '${abs}?scene';`;
  })
  .join('\n');

const names = sceneFiles.map((_, i) => `scene${i}`).join(', ');

const generated = `\
import {makeProject} from '@motion-canvas/core';
${imports}
export default makeProject({
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
