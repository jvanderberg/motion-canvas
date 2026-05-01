#!/usr/bin/env node
/**
 * CLI tool for rendering Motion Canvas frames and video.
 *
 * Usage:
 *   node render.mjs --frame 120                    # capture frame 120 as PNG
 *   node render.mjs --frame 120 --output f.png     # save to specific path
 *   node render.mjs --render mp4                   # trigger full MP4 render
 *   node render.mjs --render png                   # trigger image sequence render
 *   node render.mjs --status                       # check editor status
 *
 * Requires the Motion Canvas editor to be running (npm run serve).
 */

import {parseArgs} from 'node:util';
import {request} from 'node:http';

const {values} = parseArgs({
  options: {
    frame: {type: 'string'},
    output: {type: 'string', short: 'o'},
    render: {type: 'string'},
    status: {type: 'boolean'},
    logs: {type: 'boolean'},
    port: {type: 'string', default: '9000'},
    help: {type: 'boolean', short: 'h'},
  },
  strict: true,
});

if (
  values.help ||
  (!values.frame && !values.render && !values.status && !values.logs)
) {
  console.log(`Motion Canvas CLI Renderer

Usage:
  node render.mjs --frame <N> [--output <path>]   Capture a single frame
  node render.mjs --render <mp4|png>               Trigger a full render
  node render.mjs --status                         Query editor status
  node render.mjs --logs                           Show compilation/runtime errors

Options:
  --frame <N>       Frame number to capture
  --output, -o      Output file path (default: stdout for --frame)
  --render <fmt>    Render format: mp4 or png
  --status          Query editor status
  --logs            Fetch recent errors/warnings from the editor
  --port <N>        Vite dev server port (default: 9000)
  --help, -h        Show this help`);
  process.exit(0);
}

const port = parseInt(values.port, 10);
const base = `http://localhost:${port}`;

function httpGet(url) {
  return new Promise((resolve, reject) => {
    const req = request(url, res => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        const body = Buffer.concat(chunks);
        resolve({status: res.statusCode, headers: res.headers, body});
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function main() {
  if (values.logs) {
    const res = await httpGet(`${base}/__logs?clear=true`);
    const data = JSON.parse(res.body.toString());
    if (res.status !== 200) {
      console.error('Error:', data.error ?? 'Unknown error');
      process.exit(1);
    }
    if (data.length === 0) {
      console.log('No errors or warnings.');
    } else {
      for (const log of data) {
        const prefix =
          log.level === 'error'
            ? 'ERROR'
            : log.level === 'warn'
              ? 'WARN'
              : log.level.toUpperCase();
        console.log(`[${prefix}] ${log.message}`);
        if (log.stack) console.log(log.stack);
      }
    }
    return;
  }

  if (values.status) {
    const res = await httpGet(`${base}/__status`);
    const data = JSON.parse(res.body.toString());
    if (res.status !== 200) {
      console.error('Error:', data.error ?? 'Unknown error');
      process.exit(1);
    }
    console.log(JSON.stringify(data, null, 2));
    return;
  }

  if (values.frame != null) {
    const frame = parseInt(values.frame, 10);
    const output = values.output;

    let url = `${base}/__capture?frame=${frame}`;
    if (output) {
      url += `&output=${encodeURIComponent(output)}`;
    }

    console.error(`Capturing frame ${frame}...`);
    const res = await httpGet(url);

    if (res.status !== 200) {
      const data = JSON.parse(res.body.toString());
      console.error('Error:', data.error ?? 'Unknown error');
      process.exit(1);
    }

    if (output) {
      const data = JSON.parse(res.body.toString());
      console.error(`Saved to ${data.path} (${data.size} bytes)`);
    } else {
      // Write raw PNG to stdout
      process.stdout.write(res.body);
    }
    return;
  }

  if (values.render) {
    const format = values.render;
    if (format !== 'mp4' && format !== 'png') {
      console.error('Format must be "mp4" or "png"');
      process.exit(1);
    }

    console.error(`Starting ${format} render...`);
    const res = await httpGet(`${base}/__render?format=${format}`);
    const data = JSON.parse(res.body.toString());

    if (res.status !== 200) {
      console.error('Error:', data.error ?? 'Unknown error');
      process.exit(1);
    }

    console.error('Render complete. Result:', data.result);
  }
}

main().catch(e => {
  console.error('Failed to connect. Is the editor running?');
  console.error(e.message);
  process.exit(1);
});
