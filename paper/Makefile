PYTHON ?= python3
VENV ?= venv
PIP := $(VENV)/bin/pip
UVICORN := $(VENV)/bin/uvicorn
HOST ?= 0.0.0.0
PORT ?= 10000
WORKERS ?= 1
LOG_LEVEL ?= info

.PHONY: help venv install backend dev start prod-start test clean

help:
	@echo "Available targets:"
	@echo "  make install      Create venv and install backend dependencies"
	@echo "  make backend      Start the FastAPI backend on $(HOST):$(PORT)"
	@echo "  make dev          Start backend with auto-reload for local development"
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

dev: venv
	@mkdir -p notes assets/notes_marketplace
	$(UVICORN) main:app --host $(HOST) --port $(PORT) --reload --log-level $(LOG_LEVEL)

start: backend

prod-start:
	./start.sh

test: venv
	$(VENV)/bin/pytest

clean:
	find . -type d -name '__pycache__' -prune -exec rm -rf {} +
	find . -type f -name '*.pyc' -delete
