# Agent-Ready Repo Implementation Task List (Beginner-Friendly)

This is a **step-by-step task list** to turn any repository into an **Agent-Ready**, **secure**, and **repeatable** codebase that works across:
- **Cursor / Windsurf (local IDE agents)**
- **Claude Code (CLI agent)**
- **OpenAI Codex (cloud tasks)**
- **GitHub Copilot (agent mode / PR agents)**

**Goal:** A repo where a human (and an agent) can clone, run one command, and reliably verify changes.

---

## Phase 0 — Decide the “Repo Contract” (What “Done” Means)

### Task 0.1 — Define the 2 required commands
**Outcome:** Everyone (and every agent) knows exactly how to run the project and verify changes.

- [ ] Pick a **setup command** name: `setup` or `bootstrap`
- [ ] Pick a **verify command** name: `verify` (recommended)
- [ ] Write these rules in plain English:
  - [ ] “setup installs dependencies”
  - [ ] “verify runs tests + lint + build + security checks”
  - [ ] “If verify is green, the change is allowed to merge”

### Task 0.2 — Pick “critical paths” (high-risk areas)
**Outcome:** We know which folders/files require extra care.

- [ ] List the folders that are **high risk**, for example:
  - [ ] `auth/`, `payments/`, `infra/`, `security/`
  - [ ] `.github/workflows/`, `Dockerfile`, dependency lockfiles
- [ ] Define a rule: “Changes to critical paths require human review.”

---

## Phase 1 — Make the Repo Deterministic (Setup + Verify)

### Task 1.1 — Add a `scripts/` folder
**Outcome:** We keep the “repo contract” logic in one obvious place.

- [ ] Create `scripts/`
- [ ] Create `scripts/setup.sh` (or `scripts/setup.ps1` if Windows-first)
- [ ] Create `scripts/verify.sh`

### Task 1.2 — Implement `setup` (dependency install)
**Outcome:** Setup is repeatable and works on a fresh clone.

Subtasks:
- [ ] Make setup **fail fast** (stop on errors)
- [ ] Install dependencies using the repo’s package manager
  - Node: `npm ci` or `pnpm i --frozen-lockfile`
  - Python: `pip install -r requirements.txt` or `poetry install`
- [ ] Print a simple success message: “setup complete”

### Task 1.3 — Implement `verify` (the one true quality gate)
**Outcome:** Verify can be run locally, in CI, and by agents.

Subtasks:
- [ ] Make verify **fail fast** (stop on errors)
- [ ] Run checks in this order:
  1. [ ] **secret scan** (basic)
  2. [ ] **lint**
  3. [ ] **typecheck** (if applicable)
  4. [ ] **tests**
  5. [ ] **build**
- [ ] Ensure `verify` prints:
  - [ ] what it is running
  - [ ] what failed (if anything)
  - [ ] “verify passed” at the end

### Task 1.4 — Create a “single command entry point”
**Outcome:** Humans and agents can always run the same commands.

Pick one:
- **Option A (recommended):** `Makefile`
  - [ ] Add `make setup` and `make verify`
- **Option B:** `package.json` scripts (Node repos)
  - [ ] Add `npm run setup` and `npm run verify`

---

## Phase 2 — Add Agent Instruction Files (Cross-Platform)

### Task 2.1 — Add `AGENTS.md` (universal rules for Codex/Claude)
**Outcome:** Cloud + CLI agents get the same playbook every time.

Subtasks:
- [ ] Create `AGENTS.md` at repo root
- [ ] Add these sections (keep it short and concrete):
  - [ ] **What this repo is**
  - [ ] **Project structure** (top folders + what they do)
  - [ ] **Exact commands**
    - setup: `…`
    - verify: `…`
  - [ ] **Rules**
    - “Do not change critical paths without explicit instruction”
    - “Do not add dependencies without approval”
    - “Keep changes small and focused”
  - [ ] **How to test locally** (copy/paste commands)

### Task 2.2 — Add `.cursorrules` (Cursor/Windsurf local agent rules)
**Outcome:** Local IDE agents follow your standards automatically.

Subtasks:
- [ ] Create `.cursorrules` at repo root
- [ ] Add:
  - [ ] The verify command
  - [ ] Coding style basics (naming, file patterns)
  - [ ] “Plan first for changes over X lines/files”
  - [ ] “Never touch protected paths without approval”
  - [ ] “Prefer editing existing patterns over inventing new ones”

### Task 2.3 — Add Copilot instructions
**Outcome:** Copilot PR agents behave consistently.

Subtasks:
- [ ] Create `.github/copilot-instructions.md`
- [ ] Add:
  - [ ] Branch naming rules
  - [ ] PR requirements: verify must pass
  - [ ] Protected paths policy
  - [ ] “Add tests for new logic”

---

## Phase 3 — Enforce the Contract in CI (So Agents Can’t “Skip” It)

### Task 3.1 — Add CI workflow that runs `verify`
**Outcome:** Nothing merges unless verify passes.

Subtasks:
- [ ] Create `.github/workflows/verify.yml`
- [ ] On every PR:
  - [ ] checkout
  - [ ] run setup
  - [ ] run verify
- [ ] Ensure the workflow fails if verify fails

### Task 3.2 — Add branch protections (repo settings)
**Outcome:** CI can’t be bypassed.

Subtasks:
- [ ] Require PRs to merge into main
- [ ] Require status checks to pass (verify workflow)
- [ ] Require at least 1 human review
- [ ] Restrict who can push to main

---

## Phase 4 — Blast Radius Controls (Stop Risky Changes Automatically)

### Task 4.1 — Add a “protected paths” checker script
**Outcome:** The repo blocks risky changes unless approved.

Subtasks:
- [ ] Create `scripts/security/check-blast-radius.sh`
- [ ] It should:
  - [ ] list changed files in the PR
  - [ ] compare them to protected path patterns
  - [ ] fail with a clear message if protected paths are touched

### Task 4.2 — Integrate blast radius into CI
**Outcome:** Protected path changes require explicit approval.

Subtasks:
- [ ] Run blast radius checker before verify in CI
- [ ] Add labeling rule (optional):
  - [ ] auto-label PRs that touch protected areas

---

## Phase 5 — Security Baseline (Simple First, Expand Later)

### Task 5.1 — Add secret scanning (baseline)
**Outcome:** Prevent accidental key leaks.

Subtasks:
- [ ] Add a simple secret scan:
  - [ ] gitleaks OR detect-secrets OR a basic grep rule
- [ ] Run it inside `verify`

### Task 5.2 — Add dependency scanning (baseline)
**Outcome:** Catch known vulnerable dependencies.

Subtasks:
- [ ] Add one dependency scanner:
  - [ ] npm audit (Node) OR pip-audit (Python) OR osv-scanner
- [ ] Run it in CI (or in verify, if fast)

---

## Phase 6 — Agent Workflow Standards (How to Assign Work)

### Task 6.1 — Add a task template (“task packet”)
**Outcome:** Every agent task is clear, scannable, and verifiable.

Subtasks:
- [ ] Create `governance/templates/task-packet.md`
- [ ] Include:
  - [ ] Objective (1 sentence)
  - [ ] Allowed files / forbidden files
  - [ ] Plan (bullet steps)
  - [ ] Verify steps (exact command)
  - [ ] Definition of Done

### Task 6.2 — Add an operator checklist (“Operator Sheet”)
**Outcome:** Humans know how to safely run agents.

Subtasks:
- [ ] Create `governance/OPERATOR_SHEET.md`
- [ ] Include:
  - [ ] Which tool to use (Cursor vs cloud)
  - [ ] When human approval is required
  - [ ] How to review diffs quickly
  - [ ] “If diff is too big to review in 60 seconds, reject and split”

---

## Phase 7 — Optional Enterprise Hardening (Add After the Basics Work)

### Task 7.1 — Governance drift detection
**Outcome:** Governance files can’t be quietly weakened.

Subtasks:
- [ ] Add CI rule: changes to governance files require extra review
  - `.github/`, `scripts/`, `AGENTS.md`, `.cursorrules`

### Task 7.2 — Audit logging (lightweight)
**Outcome:** Track agent work for debugging and accountability.

Subtasks:
- [ ] Require PR template fields:
  - [ ] “Agent used”
  - [ ] “Verification output”
  - [ ] “Risk areas touched”
- [ ] (Optional) store a simple log file in CI artifacts

### Task 7.3 — Supply chain upgrades (SBOM + provenance)
**Outcome:** Stronger security for releases.

Subtasks:
- [ ] Generate SBOM in CI (CycloneDX/SPDX)
- [ ] Attach SBOM as build artifact
- [ ] Add provenance/attestation later (when needed)

---

# Definition of “Agent-Ready” (Final Checklist)

A repo is Agent-Ready when:

- [ ] `setup` works on a fresh clone
- [ ] `verify` is the single gate and is reliable
- [ ] `AGENTS.md` exists with exact commands + rules
- [ ] `.cursorrules` exists for local agents
- [ ] Copilot instructions exist for PR agents
- [ ] CI runs `verify` on every PR
- [ ] Branch protections enforce CI + human review
- [ ] Protected paths are blocked without approval
- [ ] Secret scanning is included

---

# Recommended Rollout Order (1 PR at a time)

1. PR1: Add `scripts/setup` + `scripts/verify` + wire to package.json/Makefile  
2. PR2: Add `AGENTS.md` + `.cursorrules` + Copilot instructions  
3. PR3: Add CI workflow for verify  
4. PR4: Turn on branch protections  
5. PR5: Add blast radius checker + integrate in CI  
6. PR6: Add secret scan + dependency scan  
7. PR7+: Add drift detection + logging + SBOM (optional)