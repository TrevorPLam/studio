# Frequently Asked Questions (FAQ)

Common questions about ALIGNMENT standard and implementation.

## General Questions

### What is ALIGNMENT?
ALIGNMENT is a comprehensive repository standard that defines how repositories should be organized, documented, and maintained. It's platform-agnostic, language-agnostic, and suitable for various project types.

### Do I have to follow all sections?
No. ALIGNMENT uses priority tiers:
- **P0 (Required):** Must have for production repos
- **P1 (Recommended):** Should have for most repos
- **P2 (Advanced):** Nice to have, scale-driven

Start with P0, add P1 as needed, P2 when scaling.

### How long does alignment take?
- **New repository:** 1-2 days (full alignment)
- **Existing repository (small):** 1-2 weeks (incremental)
- **Existing repository (large):** 1-2 months (phased)
- **Minimum Viable Alignment:** ~90 minutes

See effort estimates in each section.

### Can I align incrementally?
Yes! See [Migration Guide](Migration-Guide.md) for incremental strategies. It's recommended to align one section at a time.

## Getting Started

### Where do I start?
1. **Section 0:** Complete decision points first
2. **Section 1:** Root directory structure
3. Continue in order (1 → 2 → 3 → ...)

See [Quick Start Checklist](Quick-Start-Checklist.md).

### What if I'm aligning an existing repository?
Use [Migration Guide](Migration-Guide.md) for existing repositories. Start with Section 0, then follow incremental migration strategy.

### What if I don't have time for full alignment?
Use [Minimum Viable Alignment (MVA)](Minimum-Viable-Alignment.md) - ~90 minutes for essential structure.

## Structure & Organization

### How many files should be in root?
Target: ≤10 files. Keep only:
- README.md
- LICENSE (if public)
- .gitignore
- Package manager file (package.json, go.mod, etc.)
- CHANGELOG.md (if versioned)

Move everything else to appropriate directories.

### Where should source code go?
- **JavaScript/Python/Rust:** `src/`
- **Go:** `cmd/` + `pkg/`
- **Monorepo:** `apps/` + `packages/`

See [Section 2](02-Source-Code-Layout.md) for details.

### What if I have source files in root?
Move them to appropriate directory (`src/`, `cmd/pkg/`, etc.). Use `git mv` to preserve history. Update import paths.

## Security

### What if I accidentally committed a secret?
⚠️ **CRITICAL:** 
1. Rotate the secret immediately (it's compromised)
2. Remove from git history (BFG Repo-Cleaner or git filter-branch)
3. Set up secret scanning to prevent future issues

See [Section 3](03-Configuration-Environment.md) for details.

### Do I need SECURITY.md?
Yes, for all repositories (P0 requirement). It should include:
- Vulnerability disclosure process
- Security contact information
- Response SLAs

See [Templates](Templates.md) for SECURITY.md template.

### How do I set up secret scanning?
1. Pre-commit hook: git-secrets or truffleHog
2. CI/CD scanning: Add to CI pipeline
3. Configure custom patterns for your secret formats

See [Section 3](03-Configuration-Environment.md) and [Section 10](10-Security-Compliance.md).

## CI/CD

### Which CI/CD platform should I use?
- **GitHub repository:** GitHub Actions (easiest)
- **GitLab repository:** GitLab CI (built-in)
- **Self-hosted:** Jenkins
- **Small project:** Start with GitHub Actions

See [Section 5](05-CI-CD-Structure.md) for platform-specific guidance.

### What if CI/CD is too slow?
- Use caching for dependencies
- Run tests in parallel
- Use matrix builds efficiently
- Consider fast/slow test separation

### Do I need CI/CD for a small project?
Yes, even small projects benefit from:
- Automated testing
- Code quality checks
- Security scanning

Start with basic CI/CD (build + lint).

## Dependencies

### Should I commit lockfiles?
Yes! Always commit lockfiles:
- `package-lock.json` (npm)
- `yarn.lock` (yarn)
- `pnpm-lock.yaml` (pnpm)
- `poetry.lock` (poetry)
- `go.sum` (Go)
- `Cargo.lock` (Rust)

Lockfiles ensure consistent installs.

### What if I don't have a lockfile?
Generate it:
- npm: `npm install`
- poetry: `poetry lock`
- Go: `go mod tidy`
- Rust: `cargo build` (creates Cargo.lock)

### How do I handle dependency vulnerabilities?
1. Set up automated vulnerability scanning
2. Define SLAs (Critical: 7 days, High: 30 days)
3. Prioritize critical vulnerabilities
4. Use Dependabot/Renovate for automated updates

## Testing

### Do I need tests?
Yes, for production repositories. Start with:
- Unit tests (P0)
- Integration tests (P1)
- E2E tests (P2, if applicable)

See [Section 6](06-Testing-Structure.md).

### What if tests pass locally but fail in CI?
- Check Node.js/Python/Go version matches CI
- Verify environment variables are set
- Check for platform-specific issues
- Test in Docker container to match CI

### How much test coverage do I need?
Target: ≥70% for production code. Track coverage over time.

## Documentation

### What should be in README.md?
- What the repo is (1-2 sentences)
- How to install/run it
- Where code lives
- How to contribute

Keep README concise (<1 minute read). Move details to `docs/`.

### Do I need a docs/ folder?
P1 recommendation. Create `docs/` when you have:
- Architecture documentation
- API documentation
- Developer onboarding guide
- Setup instructions

### How do I keep documentation up-to-date?
- Review docs when code changes
- Add to PR checklist
- Use automated doc generation
- Test documentation regularly

## Change Management

### Do I need CHANGELOG.md?
Only if versioned project (others install/use your code). Internal tools can skip.

### What commit message format should I use?
[Conventional Commits](https://www.conventionalcommits.org/):
- Format: `type(scope): description`
- Types: feat, fix, docs, style, refactor, test, chore, perf, ci, build, revert
- Example: `feat(auth): add OAuth2 support`

### How do I enforce commit message format?
Use commitlint or pre-commit hooks. See [Section 12](12-Change-Management.md).

## Migration

### How do I migrate an existing repository?
See [Migration Guide](Migration-Guide.md). Use incremental strategy:
1. Complete Section 0
2. Migrate one section at a time
3. Test after each section
4. Use feature branches

### What if migration breaks things?
- Use rollback procedures (see Migration Guide)
- Test thoroughly before merging
- Keep backup branch
- Migrate incrementally

### Can I skip sections?
Yes, but be careful:
- Don't skip prerequisites
- Document why you skipped
- Consider impact on other sections

## Platform-Specific

### I'm not using GitHub. What about .github/ folder?
`.github/` is only for GitHub Actions. Other platforms:
- **GitLab:** `.gitlab-ci.yml` in root
- **Jenkins:** `Jenkinsfile` in root
- **CircleCI:** `.circleci/config.yml`
- **Azure DevOps:** `azure-pipelines.yml`

### How do I set up CI/CD for GitLab?
Create `.gitlab-ci.yml` in root. See [Section 5](05-CI-CD-Structure.md) for examples.

### What about Azure DevOps?
Create `azure-pipelines.yml`. See [Section 5](05-CI-CD-Structure.md) for platform-specific guidance.

## Language-Specific

### I'm using [language]. Is ALIGNMENT applicable?
Yes! ALIGNMENT is language-agnostic. See [Section 2](02-Source-Code-Layout.md) for language-specific structure guidance.

### What if my language isn't mentioned?
ALIGNMENT principles apply to all languages. Adapt structure conventions to your language's best practices.

## Troubleshooting

### Validation script fails. What do I do?
1. Read error message carefully
2. Check relevant section's "Common Issues & Solutions"
3. Review [Common Pitfalls](Common-Pitfalls.md)
4. Verify prerequisites are complete

### Health score is low. How do I improve it?
1. Complete P0 requirements first (40 points)
2. Add P1 requirements (30 points)
3. Improve documentation quality (10 points)
4. See [Success Metrics](Success-Metrics.md)

### I'm stuck. Where do I get help?
1. Check [Common Pitfalls](Common-Pitfalls.md)
2. Review section's "Common Issues & Solutions"
3. See [Getting Help](Getting-Help.md)
4. Open an issue in ALIGNMENT repository

## Advanced Topics

### What is SLSA compliance?
SLSA (Supply Chain Levels for Software Artifacts) is a security framework. See [Section 10](10-Security-Compliance.md) P2 for details.

### Do I need DORA metrics?
DORA metrics (Deployment Frequency, Lead Time, MTTR, Change Failure Rate) are P2 (advanced). Useful for measuring team performance.

### What about FAIR principles?
FAIR (Findable, Accessible, Interoperable, Reusable) is P1/P2 for research/data repositories. See [Section 7](07-Documentation-Standards.md).

## Still Have Questions?

- Check relevant section's documentation
- Review [Common Pitfalls](Common-Pitfalls.md)
- See [Getting Help](Getting-Help.md)
- Open an issue in ALIGNMENT repository

---

**Remember:** ALIGNMENT is a guide, not a strict rule. Adapt it to your needs!
