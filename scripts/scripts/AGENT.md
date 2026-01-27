# AGENT.md (Folder-Level Guide)

## Purpose of this folder

The `scripts/` folder contains automation scripts, build tools, and utility scripts that support development, testing, and maintenance. This includes:
- Build scripts
- Check/validation scripts (lint, typecheck, boundaries, etc.)
- Development tools
- Automation utilities
- CI/CD helper scripts

These scripts are used by developers and agents to run checks, build the application, and automate repetitive tasks.

## What agents may do here

- **Create scripts** for new checks, validations, or automation
- **Modify scripts** to fix bugs or improve functionality
- **Add utility scripts** that support development workflows
- **Update scripts** when build/test processes change
- **Follow existing script patterns** and conventions

## What agents may NOT do

- **Modify core application code** - Scripts are separate from application code
- **Break existing script functionality** - Maintain backward compatibility
- **Skip testing scripts** - Scripts should be tested and verified
- **Ignore script conventions** - Follow existing patterns (Node.js, shell scripts, etc.)

## Script Categories

### Check Scripts
Scripts that validate code quality, boundaries, or compliance:
- `check-traceability.mjs` - Validates traceability requirements
- `check-exceptions.mjs` - Validates exception expiry
- `check-agent-platform.mjs` - Validates agent platform consistency
- `check-expo-config.mjs` - Validates Expo configuration

### Build Scripts
Scripts that build or prepare the application:
- `build.js` - Static build for Expo deployment

### Tool Scripts
Scripts in `scripts/tools/` that support governance:
- `compile-constitution.mjs` - Compiles constitution into copilot instructions

## Script Requirements

When creating or modifying scripts:
- Include error handling and clear error messages
- Use appropriate exit codes (0 for success, non-zero for failure)
- Document script purpose and usage
- Test scripts before committing
- Follow existing script patterns and conventions

## Integration with Manifest

Scripts are referenced in `/.repo/repo.manifest.yaml`:
- Commands in the manifest may call these scripts
- Scripts should be executable and reliable
- Script failures should provide clear error messages

## Required links

- Refer to higher-level policy:
  - `/.repo/policy/PRINCIPLES.md` - Operating principles
  - `/.repo/repo.manifest.yaml` - Command definitions that use these scripts
  - `/.repo/agents/AGENTS.md` - Core agent rules

## Testing Scripts

Scripts should be:
- Tested manually before committing
- Documented with usage examples
- Reliable and idempotent when possible
- Clear about their dependencies

## When in Doubt

- Check `/.repo/repo.manifest.yaml` to see how scripts are used
- Follow existing script patterns in this directory
- Test scripts locally before committing
- Create HITL item if script requirements are unclear
- Reference `BESTPR.md` for repository best practices
