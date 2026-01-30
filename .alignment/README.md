# Repository Alignment Standard

**Version:** 1.2.0  
**Last Updated:** 2026-01-28  
*(Human-Friendly, Hybrid Tone, P0 → P1 → P2)*

This standard defines how every repository should be organized, documented, and maintained. It is platform-agnostic, language-agnostic, and suitable for monorepos, polyrepos, app repos, infra repos, and library repos.

> **Note:** When implementing ALIGNMENT, specify which version you're following (e.g., "ALIGNMENT v1.0.0") in your repository documentation for future reference.

## Table of Contents

### Getting Started
- [Quick Start Checklist](getting-started/Quick-Start-Checklist.md) - Start here for new repos
- [Minimum Viable Alignment (MVA)](getting-started/Minimum-Viable-Alignment.md) - **Quick start** (~90 minutes)
- [Migration Guide](getting-started/Migration-Guide.md) - **For existing repositories** - Incremental adoption strategies
- [Implementation Status](getting-started/Implementation-Status.md) - How .alignment is implemented and next steps

### Core Standards
- [Reference Guide](#reference-guide) - Detailed standards by category (see below)

### Principles
- [Principles Overview](principles/README.md) - Philosophical foundations for standards
- [Configuration Principles](principles/Configuration-Principles.md) - *Treat config like code: versioned, validated, layered, and boring*
- [Testing Principles](principles/Testing-Principles.md) - *Tests are specifications, documentation, and safety nets*
- [Security Principles](principles/Security-Principles.md) - *Security is not a feature—it's a fundamental requirement*
- [Change Management Principles](principles/Change-Management-Principles.md) - *Version numbers communicate intent. Changes communicate impact.*
- [Documentation Principles](principles/Documentation-Principles.md) - *Documentation is code. It should be versioned, reviewed, tested, and kept current.*
- [Governance Principles](principles/Governance-Principles.md) - *Clear ownership enables accountability. Open contribution enables growth.*

### Reference Materials
- [Templates](reference/Templates.md) - File templates and examples
- [Quick Reference](reference/Quick-Reference.md) - Cheat sheets and templates
- [Decision Tree](reference/Decision-Tree.md) - Decision-making guide
- [Language Quick Starts](reference/Language-Quick-Starts.md) - Language-specific guidance (JS/TS, Python, Go, Rust, Ruby, PHP, Java/Kotlin, C#, Swift)
- [Platform Quick Starts](reference/Platform-Quick-Starts.md) - CI/CD platform guidance (GitHub Actions, GitLab CI, Azure DevOps, CircleCI, Bitbucket, Jenkins)
- [Cloud-Specific Guidance](reference/Cloud-Specific-Guidance.md) - AWS, Azure, GCP best practices
- [Execution Flow](reference/Execution-Flow.md) - Visual execution order guide
- [Section Dependencies](reference/Section-Dependencies.md) - Dependency graph and prerequisites
- [Migration Paths](reference/Migration-Paths.md) - Migration strategy visual guide
- [Dependency Graph](reference/Dependency-Graph.md) - Section dependencies
- [Badge Generator](reference/Badge-Generator.md) - Repository badges

### Supporting Documentation
- [Workflow Guides](supporting/Workflow-Guides.md) - Step-by-step processes
- [Success Metrics](supporting/Success-Metrics.md) - Defining "successfully aligned"
- [Cost-Benefit Analysis](supporting/Cost-Benefit-Analysis.md) - ROI and investment analysis
- [Common Pitfalls](supporting/Common-Pitfalls.md) - Mistakes to avoid
- [FAQ](supporting/FAQ.md) - Frequently asked questions
- [Getting Help](supporting/Getting-Help.md) - Where to find help

### Tools & Automation
- [Validation Scripts](tools/scripts/README.md) - Automated compliance checking
- [Checklist Generator](tools/checklist-generator.html) - Interactive checklist creation
- [Progress Calculator](tools/progress-calculator.html) - Track alignment progress
- [Compliance Score Calculator](tools/compliance-score-calculator.html) - Calculate repository health score

### Research & Learning (optional)
- If present: `research/README.md` and `research/MASTER-RESEARCH-SUMMARY.md` provide evidence and best-practice summaries. Not required for alignment.

### Architecture & Structure
- [Structure Overview](STRUCTURE.md) - Folder organization and rationale

### Contributing & Community
- [Contributing to ALIGNMENT](CONTRIBUTING.md) - How to improve this standard
- [Community Hub](COMMUNITY.md) - Community engagement and discussions
- [Versioning Policy](VERSIONING-POLICY.md) - Version management and deprecation
- [For AI Agents](#for-ai-agents) - Execution guidance for AI agents

---

## Priority Tiers

- **P0** — Required (must have)
- **P1** — Strongly Recommended (should have)
- **P2** — Advanced / Optional / Scale-Driven (nice to have)

---

## When Not to Align

ALIGNMENT is comprehensive, but it's not always necessary. Consider skipping or using a minimal subset if:

- **Tiny projects:** Single-file scripts, one-off utilities, or prototypes (< 100 lines)
- **Temporary projects:** Experiments, proofs-of-concept, or throwaway code
- **Legacy systems:** Very old codebases where alignment would be disruptive without clear benefit
- **External constraints:** Projects with strict organizational requirements that conflict with ALIGNMENT
- **Time-critical:** When alignment would delay critical deliverables (align incrementally instead)

**Minimal Alignment:** Even for small projects, consider at minimum:
- README.md with basic info
- `.gitignore` configured
- LICENSE file (if public)
- Basic CI/CD (if code is shared)

For existing repositories, see [Migration Guide](getting-started/Migration-Guide.md) for incremental adoption strategies.

---

## Reference Guide

Detailed standards organized by category. Use this as a reference when implementing specific requirements.

### Core Structure
0. [Prerequisites & Setup](standards/00-Prerequisites.md) - **Start here first**
1. [Root Directory Structure](standards/01-Root-Directory-Structure.md)
2. [Source Code Layout](standards/02-Source-Code-Layout.md)
3. [Configuration & Environment](standards/03-Configuration-Environment.md)
4. [Dependency Management](standards/04-Dependency-Management.md)

### Automation & Quality
5. [CI/CD Structure](standards/05-CI-CD-Structure.md)
6. [Testing Structure](standards/06-Testing-Structure.md)

### Documentation & Governance
7. [Documentation Standards](standards/07-Documentation-Standards.md)
8. [Infrastructure / IaC Structure](standards/08-Infrastructure-IaC.md)
9. [Governance & Ownership](standards/09-Governance-Ownership.md)

### Security & Operations
10. [Security & Compliance](standards/10-Security-Compliance.md)
11. [Observability & Monitoring](standards/11-Observability-Monitoring.md)
12. [Change Management](standards/12-Change-Management.md)
13. [Quality & Health Checks](standards/13-Quality-Health-Checks.md)

---

## For AI Agents

**Execution Order:**
1. **Start with [Section 0: Prerequisites](standards/00-Prerequisites.md)** - Complete all decision points first
2. Complete Section 1 fully before proceeding to Section 2
3. Sections 3-4 can be done in parallel (after Section 1)
4. Section 5 Phase 1 (Bootstrap CI/CD) before Section 6
5. Section 5 Phase 2 (Complete CI/CD) after Section 6
6. Sections 7-13 can be done in order, respecting prerequisites

**Validation:**
- After each section, verify completion before proceeding
- Use `meta/alignment-progress.json` to track state (see [Templates](reference/Templates.md))
- If task fails, check "Common Issues & Solutions" in that section
- Run verification checks listed in each section

**Checkpoints:**
- Save progress after each section completion
- Format: `alignment-progress-{timestamp}.json`
- Store decision points from Section 0 for context
- Track blockers and resolve before proceeding

**Decision Points (from Section 0):**
- Store answers to: Is versioned project? Project type? Language? CI/CD platform? Public/private?
- Use answers to skip or include conditional tasks in later sections
- Update progress tracker with decision point answers

**Error Handling:**
- If prerequisite section incomplete: Complete it first
- If task fails: Check "Common Issues & Solutions" in that section
- If circular dependency detected: Follow Phase 1 → Phase 2 pattern (Sections 5-6)
- If validation fails: Review "Verification" subsection for that section

**Progress Tracking:**
- Initialize `meta/alignment-progress.json` with Section 0 decision points
- Update after each section: status, tasks_complete, tasks_total
- Mark sections as "completed" only after verification passes
- Update `next_section` field to guide next steps

**Best Practices:**
- Read entire section before starting tasks
- Complete all P0 tasks before moving to next section
- P1 and P2 tasks can be done later if needed
- Verify each section before proceeding (use verification checks)
- Document any deviations or blockers in progress tracker
