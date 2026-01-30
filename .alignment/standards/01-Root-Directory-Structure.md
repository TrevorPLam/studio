# 1. Root Directory Structure

**Prerequisites:** [Section 0: Prerequisites](00-Prerequisites.md) - Complete decision points first

## 🎯 What You're Trying to Accomplish
Your repository's root directory (top-level folder) is the first thing people see. This section helps you organize it so it's **clean, clear, and professional** - like a desk with only essential items on top and everything else organized in drawers.

**In simple terms:** Move files from root into organized folders so the repository is easy to understand at a glance.

## 🎓 Why This Section Exists
A messy root directory with 25+ files overwhelms people. A clean root with 5-10 essential files says "this project is well-organized." It also makes it easier to find things and signals professionalism.

## 📊 Effort Estimate
- **New repository:** 30-60 minutes
- **Existing repository (small, < 20 files):** 1-2 hours
- **Existing repository (medium, 20-50 files):** 2-4 hours
- **Existing repository (large, 50+ files):** 4-8 hours

## 📚 Key Concepts

### Concept 1: Root Directory Clutter
**Simple version:** Too many files in the root folder makes it hard to understand what's important.

**Why it matters:** Someone opening your repo should understand the project in 5 seconds by looking at root. If root has 25 files, they're confused.

**Real-world analogy:** Like a desk. Important items on top (README, License), everything else in drawers (folders).

**Example:** Root should have 5-10 files maximum. Source code, tests, config → goes in folders.

### Concept 2: Essential vs Non-Essential Files
**Simple version:** Essential files must be in root. Non-essential goes in folders.

**Why it matters:** If someone needs the LICENSE to use your code, it must be easy to find. Config files are "nice to have in root" - they can go in a folder.

**Essential (stays in root):**
- `README.md` - What is this project?
- `LICENSE` - Legal terms
- `.gitignore` - What to ignore
- `package.json` / `setup.py` / etc. - Package/dependency file
- `CHANGELOG.md` - Version history (if versioned)

**Non-essential (move to folders):**
- Config files → `config/`
- Scripts → `scripts/`
- Source code → `src/`
- Tests → `tests/`
- Documentation → `docs/`

## ✅ Subtasks (Tagged Quick Start)

#### Subtask 1.1 — Inventory root files | **USER**
**Purpose:** Know what’s in root before moving anything.
**Expected outcome:** A list of all root files with their purpose.

#### Subtask 1.2 — Decide what must stay | **USER**
**Purpose:** Keep only essential files visible.
**Expected outcome:** Clear keep/move decisions per file.

#### Subtask 1.3 — Move non‑essential files into folders | **AGENT**
**Purpose:** Reduce root clutter without breaking references.
**Expected outcome:** Files relocated to `config/`, `scripts/`, `docs/`, etc.

#### Subtask 1.4 — Update `.gitignore` for generated files | **AGENT**
**Purpose:** Prevent future clutter and secret leaks.
**Expected outcome:** Standard ignore patterns added.

#### Subtask 1.5 — Verify root cleanliness | **USER**
**Purpose:** Confirm the root is understandable at a glance.
**Expected outcome:** ≤10 root files and obvious purpose for each.

## 📊 Before/After Examples

### JavaScript Project
**BEFORE:** 25 files scattered in root (confusing)  
**AFTER:** 8 files in root + organized folders (clear)

Key moves:
- Source code (`index.js`, `utils.js`) → `src/`
- Config files (`.eslintrc.json`, `jest.config.js`) → `config/`
- Scripts (`setup.sh`, `deploy.sh`) → `scripts/`

### Python Project  
**BEFORE:** 18 files in root  
**AFTER:** 7 files in root

Key moves:
- Source code (`main.py`) → `src/`
- Config (`.flake8`, `pytest.ini`) → `config/`
- Scripts (`deploy.sh`) → `scripts/`

## P0 — Required Actions

**Action:** Clean up root directory | **USER**

**What this means:** Your repository's root (top-level folder) should only contain essential files that someone needs to see immediately. Think of it like a desk - keep only what you need on top, organize everything else in drawers (subdirectories).

**Why it matters:** A clean root makes your repository easy to understand at first glance. Too many files in root overwhelms new contributors and makes the repository structure unclear.

### Task 1: Audit current root files *(USER)*
- [ ] **List all files** in your root directory (don't include folders yet)
  - *Command:* `ls -la` (Mac/Linux) or `dir` (Windows) in your terminal
  - *Or:* Look at the files in your code editor's file explorer
- [ ] **Count the files** - How many files do you have? (Target: ≤10 files)
- [ ] **Identify purpose** - For each file, ask: "Does this NEED to be in root?"

### Task 2: Keep only essential root files *(USER/AGENT)*
- [ ] **Required files that must stay in root:**
  - `README.md` - Main documentation entry point (explains what the project is)
  - `LICENSE` - Legal license for your code (required for public repositories)
  - `.gitignore` - Tells Git which files to ignore (prevents committing sensitive data)
  - Package manager file - `package.json`, `go.mod`, `Cargo.toml`, `pyproject.toml`, etc. (depends on your programming language)
  - `CHANGELOG.md` - Version history (required ONLY if your project has version numbers)

### Task 3: Move configuration files to config/ *(USER/AGENT)*
- [ ] **Create `config/` directory** if it doesn't exist
  - *Command:* `mkdir config`
- [ ] **Move these types of files to `config/`:**
  - Build configuration: `webpack.config.js`, `vite.config.ts`, etc.
  - Linter configuration: `.eslintrc.json`, `.prettierrc`, etc.
  - Test configuration: `jest.config.js`, `pytest.ini`, etc.
  - Any file ending in `.config.js`, `.config.ts`, `.rc`, or `rc.json`
  - *Example:* `mv webpack.config.js config/` or `git mv webpack.config.js config/`

### Task 4: Move scripts to scripts/ *(USER/AGENT)*
- [ ] **Create `scripts/` directory** if it doesn't exist
  - *Command:* `mkdir scripts`
- [ ] **Move these files to `scripts/`:**
  - Shell scripts: `setup.sh`, `deploy.sh`, `build.sh`, etc.
  - Helper scripts: Any `.sh`, `.bash`, or `.ps1` files
  - *Example:* `mv setup.sh scripts/` or `git mv setup.sh scripts/`

### Task 5: Remove temporary and generated files *(USER)*
- [ ] **Delete these immediately (if found):**
  - Build artifacts: `dist/`, `build/`, `*.o`, `*.exe`, compiled files
  - Environment files: `.env` (CRITICAL - this contains secrets!)
  - Temporary files: `*.tmp`, `*.log`, `*.cache`
  - OS files: `.DS_Store` (Mac), `Thumbs.db` (Windows)
  - *Warning:* If you find `.env` in your repository, you have a SECURITY ISSUE. See [Section 10: Security](10-Security-Compliance.md) immediately.

### Task 6: Configure .gitignore *(USER/AGENT)*
- [ ] **Open or create `.gitignore` file**
- [ ] **Add these patterns to prevent future accidents:**
  ```
  # Environment files (secrets)
  .env
  .env.local
  .env.*.local
  
  # Build artifacts
  dist/
  build/
  *.o
  *.exe
  
  # IDE files (unless your team requires specific settings)
  .idea/
  .vscode/
  
  # OS files
  .DS_Store
  Thumbs.db
  ```
- [ ] **Save and commit** the updated `.gitignore`
  - *Commands:* 
    ```bash
    git add .gitignore
    git commit -m "Add/update .gitignore to exclude generated files"
    ```

### Task 7: Verify root cleanliness *(USER)*
- [ ] **Count root files again** - Should be ≤10 files
- [ ] **Check each remaining file** - Every file should have an obvious, essential purpose
- [ ] **Review with teammate** - Can someone new understand your root structure immediately?

**Done Criteria:**
- ✅ Root directory has ≤10 files
- ✅ Only essential files remain (README, LICENSE, .gitignore, package file, optional CHANGELOG)
- ✅ Configuration files moved to `config/`
- ✅ Scripts moved to `scripts/`
- ✅ No secrets (.env) in root
- ✅ .gitignore configured to prevent future clutter

## P1 — Recommended Actions

**Action:** Organize related files into folders | **USER**

**What this means:** Group related files together in dedicated folders. This makes your repository easier to navigate and shows clear organization patterns.

**Why it matters:** As repositories grow, having clear organizational folders prevents chaos. It's like having a filing system - everything has its place.

### Task 1: Create .github/ folder (for GitHub users) *(USER/AGENT)*
- [ ] **Check if using GitHub** - Is your code hosted on GitHub? (Check your `git remote -v` output)
- [ ] **Create `.github/` directory** if yes
  - *Command:* `mkdir .github` or `mkdir -p .github/workflows`
  - *Why:* GitHub looks for special files here (workflows, issue templates, pull request templates)
- [ ] **Create subdirectories:**
  - [ ] `.github/workflows/` - For CI/CD automation (GitHub Actions)
    - *Command:* `mkdir .github/workflows`
  - [ ] `.github/ISSUE_TEMPLATE/` - For issue templates (optional for now)
  - [ ] `.github/PULL_REQUEST_TEMPLATE.md` - For PR templates (optional for now)
- [ ] **Note:** You'll add actual workflow files in [Section 5: CI/CD Structure](05-CI-CD-Structure.md)

### Task 2: Create docs/ folder *(USER/AGENT)*
- [ ] **Create `docs/` directory**
  - *Command:* `mkdir docs`
  - *Why:* Centralized location for all documentation beyond the README
- [ ] **Create `docs/README.md`** - Index file explaining what documentation exists
  - *Template content:*
    ```markdown
    # Documentation Index
    
    ## Available Documentation
    - `README.md` (in root) - Project overview
    - More documentation coming in Section 7
    
    ## Documentation Structure
    TBD - Will be organized in Section 7: Documentation Standards
    ```
- [ ] **Commit the structure:**
  ```bash
  git add docs/
  git commit -m "Add docs folder structure"
  ```
- [ ] **Note:** You'll populate this with actual documentation content in [Section 7: Documentation Standards](07-Documentation-Standards.md)

**Done Criteria:**
- ✅ `.github/` folder created (if using GitHub)
- ✅ `.github/workflows/` folder exists (empty for now)
- ✅ `docs/` folder created
- ✅ `docs/README.md` placeholder exists
- ✅ Changes committed to Git

## P2 — Advanced Actions

**Action:** Add repository index and templates | **AGENT**

**What this means:** Create advanced organizational tools that help both humans and automation understand your repository structure.

**Why it matters:** These are "nice-to-have" features that become more valuable as your project grows or when you're creating multiple similar repositories.

### Task 1: Create repository index file *(AGENT)*
- [ ] **Choose format:** `INDEX.md` (human-readable) or `INDEX.json` (machine-readable)
- [ ] **Document all directories and their purposes**
  - *Example INDEX.md structure:*
    ```markdown
    # Repository Index
    
    ## Directory Structure
    
    - `src/` - Source code (see Section 2)
    - `tests/` - Test files (see Section 6)
    - `docs/` - Documentation (see Section 7)
    - `config/` - Configuration files (see Section 3)
    - `scripts/` - Build and deployment scripts
    - `.github/workflows/` - CI/CD automation (see Section 5)
    
    ## Purpose
    This repository contains [project description]
    ```
- [ ] **Update when structure changes** - Treat this as living documentation
- [ ] **Commit the index:**
  ```bash
  git add INDEX.md
  git commit -m "Add repository structure index"
  ```

### Task 2: Add NOTICE file (if legally required) *(USER)*
- [ ] **Determine if needed:**
  - Using Apache License 2.0? → Yes, need NOTICE
  - Using third-party code with attribution requirements? → Yes, need NOTICE
  - Corporate/enterprise repository? → Check with legal team
  - Simple MIT/BSD license? → Usually not needed
- [ ] **Create `NOTICE` file** if required
  - Include copyright notices
  - Include third-party attributions
  - Include any required legal text
- [ ] **Commit if created:**
  ```bash
  git add NOTICE
  git commit -m "Add NOTICE file for legal compliance"
  ```

### Task 3: Create repository template (for organizations) *(AGENT)*

**Purpose:** If you're creating multiple similar repositories, a template saves hours of setup time. This is especially useful for organizations or teams that create many projects.

- [ ] **Create template repository structure:**
  - [ ] Create new "template" repository (e.g., `my-org/repo-template`)
  - [ ] Include all P0 requirements pre-configured:
    - Pre-filled README.md template
    - Standard .gitignore for your tech stack
    - LICENSE file
    - Standard directory structure (src/, tests/, docs/, config/)
  - [ ] Add pre-populated CI/CD workflows
    - Basic build workflow
    - Test workflow
    - Linting workflow
  - [ ] Include template files:
    - CONTRIBUTING.md template
    - CODE_OF_CONDUCT.md template
    - Issue templates
    - PR template

- [ ] **Create setup automation script:**
  - [ ] Write CLI tool or script (bash/python/node) that:
    - Accepts project name and type as input
    - Clones template
    - Replaces placeholder variables (PROJECT_NAME, etc.)
    - Initializes Git repository
    - Creates initial commit
  - [ ] Example usage: `create-repo my-new-project --type=api`
  - [ ] Document script usage in template README

- [ ] **Configure as GitHub template:**
  - [ ] In GitHub repository settings, enable "Template repository"
  - [ ] Add template variables in repository description
  - [ ] Document "Use this template" button usage
  - [ ] Test template by creating a new repository from it

- [ ] **Document template usage:**
  - [ ] Create `docs/repository-templates.md`
  - [ ] Explain when to use the template
  - [ ] Provide step-by-step usage instructions
  - [ ] Include customization guidelines
  - [ ] List template maintenance procedures

**Benefits:**
- New repositories are ALIGNMENT-compliant from day one
- Saves 2-4 hours per new repository
- Ensures consistency across multiple projects
- Reduces onboarding time for new projects

**Done Criteria:**
- ✅ INDEX.md or INDEX.json created and documents all directories
- ✅ NOTICE file added (if legally required)
- ✅ Repository template created (if creating multiple similar repos)
- ✅ Template automation script works (if applicable)
- ✅ Template documentation exists (if applicable)

## Decision: Is this a versioned project?

**If you answered "Yes" in Section 0:**
- [ ] Create `CHANGELOG.md` file (basic structure, will be formatted in [Section 12](12-Change-Management.md))
- [ ] Use semantic versioning (SemVer) for releases

**If you answered "No" in Section 0:**
- [ ] Skip `CHANGELOG.md` creation
- [ ] You can still use versioning internally, but it's not required

## Verification

**Manual Check:**
- [ ] Run `ls -la` (or `dir` on Windows) and verify root has ≤ 10 files (excluding hidden files)
- [ ] Verify `README.md` clearly describes:
  - What the repo is (1-2 sentences) - **What should it say?**
  - How to install/run it - **What are the exact commands?**
  - Where the code lives - **Which directories contain source code?**
  - How to contribute - **What's the contribution process?**
- [ ] Check `.gitignore` excludes: `.env`, `build/`, `dist/`, `node_modules/`, `*.o`, `*.exe`
- [ ] Verify no secrets are committed (run: `git log --all --full-history -- .env` or similar)
- [ ] If public repo: verify `LICENSE` file exists and matches your chosen license type
- [ ] If versioned project: verify `CHANGELOG.md` follows [Keep a Changelog](https://keepachangelog.com/) format

**Automated Check:**
```bash
# Run validation script (from repository root)
./scripts/validate-section-1.sh

# Or if scripts are in ALIGNMENT directory
../.alignment/scripts/validate-section-1.sh .
```

**Note:** See [scripts/README.md](../scripts/README.md) for validation script usage.

**Done Criteria:**
- ✅ Root directory contains only essential files
- ✅ All required files exist (README, LICENSE if public, .gitignore)
- ✅ `.gitignore` properly configured
- ✅ No build artifacts or secrets in repository
- ✅ CHANGELOG.md exists if versioned project

## Rollback Procedures

If root directory cleanup causes issues:

**Option 1: Restore moved files**
```bash
# Restore files from previous commit
git checkout <previous-commit> -- filename
```

**Option 2: Restore entire root structure**
```bash
# Restore all root files from backup
git checkout backup/pre-alignment -- .
```

**Option 3: Revert commit**
```bash
git revert <commit-hash>
```

**Option 4: Manual restoration**
- Move files back from `config/`, `scripts/`, `docs/`
- Update any references
- Test build

**Prevention:** Create backup branch before major restructuring: `git checkout -b backup/pre-alignment`

## Common Issues & Solutions

**Issue:** "I don't have a LICENSE file"  
- **Solution:** 
  - Public repos: Use [choosealicense.com](https://choosealicense.com/) to select appropriate license
  - Common choices: MIT (permissive), Apache 2.0 (patent protection), GPL (copyleft)
  - Copy license text to `LICENSE` file in root

**Issue:** ".github folder doesn't exist"  
- **Solution:** Create it: `mkdir -p .github/workflows` (or `mkdir .github\workflows` on Windows)
- **Note:** Only needed if using GitHub. For GitLab, create `.gitlab-ci.yml` in root instead

**Issue:** "I'm not using GitHub"  
- **Solution:** See [Section 5](05-CI-CD-Structure.md) for GitLab, Jenkins, CircleCI alternatives
- **Note:** `.github/` folder is only for GitHub Actions. Other platforms have different config locations

**Issue:** "I have too many files in root"  
- **Solution:** 
  - Move config files to `config/` directory (see [Section 3](03-Configuration-Environment.md))
  - Move documentation to `docs/` directory
  - Move scripts to `scripts/` directory
  - Keep only: README, LICENSE, .gitignore, package manager file, CHANGELOG (if versioned)

**Issue:** "I don't know if I need CHANGELOG.md"  
- **Solution:** Refer to Section 0 decision point. If others will install/use your code → Yes. If internal tool → No.

**Issue:** ".gitignore is missing common patterns"  
- **Solution:** Use language-specific .gitignore templates:
  - [GitHub gitignore templates](https://github.com/github/gitignore)
  - Add patterns for your language/framework
  - Always include: `.env*`, `node_modules/`, `dist/`, `build/`, `.DS_Store`
