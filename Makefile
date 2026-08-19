.PHONY: help build build-d up down down-v restart logs logs-backend logs-frontend
.PHONY: migrate makemigrations createsuperuser shell bash-backend bash-frontend
.PHONY: lint lint-backend lint-frontend lint-fix format check test coverage

# ========================================
# DOCKER COMMANDS
# ========================================

build:
	docker-compose up --build

build-d:
	docker-compose up --build -d

up:
	docker-compose up -d

down:
	docker-compose down

down-v:
	docker-compose down -v

restart: down up

logs:
	docker-compose logs -f

logs-backend:
	docker-compose logs -f backend

logs-frontend:
	docker-compose logs -f frontend

# ========================================
# DJANGO COMMANDS
# ========================================

migrate:
	docker-compose exec backend python manage.py migrate

makemigrations:
	docker-compose exec backend python manage.py makemigrations

createsuperuser:
	docker-compose exec backend python manage.py createsuperuser

shell:
	docker-compose exec backend python manage.py shell

bash-backend:
	docker-compose exec backend /bin/bash

bash-frontend:
	docker-compose exec frontend /bin/sh

# ========================================
# LINTING & CODE QUALITY
# ========================================

lint: lint-backend lint-frontend

lint-backend:
	@echo "Checking backend..."
	docker-compose exec backend ruff check .
	docker-compose exec backend ruff format --check .
	docker-compose exec backend mypy .

lint-frontend:
	@echo "Checking frontend..."
	docker-compose exec frontend npm run lint
	docker-compose exec frontend npx tsc --noEmit
	-docker-compose exec frontend npx --yes knip || echo "Knip issues ignored"

lint-fix:
	@echo "Fixing errors..."
	docker-compose exec backend ruff check --fix .
	docker-compose exec backend ruff format .
	docker-compose exec frontend npm run lint -- --fix

# ========================================
# FORMATTING
# ========================================

format: format-backend format-frontend

format-backend:
	@echo "Formatting backend..."
	docker-compose exec backend ruff check --fix .
	docker-compose exec backend ruff format .

format-frontend:
	@echo "Formatting frontend..."
	docker-compose exec frontend npx prettier --write "src/**/*.{ts,tsx,css}"

# ========================================
# TESTING
# ========================================

test: test-backend test-frontend

test-backend:
	@echo "Running backend tests..."
	docker-compose exec backend python manage.py test

test-frontend:
	@echo "Running frontend tests..."
	docker-compose exec frontend npm run test

# ========================================
# COVERAGE
# ========================================

coverage: coverage-backend

coverage-backend:
	@echo "Backend coverage..."
	docker-compose exec backend coverage run manage.py test
	docker-compose exec backend coverage report
	docker-compose exec backend coverage html

# ========================================
# HEALTH CHECK
# ========================================

check:
	@echo "Health check..."
	docker-compose ps
	@echo "\nContainer stats:"
	docker stats --no-stream

# ========================================
# HELP (default)
# ========================================

help:
	@echo "Available commands:"
	@echo ""
	@echo "DOCKER:"
	@echo "  build            Build and run containers (with logs)"
	@echo "  build-d          Build and run containers in background"
	@echo "  up               Run containers in background"
	@echo "  down             Stop containers"
	@echo "  down-v           Stop containers and remove volumes"
	@echo "  restart          Restart containers"
	@echo "  logs             Show all container logs"
	@echo "  logs-backend     Show backend logs"
	@echo "  logs-frontend    Show frontend logs"
	@echo ""
	@echo "DJANGO:"
	@echo "  migrate          Apply migrations"
	@echo "  makemigrations   Create new migrations"
	@echo "  createsuperuser  Create superuser"
	@echo "  shell            Open Django shell"
	@echo "  bash-backend     Enter backend container"
	@echo "  bash-frontend    Enter frontend container"
	@echo ""
	@echo "LINTING:"
	@echo "  lint             Run all linters"
	@echo "  lint-backend     Check backend (ruff, mypy)"
	@echo "  lint-frontend    Check frontend (ESLint, TypeScript, Knip)"
	@echo "  lint-fix         Auto-fix errors"
	@echo ""
	@echo "FORMATTING:"
	@echo "  format           Format all code"
	@echo "  format-backend   Format backend (ruff)"
	@echo "  format-frontend  Format frontend (Prettier)"
	@echo ""
	@echo "TESTING:"
	@echo "  test             Run all tests"
	@echo "  test-backend     Run Django tests"
	@echo "  test-frontend    Run frontend tests"
	@echo ""
	@echo "COVERAGE:"
	@echo "  coverage         Run test coverage"
	@echo "  coverage-backend Django coverage"
	@echo ""
	@echo "HEALTH:"
	@echo "  check            Check project health"

.DEFAULT_GOAL := help