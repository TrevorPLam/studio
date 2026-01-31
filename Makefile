# filepath: Makefile
# purpose: Single entry point for setup and verify commands.
# last updated: 2026-01-30
# related tasks: FIRST.md Phase 1 (repo contract)

.PHONY: setup verify

setup:
	./scripts/setup.sh

verify:
	./scripts/verify.sh
