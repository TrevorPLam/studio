# Decision Tree: Section 0 Prerequisites

Visual guide to answering Section 0 decision points. Follow the tree to determine your alignment path.

## Decision Flow

```
START: Aligning Repository
│
├─ Is this a versioned project?
│  │
│  ├─ YES → Others install/use this?
│  │  │
│  │  ├─ YES → Versioned Project
│  │  │  └─ Need: CHANGELOG.md, SemVer, release process
│  │  │
│  │  └─ NO → Internal tool
│  │     └─ Skip: CHANGELOG.md (optional)
│  │
│  └─ NO → Internal application
│     └─ Skip: CHANGELOG.md
│
├─ What is your project type?
│  │
│  ├─ Library/Package → Structure: src/ (flat)
│  ├─ Application → Structure: src/ (feature/layer-based)
│  ├─ CLI Tool → Structure: cmd/ + pkg/ (Go) or src/ (others)
│  ├─ API/Service → Structure: src/ + API docs
│  ├─ Infrastructure → Structure: infra/ + IaC
│  ├─ Monorepo → Structure: apps/ + packages/
│  └─ Documentation → Structure: docs/ focused
│
├─ What is your primary language?
│  │
│  ├─ JavaScript/TypeScript → Tools: npm/yarn/pnpm, ESLint, Jest
│  ├─ Python → Tools: pip/poetry, Black, pytest
│  ├─ Go → Tools: go mod (built-in), golangci-lint, go test
│  ├─ Rust → Tools: Cargo (built-in), Clippy, cargo test
│  ├─ Java/Kotlin → Tools: Maven/Gradle, Checkstyle, JUnit
│  └─ Other → Adapt ALIGNMENT principles
│
├─ Which CI/CD platform?
│  │
│  ├─ GitHub → Config: .github/workflows/ci.yml
│  ├─ GitLab → Config: .gitlab-ci.yml
│  ├─ Jenkins → Config: Jenkinsfile
│  ├─ CircleCI → Config: .circleci/config.yml
│  ├─ Azure DevOps → Config: azure-pipelines.yml
│  └─ None → Skip CI/CD sections (not recommended)
│
├─ Public or private repository?
│  │
│  ├─ Public → LICENSE required (mandatory)
│  └─ Private → LICENSE optional (recommended)
│
├─ Repository structure type?
│  │
│  ├─ Single Package → Structure: src/ or cmd/pkg/
│  ├─ Monorepo → Structure: apps/ + packages/
│  └─ Application → Structure: src/ (organized by feature/layer)
│
├─ Code in root directory?
│  │
│  ├─ YES → Migration needed (Section 2)
│  └─ NO → Clean structure
│
├─ Secrets in repository? ⚠️ CRITICAL
│  │
│  ├─ YES → IMMEDIATE ACTION REQUIRED
│  │  └─ 1. Rotate secrets
│  │  └─ 2. Remove from git history
│  │  └─ 3. Set up secret scanning
│  │
│  └─ NO → Set up prevention (Section 3)
│
└─ Who are repository owners?
   │
   └─ Document for CODEOWNERS file (Section 9)
```

## Quick Decision Matrix

| Question | Answer | Impact |
|----------|--------|--------|
| **Versioned?** | Yes | Need CHANGELOG.md, SemVer |
| **Versioned?** | No | Skip CHANGELOG.md |
| **Project Type** | Library | Focus: API docs, examples |
| **Project Type** | Application | Focus: Setup, architecture |
| **Project Type** | Monorepo | Focus: Workspace config |
| **Language** | JS/TS | Use npm, ESLint, Jest |
| **Language** | Python | Use poetry, Black, pytest |
| **Language** | Go | Use go mod, golangci-lint |
| **CI/CD** | GitHub | .github/workflows/ |
| **CI/CD** | GitLab | .gitlab-ci.yml |
| **Public?** | Yes | LICENSE mandatory |
| **Public?** | No | LICENSE optional |
| **Secrets?** | Yes | ⚠️ CRITICAL - Remediate immediately |
| **Secrets?** | No | Set up prevention |

## Decision Point Dependencies

Some decisions affect others:

1. **Versioned Project** → Affects:
   - Section 1: Need CHANGELOG.md
   - Section 12: Need SemVer, changelog format

2. **Project Type** → Affects:
   - Section 2: Structure pattern
   - Section 7: Documentation focus

3. **Language** → Affects:
   - Section 2: Directory conventions
   - Section 4: Lockfile type
   - Section 5: CI/CD tools
   - Section 6: Testing framework

4. **CI/CD Platform** → Affects:
   - Section 1: Config file location
   - Section 5: Platform-specific setup

5. **Public Repository** → Affects:
   - Section 1: LICENSE mandatory
   - Section 10: Security requirements

6. **Secrets in Repo** → Affects:
   - Section 3: Immediate remediation
   - Section 10: Security scanning priority

## Common Decision Combinations

### New JavaScript Library (Public)
- Versioned: Yes
- Type: Library
- Language: TypeScript
- CI/CD: GitHub Actions
- Public: Yes
- Structure: Single Package
- **Path:** Full alignment, focus on API docs

### Internal Python Application
- Versioned: No
- Type: Application
- Language: Python
- CI/CD: GitLab CI
- Public: No
- Structure: Application
- **Path:** Skip CHANGELOG, focus on setup docs

### Go CLI Tool (Public)
- Versioned: Yes
- Type: CLI Tool
- Language: Go
- CI/CD: GitHub Actions
- Public: Yes
- Structure: Single Package (cmd/pkg/)
- **Path:** Full alignment, Go-specific structure

### Monorepo (Private)
- Versioned: No
- Type: Monorepo
- Language: JavaScript
- CI/CD: GitHub Actions
- Public: No
- Structure: Monorepo (apps/packages)
- **Path:** Focus on workspace config, shared packages

## Decision Validation

After answering all questions, verify:

- [ ] All 10 decision points answered
- [ ] Answers documented in `alignment-progress.json`
- [ ] Decisions are consistent (e.g., versioned + library makes sense)
- [ ] Secrets remediated if found (CRITICAL)
- [ ] Ready to proceed to Section 1

## Next Steps

After completing decision points:

1. **Document answers** in `alignment-progress.json`
2. **Review dependencies** - Check how decisions affect later sections
3. **Start Section 1** - Root Directory Structure
4. **Reference decisions** - Use answers throughout alignment

---

**Remember:** Decisions guide your alignment path. Document them clearly for reference.
