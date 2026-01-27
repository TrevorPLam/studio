# Automation Scripts

This directory contains automation scripts for governance framework operations.

## Scripts

### `governance-verify.js`

Governance verification script that enforces structure, required artifacts, logs, trace schema, and HITL/waivers.

**Usage:**
```bash
node .repo/automation/scripts/governance-verify.js \
  [--trace-log <path>] \
  [--hitl-file <path>] \
  [--pr-body <path>] \
  [--base-ref <ref>]
```

**Options:**
- `--trace-log <path>` - Path to trace log JSON file (optional)
- `--hitl-file <path>` - Path to HITL index file (default: `.repo/policy/HITL.md` - note: HITL process now in procedures.json)
- `--pr-body <path>` - Path to PR body file for validation (optional)
- `--base-ref <ref>` - Git base reference for changed files detection (default: `HEAD`)

**Features:**
- Validates trace log JSON against AGENT_TRACE_SCHEMA.json
- Parses HITL item status from tables
- Checks for required artifacts (ADR detection for API/module changes)
- Verifies boundary checker configuration
- Improved error reporting

**Exit Codes:**
- `0` - All checks passed
- `1` - Hard gate failures (governance integrity violations)
- `2` - Waiverable gate failures (warnings)

### `validate-agent-trace.js`

Validates trace logs against AGENT_TRACE_SCHEMA.json.

**Usage:**
```bash
node .repo/automation/scripts/validate-agent-trace.js <trace-log-path>
```

**Exit Codes:**
- `0` - Valid
- `1` - Invalid

### `sync-hitl-to-pr.py`

Syncs HITL status from `.repo/policy/HITL.md` to PR description.

**Usage:**
```bash
# Manual usage
python3 .repo/automation/scripts/sync-hitl-to-pr.py \
    --pr-number <number> \
    --hitl-file .repo/policy/HITL.md \
    [--github-token <token>] \
    [--dry-run]

# In CI (auto-detects environment variables)
python3 .repo/automation/scripts/sync-hitl-to-pr.py \
    --hitl-file .repo/policy/HITL.md
```

**Features:**
- Reads HITL index table
- Formats HITL items as markdown section
- Updates PR description via GitHub API
- **Auto-detects GitHub environment variables in CI:**
  - `GITHUB_TOKEN` - Automatically used if available
  - `GITHUB_REPOSITORY` - Auto-parsed for owner/repo
  - `GITHUB_EVENT_PATH` - Auto-detects PR number from event
- Falls back gracefully if API unavailable
- Supports dry-run mode

**Requirements:**
- Python 3.6+
- `requests` library: `pip install -r .repo/automation/scripts/requirements.txt`

**Environment Variables (Auto-detected in CI):**
- `GITHUB_TOKEN` - GitHub token (auto-provided in GitHub Actions)
- `GITHUB_REPOSITORY` - Repository in format `owner/repo` (auto-provided in CI)
- `GITHUB_EVENT_PATH` - Path to GitHub event JSON (auto-provided in CI)

### `create-hitl-item.py`

Creates a new HITL item from template and adds it to the HITL index.

**Usage:**
```bash
python3 .repo/automation/scripts/create-hitl-item.py \
    --category <category> \
    --summary <summary> \
    --required-for <change-types> \
    --owner <owner> \
    [--reviewer <reviewer>] \
    [--related-pr <pr-number>] \
    [--related-adr <adr-path>] \
    [--dry-run]
```

**Features:**
- Auto-generates next available HITL ID
- Creates HITL item file in `.repo/hitl/`
- Adds item to HITL index table
- Validates required fields
- Supports dry-run mode

**Requirements:**
- Python 3.6+

### `manage-waivers.py`

Creates, validates, and tracks waivers for policy exceptions.

**Usage:**
```bash
# Create a new waiver
python3 .repo/automation/scripts/manage-waivers.py create \
    --waives <policy> \
    --why <justification> \
    --scope <scope> \
    --owner <owner> \
    --expiration <YYYY-MM-DD>

# Check for expired waivers
python3 .repo/automation/scripts/manage-waivers.py check-expired

# List active waivers
python3 .repo/automation/scripts/manage-waivers.py list
```

**Features:**
- Auto-generates waiver IDs
- Tracks expiration dates
- Checks for expired waivers
- Lists active waivers
- Supports dry-run mode

**Requirements:**
- Python 3.6+

### `check-security-patterns.js`

Scans codebase for forbidden security patterns defined in SECURITY_BASELINE.md.

**Usage:**
```bash
node .repo/automation/scripts/check-security-patterns.js [--path <path>]
```

**Features:**
- Reads patterns from SECURITY_BASELINE.md
- Scans TypeScript, JavaScript, JSON, YAML, and .env files
- Reports violations with file and line numbers
- Exits with error code if violations found

**Exit Codes:**
- `0` - No violations found
- `1` - Violations found

### `check-boundaries.js`

Enforces architectural boundaries defined in BOUNDARIES.md.

**Usage:**
```bash
node .repo/automation/scripts/check-boundaries.js [--path <path>]
```

**Features:**
- Checks import statements against allowed direction: ui → domain → data → platform
- Detects cross-feature imports (require ADR)
- Validates layer boundaries
- Reports violations with file and line numbers

**Exit Codes:**
- `0` - No violations found
- `1` - Violations found

### `validate-manifest.js`

Validates that commands in repo.manifest.yaml match actual commands in package.json, CI, and Makefile.

**Usage:**
```bash
node .repo/automation/scripts/validate-manifest.js
```

**Features:**
- Checks manifest commands against package.json scripts
- Validates command existence
- Reports discrepancies and warnings

**Exit Codes:**
- `0` - All commands valid
- `1` - Discrepancies found

### `create-agent-log.py`

Creates and manages agent logs following AGENT_LOG_TEMPLATE.md format.

**Usage:**
```bash
# Create new log
python3 .repo/automation/scripts/create-agent-log.py \
    --agent-id <id> \
    --task-id <task-id> \
    --intent <intent>

# Add action
python3 .repo/automation/scripts/create-agent-log.py \
    --log-file <path> \
    --add-action <type> \
    --filepath <path> \
    --reasoning <reasoning>

# Add evidence
python3 .repo/automation/scripts/create-agent-log.py \
    --log-file <path> \
    --add-evidence <type> \
    --command <command> \
    --output <output>
```

**Features:**
- Creates logs in JSON format
- Integrates with three-pass workflow
- Tracks actions and evidence
- Supports dry-run mode

**Requirements:**
- Python 3.6+

### `promote-task.py`

Promotes tasks from BACKLOG.md to TODO.md with validation.

**Usage:**
```bash
python3 .repo/automation/scripts/promote-task.py \
    --task-id <TASK-ID> \
    [--validate-only] \
    [--dry-run]
```

**Features:**
- Validates task format before promotion
- Moves task from backlog to TODO
- Checks for required fields
- Supports dry-run mode

**Requirements:**
- Python 3.6+

### `validate-evidence.js`

Validates evidence against EVIDENCE_SCHEMA.json.

**Usage:**
```bash
node .repo/automation/scripts/validate-evidence.js <evidence-file>
```

**Exit Codes:**
- `0` - Valid
- `1` - Invalid

### `create-trace-log.js`

Creates a trace log following AGENT_TRACE_SCHEMA.json format. Automates trace log creation for agents.

**Usage:**
```bash
node .repo/automation/scripts/create-trace-log.js \
  --intent "Add feature X" \
  --files "file1.ts,file2.ts" \
  --commands "npm test,npm run lint" \
  --evidence "Tests passed,Lint clean" \
  [--hitl "HITL-0001"] \
  [--unknowns "API endpoint unclear"] \
  [--output .repo/traces/trace-{timestamp}.json]
```

**Features:**
- Validates against schema
- Auto-generates output path
- Creates traces directory if needed
- Provides helpful error messages

**Exit Codes:**
- `0` - Success
- `1` - Error

### `check-framework-compliance.js`

Checks if PRs and changes comply with the governance framework requirements. Enforces framework usage.

**Usage:**
```bash
node .repo/automation/scripts/check-framework-compliance.js \
  [--base-ref <ref>] \
  [--pr-body <path>] \
  [--trace-log <path>]
```

**Features:**
- Checks trace log compliance (required for non-doc changes)
- Checks HITL compliance (required for security/risky changes)
- Checks task compliance (PRs should reference tasks)
- Checks filepath compliance (filepaths required in PRs)

**Exit Codes:**
- `0` - Compliant
- `1` - Non-compliant (hard failure)
- `2` - Warnings (waiverable)

### `framework-metrics.js`

Generates metrics and reports on framework compliance and usage. Helps track adoption and identify areas for improvement.

**Usage:**
```bash
node .repo/automation/scripts/framework-metrics.js [--output <path>]
```

**Features:**
- HITL item statistics (active, pending, completed, etc.)
- Trace log statistics (total, recent, oldest, newest)
- Waiver statistics (active, expired, total)
- ADR statistics
- Compliance status

**Exit Codes:**
- `0` - Success
- `1` - Error

### `archive-task.py`

Archives completed tasks from priority TODO files and promotes tasks from backlog.

**Usage:**
```bash
# Archive completed task
python3 .repo/automation/scripts/archive-task.py \
    --task-id <TASK-ID> \
    --status completed \
    [--dry-run]

# Promote task from backlog
python3 .repo/automation/scripts/archive-task.py \
    --task-id <TASK-ID> \
    --promote-from P3 \
    --promote-to P0 \
    [--dry-run]
```

**Features:**
- Marks tasks as completed in TODO files
- Archives tasks to archive directory
- Promotes tasks between priority levels
- Supports dry-run mode

**Requirements:**
- Python 3.6+

## CI Integration

These scripts are integrated into the CI/CD pipeline. See `.github/workflows/ci.yml` for details.

**Current Integration:**
- ✅ GitHub Actions workflow (`.github/workflows/ci.yml`) - Job 7: Governance Verification
- ✅ Framework compliance check integrated into CI
- ✅ Automatic HITL sync on every PR
- ✅ Governance verification blocks merge on hard gate failures
- ✅ Compliance check blocks merge on non-compliance
- ✅ Makefile target: `make check-governance` for local verification
- ✅ Pre-commit hook: Non-blocking governance checks on `.repo/`, `agents/`, `scripts/` changes
- ✅ npm scripts: `check:governance`, `check:compliance`, `framework:metrics`

## Error Handling

All scripts follow consistent error handling:
- Exit code `0` for success
- Exit code `1` for errors
- Clear error messages to stderr
- Helpful usage information

## Testing

Run scripts with `--dry-run` flag to test without making changes:

```bash
node .repo/automation/scripts/governance-verify.js --dry-run
python3 .repo/automation/scripts/sync-hitl-to-pr.py --pr-number 123 --dry-run
python3 .repo/automation/scripts/archive-task.py --task-id T-001 --status completed --dry-run
```

## Related Documentation

- `.github/workflows/ci.yml` - CI integration
- `.repo/policy/procedures.json` - HITL process and procedures
- `.repo/policy/constitution.json` - Quality gate definitions
- `.repo/templates/AGENT_TRACE_SCHEMA.json` - Trace log schema
