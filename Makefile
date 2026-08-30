# ══════════════════════════════════════════════════════════════
# AEGIS — Development Makefile
# ══════════════════════════════════════════════════════════════

PYTHON  ?= python3
PIP     ?= pip3
PORT    ?= 8080

.PHONY: help install dev test test-quick lint smoke docker-up docker-down clean

help: ## Show available commands
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2}'

# ── Setup ──

install: ## Install all dependencies
	$(PIP) install -r requirements.txt
	@if [ -f apps/web/package.json ]; then cd apps/web && npm install; fi
	@echo "✅ Dependencies installed"

# ── Development ──

dev: ## Start API server with hot reload
	PYTHONPATH=src:. $(PYTHON) -m uvicorn apps.api.app.main:app \
		--reload --host 0.0.0.0 --port $(PORT)

dev-web: ## Start Next.js frontend dev server
	@if [ -f apps/web/package.json ]; then \
		cd apps/web && npm run dev; \
	else \
		echo "❌ apps/web/package.json not found"; \
	fi

dev-all: ## Start API + Frontend (background API, foreground web)
	@echo "Starting API on port $(PORT)..."
	PYTHONPATH=src:. $(PYTHON) -m uvicorn apps.api.app.main:app \
		--host 0.0.0.0 --port $(PORT) &
	@sleep 2
	@echo "Starting Frontend..."
	@$(MAKE) dev-web

# ── Testing ──

test: ## Run all tests
	PYTHONPATH=src:. $(PYTHON) -m pytest tests/ -v --tb=short
	@echo "✅ All tests complete"

test-quick: ## Run fast tests only (no E2E)
	PYTHONPATH=src:. $(PYTHON) -m pytest tests/ -v --tb=short \
		--ignore=tests/test_e2e.py --ignore=tests/test_policy_drift_e2e.py

test-count: ## Count tests
	@PYTHONPATH=src:. $(PYTHON) -m pytest tests/ --collect-only -q 2>/dev/null | tail -1

# ── Quality ──

lint: ## Run basic Python checks
	$(PYTHON) -m py_compile apps/api/app/main.py
	$(PYTHON) -m py_compile apps/worker/main.py
	@echo "✅ Syntax OK"

# ── Docker ──

docker-up: ## Start all services via docker-compose
	docker compose up --build -d
	@echo "✅ Services starting..."
	@echo "  API:      http://localhost:$(PORT)"
	@echo "  Frontend: http://localhost:3000"

docker-down: ## Stop all docker-compose services
	docker compose down

docker-logs: ## Show docker-compose logs
	docker compose logs -f

# ── Smoke tests ──

smoke: ## Run smoke tests against local API
	@bash infra/scripts/smoke_test.sh http://localhost:$(PORT)

# ── Cleanup ──

clean: ## Remove caches and temp files
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name .pytest_cache -exec rm -rf {} + 2>/dev/null || true
	rm -rf .mypy_cache .ruff_cache htmlcov .coverage
	@echo "✅ Cleaned"
