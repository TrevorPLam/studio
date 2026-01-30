# 9. Governance & Ownership

**Prerequisites:** 
- [Section 0: Prerequisites](00-Prerequisites.md) - Complete decision points
- [Section 1: Root Directory Structure](01-Root-Directory-Structure.md)
- [Section 5: CI/CD Structure](05-CI-CD-Structure.md) - Phase 1 (bootstrap) should be complete

**Principles:**
- [Governance Principles](../principles/Governance-Principles.md) - Core philosophy: *Clear ownership enables accountability. Open contribution enables growth. Code review is learning, not gatekeeping. Trust enables autonomy.*
  - Key concepts: Clear ownership (every area has an owner), open contribution (contributions welcome), code review as learning, trust enables autonomy, shared responsibility

**Effort Estimate:**
- **Basic governance (CODEOWNERS + CONTRIBUTING):** 1-2 hours
- **Complete governance (P0 + P1):** 3-5 hours
- **Advanced governance (P2):** 4-8 hours additional
- **Team coordination:** 1-2 hours (discussion/consensus)

## 🎯 What You're Trying to Accomplish
Define who owns what, how changes are reviewed, and how decisions are made.

## 🎓 Why This Section Exists
Clear ownership prevents bottlenecks and confusion. Governance makes collaboration smoother and more predictable.

## 📚 Key Concepts (Mentor Mode)

### CODEOWNERS
**Simple:** A file that lists who must review changes in specific paths.
**Why it matters:** Ensures the right people approve changes.

### Branching strategy
**Simple:** The rules for how branches are created and merged.
**Why it matters:** Keeps releases organized and stable.

### Review policy
**Simple:** The checklist for approving changes.
**Why it matters:** Increases quality and reduces regressions.

## ✅ Subtasks (With Owner Tags)

#### Subtask 9.1 — Define ownership areas | **USER**
**Purpose:** Decide who owns which parts of the repo.
**Expected outcome:** Ownership map drafted.

#### Subtask 9.2 — Add CODEOWNERS file | **AGENT**
**Purpose:** Encode ownership in the repo.
**Expected outcome:** CODEOWNERS file added.

#### Subtask 9.3 — Choose branching strategy | **USER**
**Purpose:** Align workflow with team size and release cadence.
**Expected outcome:** Strategy documented.

#### Subtask 9.4 — Define review checklist | **USER**
**Purpose:** Standardize what reviewers check.
**Expected outcome:** Review policy written.

#### Subtask 9.5 — Add PR/issue templates | **AGENT**
**Purpose:** Improve change quality and context.
**Expected outcome:** Templates added under `.github/`.

## 📘 Detailed Reference (Original Guidance)

## Questions to Answer

Before proceeding, answer these questions:

1. **What branching strategy fits your workflow?**
   - [ ] GitHub Flow (simple: main + feature branches) - **Best for:** Continuous deployment, small teams
   - [ ] Git Flow (complex: main, develop, release branches) - **Best for:** Release-heavy projects, versioned libraries
   - [ ] Trunk-Based Development (main only, short-lived branches) - **Best for:** Large teams, fast iteration
   - [ ] Other: _______________

2. **What should code reviews cover?**
   - [ ] Functionality (does it work, edge cases handled)
   - [ ] Tests (adequate coverage, tests pass, maintainable)
   - [ ] Documentation (code comments, README, API docs updated)
   - [ ] Security (vulnerabilities, best practices)
   - [ ] Performance (implications, regressions)
   - [ ] Accessibility (a11y standards for web apps)
   - [ ] Other: _______________

**Note:** Repository owners/maintainers should already be documented from Section 0 Question 10. If not, specify:
- Primary maintainer: _______________
- Additional maintainers: _______________
- Teams (if applicable): _______________

**Document your answers** in `alignment-progress.json` before proceeding.

## P0 — Required Actions

**Action:** Define ownership and contribution rules (see [Governance Principles](../principles/Governance-Principles.md) for foundational concepts) | **USER**
- [ ] Apply clear ownership principle (see [Governance Principles](../principles/Governance-Principles.md)):
  - [ ] Every area has an owner (code, docs, infrastructure)
  - [ ] Owners are accountable for their areas
  - [ ] Ownership enables autonomy
- [ ] Create `CODEOWNERS` file in `.github/` directory (see [Section 1](01-Root-Directory-Structure.md))
- [ ] Apply open contribution principle (see [Governance Principles](../principles/Governance-Principles.md)):
  - [ ] Contributions are welcome
  - [ ] Clear contribution process
  - [ ] Recognize contributors
- [ ] Create `CONTRIBUTING.md` with:
  - How to contribute
  - Code style guidelines
  - PR process (references CI/CD from [Section 5](05-CI-CD-Structure.md))
  - How to report issues
- [ ] Ensure no governance gaps (every area has an owner)

See [Templates](Templates.md) for CODEOWNERS and CONTRIBUTING.md templates.

## P1 — Recommended Actions

**Action:** Expand governance | **USER**
- [ ] Create `maintainers.md` listing:
  - Maintainer responsibilities
  - Current maintainers
  - How to become a maintainer
- [ ] Create `waiver.md` to document intentional deviations from standards
- [ ] Document escalation process for issues

**Action:** Define branching strategy | **USER**
- [ ] Document chosen branching strategy (GitHub Flow recommended for most repos, Git Flow for release-heavy projects)
- [ ] Define branch naming conventions:
  - Feature branches: `feature/description` or `feat/description`
  - Bug fixes: `fix/description` or `bugfix/description`
  - Hotfixes: `hotfix/description`
  - Documentation: `docs/description`
- [ ] Document merge vs rebase policy (typically: merge for shared branches, rebase for personal branches)
- [ ] Link branching strategy to CI/CD branch protection rules (see [Section 5 P1](05-CI-CD-Structure.md))
- [ ] Document in CONTRIBUTING.md

**Action:** Define code review standards (see [Governance Principles](../principles/Governance-Principles.md) for review philosophy) | **USER**
- [ ] Apply code review as learning principle (see [Governance Principles](../principles/Governance-Principles.md)):
  - [ ] Review is educational, not gatekeeping
  - [ ] Constructive, respectful feedback
  - [ ] Focus on code, not person
  - [ ] Explain why, not just what
- [ ] Create code review checklist covering:
  - Functionality: Does it work as intended? Are edge cases handled?
  - Tests: Are tests adequate, passing, and maintainable?
  - Documentation: Is documentation updated (code comments, README, API docs)?
  - Security: Any security concerns or vulnerabilities?
  - Performance: Any performance implications or regressions?
  - Accessibility: For web apps, are a11y standards met? (see [Section 6 P1](06-Testing-Structure.md))
- [ ] Define approval requirements:
  - Minimum reviewers (typically 1-2, depending on repo size)
  - Code owner approval for sensitive areas (per CODEOWNERS)
  - All CI checks must pass before approval
- [ ] Set review SLAs (see [Governance Principles](../principles/Governance-Principles.md)):
  - Critical/urgent: 4 hours
  - Normal priority: 24-48 hours
  - Low priority: 72 hours
- [ ] Document review best practices (see [Governance Principles](../principles/Governance-Principles.md)):
  - Keep PRs small and focused (aim for <400 lines when possible)
  - Provide constructive, actionable feedback
  - Approve with suggestions when appropriate
  - Request changes only for blocking issues
  - Fast, helpful reviews (don't delay)
- [ ] Add review guidelines to CONTRIBUTING.md and PR template (see [Section 1 P1](01-Root-Directory-Structure.md) for `.github/` folder)

## P2 — Advanced Actions

**Action:** Advanced governance | **USER**
- [ ] Define repository-level SLAs:
  - Response time for issues
  - Review time for PRs
- [ ] Implement rotational ownership or stewardship model
- [ ] Track governance metrics

## Decision: What branching strategy should you use?

**Choose based on your project:**

**GitHub Flow (Recommended for most projects):**
- Simple: `main` branch + feature branches
- Good for: Continuous deployment, small teams, simple projects
- [ ] Use GitHub Flow

**Git Flow:**
- Complex: `main`, `develop`, feature branches, release branches
- Good for: Release-heavy projects, versioned libraries
- [ ] Use Git Flow

**Trunk-Based Development:**
- Very simple: `main` branch only, short-lived feature branches
- Good for: Large teams, fast iteration
- [ ] Use Trunk-Based Development

**Action:** Document your choice | **USER**
- [ ] Choose branching strategy
- [ ] Document in CONTRIBUTING.md
- [ ] Define branch naming conventions
- [ ] Set up branch protection rules (Section 5 P1)

## Verification

**Manual Check:**
- [ ] Verify `CODEOWNERS` file exists in `.github/` directory
- [ ] Check `CONTRIBUTING.md` exists and is complete
- [ ] Verify CODEOWNERS syntax is valid (GitHub will validate)
- [ ] Check branching strategy is documented
- [ ] Verify code review standards are defined
- [ ] If P1 completed: Check `maintainers.md` exists

**Automated Check (Future):**
```bash
./scripts/validate-section-9.sh
```

**Done Criteria:**
- ✅ CODEOWNERS file exists and is valid
- ✅ CONTRIBUTING.md exists with contribution guidelines
- ✅ Branching strategy documented
- ✅ Code review standards defined
- ✅ No governance gaps (every area has owner)
- ✅ Clear ownership enables accountability (every area has owner)
- ✅ Open contribution process (contributions welcome, clear process)
- ✅ Code review as learning (constructive, educational, not gatekeeping)
- ✅ Governance follows principles from [Governance Principles](../principles/Governance-Principles.md)

## Common Issues & Solutions

**Issue:** "I don't know who should be in CODEOWNERS"  
- **Solution:** 
  - Start with repository maintainers/owners
  - Add team leads for specific areas
  - Use GitHub teams if available: `@org/team-name`
  - Update as team grows

**Issue:** "CODEOWNERS file doesn't work"  
- **Solution:** 
  - Check file location: Must be `.github/CODEOWNERS` or root
  - Verify syntax: `path @username` or `path @team`
  - Check usernames/teams exist in GitHub/GitLab
  - Test by creating a PR and checking if owners are requested

**Issue:** "I don't know which branching strategy to use"  
- **Solution:** 
  - Start with GitHub Flow (simplest)
  - Switch to Git Flow if you need release branches
  - Use Trunk-Based if you deploy multiple times per day
  - You can change strategies later

**Issue:** "I'm a solo developer, do I need CODEOWNERS?"  
- **Solution:** 
  - Yes, still create CODEOWNERS (put yourself)
  - Helps when you add collaborators later
  - Enables branch protection rules
  - Documents ownership clearly

**Issue:** "Code review standards seem too strict"  
- **Solution:** 
  - Start with basic checklist (functionality, tests, docs)
  - Add more standards as team grows
  - Adjust SLAs based on team size and priorities
  - Review standards should evolve with team