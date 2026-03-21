import * as crypto from 'node:crypto';
import * as fs from 'node:fs';
import type {ServerResponse} from 'node:http';
import * as path from 'node:path';
import type {Plugin, WebSocketServer} from 'vite';

interface PendingRequest {
  resolve: (value: any) => void;
  reject: (error: Error) => void;
  timer: ReturnType<typeof setTimeout>;
}

interface LogEntry {
  level: string;
  message: string;
  stack?: string;
}

const MaxServerLogs = 50;

function json(res: ServerResponse, status: number, body: unknown) {
  res.setHeader('Content-Type', 'application/json');
  res.writeHead(status);
  res.end(JSON.stringify(body));
}

function png(res: ServerResponse, buffer: Buffer) {
  res.setHeader('Content-Type', 'image/png');
  res.writeHead(200);
  res.end(buffer);
}

export function cliRemotePlugin(): Plugin {
  const pending = new Map<string, PendingRequest>();
  const serverLogs: LogEntry[] = [];
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

  function pushServerLog(level: string, message: string, stack?: string) {
    serverLogs.push({level, message, stack});
    if (serverLogs.length > MaxServerLogs) serverLogs.shift();
  }

  return {
    name: 'motion-canvas:cli-remote',

    configureServer(server) {
      // Intercept Vite's WebSocket error events (compilation/transform errors)
      const origSend = server.ws.send.bind(server.ws) as (
        ...args: any[]
      ) => any;
      server.ws.send = (first: any, second?: any) => {
        // Vite sends errors as ws.send({ type: 'error', err: {...} })
        if (typeof first === 'object' && first?.type === 'error') {
          const err = first.err;
          if (err) {
            pushServerLog(
              'error',
              err.message || String(err),
              err.stack || err.frame,
            );
          }
        }
        return second !== undefined
          ? (origSend as any)(first, second)
          : (origSend as any)(first);
      };
      ws = server.ws;

      server.ws.on('motion-canvas:cli-capture-result', handleResult());
      server.ws.on('motion-canvas:cli-render-result', handleResult());
      server.ws.on('motion-canvas:cli-status-result', handleResult());
      server.ws.on('motion-canvas:cli-logs-result', handleResult());

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
              json(res, 200, {ok: true, path: output, size: buffer.length});
            } else {
              png(res, buffer);
            }
          } catch (e: any) {
            json(res, 500, {error: e.message});
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
            json(res, 200, {ok: true, result: result.result});
          } catch (e: any) {
            json(res, 500, {error: e.message});
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
            json(res, 200, {
              ready: result.ready,
              frame: result.frame,
              duration: result.duration,
            });
          } catch (e: any) {
            json(res, 500, {error: e.message});
          }
          return;
        }

        if (url.pathname === '/__logs') {
          const clear = url.searchParams.get('clear') === 'true';

          // Collect browser-side logs (may timeout if browser is disconnected)
          let browserLogs: LogEntry[] = [];
          try {
            const result = await sendAndWait(
              'motion-canvas:cli-logs',
              {clear},
              5000,
            );
            browserLogs = result.logs ?? [];
          } catch {
            // Browser unreachable — server logs are still useful
          }

          // Merge server-side logs (Vite compilation errors) with browser logs
          const allLogs = [...serverLogs, ...browserLogs];
          if (clear) serverLogs.length = 0;

          json(res, 200, allLogs);
          return;
        }

        next();
      });
    },
  };
}
