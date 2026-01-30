# ALIGNMENT Validation Scripts

Automated validation scripts for checking ALIGNMENT standard compliance.

## Usage

### Run Individual Section Validation

```bash
# Validate Section 1 (Root Directory Structure)
./scripts/validate-section-1.sh

# Validate Section 3 (Configuration & Environment)
./scripts/validate-section-3.sh

# Validate from specific directory
./scripts/validate-section-1.sh /path/to/repo
```

### Run All Validations

```bash
# Validate all sections
./scripts/validate-all.sh

# Validate all sections in specific directory
./scripts/validate-all.sh /path/to/repo
```

## Making Scripts Executable

On Unix-like systems (Linux, macOS):

```bash
chmod +x scripts/*.sh
```

On Windows (Git Bash, WSL):

```bash
# Scripts should work in Git Bash or WSL
# If needed, ensure line endings are LF (not CRLF)
```

## Available Scripts

**Complete Coverage (All 14 Sections):**
- `validate-section-1.sh` - Root Directory Structure
- `validate-section-2.sh` - Source Code Layout
- `validate-section-3.sh` - Configuration & Environment
- `validate-section-4.sh` - Dependency Management
- `validate-section-5.sh` - CI/CD Structure
- `validate-section-6.sh` - Testing Structure
- `validate-section-7.sh` - Documentation Standards
- `validate-section-8.sh` - Infrastructure / IaC
- `validate-section-9.sh` - Governance & Ownership
- `validate-section-10.sh` - Security & Compliance
- `validate-section-11.sh` - Observability & Monitoring
- `validate-section-12.sh` - Change Management
- `validate-section-13.sh` - Quality & Health Checks
- `validate-all.sh` - Run all available validations

## Exit Codes

- `0` - Validation passed (may have warnings)
- `1` - Validation failed (errors found)

## Integration with CI/CD

Add to your CI/CD pipeline:

```yaml
# GitHub Actions example
- name: Validate ALIGNMENT Section 1
  run: ./scripts/validate-section-1.sh

# GitLab CI example
validate_alignment:
  script:
    - chmod +x scripts/*.sh
    - ./scripts/validate-section-1.sh
```

## Contributing

To add a new validation script:

1. Create `validate-section-X.sh` where X is the section number
2. Follow the pattern of existing scripts:
   - Set `set -e` for error handling
   - Use consistent output format
   - Return exit code 0 for success, 1 for failure
   - Count ERRORS and WARNINGS
3. Add to `validate-all.sh` if appropriate
4. Update this README

## Notes

- Scripts are designed to be run from repository root
- Scripts check for common issues but may not catch everything
- Manual review is still recommended
- Scripts are bash-compatible (should work in Git Bash, WSL, Linux, macOS)
