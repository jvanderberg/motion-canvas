import fs from 'node:fs';
import path from 'node:path';
import {Readable} from 'node:stream';
import type {EnvironmentModuleNode, Plugin, ResolvedConfig} from 'vite';

const AUDIO_EXTENSION_REGEX = /\.(mp3|wav|ogg|aac|flac)(?:$|\?)/;
const AUDIO_HMR_DELAY = 1000;

interface AssetsPluginConfig {
  bufferedAssets: RegExp | false;
}

export function assetsPlugin({
  bufferedAssets: rawBufferedAssets,
}: AssetsPluginConfig): Plugin {
  const bufferedAssets = rawBufferedAssets || null;
  let config: ResolvedConfig;
  return {
    name: 'motion-canvas:assets',

    configResolved(resolvedConfig) {
      config = resolvedConfig;
    },

    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url && bufferedAssets?.test(req.url)) {
          const file = fs.readFileSync(
            path.resolve(config.root, req.url.slice(1)),
          );
          Readable.from(file).pipe(res);
          return;
        }

        next();
      });
    },

    hotUpdate(ctx) {
      const urls: string[] = [];
      const modules: EnvironmentModuleNode[] = [];
      const audioPromises: Promise<void>[] = [];

      for (const module of ctx.modules) {
        urls.push(module.url);
        if (!AUDIO_EXTENSION_REGEX.test(module.url)) {
          modules.push(module);
        } else {
          audioPromises.push(
            new Promise(resolve => {
              setTimeout(resolve, AUDIO_HMR_DELAY);
            }),
          );
        }
      }

      if (audioPromises.length > 0 || urls.length > 0) {
        const finish = async () => {
          await Promise.all(audioPromises);
          if (urls.length > 0) {
            this.environment.hot.send('motion-canvas:assets', {urls});
          }
        };
        finish();
      }

      return modules;
    },
  };
}
