# Quick Start Checklist

**Use this checklist when setting up a new repository or auditing an existing one.**

## P0 — Must Have (Do First)

- [ ] Root contains only essential files (README, LICENSE, .gitignore, package manager file)
- [ ] Source code in dedicated directory (`src/`, `cmd/`, `apps/`, etc.)
- [ ] README explains: what it is, how to install/run, where code lives, how to contribute
- [ ] LICENSE file exists (mandatory for public repos)
- [ ] `.gitignore` configured to exclude secrets and build artifacts
- [ ] Lockfiles committed (package-lock.json, pnpm-lock.yaml, Cargo.lock, go.sum)
- [ ] CI/CD configured with: build, test, lint, security checks
- [ ] Tests pass on CI before merging
- [ ] `CODEOWNERS` file specifies approvers
- [ ] `CONTRIBUTING.md` defines contribution rules
- [ ] `SECURITY.md` exists with disclosure process
- [ ] Secret scanning automated in CI/CD
- [ ] Dependency vulnerability scanning automated
- [ ] Structured logging implemented (JSON format)
- [ ] For versioned projects: `CHANGELOG.md` exists and follows SemVer
- [ ] Commit message conventions adopted (Conventional Commits format)

## P1 — Should Have (Do Next)

- [ ] `docs/` folder with clear structure
- [ ] `.github/` folder (if using GitHub) with workflows and templates
- [ ] Test categories separated (unit/integration/e2e)
- [ ] Configuration centralized in `config/` directory
- [ ] Dependency automation configured (Dependabot/Renovate)
- [ ] `infra/` directory with documentation
- [ ] PR and Issue templates
- [ ] `HEALTHCHECK.md` summarizing repo status
- [ ] Error tracking integrated (Sentry, Rollbar, etc.)
- [ ] Metrics/telemetry collection implemented
- [ ] Branching strategy documented
- [ ] Code review standards defined
- [ ] Pre-commit hooks configured
- [ ] Developer onboarding guide (`docs/onboarding.md`)
- [ ] Performance budgets defined (for web/API projects)
- [ ] Incident response process documented
- [ ] Automated repository health scoring configured
- [ ] Automated compliance validation configured
- [ ] AI provenance tracking configured (if AI-native repo)
- [ ] FAIR principles implemented (if applicable)
- [ ] Automated documentation generation configured
- [ ] Container/Dev Container standards defined

## P2 — Advanced (Scale-Driven)

- [ ] `INDEX.md` or `INDEX.json` at root
- [ ] ADRs maintained in `docs/adr/`
- [ ] Schema-validated configuration
- [ ] GitOps structure for infrastructure
- [ ] Automated repository linting
- [ ] SBOM generation for releases
- [ ] Distributed tracing implemented
- [ ] `.ai/` directory with AI boundaries (if using AI)
- [ ] SLSA Level 2+ compliance achieved
- [ ] DORA metrics tracked
- [ ] Repository template/scaffolding available
- [ ] Experiment tracking configured (if AI/ML repo)