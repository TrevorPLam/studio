# Automation & AI Infrastructure Injection Guide

**Purpose**: Safely inject automation scripts and AI infrastructure from this repo into other repositories

**Manifest**: `.repo/automation/AUTOMATION_MANIFEST.json`

---

## Quick Start

1. **Read the manifest**: `.repo/automation/AUTOMATION_MANIFEST.json`
2. **Follow installation steps** in the manifest
3. **Verify** using the checklist

---

## What Gets Injected

### Directories

- `scripts/intelligent/` - 17 intelligent automations
- `scripts/ultra/` - 40 ultra automations + shared infrastructure
- `scripts/vibranium/` - 10 vibranium automations

### Core Infrastructure

- `scripts/ultra/shared-infrastructure.mjs` - **CRITICAL** - AI engine, learning system, utilities

### Package.json Scripts

- 17 `intelligent:*` scripts
- 40 `ultra:*` scripts
- 10 `vibranium:*` scripts
- 1 `ultra:all` orchestrator

### Data Directories

- `.repo/automation/learning/` - Auto-created by LearningSystem

---

## Installation Steps

### Step 1: Copy Directories

```bash
# From source repo
cp -r scripts/intelligent <target-repo>/scripts/
cp -r scripts/ultra <target-repo>/scripts/
cp -r scripts/vibranium <target-repo>/scripts/
```

### Step 2: Verify Shared Infrastructure

```bash
# Ensure this file exists (CRITICAL)
ls <target-repo>/scripts/ultra/shared-infrastructure.mjs
```

### Step 3: Add Package.json Scripts

Copy all scripts from manifest's `package_json_integration` section.

**Check for conflicts first:**

```bash
# Check for existing script names
grep -E "(intelligent:|ultra:|vibranium:)" <target-repo>/package.json
```

### Step 4: Test Installation

```bash
cd <target-repo>
npm run intelligent:task-completion
npm run ultra:orchestrate -- --tier=1
```

---

## Environment Variables (Optional)

For AI features:

```bash
export AI_PROVIDER=openai
export OPENAI_API_KEY=your_key
export AI_MODEL=gpt-4
```

**Note**: Automations work without AI, just with reduced capabilities.

---

## Safety Checklist

Before injecting:

- [ ] Review manifest for conflicts
- [ ] Check target repo's package.json for script name conflicts
- [ ] Verify Node.js version >= 18.0.0
- [ ] Ensure target repo uses ES modules (or .mjs files)

After injecting:

- [ ] All directories copied
- [ ] shared-infrastructure.mjs exists
- [ ] Package.json scripts added
- [ ] Test runs successfully
- [ ] No errors in console

---

## Common Issues

### Issue: Scripts fail with "Cannot find module"

**Solution**: Ensure `shared-infrastructure.mjs` exists in `scripts/ultra/`

### Issue: Script name conflicts

**Solution**: Rename conflicting scripts or use different prefixes

### Issue: Path errors

**Solution**: Verify repo structure matches (scripts in root, not nested)

### Issue: AI warnings

**Solution**: Set environment variables or ignore (automations work without AI)

---

## Rollback

To remove:

1. Delete `scripts/intelligent/`, `scripts/ultra/`, `scripts/vibranium/`
2. Remove `intelligent:`, `ultra:`, `vibranium:` scripts from package.json
3. Delete `.repo/automation/learning/` if desired

---

## Support

See manifest for complete details: `.repo/automation/AUTOMATION_MANIFEST.json`
