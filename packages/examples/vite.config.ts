import motionCanvas from '@motion-canvas/vite-plugin';
import {defineConfig} from 'vite';

export default defineConfig({
  server: {
    host: true,
    allowedHosts: true,
    fs: {
      allow: ['../..'],
    },
  },
  plugins: [
    motionCanvas({
      project: [
        './src/example.ts',
        './src/display-fps.ts',
        './src/synth-voices.ts',
      ],
    }),
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
