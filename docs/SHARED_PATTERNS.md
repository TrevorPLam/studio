# filepath: docs/SHARED_PATTERNS.md
# purpose: Cross-repository pattern sharing and standardization.
# last updated: 2026-01-30
# related tasks: Agentic workflow analysis and recommendations

# Shared Agentic Patterns

This document captures standardized patterns across all repositories to ensure consistency and enable knowledge sharing.

## Core File Structure

### Required Files (All Repositories)
```
agents/
├── AGENTS.toon              # Canonical agent governance
├── TOON.toon               # Format definition
├── hitl/
│   ├── README.md           # HITL process documentation
│   └── templates/         # Standardized HITL templates
│       ├── HITL-SEC-template.md  # Security changes
│       ├── HITL-PROT-template.md # Protected path changes
│       ├── HITL-EXT-template.md  # External integrations
│       └── HITL-UNK-template.md  # Unknown items
└── tasks/
    ├── TODO.toon           # Active work
    ├── BACKLOG.toon        # Future work
    ├── ARCHIVE.toon        # Completed work
    └── templates/         # Standardized task templates
        ├── FEATURE-template.md   # Feature tasks
        └── BUG-template.md       # Bug tasks

scripts/
├── setup.sh               # Dependency installation
├── verify.sh              # Quality gate
├── automation/           # Workflow automation scripts
│   ├── check-task-quality.sh   # Task validation
│   ├── check-hitl-quality.sh   # HITL validation
│   └── sync-workflows.sh       # Cross-repo sync
├── metrics/              # Performance tracking
│   ├── track-workflow-performance.sh  # Metrics collection
│   └── generate-metrics-dashboard.sh  # Dashboard generation
└── security/
    ├── protected-paths.txt # Blast radius patterns
    └── check-blast-radius.sh # Protected path checker

Makefile                   # Single entry point
AGENTS.md                  # Human-readable governance
```

## Standardized Commands

### Setup and Verification
```bash
make setup    # Install dependencies
make verify   # Run quality gate
```

### Quality Gate Sequence
1. **Blast Radius Check** - Protected path validation
2. **Secret Scan** - Security vulnerability check
3. **Lint** - Code style enforcement
4. **Type Check** - TypeScript validation
5. **Tests** - Unit and integration tests
6. **Build** - Package compilation

### Automation Commands
```bash
# Task and HITL quality validation
./scripts/automation/check-task-quality.sh
./scripts/automation/check-hitl-quality.sh

# Cross-repository synchronization
./scripts/automation/sync-workflows.sh

# Performance metrics
./scripts/metrics/track-workflow-performance.sh collect
./scripts/metrics/track-workflow-performance.sh report
./scripts/metrics/track-workflow-performance.sh trends
./scripts/metrics/generate-metrics-dashboard.sh
```

## Workflow Automation

### Task Quality Validation
- **Structure Validation**: Ensures proper TOON format
- **Dependency Checking**: Validates task dependencies
- **Actor Consistency**: Verifies AGENT/USER assignments
- **Priority Validation**: Checks priority level compliance

### HITL Quality Validation
- **Template Compliance**: Ensures required sections present
- **Naming Convention**: Validates HITL-XXXX format
- **Status Validation**: Checks status values
- **Duplicate Prevention**: Identifies duplicate HITL numbers

### Cross-Repository Synchronization
- **Template Distribution**: Syncs templates across repos
- **Automation Scripts**: Maintains script consistency
- **Integrity Verification**: Validates sync success

## Performance Metrics

### Tracked Metrics
- **Task Completion Rate**: Percentage of completed tasks
- **Task Distribution**: By status and priority
- **HITL Resolution**: Pending/approved/rejected counts
- **Repository Health**: Overall workflow health score
- **Trend Analysis**: Historical performance changes

### Health Score Calculation
- **Base Score**: 100 points
- **Completion Rate Impact**: -0.5 points per % below 100%
- **Blocked Tasks Impact**: -0.3 points per % blocked
- **HITL Items Impact**: -2 points per pending HITL

### Dashboard Features
- **Repository Overview**: Health scores and key metrics
- **Trend Visualization**: Performance over time
- **Comparative Analysis**: Cross-repository metrics
- **Interactive Reports**: HTML dashboard with real-time data

## TOON Format Standards

### Task Structure
```toon
active_work[N]{id, parent_id, title, status, priority, owner, actor, due, description, acceptance_criteria, dependencies, notes}
```

### Actor Classification
- **AGENT**: Autonomous execution possible
- **USER**: Human decision/approval required

### Status Values
- Not Started, In Progress, Completed, Blocked

### Priority Levels
- P0: Critical (blocking issues)
- P1: High (important features)
- P2: Medium (enhancements)

## HITL Process Standards

### Triggers (Consistent Across Repos)
- Security/login/money/data changes
- External integrations
- Unknown items requiring human input
- Dependency vulnerabilities
- Protected path changes

### Template Structure
All HITL files must include:
- Title and Context
- Changes Made
- Why Human Approval Required
- Impact Analysis (Approved/Rejected)
- Verification Steps
- Security Considerations
- Blast Radius Assessment
- Recommendation

## Security Patterns

### Protected Paths
```regex
^\.github/
^scripts/
^agents/
^AGENTS\.md$
^\.cursorrules$
^Makefile$
^package\.json$
^pnpm-lock\.yaml$
^docker-compose\.yml$
```

### Blast Radius Process
1. Define protected paths in `scripts/security/protected-paths.txt`
2. Run `scripts/security/check-blast-radius.sh` in CI
3. Fail PR when protected paths change without approval

## Agent Capabilities

### Standard Agent Types
1. **build_agent**: Development across full repo
2. **test_agent**: Quality assurance and testing  
3. **docs_agent**: Documentation updates

### Workflow Steps
1. Group 3-5 same-type tasks from TODO.toon
2. Create plan for first task (files, quality gates, verification)
3. Execute changes task-by-task with verification
4. Handle blocks via HITL creation
5. Update TODO.toon and archive completed tasks

## Integration Points

### CI/CD Integration
- **GitHub Actions**: `.github/workflows/`
- **Turbo Pipeline**: `turbo.json` configuration
- **Quality Gates**: Automated verification in PRs

### Toolchain Standards
- **pnpm**: v8.15.0 (package management)
- **Turbo**: Monorepo task runner
- **TypeScript**: Type safety enforcement
- **ESLint/Prettier**: Code quality

## Repository-Specific Adaptations

### OS Repository (Reference Implementation)
- Full-stack with backend services
- Comprehensive security scanning
- 22+ active tasks with subtasks
- Production-ready workflows

### AIOS Repository (Mobile-First)
- React Native applications
- Simplified verification (no secret scan)
- Focus on API gateway setup

### Studio Repository (Web-Only)
- Minimal implementation
- Web application focus
- 3 active tasks for standardization

### Firm Template (Multi-Site)
- Template and client sites
- Alignment-driven development
- Platform consistency focus

## Implementation Checklist

When creating a new repository or updating an existing one:

- [ ] Copy core file structure from OS repository
- [ ] Update repository metadata in AGENTS.toon
- [ ] Configure protected paths for repository context
- [ ] Adapt verify.sh for repository tooling
- [ ] Create initial TODO.toon with repository-specific tasks
- [ ] Set up HITL process documentation
- [ ] Configure Makefile with setup/verify commands
- [ ] Test workflow end-to-end

## Pattern Evolution

This document should be updated when:
- New repositories are added
- Core workflows change
- Security requirements evolve
- Toolchain updates require pattern changes
- Cross-repo learning reveals improvements

Maintain pattern consistency while allowing repository-specific adaptations as needed.
