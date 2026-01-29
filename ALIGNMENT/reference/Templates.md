# Templates & Examples

<!-- markdownlint-disable MD031 MD040 MD022 MD025 MD004 MD032 -->
File templates and examples for common repository files.

## Template Index

Quick reference to available templates:

### Core Files (P0)
- **[README Template](#readme-template)** - Basic project README structure
- **[.env.example Template](#envexample-template)** - Environment variable template
- **[CHANGELOG.md Template](#changelogmd-template)** - Version changelog format (for versioned projects)

### Governance Files (P0)
- **[CODEOWNERS Example](#codeowners-example)** - Code ownership specification
- **[CONTRIBUTING.md Template](#contributingmd-template)** - Contribution guidelines
- **[SECURITY.md Template](#securitymd-template)** - Security policy and disclosure process

### Documentation (P1)
- **[docs/onboarding.md Template](#docsonboardingmd-template)** - Developer onboarding guide
- **[HEALTHCHECK.md Template](#healthcheckmd-template)** - Repository health status

### CI/CD & Automation (P1)
- **[Compliance Validation CI Job Template](#compliance-validation-ci-job-template)** - CI/CD compliance checking
- **[Repository Health Check Script Template](#repository-health-check-script-template)** - Automated health scoring

### Advanced Templates (P2)
- **[Performance Budgets Template](#performance-budgets-template)** - Performance monitoring budgets
- **[Incident Response Runbook Template](#incident-response-runbook-template)** - Incident management procedures
- **[SLSA Compliance Documentation Template](#slsa-compliance-documentation-template)** - Supply chain security
- **[AI Provenance Schema Template](#ai-provenance-schema-template)** - AI-generated content tracking
- **[RO-Crate Metadata Template](#ro-crate-metadata-template)** - Research data metadata (FAIR principles)
- **[Dev Container Configuration Template](#dev-container-configuration-template)** - VS Code Dev Container setup

### Commit Messages
- **[Commit Message Examples](#commit-message-examples)** - Conventional Commits format examples

---

## README Template

```markdown
# Project Name

Brief description (1-2 sentences).

## Installation

\`\`\`bash
# Commands to install
\`\`\`

## Usage

\`\`\`bash
# Commands to run
\`\`\`

## Project Structure

- `src/` - Source code
- `docs/` - Documentation
- `tests/` - Tests

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md)

## License

[License type] - See [LICENSE](LICENSE)

```

## CODEOWNERS Example

```plaintext
# Global owners
* @team-leads

# Specific paths
/src/ @backend-team
/docs/ @tech-writers
/infra/ @devops-team
```

## CONTRIBUTING.md Template

```markdown
# Contributing

## Getting Started
1. Fork the repository
2. Create a feature branch (see Branching Strategy below)
3. Make your changes
4. Submit a pull request

## Branching Strategy
We use [GitHub Flow](https://guides.github.com/introduction/flow/):
- `main` - Production-ready code
- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates

## Commit Messages
We follow [Conventional Commits](https://www.conventionalcommits.org/):
- Format: `type(scope): description`
- Types: feat, fix, docs, style, refactor, test, chore, perf, ci, build, revert
- Breaking changes: Add `!` after type or `BREAKING CHANGE:` in footer
- Example: `feat(auth): add OAuth2 support` or `fix(api)!: change response format`

## Code Style
- Follow language-specific style guides
- Run linters before committing (pre-commit hooks configured)
- Ensure code passes all CI checks

## Pull Request Process
1. Ensure tests pass locally and on CI
2. Update documentation as needed
3. Get approval from code owners (see CODEOWNERS)
4. Address review feedback
5. Squash commits before merging (if required by project)

## Code Review Checklist
- [ ] Functionality works as intended
- [ ] Tests are adequate and passing
- [ ] Documentation is updated
- [ ] No security concerns
- [ ] Performance implications considered
- [ ] Accessibility standards met (for web apps)
```

## Commit Message Examples

```bash
# Feature
feat(auth): add OAuth2 authentication

# Bug fix
fix(api): handle null response in user endpoint

# Documentation
docs(readme): update installation instructions

# Breaking change
feat(api)!: change user endpoint response format

BREAKING CHANGE: User endpoint now returns nested profile object

# With scope
fix(database): resolve connection pool exhaustion

# Performance
perf(cache): implement Redis caching layer
```

## SECURITY.md Template

```markdown
# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

Please report vulnerabilities to: security@example.com

## Response SLA
- Critical: 7 days
- High: 30 days
- Medium/Low: Next release cycle
```

## HEALTHCHECK.md Template

```markdown
# Repository Health Check

Last updated: [date]

## Build Status
- ✅ Passing / ❌ Failing
- Last successful build: [date]

## Test Status
- Coverage: [percentage]%
- Passing: [number]
- Failing: [number]

## Dependencies
- Outdated: [number]
- Vulnerabilities: [number]

## Known Issues
- [List any known issues]
```

## CHANGELOG.md Template

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2024-01-01
### Added
- Initial release

### Changed
- [Breaking] Changed API endpoint structure

### Fixed
- Bug fixes
```

## .env.example Template

```bash
# Application Configuration
APP_NAME=your-app-name
APP_ENV=development
APP_DEBUG=true

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=your_database
DB_USER=your_user
# DB_PASSWORD=set_in_production

# API Keys (never commit real keys)
# API_KEY=your_api_key_here
# SECRET_KEY=your_secret_key_here
```

## docs/onboarding.md Template

```markdown
# Developer Onboarding Guide

## Prerequisites

- [ ] Node.js v18+ (or Python 3.10+, Go 1.20+, etc.)
- [ ] Git configured with SSH keys
- [ ] Access to [repository/CI/CD platform]
- [ ] IDE/editor setup (VS Code recommended)
- [ ] Required accounts: [GitHub, Slack, etc.]

## Local Development Setup

1. Clone the repository:
   ```bash
   git clone git@github.com:org/repo.git
   cd repo
   ```

2. Install dependencies:
   ```bash
   npm install  # or pip install -r requirements.txt, etc.
   ```

3. Set up environment:
   ```bash
   cp .env.example .env
   # Edit .env with your local configuration
   ```

4. Run database migrations:
   ```bash
   npm run migrate  # or equivalent
   ```

5. Start development server:
   ```bash
   npm run dev
   ```

## First Contribution

1. Create a feature branch: `git checkout -b feat/my-first-contribution`
2. Make a small change (e.g., fix a typo, add a comment)
3. Commit using Conventional Commits: `git commit -m "docs: fix typo in README"`
4. Push and create PR: `git push origin feat/my-first-contribution`
5. Request review from code owners

## Common Issues

**Issue:** Dependencies fail to install
- **Solution:** Clear cache and reinstall: `rm -rf node_modules package-lock.json && npm install`

**Issue:** Tests fail locally but pass in CI
- **Solution:** Ensure you're using the same Node.js version as CI

**Issue:** Pre-commit hooks failing
- **Solution:** Run `npm run lint:fix` to auto-fix issues

## Team Communication

- **Slack:** #project-name channel
- **Standup:** Daily at 10:00 AM
- **Code Reviews:** Tag @team-leads for urgent reviews
- **Questions:** Ask in Slack or create a GitHub Discussion

## Resources

- [Architecture Documentation](docs/architecture.md)
- [API Documentation](docs/api.md)
- [Contributing Guide](CONTRIBUTING.md)
- [Code Style Guide](docs/code-style.md)
```

## Performance Budgets Template

```markdown
# Performance Budgets

Last updated: [date]

## Web Application Budgets

### Bundle Size
- Initial bundle: < 500 KB (gzipped)
- Total bundle: < 1 MB (gzipped)
- Individual chunk: < 200 KB (gzipped)

### Lighthouse Scores
- Performance: ≥ 90
- Accessibility: ≥ 95
- Best Practices: ≥ 90
- SEO: ≥ 90

### Core Web Vitals
- Largest Contentful Paint (LCP): < 2.5s
- First Input Delay (FID): < 100ms
- Cumulative Layout Shift (CLS): < 0.1

## API Performance Budgets

### Response Times
- p50 (median): < 200ms
- p95: < 500ms
- p99: < 1000ms

### Database Queries
- Simple queries (p95): < 100ms
- Complex queries (p95): < 500ms
- Aggregations (p95): < 1000ms

## Monitoring

- Budget violations trigger alerts in [monitoring tool]
- Weekly performance review meetings
- Budgets reviewed quarterly or when architecture changes

## Violation Process

1. Alert triggered
2. Team notified
3. Investigation within 24 hours
4. Fix or budget adjustment within 1 week
```

## Incident Response Runbook Template

```markdown
# Incident Response Runbook

## Severity Levels

- **P0/Critical:** Service down, data loss, security breach
- **P1/High:** Major feature broken, significant degradation
- **P2/Medium:** Minor feature broken, some users affected
- **P3/Low:** Cosmetic issues, edge cases

## Response SLAs

- P0: Immediate response, 1-hour resolution target
- P1: 15-minute response, 4-hour resolution target
- P2: 1-hour response, 24-hour resolution target
- P3: 24-hour response, next release cycle

## On-Call Rotation

- **Primary:** [@username] (first responder)
- **Secondary:** [@username] (escalation)
- **Manager:** [@username] (for P0/P1)

## Communication Channels

- **Incident Channel:** #incidents
- **Status Page:** [URL]
- **PagerDuty:** [Integration]

## Common Incidents

### Database Connection Issues
1. Check database status dashboard
2. Verify connection pool settings
3. Check for recent deployments
4. Escalate to DBA if needed

### High Error Rate
1. Check error logs and monitoring
2. Identify error pattern
3. Check recent deployments
4. Consider rollback if needed

### Performance Degradation
1. Check performance metrics
2. Identify slow endpoints/queries
3. Check resource utilization
4. Scale if needed

## Post-Mortem Template

### Incident: [Title]
**Date:** [Date]
**Duration:** [Duration]
**Severity:** P0/P1/P2/P3

### Timeline
- [Time] - Incident detected
- [Time] - Team notified
- [Time] - Root cause identified
- [Time] - Fix deployed
- [Time] - Incident resolved

### Root Cause
[Description of root cause]

### Impact
- Users affected: [Number]
- Downtime: [Duration]
- Data loss: [Yes/No/Amount]

### Action Items
- [ ] [Action item 1] - Owner: [@username] - Due: [Date]
- [ ] [Action item 2] - Owner: [@username] - Due: [Date]

### Follow-up
- [ ] Review with team
- [ ] Update runbooks
- [ ] Implement preventive measures
```

## AI Provenance Schema Template

```json
{
  "@context": "https://www.w3.org/ns/prov",
  "id": "urn:uuid:...",
  "type": "Activity",
  "startedAtTime": "2026-01-28T10:00:00Z",
  "endedAtTime": "2026-01-28T10:00:05Z",
  "wasAssociatedWith": {
    "id": "agent:gpt-4",
    "type": "SoftwareAgent",
    "version": "4.0"
  },
  "used": [
    {
      "id": "prompt:user-query",
      "type": "Entity",
      "value": "User query text..."
    }
  ],
  "generated": [
    {
      "id": "response:agent-output",
      "type": "Entity",
      "value": "Agent response..."
    }
  ],
  "wasInfluencedBy": [
    {
      "id": "context:previous-interaction",
      "type": "Entity"
    }
  ]
}
```

## SLSA Compliance Documentation Template

```markdown
# SLSA Compliance

**Current Level:** SLSA Level 2  
**Target Level:** SLSA Level 3  
**Last Updated:** [Date]

## Attestation Generation

Attestations are generated automatically in CI/CD using [tool].

### Build Attestation Format
- Format: in-toto attestations
- Storage: [artifact registry location]
- Verification: [verification process]

## Source Verification

- Commits must be GPG signed
- CI/CD verifies signatures before build
- Source repository: [repository URL]

## Build Environment

- OS: [OS and version]
- Build tools: [tools and versions]
- Dependencies: Locked via [lockfile]

## Roadmap

- [ ] Achieve SLSA Level 3 (target: [date])
- [ ] Implement two-person review
- [ ] Harden build environment
```

## Repository Health Check Script Template

```bash
#!/bin/bash
# Repository Health Checker
# Validates ALIGNMENT standards compliance

SCORE=0
MAX_SCORE=100

# Check P0 requirements (40 points)
check_p0() {
  # Check required files
  [ -f README.md ] && ((SCORE+=5))
  [ -f LICENSE ] && ((SCORE+=5))
  [ -f .gitignore ] && ((SCORE+=5))
  [ -f SECURITY.md ] && ((SCORE+=5))
  [ -f CONTRIBUTING.md ] && ((SCORE+=5))
  [ -f CHANGELOG.md ] && ((SCORE+=5))
  [ -f .github/CODEOWNERS ] && ((SCORE+=5))
  [ -f .github/workflows/ci.yml ] && ((SCORE+=5))
  
  # Check structure
  [ -d "src" ] || [ -d "apps" ] || [ -d "packages" ] && ((SCORE+=10))
}

# Check P1 requirements (30 points)
check_p1() {
  [ -d "docs" ] && ((SCORE+=10))
  [ -f ".github/workflows/dependabot.yml" ] && ((SCORE+=5))
  [ -f "docs/onboarding.md" ] && ((SCORE+=5))
  [ -f ".pre-commit-config.yaml" ] && ((SCORE+=5))
  # Add more P1 checks...
}

# Check P2 requirements (20 points)
check_p2() {
  [ -f "INDEX.md" ] && ((SCORE+=5))
  [ -d "docs/adr" ] && ((SCORE+=5))
  # Add more P2 checks...
}

# Check documentation quality (10 points)
check_docs() {
  # Check README completeness, etc.
  ((SCORE+=10))
}

check_p0
check_p1
check_p2
check_docs

echo "Repository Health Score: $SCORE/$MAX_SCORE"
exit $([ $SCORE -ge 70 ] && echo 0 || echo 1)
```

## Compliance Validation CI Job Template

```yaml
# .github/workflows/compliance.yml
name: Compliance Check

on:
  pull_request:
    branches: [main, develop]

jobs:
  compliance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run compliance check
        run: |
          ./scripts/check-compliance.sh
      - name: Post compliance report
        uses: actions/github-script@v7
        with:
          script: |
            // Post report as PR comment
```

## RO-Crate Metadata Template

```json
{
  "@context": ["https://w3id.org/ro/crate/1.1/context"],
  "@graph": [
    {
      "@id": "ro-crate-metadata.json",
      "@type": "CreativeWork",
      "about": {
        "@id": "./"
      }
    },
    {
      "@id": "./",
      "@type": "Dataset",
      "name": "Repository Name",
      "description": "Repository description",
      "license": "MIT",
      "keywords": ["keyword1", "keyword2"]
    }
  ]
}
```

## Dev Container Configuration Template

```json
{
  "name": "Project Development Container",
  "image": "mcr.microsoft.com/devcontainers/base:ubuntu",
  "features": {
    "ghcr.io/devcontainers/features/node:1": {
      "version": "18"
    },
    "ghcr.io/devcontainers/features/docker-in-docker:2": {}
  },
  "customizations": {
    "vscode": {
      "extensions": [
        "dbaeumer.vscode-eslint",
        "esbenp.prettier-vscode"
      ]
    }
  },
  "postCreateCommand": "npm install",
  "remoteUser": "node"
}
```