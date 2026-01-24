# Contributing Guide

Thank you for your interest in contributing to Firebase Studio!

## Table of Contents

- [Getting Started](#getting-started)
- [Code Style](#code-style)
- [Pull Request Process](#pull-request-process)
- [Commit Messages](#commit-messages)
- [Testing](#testing)
- [Documentation](#documentation)
- [Code Review Guidelines](#code-review-guidelines)
- [Development Setup](#development-setup)
- [Questions?](#questions)
- [Related Documentation](#related-documentation)

---

## Getting Started

1. **Fork the repository**
2. **Clone your fork:**
   ```bash
   git clone https://github.com/your-username/studio.git
   cd studio
   ```
3. **Create a branch:**
   ```bash
   git checkout -b feature/my-feature
   ```
4. **Make your changes**
5. **Test your changes:**
   ```bash
   npm test
   npm run typecheck
   ```
6. **Commit your changes:**
   ```bash
   git commit -m "feat: add my feature"
   ```
7. **Push to your fork:**
   ```bash
   git push origin feature/my-feature
   ```
8. **Create a Pull Request**

## Code Style

### TypeScript

- Use strict TypeScript
- Prefer explicit types over `any`
- Use interfaces for object shapes
- Use types for unions/intersections

### Naming Conventions

- **Components:** PascalCase (`MyComponent.tsx`)
- **Files:** kebab-case (`my-component.tsx`)
- **Functions:** camelCase (`myFunction`)
- **Constants:** UPPER_SNAKE_CASE (`MY_CONSTANT`)
- **Types/Interfaces:** PascalCase (`MyType`)

### Formatting

- Use 2 spaces for indentation
- Use single quotes for strings (when possible)
- Trailing commas in multi-line objects/arrays
- Maximum line length: 100 characters

## Pull Request Process

### Before Submitting

- [ ] Code follows style guide
- [ ] Tests added/updated
- [ ] All tests pass
- [ ] Documentation updated
- [ ] No console.logs or debug code
- [ ] No secrets in code

### PR Description

Include:
- **What:** Description of changes
- **Why:** Reason for changes
- **How:** Implementation approach
- **Testing:** How to test changes

### Review Process

1. **Automated Checks:**
   - Tests must pass
   - Type checking must pass
   - Linting must pass

2. **Code Review:**
   - At least one approval required
   - Address review comments
   - Update PR as needed

3. **Merge:**
   - Squash and merge (preferred)
   - Delete feature branch

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new feature
fix: fix bug
docs: update documentation
refactor: refactor code
test: add tests
chore: maintenance tasks
```

**Examples:**
- `feat: add session retry functionality`
- `fix: resolve state transition validation`
- `docs: update API documentation`

## Testing

### Writing Tests

- Write tests for new features
- Write tests for bug fixes
- Aim for good coverage
- Keep tests independent

See [TESTING.md](./TESTING.md) for details.

## Documentation

### When to Update

- Adding new features
- Changing APIs
- Fixing bugs (if behavior changes)
- Updating dependencies

### Documentation Files

- **API.md:** API endpoint changes
- **ARCHITECTURE.md:** Architecture changes
- **README.md:** Major feature additions
- **Code comments:** Complex logic

## Code Review Guidelines

### For Authors

- Be responsive to feedback
- Explain design decisions
- Keep PRs focused and small
- Update documentation

### For Reviewers

- Be constructive and respectful
- Focus on code, not person
- Explain reasoning
- Approve when ready

## Development Setup

See [DEVELOPMENT.md](./DEVELOPMENT.md) for setup instructions.

## Questions?

- Open a GitHub issue
- Check existing documentation
- Ask in discussions

Thank you for contributing! 🎉

---

## Related Documentation

- **[DEVELOPMENT.md](./DEVELOPMENT.md)** - Development workflow
- **[CODE_STYLE.md](./CODE_STYLE.md)** - Code style guide
- **[TESTING.md](./TESTING.md)** - Testing guidelines
- **[API.md](./API.md)** - API documentation

## Contribution Workflow Diagram

```
Fork Repository
    │
    ▼
Create Feature Branch
    │
    ▼
Make Changes
    │
    ├─→ Write Code
    ├─→ Add Tests
    ├─→ Update Docs
    └─→ Follow Style Guide
    │
    ▼
Test Locally
    │
    ├─→ npm test
    ├─→ npm run typecheck
    └─→ npm run lint
    │
    ▼
Commit Changes
    │
    ▼
Push to Fork
    │
    ▼
Create Pull Request
    │
    ▼
Code Review
    │
    ├─→ Address Feedback
    └─→ Update PR
    │
    ▼
Merge (Squash)
```
