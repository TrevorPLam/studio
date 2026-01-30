# ALIGNMENT Versioning and Deprecation Policy

**Version:** 1.0.0  
**Last Updated:** 2026-01-29  
**Status:** Active

---

## Overview

This document defines how the ALIGNMENT standard itself is versioned, how changes are managed, and how deprecated content is handled.

---

## Versioning Strategy

### Semantic Versioning

ALIGNMENT follows [Semantic Versioning 2.0.0](https://semver.org/):

**Format:** `MAJOR.MINOR.PATCH`

- **MAJOR** - Breaking changes that require repository restructuring
- **MINOR** - New standards, principles, or significant additions (backward compatible)
- **PATCH** - Bug fixes, clarifications, typo corrections (backward compatible)

### Version Scope

Versions apply to the **entire ALIGNMENT standard**, not individual sections.

**Current Version:** 1.2.0 (as declared in [.alignment/README.md](.alignment/README.md))

---

## What Constitutes a Breaking Change?

### Major Version Bump (X.0.0)

Increment MAJOR version when:

- **Structural changes** - Moving/renaming standard files (e.g., renaming `01-Root-Directory-Structure.md`)
- **Removed requirements** - Removing a P0 requirement
- **Incompatible changes** - Changes that make previously compliant repos non-compliant
- **Section reorganization** - Renumbering or restructuring sections

**Example:** Moving from 14 sections to 15 sections (shifting all numbers) = MAJOR bump

### Minor Version Bump (0.X.0)

Increment MINOR version when:

- **New standards** - Adding new standard documents
- **New principles** - Adding new principle documents
- **New requirements** - Adding P1 or P2 requirements (non-breaking)
- **Significant additions** - New reference materials, tools, or guides
- **Enhanced tooling** - New validation scripts or automation

**Example:** Adding Testing-Principles.md = MINOR bump

### Patch Version Bump (0.0.X)

Increment PATCH version when:

- **Typo fixes** - Correcting spelling or grammar
- **Clarifications** - Improving existing explanations without changing requirements
- **Link fixes** - Fixing broken links
- **Formatting** - Improving markdown formatting
- **Documentation fixes** - Minor corrections to examples or code snippets

**Example:** Fixing typos in Section 3 = PATCH bump

---

## Deprecation Policy

### When to Deprecate

Deprecate content when:

- **Better alternatives exist** - New approach supersedes old approach
- **Technology obsolescence** - Technology no longer relevant (e.g., deprecated CI/CD platform)
- **Redundancy** - Overlapping or duplicate content
- **Inaccuracy** - Content no longer reflects best practices

### Deprecation Process

#### 1. Mark as Deprecated

Add deprecation notice at the top of the document:

```markdown
> **⚠️ DEPRECATED:** This content is deprecated as of ALIGNMENT v2.0.0.
> Use [Alternative Document](link-to-alternative.md) instead.
> This document will be removed in ALIGNMENT v3.0.0.
```

#### 2. Deprecation Timeline

- **Announcement** - Deprecated in current MAJOR version
- **Grace period** - Maintained for at least ONE full MAJOR version
- **Removal** - Removed in NEXT MAJOR version (minimum 6 months after deprecation)

**Example Timeline:**
- v1.5.0: Feature X deprecated (announcement)
- v2.0.0: Feature X still present but deprecated (grace period)
- v3.0.0: Feature X removed (removal)

#### 3. Update Cross-References

When deprecating content:
- Update all links pointing to deprecated content
- Add migration notes in related documents
- Update [CHANGELOG.md](.alignment/CHANGELOG.md)

#### 4. Archive Deprecated Content

Before removal, move deprecated content to `.alignment/deprecated/`:

```
.alignment/
└── deprecated/
    ├── README.md (explanation of deprecated content)
    └── v1/
        └── [deprecated-file].md
```

---

## Standard Lifecycle

### 1. Draft (Pre-release)

- **Status:** In development, not yet released
- **Location:** Feature branch
- **Stability:** Unstable, subject to major changes
- **Usage:** Not recommended for production use

### 2. Stable (Released)

- **Status:** Released in a version (e.g., v1.0.0)
- **Location:** Main branch
- **Stability:** Stable, backward compatible changes only
- **Usage:** Recommended for production use

### 3. Deprecated

- **Status:** Marked for removal
- **Location:** Main branch with deprecation notice
- **Stability:** No new changes except critical fixes
- **Usage:** Migrate to alternative

### 4. Archived

- **Status:** Removed from main standards
- **Location:** `.alignment/deprecated/`
- **Stability:** Read-only
- **Usage:** Historical reference only

---

## Backward Compatibility

### Compatibility Promise

Within the same MAJOR version:

- **File locations remain stable** - No moving/renaming files
- **Existing requirements stay valid** - No removing P0/P1 requirements
- **Links remain valid** - No breaking cross-references
- **Tooling compatibility** - Validation scripts remain compatible

### Breaking Compatibility

When breaking compatibility:
- **Increment MAJOR version**
- **Document migration path** in [Migration Guide](.alignment/getting-started/Migration-Guide.md)
- **Provide upgrade tools** if possible
- **Give advance notice** (at least one MINOR version before MAJOR bump)

---

## Version Documentation

### CHANGELOG.md

Every release must update [CHANGELOG.md](.alignment/CHANGELOG.md):

```markdown
## [1.3.0] - 2026-02-15

### Added
- New Testing-Principles.md document
- Enhanced validation scripts for Section 10

### Changed
- Improved Migration Guide with more examples
- Updated FAQ with common questions

### Fixed
- Fixed broken links in Section 7
- Corrected typos in Configuration-Principles.md

### Deprecated
- Old validation approach (use new scripts instead)
```

### Version Tag in README

[.alignment/README.md](.alignment/README.md) must include version:

```markdown
**Version:** 1.2.0  
**Last Updated:** 2026-01-28
```

### Git Tags

Each release gets a Git tag:
```bash
git tag -a v1.3.0 -m "Release version 1.3.0"
git push origin v1.3.0
```

---

## Individual Standard Versioning

### Standards Don't Have Individual Versions

Individual standards (Section 1, Section 2, etc.) **do not have separate version numbers**. They are versioned as part of the overall ALIGNMENT version.

**Why?**
- Standards are interdependent
- Avoids version confusion
- Simplifies compliance tracking

### Tracking Standard Changes

Use [CHANGELOG.md](.alignment/CHANGELOG.md) to track which standards changed in each release:

```markdown
## [1.3.0] - 2026-02-15

### Changed
- **Section 6:** Added test pyramid guidance
- **Section 10:** Enhanced security scanning requirements
```

---

## Review Cadence

### Regular Reviews

Standards should be reviewed:

- **Annually** - Full review of all standards
- **Quarterly** - Review of high-change areas (CI/CD, tooling)
- **Ad-hoc** - When technology or best practices change significantly

### Review Process

1. **Assessment** - Evaluate current state vs industry best practices
2. **Proposals** - Create GitHub issues for proposed changes
3. **Discussion** - Community feedback period
4. **Implementation** - Approved changes implemented
5. **Release** - New version released with updated content

---

## Version Compliance

### Repository Compliance Tracking

Repositories implementing ALIGNMENT should declare which version they follow:

```markdown
# My Project

This repository follows ALIGNMENT v1.2.0.

[![ALIGNMENT v1.2.0](https://img.shields.io/badge/ALIGNMENT-v1.2.0-blue)](https://github.com/TrevorPLam/workspace)
```

### Upgrading Between Versions

See [Migration Guide](.alignment/getting-started/Migration-Guide.md) for upgrade paths between ALIGNMENT versions.

---

## Questions?

- **Version clarification** - See [FAQ](.alignment/supporting/FAQ.md)
- **Deprecation questions** - Open a GitHub Issue
- **Migration help** - See [Migration Guide](.alignment/getting-started/Migration-Guide.md)
