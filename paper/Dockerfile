# syntax=docker/dockerfile:1.7
# Multi-stage Dockerfile for PaperX FastAPI app with Playwright (Chromium) support

ARG PYTHON_VERSION=3.12

###############################
# Base stage with system deps #
###############################
FROM mcr.microsoft.com/playwright/python:v1.47.0-jammy AS base
# Includes Python + Playwright browsers already installed.

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    POETRY_VIRTUALENVS_CREATE=false \
    APP_HOME=/app

WORKDIR ${APP_HOME}

# Install OS packages you might need (add as required)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential curl git pkg-config \
    python3-dev \
    libcairo2 libcairo2-dev libffi-dev \
    libnss3 libasound2 libxkbcommon0 \
    && rm -rf /var/lib/apt/lists/*

###############################
# Builder (deps)              #
###############################
FROM base AS builder

COPY requirements.txt ./
RUN pip install --upgrade pip && pip install -r requirements.txt

###############################
# Runtime final image         #
###############################
FROM base AS final

# Install Python deps in final stage to ensure correct interpreter paths
COPY requirements.txt ./
RUN pip install --upgrade pip && pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY main.py ./


COPY db.sql ./
COPY packages ./packages
COPY config ./config
COPY ui ./ui


# Ensure writable storage dirs before switching to non-root user
RUN mkdir -p assets/notes_marketplace notes && \
    chown -R pwuser:pwuser assets notes

# Create notes dir (will be replaced by Render disk mount at /app/notes)
RUN mkdir -p notes

# Start script (added separately)
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

# Non-root user for security (playwright base has pwuser)
USER pwuser

ENV PORT=10000 \
    HOST=0.0.0.0 \
    UVICORN_WORKERS=3 \
    UVICORN_LOG_LEVEL=info \
    PYTHONPATH=/app

# Healthcheck hitting docs
HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD curl -fsS http://localhost:${PORT}/docs >/dev/null || exit 1

EXPOSE 10000

ENTRYPOINT ["/app/start.sh"]
