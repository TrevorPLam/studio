# Human-In-The-Loop (HITL) Items

This directory contains blocking questions and decisions that require human approval.

## Naming Convention
Use sequential IDs: `HITL-0001.md`, `HITL-0002.md`, etc.

## Structure
Each HITL file should contain:
- **Title**: Short description of the decision needed
- **Context**: Background and why this requires human input
- **Question/Decision**: What needs to be approved or decided
- **Options**: Available choices (if applicable)
- **Impact**: What will happen based on the decision
- **Related Tasks**: Links to TODO.toon tasks
- **Status**: Pending / Approved / Rejected / Resolved

## Triggers
HITLs are created for:
- Security/login/money/data changes
- External integrations
- Unknown items that agent cannot resolve
- Dependency vulnerabilities requiring decisions
- Protected path changes (e.g., governance files, lockfiles)

## Process
1. Mark the related task as "Blocked" in `agents/tasks/TODO.toon`
2. Create the HITL file here with proper structure
3. Continue with the next task in the group
4. Update HITL status when resolved
