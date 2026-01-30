# Quick Reference

Cheat sheets and quick checklists for repository standards.

## File Checklist

### Root Level (P0)
- `README.md` ✓
- `LICENSE` ✓
- `.gitignore` ✓
- Package manager file ✓
- `CHANGELOG.md` (if versioned) ✓

### Root Level (P1)
- `docs/` directory ✓
- `.github/` directory (if GitHub) ✓

### Required Files
- `CODEOWNERS` ✓
- `CONTRIBUTING.md` ✓
- `SECURITY.md` ✓

### Recommended Files
- `HEALTHCHECK.md` ✓
- `maintainers.md` ✓
- `waiver.md` (if needed) ✓

## Directory Structure Checklist

- [ ] Source code in dedicated directory
- [ ] Tests organized consistently
- [ ] Configuration centralized
- [ ] Infrastructure code in `infra/`
- [ ] Documentation in `docs/`
- [ ] No build artifacts in repo
- [ ] No secrets in repo

## CI/CD Checklist

- [ ] Build step
- [ ] Test step
- [ ] Lint step
- [ ] Security scanning:
  - [ ] SAST
  - [ ] Dependency scanning
  - [ ] Secret scanning
- [ ] Blocks merges on failure
- [ ] Documented process
