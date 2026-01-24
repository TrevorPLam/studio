# Development Guide

## Table of Contents

- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Common Development Tasks](#common-development-tasks)
- [Debugging](#debugging)
- [Testing](#testing)
- [Git Workflow](#git-workflow)
- [Code Review Guidelines](#code-review-guidelines)
- [Performance Considerations](#performance-considerations)
- [Dependencies](#dependencies)
- [Environment Variables](#environment-variables)
- [Troubleshooting](#troubleshooting)
- [Resources](#resources)
- [Getting Help](#getting-help)
- [Related Documentation](#related-documentation)

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn
- GitHub account (for OAuth)
- AI API keys (Google AI, OpenAI, or Anthropic)

### Initial Setup

1. **Clone Repository:**
   ```bash
   git clone <repository-url>
   cd studio
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your values
   ```

4. **Start Development Server:**
   ```bash
   npm run dev
   ```

5. **Start Genkit (Optional):**
   ```bash
   npm run genkit:dev
   ```

See [SETUP.md](../SETUP.md) for detailed setup instructions.

## Development Workflow

### Code Organization

```
src/
├── app/              # Next.js App Router (pages & API routes)
├── components/       # React components
├── lib/              # Core business logic
├── hooks/            # React hooks
├── types/            # TypeScript types
└── ai/               # AI/Genkit integration
```

### Adding a New Feature

1. **Create Feature Branch:**
   ```bash
   git checkout -b feature/my-feature
   ```

2. **Implement Feature:**
   - Add code in appropriate directory
   - Follow existing patterns
   - Add tests

3. **Test Locally:**
   ```bash
   npm run test
   npm run typecheck
   ```

4. **Commit Changes:**
   ```bash
   git add .
   git commit -m "feat: add my feature"
   ```

5. **Push and Create PR:**
   ```bash
   git push origin feature/my-feature
   ```

### Code Style

- **TypeScript:** Strict mode enabled
- **Formatting:** Use Prettier (if configured)
- **Linting:** ESLint with Next.js config
- **Naming:**
  - Components: PascalCase (`MyComponent.tsx`)
  - Files: kebab-case (`my-component.tsx`)
  - Functions: camelCase (`myFunction`)
  - Constants: UPPER_SNAKE_CASE (`MY_CONSTANT`)

## Common Development Tasks

### Adding a New API Endpoint

1. **Create Route File:**
   ```typescript
   // src/app/api/my-endpoint/route.ts
   import { NextRequest, NextResponse } from 'next/server';
   import { getServerSession } from 'next-auth';
   import { authOptions } from '@/app/api/auth/[...nextauth]/route';

   export async function GET(request: NextRequest) {
     const session = await getServerSession(authOptions);
     if (!session) {
       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
     }
     // Implementation
   }
   ```

2. **Add Validation:**
   ```typescript
   import { validateRequest } from '@/lib/validation';
   import { z } from 'zod';

   const schema = z.object({
     // Define schema
   });

   const input = validateRequest(schema, body);
   ```

3. **Add Tests:**
   ```typescript
   // tests/integration/api/my-endpoint.test.ts
   describe('GET /api/my-endpoint', () => {
     // Tests
   });
   ```

### Adding a New Component

1. **Create Component:**
   ```typescript
   // src/components/my-component.tsx
   interface MyComponentProps {
     // Props
   }

   export function MyComponent({ ...props }: MyComponentProps) {
     return (
       // JSX
     );
   }
   ```

2. **Use UI Components:**
   ```typescript
   import { Button } from '@/components/ui/button';
   ```

3. **Add Tests:**
   ```typescript
   // tests/unit/components/my-component.test.tsx
   import { render, screen } from '@testing-library/react';
   ```

### Adding a New Library Module

1. **Create Module:**
   ```typescript
   // src/lib/my-module.ts
   /**
    * Module description
    */

   export function myFunction() {
     // Implementation
   }
   ```

2. **Add Types:**
   ```typescript
   // src/lib/my-module.ts
   export interface MyType {
     // Type definition
   }
   ```

3. **Add Tests:**
   ```typescript
   // tests/unit/lib/my-module.test.ts
   describe('myFunction', () => {
     // Tests
   });
   ```

## Debugging

### Local Development

1. **Check Logs:**
   - Server logs in terminal
   - Browser console for client errors
   - Network tab for API calls

2. **Use Debugger:**
   ```typescript
   // Add breakpoint
   debugger;
   ```

3. **Check Environment:**
   ```bash
   # Verify environment variables
   node -e "console.log(process.env.NEXTAUTH_URL)"
   ```

### Common Issues

**Issue:** API endpoint returns 401
- **Check:** Is user authenticated?
- **Check:** Is session cookie present?

**Issue:** TypeScript errors
- **Run:** `npm run typecheck`
- **Fix:** Address type errors

**Issue:** Build fails
- **Clear:** `.next` directory
- **Reinstall:** `rm -rf node_modules && npm install`

## Testing

### Running Tests

```bash
# All tests
npm test

# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

### Writing Tests

See [TESTING.md](./TESTING.md) for detailed testing guide.

## Git Workflow

### Branch Naming

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation
- `refactor/` - Code refactoring
- `test/` - Test additions

### Commit Messages

Follow conventional commits:

```
feat: add new feature
fix: fix bug
docs: update documentation
refactor: refactor code
test: add tests
```

### Pull Request Process

1. **Create PR:**
   - Clear title
   - Description of changes
   - Link to related issues

2. **Review:**
   - Address review comments
   - Ensure tests pass
   - Update documentation

3. **Merge:**
   - Squash and merge (preferred)
   - Delete feature branch

## Code Review Guidelines

### What to Review

- **Functionality:** Does it work as intended?
- **Tests:** Are there adequate tests?
- **Documentation:** Is code documented?
- **Style:** Does it follow conventions?
- **Security:** Any security concerns?

### Review Checklist

- [ ] Code follows style guide
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No secrets in code
- [ ] Error handling appropriate
- [ ] Performance considered

## Performance Considerations

### Optimization Tips

1. **Use Server Components:** When possible
2. **Lazy Load:** Heavy components
3. **Cache:** API responses when appropriate
4. **Optimize Images:** Use Next.js Image component

### Profiling

```bash
# Build with profiling
npm run build -- --profile
```

## Dependencies

### Adding Dependencies

```bash
# Production dependency
npm install package-name

# Development dependency
npm install -D package-name
```

### Updating Dependencies

```bash
# Check outdated
npm outdated

# Update
npm update

# Security audit
npm audit
npm audit fix
```

## Environment Variables

### Development

Use `.env.local` (gitignored)

### Available Variables

See [CONFIGURATION.md](./CONFIGURATION.md) for complete list.

## Troubleshooting

### Common Problems

**Problem:** Port already in use
```bash
# Kill process on port 9002
lsof -ti:9002 | xargs kill
```

**Problem:** Module not found
```bash
# Clear cache and reinstall
rm -rf .next node_modules
npm install
```

**Problem:** Type errors
```bash
# Restart TypeScript server
# In VS Code: Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server"
```

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Zod Documentation](https://zod.dev)

## Getting Help

1. **Check Documentation:**
   - This guide
   - API documentation
   - Architecture docs

2. **Search Issues:**
   - GitHub issues
   - Stack Overflow

3. **Ask for Help:**
   - Create GitHub issue
   - Contact team

---

## Related Documentation

- **[SETUP.md](../SETUP.md)** - Initial setup instructions
- **[API.md](./API.md)** - API endpoint reference
- **[CODE_STYLE.md](./CODE_STYLE.md)** - Coding standards
- **[TESTING.md](./TESTING.md)** - Testing guide
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System architecture
- **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Common issues
- **[CONFIGURATION.md](./CONFIGURATION.md)** - Configuration reference

## Development Checklist

Before submitting code:

- [ ] Code follows [CODE_STYLE.md](./CODE_STYLE.md)
- [ ] Tests added/updated
- [ ] All tests pass (`npm test`)
- [ ] Type checking passes (`npm run typecheck`)
- [ ] Linting passes (`npm run lint`)
- [ ] Documentation updated
- [ ] No console.logs or debug code
- [ ] No secrets in code
- [ ] Error handling appropriate
- [ ] Security considerations addressed
