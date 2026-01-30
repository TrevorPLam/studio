# 12. Change Management

**Prerequisites:** 
- [Section 0: Prerequisites](00-Prerequisites.md) - Complete decision points (especially "Is versioned project?")
- [Section 1: Root Directory Structure](01-Root-Directory-Structure.md)

**Principles:**
- [Change Management Principles](../principles/Change-Management-Principles.md) - Core philosophy: *Version numbers communicate intent. Changes communicate impact. Breaking changes require planning, deprecation, and clear communication.*
  - Key concepts: Semantic Versioning (MAJOR.MINOR.PATCH), breaking changes philosophy, deprecation strategy, change communication, commit messages as documentation

## 🎯 What You're Trying to Accomplish
Make changes predictable by defining versioning rules, changelog practices, and release communication.

## 🎓 Why This Section Exists
Users need to trust upgrades. Clear versioning and changelogs reduce surprises and support requests.

## 📚 Key Concepts (Mentor Mode)

### Semantic Versioning (SemVer)
**Simple:** MAJOR.MINOR.PATCH where MAJOR means breaking change.
**Why it matters:** Users know when upgrades are safe.

### Changelog
**Simple:** A file describing what changed per release.
**Why it matters:** Provides a record for users and maintainers.

### Deprecation
**Simple:** Marking something as “will be removed later.”
**Why it matters:** Gives users time to adapt.

## ✅ Subtasks (With Owner Tags)

#### Subtask 12.1 — Choose a versioning strategy | **USER**
**Purpose:** Pick SemVer, CalVer, or a custom scheme.
**Expected outcome:** Strategy documented.

#### Subtask 12.2 — Create CHANGELOG template | **AGENT**
**Purpose:** Standardize release notes.
**Expected outcome:** CHANGELOG.md created (if versioned).

#### Subtask 12.3 — Define release process | **USER**
**Purpose:** Make releases repeatable.
**Expected outcome:** Release steps documented.

#### Subtask 12.4 — Automate changelog generation | **AGENT**
**Purpose:** Reduce manual effort.
**Expected outcome:** Tooling configured if desired.

#### Subtask 12.5 — Document deprecation policy | **USER**
**Purpose:** Avoid surprise removals.
**Expected outcome:** Deprecation rules documented.

## 📘 Detailed Reference (Original Guidance)

## Questions to Answer

Before proceeding, answer these questions:

1. **What versioning strategy will you use?**
   - [ ] Semantic Versioning (SemVer: MAJOR.MINOR.PATCH) - **Starting version?** _______________
   - [ ] Calendar Versioning (CalVer: YYYY.MM.DD)
   - [ ] Custom versioning scheme: _______________
   - [ ] No versioning (internal projects only)

2. **What should your CHANGELOG.md include?** (if versioned project)
   - [ ] Added (new features)
   - [ ] Changed (changes in existing functionality)
   - [ ] Deprecated (soon-to-be removed features)
   - [ ] Removed (removed features)
   - [ ] Fixed (bug fixes)
   - [ ] Security (vulnerability fixes)

3. **What commit message format will you use?**
   - [ ] Conventional Commits (`type(scope): description`) - **Recommended**
   - [ ] Custom format: _______________
   - [ ] No standard format (not recommended)

**Note:** If you answered "No" to "Is versioned project?" in Section 0, you can skip CHANGELOG.md requirements but should still adopt commit conventions.

**Document your answers** in `alignment-progress.json` before proceeding.

**Effort Estimate:**
- **Basic change management (P0):** 1-2 hours
- **Automated changelog generation (P1):** 1-2 hours additional
- **Advanced release management (P2):** 2-4 hours additional
- **Existing CHANGELOG formatting:** 30-60 minutes

## P0 — Required Actions

**Action:** Set up change tracking (see [Change Management Principles](../principles/Change-Management-Principles.md) for foundational concepts) | **USER**
- [ ] For versioned projects: ensure `CHANGELOG.md` exists and follows [Keep a Changelog](https://keepachangelog.com/) format
  - **Note:** File should be created in [Section 1 P0](01-Root-Directory-Structure.md); format it properly here
- [ ] Use semantic versioning (SemVer: MAJOR.MINOR.PATCH) - see [Change Management Principles](../principles/Change-Management-Principles.md):
  - [ ] MAJOR version for breaking changes (incompatible API changes)
  - [ ] MINOR version for new features (backward compatible)
  - [ ] PATCH version for bug fixes (backward compatible)
  - [ ] Version numbers communicate intent (see [Change Management Principles](../principles/Change-Management-Principles.md))
- [ ] Apply breaking changes philosophy (see [Change Management Principles](../principles/Change-Management-Principles.md)):
  - [ ] Plan breaking changes carefully (they're costly for users)
  - [ ] Deprecate before removing (give users time to adapt)
  - [ ] Provide migration guides (help users transition)
- [ ] Document breaking changes clearly in changelog
- [ ] Include breaking changes in release notes

**Action:** Standardize commit messages (see [Change Management Principles](../principles/Change-Management-Principles.md) for commit message principles) | **USER**
- [ ] Adopt [Conventional Commits](https://www.conventionalcommits.org/) format: `type(scope): description`
- [ ] Follow commit message principles from [Change Management Principles](../principles/Change-Management-Principles.md):
  - [ ] Use imperative mood ("Add feature" not "Added feature")
  - [ ] Keep first line < 50 characters
  - [ ] Be descriptive (explain what and why)
  - [ ] Reference issues/PRs in footer
- [ ] Use standard commit types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`, `ci`, `build`, `revert`
- [ ] Mark breaking changes with `!` after type/scope or `BREAKING CHANGE:` in footer
- [ ] Configure commitlint or pre-commit hook to enforce format (see [Section 3 P1](03-Configuration-Environment.md))
- [ ] Document commit message guidelines in CONTRIBUTING.md
- [ ] **Note:** Commit messages document history and enable automatic changelog generation (see P1 below)

See [Templates](Templates.md) for CHANGELOG.md template.

## P1 — Recommended Actions

**Action:** Automate change management | **AGENT**
- [ ] Set up automatic changelog generation from commit messages
- [ ] Configure consistent release tagging
- [ ] Document release process in `docs/releases.md`
  - **Note:** Ensure `docs/` folder exists (see [Section 1 P1](01-Root-Directory-Structure.md))
- [ ] Document rollback procedures

## P2 — Advanced Actions

**Action:** Advanced release management (see [Change Management Principles](../principles/Change-Management-Principles.md) for advanced practices) | **AGENT**
- [ ] Implement deprecation strategy (see [Change Management Principles](../principles/Change-Management-Principles.md)):
  - [ ] Mark features as deprecated before removing
  - [ ] Set removal timeline (at least one release cycle)
  - [ ] Provide clear deprecation notices
  - [ ] Remove only in next MAJOR version
- [ ] Assess change impact (see [Change Management Principles](../principles/Change-Management-Principles.md)):
  - [ ] Who is affected by changes?
  - [ ] What breaks with changes?
  - [ ] How severe is the impact?
  - [ ] Version accordingly (MAJOR for high impact)
- [ ] Automate release notes generation
- [ ] Create version compatibility matrices
- [ ] Define deprecation policies and timelines
- [ ] Set up release automation
- [ ] Ensure change management follows "Golden rules" from [Change Management Principles](../principles/Change-Management-Principles.md)

## Decision: Is this a versioned project?

**From Section 0, recall your decision:**

**If Yes (versioned project):**
- [ ] CHANGELOG.md exists (created in Section 1)
- [ ] Use semantic versioning (SemVer)
- [ ] Format CHANGELOG following [Keep a Changelog](https://keepachangelog.com/)
- [ ] Document breaking changes clearly

**If No (internal project):**
- [ ] Skip CHANGELOG.md (or use for internal tracking)
- [ ] Still use Conventional Commits for consistency
- [ ] Consider versioning internally for tracking

**Action:** Set up change management based on project type | **USER**
- [ ] If versioned: Format CHANGELOG properly
- [ ] Adopt Conventional Commits format
- [ ] Configure commit message validation (pre-commit hook)

## Verification

**Manual Check:**
- [ ] If versioned: Verify CHANGELOG.md exists and follows format
- [ ] Check commit messages follow Conventional Commits format: `git log --oneline` (last 10 commits)
- [ ] Verify commitlint or pre-commit hook enforces format (if P0 completed)
- [ ] If P1 completed: Check automatic changelog generation is configured
- [ ] Test: Make a commit with wrong format (should be rejected if hooks configured)

**Automated Check (Future):**
```bash
./scripts/validate-section-12.sh
```

**Done Criteria:**
- ✅ CHANGELOG.md exists and formatted (if versioned project)
- ✅ Commit messages follow Conventional Commits format
- ✅ Commit message validation configured (if P0 completed)
- ✅ Semantic versioning used (if versioned project)
- ✅ Breaking changes philosophy applied (plan, deprecate, communicate)
- ✅ Deprecation strategy defined (deprecate before removing)
- ✅ Change communication clear (changelog, release notes, migration guides)
- ✅ Change management follows principles from [Change Management Principles](../principles/Change-Management-Principles.md)

## Common Issues & Solutions

**Issue:** "I don't know if I need CHANGELOG.md"  
- **Solution:** 
  - Refer to Section 0 decision: Is this a versioned project?
  - If others install/use your code → Yes, need CHANGELOG
  - If internal tool → No, but still useful for tracking changes
  - You can always add it later

**Issue:** "Conventional Commits format is confusing"  
- **Solution:** 
  - Format: `type(scope): description`
  - Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
  - Examples: `feat(auth): add OAuth2`, `fix(api): handle null response`
  - Use commitlint to validate automatically

**Issue:** "My CHANGELOG is out of date"  
- **Solution:** 
  - Set up automatic changelog generation (P1 action)
  - Use tools: standard-version, semantic-release, changesets
  - Generate from commit messages (requires Conventional Commits)
  - Review and edit generated changelog before release

**Issue:** "I don't know what semantic versioning means"  
- **Solution:** 
  - SemVer = MAJOR.MINOR.PATCH (e.g., 1.2.3)
  - MAJOR: Breaking changes (1.2.3 → 2.0.0)
  - MINOR: New features, backward compatible (1.2.3 → 1.3.0)
  - PATCH: Bug fixes (1.2.3 → 1.2.4)
  - Start with 0.1.0, move to 1.0.0 when stable

**Issue:** "Commit hooks are blocking my commits"  
- **Solution:** 
  - Fix commit message format (use Conventional Commits)
  - Or bypass for urgent fixes: `git commit --no-verify` (use sparingly)
  - Configure hooks to be warnings instead of errors (if appropriate)
  - Learn the format: It becomes natural with practice