PYTHON ?= python3
VENV ?= venv
PIP := $(VENV)/bin/pip
UVICORN := $(VENV)/bin/uvicorn
HOST ?= 0.0.0.0
PORT ?= 10000
WORKERS ?= 1
LOG_LEVEL ?= info

.PHONY: help venv install install-frontend backend backend-dev frontend dev start prod-start test clean

help:
	@echo "Available targets:"
	@echo "  make install      Create venv and install backend dependencies"
	@echo "  make backend      Start the FastAPI backend on $(HOST):$(PORT)"
	@echo "  make dev          Start backend (http://localhost:$(DEV_API_PORT)) + Next.js frontend (http://localhost:$(FRONTEND_PORT)) together"
	@echo "  make backend-dev  Start only the backend with auto-reload on port $(DEV_API_PORT)"
	@echo "  make frontend     Start only the Next.js frontend dev server"
	@echo "  make start        Alias for make backend"
	@echo "  make prod-start   Run the existing start.sh deployment script"
	@echo "  make test         Run pytest"
	@echo "  make clean        Remove Python cache files"

venv:
	@test -d $(VENV) || $(PYTHON) -m venv $(VENV)

install: venv
	$(PIP) install --upgrade pip
	$(PIP) install -r requirements.txt

backend: venv
	@mkdir -p notes assets/notes_marketplace
	$(UVICORN) main:app --host $(HOST) --port $(PORT) --workers $(WORKERS) --log-level $(LOG_LEVEL)

# Local development: the frontend calls the API at http://localhost:8000 when it
# runs on localhost, so the dev backend listens there. Sign-in on localhost skips
# Cloudflare Turnstile (see /login and /signup in main.py).
DEV_API_PORT ?= 8000
FRONTEND_PORT ?= 3000

install-frontend:
	@test -d frontend/node_modules || npm --prefix frontend install

backend-dev: venv
	@mkdir -p notes assets/notes_marketplace
	$(UVICORN) main:app --host $(HOST) --port $(DEV_API_PORT) --reload --log-level $(LOG_LEVEL)

frontend: install-frontend
	npm --prefix frontend run dev -- -p $(FRONTEND_PORT)

# Runs both; Ctrl+C stops both.
dev: venv install-frontend
	@mkdir -p notes assets/notes_marketplace
	@echo "Backend  → http://localhost:$(DEV_API_PORT)"
	@echo "Frontend → http://localhost:$(FRONTEND_PORT)"
	@trap 'kill 0' INT TERM EXIT; \
	$(UVICORN) main:app --host $(HOST) --port $(DEV_API_PORT) --reload --log-level $(LOG_LEVEL) & \
	npm --prefix frontend run dev -- -p $(FRONTEND_PORT) & \
	wait

start: backend

prod-start:
	./start.sh

test: venv
	$(VENV)/bin/pytest

clean:
	find . -type d -name '__pycache__' -prune -exec rm -rf {} +
	find . -type f -name '*.pyc' -delete
