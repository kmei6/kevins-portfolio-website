#!/bin/sh
cd "$(dirname "$0")"
CODEX_PYTHON="/Users/kevinmei/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3"
if [ -x "$CODEX_PYTHON" ]; then
  exec "$CODEX_PYTHON" server.py
fi
exec python3 server.py
