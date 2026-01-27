# Makefile for studio (Firebase Studio)
# Wraps npm scripts for convenience
# Source of truth: package.json scripts and .repo/repo.manifest.yaml

.PHONY: setup lint test typecheck verify ci e2e build check-governance format format-check

setup:
	@echo "=== SETUP ==="
	npm install

lint:
	@echo "=== LINT ==="
	npm run lint

test:
	@echo "=== TEST ==="
	npm run test

test:e2e:
	@echo "=== E2E TEST ==="
	npm run test:e2e

typecheck:
	@echo "=== TYPECHECK ==="
	npm run typecheck

build:
	@echo "=== BUILD ==="
	npm run build

format:
	@echo "=== FORMAT ==="
	npm run format

format-check:
	@echo "=== FORMAT CHECK ==="
	npm run format:check

verify: lint typecheck test build
	@echo "=== VERIFICATION COMPLETE ==="

ci: verify
	@echo "=== CI COMPLETE ==="

check-governance:
	@echo "=== GOVERNANCE VERIFICATION ==="
	chmod +x scripts/governance-verify.sh
	./scripts/governance-verify.sh
