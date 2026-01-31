# Feature Task Template

## Template Structure

```toon
TASK-FEATURE-XXXX, , [Feature Title], Not Started, P1, Team, AGENT, YYYY-MM-DD, [Description], [Acceptance Criteria], [Dependencies], [Notes]
```

## Example

```toon
TASK-FEATURE-001, , Add user authentication system, Not Started, P1, Team, AGENT, 2026-02-15, Implement JWT-based authentication with login/logout functionality and protected routes, Login/logout endpoints work; JWT tokens generated and validated; Protected routes require authentication; User session management functional, , Requires security review via HITL
```

## Acceptance Criteria Guidelines

Feature tasks should have specific, measurable acceptance criteria:

- **Functionality**: What the feature should do
- **Integration**: How it integrates with existing systems
- **Performance**: Any performance requirements
- **Security**: Security considerations
- **Testing**: Test coverage requirements

## Dependencies

Common dependencies for feature tasks:
- Security review (TASK-SEC-XXX)
- Infrastructure setup (TASK-INFRA-XXX)
- Documentation updates (TASK-DOCS-XXX)
- API contracts (packages/contracts)

## Notes Section

Include:
- Technical constraints
- Business requirements
- Timeline considerations
- Risk factors
