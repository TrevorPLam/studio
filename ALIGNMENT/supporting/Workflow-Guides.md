# Workflow Guides

Step-by-step processes for common repository tasks.

## Setting Up a New Repository

1. **Prerequisites (Start Here)**
   - Complete decision points ([Section 0](00-Prerequisites.md))
   - **Answer all 10 decision point questions** in Section 0:
     - Is versioned project?
     - Project type?
     - Primary language/framework?
     - Package manager?
     - CI/CD platform?
     - Public or private repo?
     - Repository structure type?
     - Code in root directory?
     - Secrets in repository? ⚠️ (CRITICAL)
     - Repository owners/maintainers?
   - Document answers in `alignment-progress.json`
   - Understand key concepts (lockfiles, CI/CD, etc.)

2. **Foundation (P0)**
   - Root directory cleanup ([Section 1](01-Root-Directory-Structure.md))
     - **Questions to answer:** How many files in root? (Target: ≤10)
     - **Questions to answer:** Do you have a LICENSE file? (Required if public)
   - Source code organization ([Section 2](02-Source-Code-Layout.md))
     - **Questions to answer:** What structure type? (Single package/Monorepo/Application)
   - Basic .gitignore configuration ([Section 1](01-Root-Directory-Structure.md))

2. **Configuration & Dependencies (P0)**
   - Environment configuration ([Section 3](03-Configuration-Environment.md))
   - Dependency management ([Section 4](04-Dependency-Management.md))
   - Lockfiles committed

3. **Automation (P0)**
   - CI/CD pipeline setup ([Section 5](05-CI-CD-Structure.md))
     - **Questions to answer:** Do you already have CI/CD? (Setup vs migration)
     - **Questions to answer:** What security scanning tools? (ESLint/Snyk/Bandit/Gosec/etc.)
   - Security scanning in CI ([Section 5](05-CI-CD-Structure.md))
   - Test infrastructure setup ([Section 6](06-Testing-Structure.md))
     - **Questions to answer:** What testing framework? (Jest/pytest/Go testing/etc.)
     - **Questions to answer:** Do you have existing tests? (Organization vs creation)

4. **Documentation & Governance (P0)**
   - README with project structure ([Section 7](07-Documentation-Standards.md))
     - **Questions to answer:** Do you have existing documentation? (Organization vs creation)
   - CONTRIBUTING.md ([Section 9](09-Governance-Ownership.md))
     - **Questions to answer:** What branching strategy? (GitHub Flow/Git Flow/Trunk-Based)
     - **Questions to answer:** Do you have code review standards? (Documentation vs creation)
   - SECURITY.md ([Section 10](10-Security-Compliance.md))
     - **Questions to answer:** What security compliance level? (Basic/Standard/High/Compliance-specific)
     - **Questions to answer:** Do you handle sensitive data? (PII, secrets, credentials)
   - CODEOWNERS file ([Section 9](09-Governance-Ownership.md))
     - **Note:** Repository owners from Section 0 Question 10

5. **Quality & Observability (P0)**
   - Structured logging ([Section 11](11-Observability-Monitoring.md))
     - **Questions to answer:** Do you have logging? (Conversion vs setup)
     - **Questions to answer:** What logging format? (Unstructured/Semi-structured/Structured JSON)
   - Quality checks ([Section 13](13-Quality-Health-Checks.md))
     - **Questions to answer:** Do you have automated health checks? (Alignment vs setup)
     - **Questions to answer:** What quality metrics do you track? (Coverage/Complexity/Dependencies/Docs)

## Auditing an Existing Repository

1. **Quick Assessment**
   - Run through [P0 checklist](Quick-Start-Checklist.md)
   - Identify missing required items
   - Document current state

2. **Prioritize Fixes**
   - Fix P0 issues first
   - Address security gaps immediately
   - Plan P1 improvements

3. **Create Action Plan**
   - List all missing items
   - Assign owners
   - Set timelines
   - Track progress

4. **Implement Changes**
   - Follow section order: 0 → 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 → 11 → 12 → 13
   - **Start with prerequisites** ([Section 0](00-Prerequisites.md))
     - Answer all 10 decision point questions
     - Document answers in `alignment-progress.json`
     - ⚠️ **CRITICAL:** If secrets exist in repo, remediate immediately
   - **Root structure cleanup** ([Section 1](01-Root-Directory-Structure.md))
     - Answer: Root file count? LICENSE needed?
   - **Organize source code** ([Section 2](02-Source-Code-Layout.md))
     - Answer: Structure type? (Uses answer from Section 0)
   - **Set up configuration** ([Section 3](03-Configuration-Environment.md))
     - Answer: Secret management approach? (Environment variables/Secret service/CI secrets)
   - **Configure dependencies** ([Section 4](04-Dependency-Management.md))
   - **Set up CI/CD Phase 1 - Bootstrap** ([Section 5](05-CI-CD-Structure.md))
     - Answer: Existing CI/CD? Security tools?
   - **Add tests** ([Section 6](06-Testing-Structure.md))
     - Answer: Testing framework? Existing tests?
   - **Complete CI/CD Phase 2 - Add tests** ([Section 5](05-CI-CD-Structure.md))
   - **Complete documentation** ([Section 7](07-Documentation-Standards.md))
     - Answer: Existing documentation?
   - **Add infrastructure** ([Section 8](08-Infrastructure-IaC.md))
     - Answer: IaC exists? Infrastructure tools?
   - **Add governance** ([Section 9](09-Governance-Ownership.md))
     - Answer: Branching strategy? Code review standards? (Uses owners from Section 0)
   - **Enhance security** ([Section 10](10-Security-Compliance.md))
     - Answer: Security level? Sensitive data?
   - **Add logging** ([Section 11](11-Observability-Monitoring.md))
     - Answer: Existing logging? Logging format?
   - **Set up change management** ([Section 12](12-Change-Management.md))
     - Answer: Semantic versioning? CHANGELOG exists? Commit convention?
   - **Run quality checks** ([Section 13](13-Quality-Health-Checks.md))
     - Answer: Health checks? Quality metrics? Compliance validation?

5. **Maintain Health**
   - Set up regular audits
   - Keep dependencies updated
   - Maintain documentation
   - Review and update standards
