#!/usr/bin/env bash
set -euo pipefail

: "${PORT:=10000}"
: "${HOST:=0.0.0.0}"
: "${UVICORN_WORKERS:=1}"
: "${FORCE_SINGLE_WORKER:=true}"
: "${UVICORN_LOG_LEVEL:=info}"

# Ensure mount path exists (Render disk at /app/notes)
mkdir -p /app/notes

# Simple detection: if running inside Render, $RENDER is often set; adapt if needed.
if [[ "${FORCE_SINGLE_WORKER}" =~ ^(1|true|yes|on)$ ]]; then
	UVICORN_WORKERS=1
fi

echo "[start] Launching PaperX FastAPI on ${HOST}:${PORT} (workers=${UVICORN_WORKERS})"

# Migrate or init tasks could be placed here if needed.
# e.g., python scripts/bootstrap.py

exec uvicorn main:app --host "$HOST" --port "$PORT" --workers "$UVICORN_WORKERS" --log-level "$UVICORN_LOG_LEVEL"