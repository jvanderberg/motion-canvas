import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import {Plugin, WebSocketServer} from 'vite';

interface PendingRequest {
  resolve: (value: any) => void;
  reject: (error: Error) => void;
  timer: ReturnType<typeof setTimeout>;
}

export function cliRemotePlugin(): Plugin {
  const pending = new Map<string, PendingRequest>();
  let ws: WebSocketServer | null = null;

  function sendAndWait(
    event: string,
    payload: Record<string, unknown>,
    timeoutMs = 30000,
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!ws) {
        reject(new Error('WebSocket server not available'));
        return;
      }
      const id = crypto.randomUUID();
      const timer = setTimeout(() => {
        pending.delete(id);
        reject(new Error(`Timeout waiting for ${event} response`));
      }, timeoutMs);
      pending.set(id, {resolve, reject, timer});
      ws.send(event, {...payload, id});
    });
  }

  function handleResult() {
    return (data: any) => {
      const req = pending.get(data.id);
      if (!req) return;
      pending.delete(data.id);
      clearTimeout(req.timer);
      if (data.error) {
        req.reject(new Error(data.error));
      } else {
        req.resolve(data);
      }
    };
  }

  return {
    name: 'motion-canvas:cli-remote',

    configureServer(server) {
      ws = server.ws;

      server.ws.on('motion-canvas:cli-capture-result', handleResult());
      server.ws.on('motion-canvas:cli-render-result', handleResult());
      server.ws.on('motion-canvas:cli-status-result', handleResult());

      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url!, `http://${req.headers.host}`);

        if (url.pathname === '/__capture') {
          const frame = parseInt(url.searchParams.get('frame') ?? '0', 10);
          const output = url.searchParams.get('output');

          try {
            const result = await sendAndWait(
              'motion-canvas:cli-capture',
              {frame},
              60000,
            );
            const base64 = result.data.slice(result.data.indexOf(',') + 1);
            const buffer = Buffer.from(base64, 'base64');

            if (output) {
              const dir = path.dirname(output);
              if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, {recursive: true});
              }
              fs.writeFileSync(output, buffer);
              res.writeHead(200, {'Content-Type': 'application/json'});
              res.end(
                JSON.stringify({ok: true, path: output, size: buffer.length}),
              );
            } else {
              res.writeHead(200, {'Content-Type': 'image/png'});
              res.end(buffer);
            }
          } catch (e: any) {
            res.writeHead(500, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({error: e.message}));
          }
          return;
        }

        if (url.pathname === '/__render') {
          const format = url.searchParams.get('format') ?? 'mp4';

          try {
            const result = await sendAndWait(
              'motion-canvas:cli-render',
              {format},
              600000,
            );
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({ok: true, result: result.result}));
          } catch (e: any) {
            res.writeHead(500, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({error: e.message}));
          }
          return;
        }

        if (url.pathname === '/__status') {
          try {
            const result = await sendAndWait(
              'motion-canvas:cli-status',
              {},
              5000,
            );
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(
              JSON.stringify({
                ready: result.ready,
                frame: result.frame,
                duration: result.duration,
              }),
            );
          } catch (e: any) {
            res.writeHead(500, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({error: e.message}));
          }
          return;
        }

        next();
      });
    },
  };
}
