# ALIGNMENT Folder Structure

This document describes the reorganized folder structure for the ALIGNMENT repository standard.

## Folder Organization

```
ALIGNMENT/
├── README.md                    # Main entry point
├── CHANGELOG.md                 # Version history
├── CONTRIBUTING.md              # Contribution guidelines
│
├── standards/                   # Core ALIGNMENT standards (14 sections)
│   ├── 00-Prerequisites.md
│   ├── 01-Root-Directory-Structure.md
│   ├── 02-Source-Code-Layout.md
│   ├── 03-Configuration-Environment.md
│   ├── 04-Dependency-Management.md
│   ├── 05-CI-CD-Structure.md
│   ├── 06-Testing-Structure.md
│   ├── 07-Documentation-Standards.md
│   ├── 08-Infrastructure-IaC.md
│   ├── 09-Governance-Ownership.md
│   ├── 10-Security-Compliance.md
│   ├── 11-Observability-Monitoring.md
│   ├── 12-Change-Management.md
│   └── 13-Quality-Health-Checks.md
│
├── principles/                  # Philosophical foundations for standards
│   ├── README.md
│   └── Configuration-Principles.md
│
├── getting-started/             # Quick start guides
│   ├── Quick-Start-Checklist.md
│   ├── Minimum-Viable-Alignment.md
│   └── Migration-Guide.md
│
├── reference/                   # Reference materials and templates
│   ├── Templates.md
│   ├── Quick-Reference.md
│   ├── Decision-Tree.md
│   ├── Language-Quick-Starts.md
│   ├── Platform-Quick-Starts.md
│   ├── Dependency-Graph.md
│   └── Badge-Generator.md
│
├── supporting/                  # Supporting documentation
│   ├── FAQ.md
│   ├── Common-Pitfalls.md
│   ├── Success-Metrics.md
│   ├── Cost-Benefit-Analysis.md
│   ├── Workflow-Guides.md
│   └── Getting-Help.md
│
├── tools/                       # Automation and validation tools
│   └── scripts/
│       ├── README.md
│       ├── validate-all.sh
│       └── validate-section-*.sh
│
└── meta/                        # Metadata and configuration
    ├── alignment-progress.json
    ├── optimization-tracker.json
    └── .markdownlint.json
```

## Purpose of Each Folder

### standards/
Contains the 14 core ALIGNMENT standards (numbered 00-13). These are the main specification documents that define requirements for repository alignment.

### principles/
Contains standalone principle documents that provide philosophical foundations for standards. Principles define the "why" and "what" behind our standards, while standards provide the "how" through implementation checklists.

**Characteristics:**
- **Standalone:** Each principle document is self-contained
- **Philosophical:** Focus on core concepts and rationale
- **Foundational:** Standards reference principles for context
- **Cross-cutting:** Principles may inform multiple standards

See [principles/README.md](principles/README.md) for more information.

### getting-started/
Quick start guides for different use cases:
- **Quick-Start-Checklist.md**: Checklist for new repositories
- **Minimum-Viable-Alignment.md**: Minimal alignment for small projects (~90 minutes)
- **Migration-Guide.md**: Step-by-step guide for existing repositories

### reference/
Reference materials, templates, and quick guides:
- Templates for common files
- Language and platform-specific guidance
- Decision-making tools
- Quick reference cheat sheets

### supporting/
Supporting documentation that helps users understand and implement ALIGNMENT:
- FAQ and common pitfalls
- Success metrics and cost-benefit analysis
- Workflow guides
- Help resources

### tools/
Automation scripts and validation tools:
- Validation scripts for each section
- Health check automation
- Compliance validation tools

### meta/
Metadata files:
- Progress tracking schema
- Optimization tracking
- Linting configuration
- Other configuration files

## File Naming Conventions

- **Standards files**: Numbered `##-Section-Name.md` (e.g., `01-Root-Directory-Structure.md`)
- **Principles files**: `[Topic]-Principles.md` (e.g., `Configuration-Principles.md`)
- **Getting started**: Descriptive names (e.g., `Quick-Start-Checklist.md`)
- **Reference**: Descriptive names (e.g., `Templates.md`)
- **Supporting**: Descriptive names (e.g., `FAQ.md`)

## Cross-References

When referencing files in markdown:
- **Within same folder**: Use relative paths (e.g., `[Section 1](01-Root-Directory-Structure.md)`)
- **From root**: Use folder paths (e.g., `[Section 1](standards/01-Root-Directory-Structure.md)`)
- **From standards**: Use `../` for parent folder (e.g., `[Templates](../reference/Templates.md)`)

## Growth Considerations

This structure supports growth by:
1. **Clear separation**: Each folder has a distinct purpose
2. **Scalability**: Easy to add new standards, references, or tools
3. **Discoverability**: Logical grouping makes files easy to find
4. **Maintainability**: Related files are grouped together

## Migration Notes

Files were reorganized on 2026-01-28. If you have bookmarks or external references:
- Old paths: `00-Prerequisites.md` → New: `standards/00-Prerequisites.md`
- Old paths: `Templates.md` → New: `reference/Templates.md`
- Old paths: `scripts/` → New: `tools/scripts/`

**2026-01-28 Update:**
- Added `principles/` folder for standalone principle documents
- `CONFIG.md` → `principles/Configuration-Principles.md`
