# 4. Dependency Management

**Prerequisites:** 
- [Section 0: Prerequisites](00-Prerequisites.md) - Complete decision points
- [Section 1: Root Directory Structure](01-Root-Directory-Structure.md)

**Effort Estimate:**
- **New repository:** 15-30 minutes
- **Existing repository (lockfile exists):** 30-60 minutes
- **Existing repository (no lockfile):** 1-2 hours
- **Existing repository (many dependencies):** 2-4 hours (if license review needed)

## 🎯 What You're Trying to Accomplish
Lock down your dependencies so installs are repeatable, secure, and legally compatible.

## 🎓 Why This Section Exists
Unpinned dependencies can break builds or introduce vulnerabilities. Lockfiles and policies make dependency changes predictable.

## 📚 Key Concepts (Mentor Mode)

### Lockfile
**Simple:** A file that records the exact versions installed.
**Why it matters:** Everyone gets the same dependency versions.

### Transitive dependency
**Simple:** A dependency of your dependency.
**Why it matters:** Risk and licenses can come from deep in the tree.

### License compatibility
**Simple:** Legal rules that determine if a dependency is safe to use.
**Why it matters:** Incompatible licenses can force changes to your distribution.

## ✅ Subtasks (With Owner Tags)

#### Subtask 4.1 — Confirm package manager and lockfile | **USER**
**Purpose:** Ensure your ecosystem is clear.
**Expected outcome:** Correct lockfile identified or created.

#### Subtask 4.2 — Commit lockfiles | **AGENT**
**Purpose:** Make installs reproducible.
**Expected outcome:** Lockfile tracked in Git.

#### Subtask 4.3 — Review dependency licenses | **USER**
**Purpose:** Avoid legal surprises.
**Expected outcome:** Known license risks documented.

#### Subtask 4.4 — Set an update policy | **USER**
**Purpose:** Define how and when dependencies update.
**Expected outcome:** Policy documented for the team.

#### Subtask 4.5 — Automate vulnerability checks | **AGENT**
**Purpose:** Catch issues early.
**Expected outcome:** Scanning enabled in CI.

## 📘 Detailed Reference (Original Guidance)

## P0 — Required Actions

**Action:** Secure dependencies | **USER**
- [ ] Commit lockfiles: `package-lock.json`, `pnpm-lock.yaml`, `Cargo.lock`, `go.sum`
- [ ] Verify license compatibility (no incompatible licenses)
- [ ] Document dependency scanning process
- [ ] **Note:** Configure automated vulnerability scanning in CI/CD (see [CI/CD Structure](05-CI-CD-Structure.md))

## P1 — Recommended Actions

**Action:** Automate dependency management | **AGENT**
- [ ] Enable Dependabot or Renovate for automated updates
- [ ] Create dependency policy document:
  - Allowed version ranges
  - Banned packages
  - Update frequency
- [ ] Configure auto-merge for patch/minor updates (if appropriate)

## P2 — Advanced Actions

**Action:** Advanced dependency tracking | **AGENT**
- [ ] Create internal dependency dashboard
- [ ] Enforce dependency boundaries (e.g., packages cannot depend on apps)
- [ ] Track dependency health metrics

## Decision: Which package manager are you using?

**From Section 0, identify your lockfile and verify:**
- npm → `package-lock.json` - **Is it committed?** Does it exist?
- pnpm → `pnpm-lock.yaml` - **Is it committed?** Does it exist?
- yarn → `yarn.lock` - **Is it committed?** Does it exist?
- pip → `requirements.txt` (no lockfile) - **Consider:** poetry or pipenv for lockfile support
- poetry → `poetry.lock` - **Is it committed?** Does it exist?
- pipenv → `Pipfile.lock` - **Is it committed?** Does it exist?
- Go → `go.sum` - **Is it committed?** Does it exist?
- Rust → `Cargo.lock` - **Is it committed?** Does it exist?
- Other → **What's the lockfile name?** _______________ **Is it committed?**

**Action:** Verify lockfile exists and is committed | **AGENT**
- [ ] Check lockfile exists for your package manager: `ls -la | grep -E "lock|sum|txt"`
- [ ] Verify lockfile is committed to git: `git ls-files | grep -E "lock|sum"`
- [ ] If no lockfile exists, generate it: `npm install`, `poetry lock`, `go mod tidy`, etc.
- [ ] **What dependencies are critical?** (list top 5-10 most important) _______________

## Verification

**Manual Check:**
- [ ] Verify lockfile exists and is committed: `git ls-files | grep -E "lock|sum"`
- [ ] Check lockfile is not in `.gitignore` (it should be committed)
- [ ] Verify no incompatible licenses: Review dependency licenses
- [ ] Check dependency scanning is configured in CI/CD (from Section 5)
- [ ] If using Dependabot/Renovate: verify config exists (`.github/dependabot.yml` or `renovate.json`)

**Automated Check (Future):**
```bash
./scripts/validate-section-4.sh
```

**Done Criteria:**
- ✅ Lockfile exists and is committed
- ✅ No incompatible licenses in dependencies
- ✅ Dependency vulnerability scanning configured in CI/CD
- ✅ Dependabot/Renovate enabled (if P1 completed)

## Common Issues & Solutions

**Issue:** "I don't have a lockfile"  
- **Solution:** 
  - Generate it: `npm install` (creates package-lock.json), `poetry lock`, `go mod tidy`, etc.
  - Commit it to git (lockfiles should be committed)
  - Add to `.gitignore` only if your package manager doesn't use lockfiles (rare)

**Issue:** "My lockfile is in .gitignore"  
- **Solution:** 
  - Remove lockfile from `.gitignore`
  - Commit the lockfile: `git add package-lock.json` (or equivalent)
  - **Exception:** Some teams use lockfiles differently, but ALIGNMENT standard recommends committing them

**Issue:** "I don't know if I have incompatible licenses"  
- **Solution:** 
  - Use license checking tools:
    - npm: `license-checker`
    - Python: `pip-licenses`
    - Go: `go-licenses`
  - Review licenses for compatibility with your project's license
  - Common incompatible: GPL (if your project is not GPL), AGPL (restrictive)

**Issue:** "Dependabot/Renovate isn't working"  
- **Solution:** 
  - GitHub: Check `.github/dependabot.yml` exists and is valid
  - Renovate: Check `renovate.json` or `.github/renovate.json` exists
  - Verify bot has access to repository
  - Check GitHub/GitLab settings for dependency automation

**Issue:** "I have too many outdated dependencies"  
- **Solution:** 
  - Start with critical security updates first
  - Update dependencies incrementally (don't update everything at once)
  - Test after each update
  - Use Dependabot/Renovate to automate future updates