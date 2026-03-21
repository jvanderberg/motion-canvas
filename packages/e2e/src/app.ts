import * as path from 'node:path';
import {fileURLToPath} from 'node:url';
import {firefox, type Page} from 'playwright';
import {createServer} from 'vite';

const Root = fileURLToPath(new URL('.', import.meta.url));

export interface App {
  page: Page;
  stop: () => Promise<void>;
}

export async function start(): Promise<App> {
  const [browser, server] = await Promise.all([
    firefox.launch({
      headless: true,
    }),
    createServer({
      root: Root,
      configFile: path.resolve(Root, '../vite.config.ts'),
    }).then(server => server.listen()),
  ]);

  const page = await browser.newPage();
  await page.goto(`http://localhost:${server.config.server.port}`);
  await page.waitForSelector('main');

  return {
    page,
    async stop() {
      await Promise.all([browser.close(), server.close()]);
    },
  };
}
