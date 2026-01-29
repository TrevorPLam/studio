# Minimum Viable Alignment (MVA)

**For:** Small projects, prototypes, quick starts, or teams with limited time

Minimum Viable Alignment provides the essential structure and practices without the full ALIGNMENT standard. Use this when full alignment isn't feasible or necessary.

## MVA Checklist

Complete these items for basic repository alignment:

### Essential Structure (15 minutes)
- [ ] **README.md** - Contains:
  - What the project is (1-2 sentences)
  - How to install/run it
  - Where code lives
- [ ] **.gitignore** - Configured for your language/framework
- [ ] **LICENSE** - If public repository (use [choosealicense.com](https://choosealicense.com/))

### Source Organization (15 minutes)
- [ ] **Source code in dedicated directory:**
  - JavaScript/Python/Rust: `src/`
  - Go: `cmd/` + `pkg/`
  - Monorepo: `apps/` + `packages/`
- [ ] **No source files in root directory**

### Basic CI/CD (30 minutes)
- [ ] **CI/CD configured:**
  - Build step (verify code compiles)
  - Lint step (code quality)
  - Runs on pull requests
- [ ] **Blocks merges on failure**

### Security Basics (15 minutes)
- [ ] **No secrets in repository**
- [ ] **.env.example** exists (if using environment variables)
- [ ] **.env** in .gitignore

### Documentation (15 minutes)
- [ ] **README.md** complete (see above)
- [ ] **Basic project structure** documented in README

## Total Time: ~90 minutes

## What MVA Provides

✅ **Clear structure** - Easy to navigate  
✅ **Basic automation** - Catches common issues  
✅ **Security basics** - Prevents secret leaks  
✅ **Onboarding** - New developers can get started  
✅ **Foundation** - Can expand to full alignment later  

## What MVA Doesn't Include

❌ Comprehensive documentation (`docs/` folder)  
❌ Advanced security (SLSA, compliance)  
❌ Full test infrastructure  
❌ Governance files (CODEOWNERS, CONTRIBUTING)  
❌ Observability and monitoring  
❌ Change management (CHANGELOG, SemVer)  

## When to Use MVA

**Use MVA when:**
- Building a prototype or proof-of-concept
- Working on a small personal project
- Time is extremely limited (<2 hours available)
- Project will be archived or deprecated soon
- Team is very small (1-2 developers)

**Upgrade to full alignment when:**
- Project becomes production-critical
- Team grows beyond 2-3 developers
- Project will be maintained long-term
- External contributors expected
- Security/compliance requirements increase

## MVA vs Full Alignment

| Aspect | MVA | Full Alignment |
|--------|-----|----------------|
| **Time Investment** | ~90 minutes | 1-2 weeks |
| **Health Score** | 40-60/100 | 70-100/100 |
| **Sections Covered** | 0-5 (partial) | 0-13 (complete) |
| **Best For** | Prototypes, small projects | Production, teams |

## Quick Start Guide

### Step 1: Structure (15 min)
```bash
# Create source directory
mkdir src  # or cmd/pkg for Go

# Move source files
git mv *.js src/  # or appropriate for your language

# Create .gitignore
# Use language-specific template from github.com/github/gitignore
```

### Step 2: README (15 min)
```markdown
# Project Name

Brief description.

## Installation
\`\`\`bash
npm install
\`\`\`

## Usage
\`\`\`bash
npm start
\`\`\`

## Project Structure
- `src/` - Source code
```

### Step 3: CI/CD (30 min)
Create `.github/workflows/ci.yml`:
```yaml
name: CI
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run build
      - run: npm run lint
```

### Step 4: Security (15 min)
```bash
# Create .env.example
cp .env .env.example  # Remove secrets!

# Ensure .env in .gitignore
echo ".env" >> .gitignore

# Scan for secrets
git secrets --scan-history
```

### Step 5: Verify (15 min)
```bash
# Test fresh clone
cd /tmp
git clone <your-repo>
cd <your-repo>
npm install
npm run build
```

## Upgrading from MVA

When ready to upgrade:

1. **Start with Section 0:** Complete decision points
2. **Follow sections in order:** 1 → 2 → 3 → ...
3. **Use Migration Guide:** See [Migration-Guide.md](Migration-Guide.md)
4. **Track progress:** Use `alignment-progress.json`

## Examples

### MVA Example: Simple CLI Tool
```
my-cli/
├── README.md          ✅
├── LICENSE            ✅
├── .gitignore         ✅
├── package.json
├── src/
│   └── index.js       ✅
└── .github/
    └── workflows/
        └── ci.yml     ✅
```

### MVA Example: API Service
```
my-api/
├── README.md          ✅
├── LICENSE            ✅
├── .gitignore         ✅
├── .env.example       ✅
├── requirements.txt
├── src/
│   └── app.py         ✅
└── .github/
    └── workflows/
        └── ci.yml     ✅
```

## Success Criteria for MVA

✅ Repository builds from scratch  
✅ README explains what/how  
✅ Source code organized  
✅ Basic CI/CD runs  
✅ No secrets committed  
✅ New developer can get started in <30 minutes  

## Next Steps

After completing MVA:

1. **Monitor health:** Run health check monthly
2. **Gather feedback:** Ask team what's missing
3. **Plan upgrade:** Schedule time for full alignment
4. **Document decisions:** Track what you skipped and why

---

**Remember:** MVA is better than no alignment. Start here and improve over time!
