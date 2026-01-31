# Bug Task Template

## Template Structure

```toon
TASK-BUG-XXXX, , [Bug Description], Not Started, P1, Team, AGENT, YYYY-MM-DD, [Bug Description and Impact], [Fix Acceptance Criteria], [Dependencies], [Bug Report Reference]
```

## Example

```toon
TASK-BUG-001, , Fix memory leak in user session cleanup, Not Started, P1, Team, AGENT, 2026-02-10, User sessions not properly cleaned up on logout causing memory leak and potential security issue, Sessions properly cleaned up; Memory usage stable; No session data leakage after logout, , Issue #123
```

## Bug Severity Guidelines

- **P0**: Critical security issues, production outages
- **P1**: Major functionality broken, significant performance issues
- **P2**: Minor functionality issues, edge cases
- **P3**: Cosmetic issues, documentation errors

## Acceptance Criteria Guidelines

Bug fixes should include:

- **Root Cause**: What caused the bug
- **Fix Description**: How the bug is fixed
- **Verification**: How to verify the fix works
- **Regression**: Tests to prevent recurrence
- **Performance**: Any performance improvements

## Dependencies

Common dependencies for bug tasks:
- Test cases for the fix
- Documentation updates if behavior changes
- Security review for security-related bugs
- Performance monitoring for performance bugs

## Notes Section

Include:
- Bug report links
- Error logs or screenshots
- Impact assessment
- Workarounds if any
