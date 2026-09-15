import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { createSpeechHandler } from './speech.ts';
import { attachReadingRecognition } from './reading.ts';

const mime: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
  '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg',
};

/** Production serves only built assets and the private same-origin speech route. */
export function createAppServer(options: { root: string; apiKey?: string; voice?: string }) {
  const root = resolve(options.root);
  const speech = createSpeechHandler(options);
  const server = createServer(async (req, res) => {
    let pathname: string;
    try {
      pathname = decodeURIComponent(new URL(req.url ?? '/', 'http://localhost').pathname);
    } catch {
      res.writeHead(400).end();
      return;
    }
    if (pathname === '/api/speech') {
      await speech(req, res);
      return;
    }
    if (pathname.startsWith('/api/')) {
      res.writeHead(404).end();
      return;
    }
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405).end();
      return;
    }
    if (pathname.split('/').some((part) => part.startsWith('.'))) {
      res.writeHead(404).end();
      return;
    }
    let file = resolve(root, `.${pathname}`);
    if (file !== root && !file.startsWith(`${root}${sep}`)) {
      res.writeHead(404).end();
      return;
    }
    try {
      const info = await stat(file).catch(() => null);
      if (!info?.isFile()) {
        if (extname(pathname)) {
          res.writeHead(404).end();
          return;
        }
        file = resolve(root, 'index.html');
      }
      const size = (await stat(file)).size;
      let start = 0,
        end = size - 1;
      const range = req.method === 'GET' ? req.headers.range : undefined;
      if (range) {
        const match = /^bytes=(\d*)-(\d*)$/.exec(range);
        const first = match?.[1] ? Number(match[1]) : undefined;
        const last = match?.[2] ? Number(match[2]) : undefined;
        const valid =
          match &&
          (first !== undefined || last !== undefined) &&
          (first === undefined || Number.isSafeInteger(first)) &&
          (last === undefined || Number.isSafeInteger(last));
        if (valid && first === undefined && last! > 0) start = Math.max(0, size - last!);
        else if (valid && first !== undefined) {
          start = first;
          end = Math.min(last ?? end, end);
        } else {
          res.writeHead(416, { 'Content-Range': `bytes */${size}` }).end();
          return;
        }
        if (start >= size || start > end) {
          res.writeHead(416, { 'Content-Range': `bytes */${size}` }).end();
          return;
        }
      }
      res.writeHead(range ? 206 : 200, {
        'Content-Type': mime[extname(file)] ?? 'application/octet-stream',
        'Content-Length': Math.max(0, end - start + 1),
        'Accept-Ranges': 'bytes',
        ...(range ? { 'Content-Range': `bytes ${start}-${end}/${size}` } : {}),
        'Cache-Control': pathname.startsWith('/assets/')
          ? 'public, max-age=31536000, immutable'
          : 'no-cache',
        'X-Content-Type-Options': 'nosniff',
      });
      if (req.method === 'HEAD' || !size) {
        res.end();
        return;
      }
      const stream = createReadStream(file, { start, end });
      stream.on('error', () => res.destroy());
      res.on('close', () => stream.destroy());
      stream.pipe(res);
    } catch {
      if (!res.headersSent) res.writeHead(404).end();
      else res.destroy();
    }
  });
  attachReadingRecognition(server, options);
  return server;
}
