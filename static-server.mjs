import { createServer } from 'node:http';
import { readFileSync, statSync, existsSync } from 'node:fs';
import { resolve, join, extname, normalize } from 'node:path';

const root = process.env.STATIC_DIR || resolve(process.cwd(), 'dist');
const port = Number(process.env.PORT || 3000);
const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.wasm': 'application/wasm',
  '.map': 'application/json; charset=utf-8'
};

const server = createServer((req, res) => {
  try {
    const url = new URL(req.url || '/', 'http://localhost');
    const requested = normalize(join(root, '.' + decodeURIComponent(url.pathname)));
    let resolved = resolve(requested);
    const rootResolved = resolve(root);
    if (resolved !== rootResolved && !resolved.startsWith(rootResolved + '/')) {
      res.writeHead(403); res.end('Forbidden'); return;
    }
    try {
      const stat = statSync(resolved);
      if (stat.isDirectory()) resolved = join(resolved, 'index.html');
    } catch {
      res.writeHead(404); res.end('Not found'); return;
    }
    if (!existsSync(resolved)) {
      res.writeHead(404); res.end('Not found'); return;
    }
    res.setHeader('Content-Type', mime[extname(resolved)] || 'application/octet-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.end(readFileSync(resolved));
  } catch {
    res.writeHead(500); res.end('Server error');
  }
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Serving ${root} on port ${port}`);
});
