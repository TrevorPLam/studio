# Migration Guide: Aligning Existing Repositories

**For:** Teams migrating existing repositories to ALIGNMENT standards  
**Approach:** Incremental, risk-minimized adoption

## Overview

Migrating an existing repository to ALIGNMENT standards requires careful planning to avoid disrupting active development. This guide provides strategies for incremental adoption.

## Pre-Migration Assessment

Before starting, assess your repository:

1. **Repository Size:**
   - Small (< 10 files): Can align quickly (1-2 days)
   - Medium (10-100 files): Incremental approach (1-2 weeks)
   - Large (100+ files): Phased approach (1-2 months)

2. **Team Size:**
   - Solo developer: Can move faster
   - Small team (2-5): Coordinate via PRs
   - Large team (5+): Requires communication plan

3. **Activity Level:**
   - Active development: Use feature branches
   - Maintenance mode: Can align more aggressively
   - Legacy/archived: Align documentation only

4. **Risk Tolerance:**
   - High-stakes production: Very incremental
   - Internal tools: Can move faster
   - Experiments: Can align quickly

## Migration Strategies

### Strategy 1: Incremental by Section (Recommended)

**Best for:** Active repositories with ongoing development

**Approach:**
1. Complete Section 0 (Prerequisites) first
2. Implement one section at a time via feature branches
3. Merge each section as a separate PR
4. Test thoroughly before proceeding

**Timeline:** 2-4 weeks for full alignment

**Example:**
```
Week 1: Sections 0-1 (Prerequisites + Root Structure)
Week 2: Sections 2-4 (Source Layout + Config + Dependencies)
Week 3: Sections 5-6 (CI/CD + Testing)
Week 4: Sections 7-13 (Documentation + Governance + Security + etc.)
```

### Strategy 2: Critical Path First

**Best for:** Repositories needing immediate security/compliance improvements

**Approach:**
1. Complete Section 0 (Prerequisites)
2. Prioritize security-critical sections:
   - Section 3 (Configuration - secret remediation)
   - Section 10 (Security & Compliance)
   - Section 5 (CI/CD - security scanning)
3. Fill in remaining sections incrementally

**Timeline:** 1-2 weeks for critical, 4-6 weeks for complete

### Strategy 3: Documentation-Only

**Best for:** Legacy repositories with minimal changes

**Approach:**
1. Add/update README.md
2. Create basic documentation structure
3. Document current state (don't force structural changes)
4. Add governance files (CODEOWNERS, CONTRIBUTING.md)

**Timeline:** 1 week

### Strategy 4: Big Bang (Not Recommended)

**Best for:** Newly forked repositories or major refactors

**Approach:**
- Complete all sections in one large PR
- Only use if repository is inactive or undergoing major refactor
- Requires extensive testing

**Timeline:** 1-2 weeks (full-time focus)

## Section-Specific Migration Guidance

### Section 1: Root Directory Structure

**Risk:** Low (mostly file organization)

**Migration Steps:**
1. **Create backup branch:** `git checkout -b backup/pre-alignment`
2. **Identify files to move:**
   ```bash
   # List files in root
   ls -la | grep -v "^d" | grep -v "^\."
   ```
3. **Move files incrementally:**
   - Move config files → `config/`
   - Move scripts → `scripts/`
   - Move docs → `docs/`
4. **Update references:**
   - Search codebase for moved file paths
   - Update import statements
   - Update documentation links
5. **Test build:** Ensure everything still works
6. **Commit:** `git commit -m "refactor: align root directory structure (ALIGNMENT Section 1)"`

**Rollback:** `git checkout backup/pre-alignment`

**Time Estimate:** 2-4 hours

### Section 2: Source Code Layout

**Risk:** Medium (requires code changes)

**Migration Steps:**
1. **Create feature branch:** `git checkout -b refactor/source-layout`
2. **Identify source files in root:**
   ```bash
   find . -maxdepth 1 -type f \( -name "*.js" -o -name "*.ts" -o -name "*.py" -o -name "*.go" -o -name "*.rs" \)
   ```
3. **Create target directory:** `mkdir src` (or appropriate)
4. **Move files:** Use `git mv` to preserve history
   ```bash
   git mv *.js src/
   git mv *.ts src/
   ```
5. **Update imports:** Use find/replace or automated tool
   ```bash
   # Example for JavaScript
   find . -name "*.js" -exec sed -i 's/from "\.\/file/from ".\/src\/file/g' {} \;
   ```
6. **Test thoroughly:** Run all tests
7. **Update build config:** Update paths in build tools
8. **Merge:** Create PR and get team review

**Rollback:** Revert PR or `git checkout main`

**Time Estimate:** 4-8 hours (depends on codebase size)

### Section 3: Configuration & Environment

**Risk:** High (security-critical)

**Migration Steps:**
1. **⚠️ CRITICAL: Audit for secrets first**
   ```bash
   # Scan for secrets
   git secrets --scan-history
   # Or use truffleHog
   trufflehog git file://. --json
   ```
2. **If secrets found:**
   - Rotate secrets immediately
   - Remove from git history (see below)
   - Set up secret scanning before proceeding
3. **Create `.env.example`:**
   - List all required environment variables
   - Document each variable
   - Never include actual secrets
4. **Update `.gitignore`:**
   - Ensure `.env*` files are ignored
5. **Test:** Verify app works with environment variables

**Secret Removal from Git History:**
```bash
# Option 1: BFG Repo-Cleaner (recommended)
bfg --delete-files .env
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Option 2: git filter-branch (if BFG unavailable)
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all
```

**Rollback:** Not recommended if secrets were exposed (rotate instead)

**Time Estimate:** 2-6 hours (longer if secrets need rotation)

### Section 5: CI/CD Structure

**Risk:** Medium (can break existing CI/CD)

**Migration Steps:**
1. **Backup existing CI/CD:**
   ```bash
   cp .github/workflows/*.yml .github/workflows/backup/
   # Or for GitLab
   cp .gitlab-ci.yml .gitlab-ci.yml.backup
   ```
2. **Create new workflow incrementally:**
   - Start with build step only
   - Test that it works
   - Add lint step
   - Add security checks
   - Add test step (after Section 6)
3. **Test in feature branch:**
   - Push to feature branch
   - Verify CI runs successfully
   - Check that it fails appropriately on errors
4. **Update branch protection:**
   - Ensure CI must pass before merge
5. **Merge:** Create PR and monitor first few runs

**Rollback:** Restore backup files

**Time Estimate:** 4-8 hours

### Section 10: Security & Compliance

**Risk:** Low (mostly additive)

**Migration Steps:**
1. **Create SECURITY.md:**
   - Use template from Templates.md
   - Add vulnerability disclosure process
   - Add security contact
2. **Set up secret scanning:**
   - Pre-commit hooks (git-secrets)
   - CI pipeline scanning
3. **Configure dependency scanning:**
   - Enable Dependabot/Renovate
   - Set up vulnerability alerts
4. **Test secret scanning:**
   - Try committing a test secret (should be blocked)
   - Verify CI catches it

**Rollback:** Remove SECURITY.md, disable scanners

**Time Estimate:** 2-4 hours

## Common Migration Challenges

### Challenge: "Moving files breaks imports"

**Solution:**
1. Use `git mv` to preserve history
2. Update imports systematically:
   - Use IDE refactoring tools
   - Or use find/replace with regex
   - Test after each batch
3. Update build configuration
4. Run full test suite

### Challenge: "Team members have local changes"

**Solution:**
1. Communicate migration plan in advance
2. Create migration branch
3. Ask team to rebase their branches
4. Provide migration script if needed
5. Schedule migration during low-activity period

### Challenge: "CI/CD breaks after changes"

**Solution:**
1. Test CI/CD changes in feature branch first
2. Keep old CI/CD config as backup
3. Add new CI/CD alongside old (test both)
4. Switch over after verification
5. Monitor first few runs closely

### Challenge: "Too many files to move manually"

**Solution:**
1. Create migration script:
   ```bash
   #!/bin/bash
   # Example: Move all .js files to src/
   find . -maxdepth 1 -name "*.js" -exec git mv {} src/ \;
   ```
2. Test script on small subset first
3. Run script and verify
4. Update imports programmatically

### Challenge: "Secrets already in git history"

**Solution:**
1. **Immediate:** Rotate all exposed secrets
2. **Short-term:** Remove from git history (see Section 3 guidance)
3. **Long-term:** Set up secret scanning to prevent future issues
4. **Note:** If secrets were in public repo, assume they're compromised

## Rollback Procedures

### Full Rollback

If migration causes critical issues:

```bash
# Option 1: Revert specific commit
git revert <commit-hash>

# Option 2: Reset to pre-migration state
git reset --hard <pre-migration-commit>

# Option 3: Restore from backup branch
git checkout backup/pre-alignment
git checkout -b restore/pre-alignment
```

### Partial Rollback

Revert specific sections:

```bash
# Revert Section 1 only
git revert <section-1-commit>

# Or restore specific files
git checkout backup/pre-alignment -- path/to/file
```

## Testing After Migration

After each section migration:

1. **Build Test:**
   ```bash
   # Fresh clone
   git clone <repo-url> test-clone
   cd test-clone
   # Follow README instructions
   npm install  # or equivalent
   npm run build
   ```

2. **Test Suite:**
   ```bash
   npm test  # or equivalent
   ```

3. **CI/CD Test:**
   - Push to test branch
   - Verify CI/CD runs successfully
   - Check all checks pass

4. **Documentation Test:**
   - Can new developer follow README?
   - Are all links working?
   - Is setup process clear?

## Communication Plan

### Before Migration

1. **Announce intent:** Post in team chat/email
2. **Share plan:** Link to this migration guide
3. **Set timeline:** Communicate expected duration
4. **Request feedback:** Ask for concerns or suggestions

### During Migration

1. **Update progress:** Post updates as sections complete
2. **Report issues:** Share any blockers immediately
3. **Coordinate merges:** Ensure team knows when to rebase

### After Migration

1. **Announce completion:** Let team know migration is done
2. **Share benefits:** Highlight improvements
3. **Gather feedback:** Ask for team input
4. **Document learnings:** Update this guide with lessons learned

## Success Metrics

Track these to measure migration success:

- **Build time:** Should not increase significantly
- **Test pass rate:** Should remain 100%
- **Developer onboarding time:** Should decrease
- **CI/CD reliability:** Should improve
- **Security incidents:** Should decrease (especially secrets)
- **Documentation completeness:** Should improve

## Getting Help

If you encounter issues during migration:

1. Check "Common Issues & Solutions" in relevant section
2. Review [Workflow Guides](Workflow-Guides.md)
3. See [Getting Help](Getting-Help.md)
4. Consider incremental approach if stuck

## Example Migration Timeline

**Small Repository (10 files, solo developer):**
- Day 1: Sections 0-2 (Prerequisites, Root, Source)
- Day 2: Sections 3-5 (Config, Dependencies, CI/CD)
- Day 3: Sections 6-7 (Testing, Documentation)
- Day 4: Sections 8-13 (Infra, Governance, Security, etc.)

**Medium Repository (50 files, 3-person team):**
- Week 1: Sections 0-2 (coordinate via PRs)
- Week 2: Sections 3-5 (test thoroughly)
- Week 3: Sections 6-9 (documentation focus)
- Week 4: Sections 10-13 (security and quality)

**Large Repository (200+ files, 10-person team):**
- Month 1: Sections 0-4 (foundation)
- Month 2: Sections 5-7 (automation and docs)
- Month 3: Sections 8-10 (infra, governance, security)
- Month 4: Sections 11-13 (observability, change management, quality)

---

**Remember:** Migration is a journey, not a destination. It's better to align incrementally and correctly than to rush and break things.
