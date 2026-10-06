#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
PROJECT_DIR="$(pwd)"
PORT="${PORT:-3000}"
export PORT
STATIC_DIR="$PROJECT_DIR/dist"
export STATIC_DIR
if [ ! -f "$STATIC_DIR/index.html" ]; then
  echo "Static deployment output must contain index.html: $STATIC_DIR/index.html" >&2
  exit 1
fi
if [ -f "$PROJECT_DIR/package.json" ]; then
  if [ -f "$PROJECT_DIR/package-lock.json" ]; then
    /usr/bin/time -p npm ci --no-audit --no-fund
  else
    /usr/bin/time -p npm install --no-audit --no-fund
  fi
  if /usr/bin/time -p node -e "const p=require('./package.json');process.exit(p.scripts&&p.scripts.build?0:1)"; then
    /usr/bin/time -p npm run build
  fi
  /usr/bin/time -p test -f "$STATIC_DIR/index.html"
fi
WEB_DIR="${OPENCODE_WEB_DIR:-/home/runner/work/_temp/omgithub-web}"
export WEB_DIR
/usr/bin/time -p mkdir -p "$WEB_DIR"
/usr/bin/time -p node -e "const fs=require('fs');const path=require('path');const dir=process.env.STATIC_DIR;const project=process.cwd();const web=process.env.WEB_DIR;fs.writeFileSync(path.join(web,'deployment-output.json'),JSON.stringify({project,directory:dir}));console.log('wrote deployment-output.json: '+path.join(web,'deployment-output.json'));"
exec /usr/bin/time -p node "$PROJECT_DIR/static-server.mjs"
