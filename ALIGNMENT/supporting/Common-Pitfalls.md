# Common Pitfalls & How to Avoid Them

This document highlights common mistakes teams make when aligning repositories and how to avoid them.

## Structure & Organization Pitfalls

### Pitfall 1: Moving Files Without Updating References
**Problem:** Moving files breaks imports/builds  
**Solution:**
- Use `git mv` to preserve history
- Update imports systematically (use IDE refactoring tools)
- Test after each batch of moves
- Update build configuration

**Example:**
```bash
# ❌ Wrong: Regular mv breaks git history
mv src/utils.js src/utils/helpers.js

# ✅ Correct: Use git mv
git mv src/utils.js src/utils/helpers.js
# Then update imports
```

### Pitfall 2: Too Many Files in Root
**Problem:** Root directory becomes cluttered (>10 files)  
**Solution:**
- Move config files → `config/`
- Move scripts → `scripts/`
- Move docs → `docs/`
- Keep only: README, LICENSE, .gitignore, package manager file, CHANGELOG

### Pitfall 3: Source Files in Root
**Problem:** Production code mixed with configuration  
**Solution:**
- Create `src/` (or `cmd/pkg/` for Go)
- Move all `.js`, `.py`, `.go`, `.rs` files
- Update import paths

## Security Pitfalls

### Pitfall 4: Committing Secrets
**Problem:** Secrets end up in git history  
**Solution:**
- ⚠️ **CRITICAL:** Rotate secrets immediately if committed
- Remove from git history (BFG Repo-Cleaner or git filter-branch)
- Add `.env*` to `.gitignore`
- Set up secret scanning (pre-commit + CI/CD)
- Use `.env.example` template (no secrets)

**Prevention:**
```bash
# Add to .gitignore
.env
.env.local
.env.*.local

# Set up pre-commit hook
pre-commit install
```

### Pitfall 5: Weak Secret Scanning
**Problem:** Secret scanning misses custom formats  
**Solution:**
- Use multiple tools (git-secrets + truffleHog)
- Configure custom patterns for your secret formats
- Scan git history, not just current files
- Test secret scanning with dummy secrets

### Pitfall 6: Missing SECURITY.md
**Problem:** No vulnerability disclosure process  
**Solution:**
- Create SECURITY.md with disclosure process
- Include security contact email
- Define response SLAs
- Link from README

## CI/CD Pitfalls

### Pitfall 7: CI/CD Doesn't Block Merges
**Problem:** Failing CI doesn't prevent merges  
**Solution:**
- Configure branch protection rules
- Require CI to pass before merging
- Require pull request reviews
- Test branch protection with failing commit

### Pitfall 8: CI/CD Too Slow
**Problem:** Long CI runs slow down development  
**Solution:**
- Use caching for dependencies
- Run tests in parallel
- Use matrix builds efficiently
- Consider fast/slow test separation

### Pitfall 9: Missing Security Checks in CI
**Problem:** Security issues slip through  
**Solution:**
- Add dependency vulnerability scanning
- Add secret scanning
- Add SAST (Static Application Security Testing)
- Fail builds on critical vulnerabilities

## Documentation Pitfalls

### Pitfall 10: Outdated README
**Problem:** README doesn't match current state  
**Solution:**
- Review README when code changes
- Add "last updated" date
- Test README instructions regularly
- Include in PR checklist

### Pitfall 11: Missing Onboarding Guide
**Problem:** New developers struggle to get started  
**Solution:**
- Create `docs/onboarding.md`
- Include step-by-step setup
- Document common issues
- Test onboarding process with new developer

### Pitfall 12: Broken Links
**Problem:** Documentation links don't work  
**Solution:**
- Use link checker in CI/CD
- Test links before merging
- Use relative paths for internal links
- Update links when moving files

## Dependency Management Pitfalls

### Pitfall 13: Lockfile Not Committed
**Problem:** Inconsistent dependency versions  
**Solution:**
- Always commit lockfiles
- Remove lockfile from `.gitignore` if present
- Generate lockfile: `npm install`, `poetry lock`, `go mod tidy`

### Pitfall 14: Ignoring Dependency Vulnerabilities
**Problem:** Known vulnerabilities not addressed  
**Solution:**
- Set up automated vulnerability scanning
- Define SLAs for vulnerability response
- Prioritize critical vulnerabilities
- Document why vulnerabilities can't be fixed (if applicable)

### Pitfall 15: No Dependency Update Automation
**Problem:** Dependencies become outdated  
**Solution:**
- Enable Dependabot or Renovate
- Configure auto-merge for patch/minor updates
- Review major updates manually
- Set update frequency

## Testing Pitfalls

### Pitfall 16: Tests Not Running in CI
**Problem:** Tests pass locally but fail in CI  
**Solution:**
- Ensure tests run in CI/CD pipeline
- Use same Node.js/Python/Go version as CI
- Test in Docker container to match CI
- Check environment variables

### Pitfall 17: No Test Coverage Tracking
**Problem:** Don't know what's tested  
**Solution:**
- Set up test coverage reporting
- Set coverage thresholds
- Track coverage over time
- Aim for ≥70% coverage

### Pitfall 18: Flaky Tests
**Problem:** Tests fail intermittently  
**Solution:**
- Fix flaky tests immediately
- Use test retries sparingly
- Isolate tests (no shared state)
- Use deterministic test data

## Change Management Pitfalls

### Pitfall 19: Inconsistent Commit Messages
**Problem:** Hard to understand commit history  
**Solution:**
- Adopt Conventional Commits format
- Use commitlint to enforce format
- Document commit conventions in CONTRIBUTING.md
- Review commit messages in PRs

### Pitfall 20: Missing CHANGELOG for Versioned Projects
**Problem:** Users don't know what changed  
**Solution:**
- Create CHANGELOG.md for versioned projects
- Follow Keep a Changelog format
- Update CHANGELOG with each release
- Use automated changelog generation (P1)

## Migration Pitfalls

### Pitfall 21: Big Bang Migration
**Problem:** Too many changes at once breaks things  
**Solution:**
- Use incremental migration strategy
- Complete one section at a time
- Test thoroughly after each section
- Use feature branches for migration

### Pitfall 22: Not Testing After Migration
**Problem:** Migration breaks functionality  
**Solution:**
- Test fresh clone after migration
- Run full test suite
- Verify build works
- Check CI/CD still runs

### Pitfall 23: Not Communicating Migration
**Problem:** Team members have conflicts  
**Solution:**
- Announce migration plan in advance
- Coordinate with team
- Use migration branch
- Ask team to rebase their branches

## Governance Pitfalls

### Pitfall 24: Missing CODEOWNERS
**Problem:** Don't know who reviews what  
**Solution:**
- Create CODEOWNERS file
- Define owners for each path
- Keep CODEOWNERS up-to-date
- Use CODEOWNERS in branch protection

### Pitfall 25: Unclear Contribution Process
**Problem:** Contributors don't know how to contribute  
**Solution:**
- Create CONTRIBUTING.md
- Document branching strategy
- Explain PR process
- Include code review checklist

## Performance Pitfalls

### Pitfall 26: Slow Builds
**Problem:** Development slowed by long builds  
**Solution:**
- Use build caching
- Optimize build steps
- Parallelize builds
- Consider incremental builds

### Pitfall 27: Large Repository Size
**Problem:** Slow clones and operations  
**Solution:**
- Use `.gitignore` properly
- Don't commit build artifacts
- Use Git LFS for large files
- Consider repository splitting if very large

## Best Practices to Avoid Pitfalls

1. **Start Small:** Begin with MVA (Minimum Viable Alignment)
2. **Test Incrementally:** Test after each change
3. **Document Decisions:** Record why you made choices
4. **Review Regularly:** Check health score monthly
5. **Get Feedback:** Ask team what's working/not working
6. **Use Validation Scripts:** Run scripts before committing
7. **Follow Migration Guide:** Use incremental approach
8. **Monitor Health:** Track health score over time

## Getting Help

If you encounter a pitfall:

1. Check this document for solutions
2. Review relevant section's "Common Issues & Solutions"
3. See [FAQ](FAQ.md) for answers
4. Use [Migration Guide](Migration-Guide.md) for migration issues
5. Check [Getting Help](Getting-Help.md) for resources

---

**Remember:** Pitfalls are learning opportunities. Document them so others can avoid them!
