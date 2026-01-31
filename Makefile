# filepath: Makefile
# purpose: Single entry point for setup and verify commands.
# last updated: 2026-01-31
# related tasks: Repository alignment and agentic workflow

.PHONY: setup verify help

help: ## Show this help message
	@echo "Available commands:"
	@echo "  setup   - Install dependencies"
	@echo "  verify  - Run all quality checks (lint, test, build)"

setup: ## Install dependencies
	@echo "Running setup..."
	@echo "==> setup: installing dependencies"
	pnpm install --frozen-lockfile
	@echo "✅ Setup complete"

verify: ## Run all quality checks
	@echo "Running verify..."
	@echo "==> verify: lint"
	pnpm lint
	@echo "==> verify: typecheck"
	pnpm type-check
	@echo "==> verify: tests"
	pnpm test
	@echo "==> verify: build"
	pnpm build
	@echo "✅ Verify passed"
