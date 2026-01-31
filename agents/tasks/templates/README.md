# Task Templates Repository

This directory contains standardized task templates for consistent TODO.toon entries across all repositories.

## Task Types

### 1. Feature Tasks (TASK-FEATURE-XXXX)
New functionality and feature development.

### 2. Bug Tasks (TASK-BUG-XXXX)
Bug fixes and issue resolution.

### 3. Infrastructure Tasks (TASK-INFRA-XXXX)
Infrastructure, CI/CD, and tooling improvements.

### 4. Documentation Tasks (TASK-DOCS-XXXX)
Documentation updates and improvements.

### 5. Security Tasks (TASK-SEC-XXXX)
Security improvements and vulnerability fixes.

## Standard Task Structure

All tasks in TODO.toon must follow this structure:

```toon
active_work[N]{id, parent_id, title, status, priority, owner, actor, due, description, acceptance_criteria, dependencies, notes}:
TASK-XXX, , [Title], [Status], [Priority], [Owner], [Actor], [Due], [Description], [Acceptance Criteria], [Dependencies], [Notes]
```

## Field Definitions

- **id**: Unique task identifier (TASK-XXX format)
- **parent_id**: Parent task for subtasks (empty for top-level tasks)
- **title**: Short, descriptive title
- **status**: Not Started, In Progress, Completed, Blocked
- **priority**: P0 (Critical), P1 (High), P2 (Medium), P3 (Low)
- **owner**: Person or team responsible
- **actor**: AGENT (autonomous) or USER (human decision required)
- **due**: Target completion date (YYYY-MM-DD)
- **description**: Detailed description of what needs to be done
- **acceptance_criteria**: Clear criteria for task completion
- **dependencies**: Other tasks or prerequisites
- **notes**: Additional context or constraints

## Usage Guidelines

1. Use consistent naming conventions
2. Include clear acceptance criteria
3. Specify correct actor (AGENT vs USER)
4. Link dependencies properly
5. Update status regularly
