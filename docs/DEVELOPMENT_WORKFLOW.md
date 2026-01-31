# Studio Development Workflow

This guide outlines the development workflow for the Studio repository, focusing on web application development and developer experience optimization.

## Overview

Studio is a web development-focused repository with:
- React/Next.js web application
- Shared UI component library
- API integration packages
- Development tools (AI helpers, code generation)
- Emphasis on developer experience and productivity

## Development Philosophy

### Core Principles

1. **Developer First**: Optimize for developer productivity and experience
2. **Fast Feedback**: Minimize build times and maximize iteration speed
3. **Quality Code**: Maintain high standards for code quality and maintainability
4. **Incremental Development**: Support rapid iteration and experimentation
5. **Tooling Excellence**: Provide best-in-class development tools

### Workflow Goals

- **Sub-3-minute PR feedback** for development changes
- **Hot reload** for immediate visual feedback
- **Intelligent error reporting** for faster debugging
- **Automated quality checks** for consistent code quality
- **Seamless local development** setup

## Repository Structure

### Core Components

```
studio/
├── apps/
│   └── web/                # React/Next.js web application
├── packages/
│   ├── api-sdk/           # API integration package
│   ├── config/            # Configuration management
│   ├── contracts/         # TypeScript contracts
│   └── ui/                # UI component library
├── tools/
│   ├── ai-helpers/        # AI development tools
│   └── codegen/           # Code generation tools
└── docs/                  # Documentation
```

### Technology Stack

| Component | Technology | Purpose |
|-----------|-------------|---------|
| Frontend | React + Next.js | Web application framework |
| UI Library | Custom components | Reusable UI components |
| State Management | React Context/Zustand | Application state |
| Styling | CSS Modules/Tailwind | Component styling |
| Build | Next.js + SWC | Fast development builds |
| Testing | Jest + React Testing Library | Unit and integration tests |
| Code Quality | ESLint + Prettier | Code formatting and linting |

## Development Setup

### Quick Start

```bash
# Clone repository
git clone <your-fork>
cd studio

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Configuration

**.env.local:**
```bash
# Development environment variables
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=Studio Dev
```

**Development Scripts:**
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "test": "jest",
    "test:watch": "jest --watch",
    "lint": "eslint . --ext .ts,.tsx",
    "lint:fix": "eslint . --ext .ts,.tsx --fix",
    "type-check": "tsc --noEmit",
    "format": "prettier --write .",
    "storybook": "storybook dev -p 6006"
  }
}
```

## Development Workflow

### 1. Feature Development

**Step 1: Planning**
```bash
# Create feature branch
git checkout -b feature/new-feature

# Understand requirements
# Review existing code patterns
# Plan component structure
```

**Step 2: Development Setup**
```bash
# Start development server
npm run dev

# Open additional terminals for:
# - Tests: npm run test:watch
# - Linting: npm run lint -- --watch
# - Storybook: npm run storybook
```

**Step 3: Component Development**
```bash
# Create new component
mkdir src/components/NewComponent
touch src/components/NewComponent/index.tsx
touch src/components/NewComponent/NewComponent.module.css
touch src/components/NewComponent/NewComponent.test.tsx
```

**Component Template:**
```tsx
// src/components/NewComponent/index.tsx
import React from 'react';
import styles from './NewComponent.module.css';

interface NewComponentProps {
  title: string;
  onAction?: () => void;
}

export const NewComponent: React.FC<NewComponentProps> = ({
  title,
  onAction,
}) => {
  return (
    <div className={styles.container}>
      <h1>{title}</h1>
      {onAction && (
        <button onClick={onAction} className={styles.button}>
          Action
        </button>
      )}
    </div>
  );
};
```

**Step 4: Testing**
```bash
# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- NewComponent.test.tsx

# Run tests with coverage
npm test -- --coverage
```

**Step 5: Integration**
```bash
# Test in Storybook
npm run storybook

# Manual testing in browser
# Open http://localhost:3000

# Performance testing
npm run build
npm run start
```

### 2. UI Component Development

**Component Library Structure:**
```
packages/ui/
├── src/
│   ├── components/
│   │   ├── Button/
│   │   │   ├── index.tsx
│   │   │   ├── Button.module.css
│   │   │   ├── Button.test.tsx
│   │   │   └── Button.stories.tsx
│   │   └── ...
│   ├── hooks/
│   ├── utils/
│   └── index.ts
├── package.json
├── tsconfig.json
└── .storybook/
```

**Component Development Pattern:**
```tsx
// packages/ui/src/components/Button/index.tsx
import React from 'react';
import { cn } from '../utils/cn';
import styles from './Button.module.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  className,
  disabled,
  ...props
}) => {
  return (
    <button
      className={cn(
        styles.button,
        styles[variant],
        styles[size],
        loading && styles.loading,
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <span className={styles.spinner} /> : children}
    </button>
  );
};
```

**Storybook Integration:**
```tsx
// packages/ui/src/components/Button/Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './index';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Button',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary Button',
  },
};
```

### 3. API Integration

**API SDK Usage:**
```tsx
// apps/web/src/hooks/useApi.ts
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '@studio/api-sdk';

export const useUserData = (userId: string) => {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => apiClient.users.getById(userId),
  });
};

export const useUpdateUser = () => {
  return useMutation({
    mutationFn: apiClient.users.update,
    onSuccess: () => {
      // Invalidate cache
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};
```

**Error Handling:**
```tsx
// apps/web/src/components/ErrorBoundary.tsx
import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong</h2>
          <details>
            {this.state.error?.message}
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### 4. Development Tools Integration

**AI Helpers Usage:**
```tsx
// tools/ai-helpers/src/codeGeneration.ts
export const generateComponent = (
  componentName: string,
  props: string[]
): string => {
  // AI-powered component generation
  const template = `
import React from 'react';
import styles from './${componentName}.module.css';

interface ${componentName}Props {
  ${props.map(prop => `${prop}: string;`).join('\n  ')}
}

export const ${componentName}: React.FC<${componentName}Props> = ({
  ${props.join(', ')}
}) => {
  return (
    <div className={styles.container}>
      <h1>${componentName}</h1>
    </div>
  );
};
`;
  return template;
};
```

**Code Generation Workflow:**
```bash
# Generate new component
npm run generate:component MyComponent

# Generate API hooks
npm run generate:api-hooks

# Generate TypeScript types
npm run generate:types
```

## Performance Optimization

### 1. Development Performance

**Fast Refresh Configuration:**
```javascript
// next.config.js
module.exports = {
  experimental: {
    appDir: true,
  },
  webpack: (config, { dev }) => {
    if (dev) {
      // Optimize for development
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    return config;
  },
};
```

**Build Optimization:**
```javascript
// next.config.js
module.exports = {
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['@studio/ui'],
  },
};
```

### 2. Bundle Optimization

**Dynamic Imports:**
```tsx
// Lazy load components
const HeavyComponent = React.lazy(() => import('./HeavyComponent'));

// Usage
<Suspense fallback={<div>Loading...</div>}>
  <HeavyComponent />
</Suspense>
```

**Code Splitting:**
```javascript
// next.config.js
module.exports = {
  webpack: (config) => {
    config.optimization.splitChunks = {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    };
    return config;
  },
};
```

## Testing Strategy

### 1. Unit Testing

**Component Testing:**
```tsx
// src/components/Button/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './index';

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

**Hook Testing:**
```tsx
// src/hooks/useApi.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useUserData } from './useApi';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useUserData', () => {
  it('fetches user data', async () => {
    const { result } = renderHook(() => useUserData('123'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });
  });
});
```

### 2. Integration Testing

**E2E Testing Setup:**
```typescript
// e2e/tests/user-journey.spec.ts
import { test, expect } from '@playwright/test';

test('user can complete main workflow', async ({ page }) => {
  await page.goto('/');
  
  // Navigate to feature
  await page.click('[data-testid="nav-feature"]');
  
  // Interact with components
  await page.fill('[data-testid="input-field"]', 'test value');
  await page.click('[data-testid="submit-button"]');
  
  // Verify results
  await expect(page.locator('[data-testid="result"]')).toBeVisible();
});
```

### 3. Performance Testing

**Bundle Analysis:**
```bash
# Analyze bundle size
npm run build
npm run analyze

# Lighthouse performance audit
npm run lighthouse
```

## Code Quality

### 1. ESLint Configuration

```javascript
// .eslintrc.js
module.exports = {
  extends: [
    'next/core-web-vitals',
    '@typescript-eslint/recommended',
    'prettier',
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/explicit-function-return-type': 'warn',
    'prefer-const': 'error',
    'no-console': 'warn',
  },
};
```

### 2. Prettier Configuration

```json
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

### 3. TypeScript Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true
  }
}
```

## Deployment Workflow

### 1. Build Process

```bash
# Production build
npm run build

# Build analysis
npm run analyze

# Export static files (if needed)
npm run export
```

### 2. Environment Configuration

**Production Environment:**
```bash
# .env.production
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://api.studio.com
NEXT_PUBLIC_APP_NAME=Studio
```

### 3. CI/CD Integration

**GitHub Actions Workflow:**
```yaml
name: Deploy Studio

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build application
        run: npm run build
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## Troubleshooting

### Common Issues

**1. Hot Reload Not Working**
```bash
# Check Next.js version
npm list next

# Clear Next.js cache
rm -rf .next

# Restart development server
npm run dev
```

**2. TypeScript Errors**
```bash
# Check TypeScript configuration
npx tsc --noEmit

# Clear TypeScript cache
rm -rf .tsbuildinfo

# Rebuild types
npm run type-check
```

**3. Test Failures**
```bash
# Run tests with verbose output
npm test -- --verbose

# Run specific test file
npm test -- Button.test.tsx

# Update test snapshots
npm test -- --updateSnapshot
```

### Performance Issues

**1. Slow Development Server**
```bash
# Check for large dependencies
npm ls --depth=0

# Optimize imports
# Remove unused dependencies
npm uninstall <package>
```

**2. Slow Build Times**
```bash
# Analyze bundle
npm run analyze

# Optimize imports
# Use dynamic imports
# Implement code splitting
```

## Best Practices

### 1. Component Development

- Keep components small and focused
- Use TypeScript for all components
- Write tests for all components
- Document component APIs
- Use consistent naming conventions

### 2. State Management

- Use local state when possible
- Implement proper error boundaries
- Optimize re-renders with useMemo/useCallback
- Use React Query for server state
- Keep state close to where it's used

### 3. Performance

- Implement lazy loading for heavy components
- Use React.memo for expensive components
- Optimize bundle size with code splitting
- Monitor performance with Lighthouse
- Use appropriate caching strategies

### 4. Developer Experience

- Provide clear error messages
- Implement comprehensive logging
- Use TypeScript for better IDE support
- Maintain consistent code formatting
- Document complex logic

## Resources

### Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)
- [Storybook Documentation](https://storybook.js.org/)
- [Jest Documentation](https://jestjs.io/)

### Tools

- [React Developer Tools](https://chrome.google.com/webstore/detail/react-developer-tools/)
- [Redux DevTools](https://chrome.google.com/webstore/detail/redux-devtools/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [Bundle Analyzer](https://www.npmjs.com/package/@next/bundle-analyzer)

### Community

- Next.js Discord community
- React community forums
- Stack Overflow tags
- GitHub discussions

---

**Studio Development Workflow** is designed to maximize developer productivity while maintaining high code quality standards. Happy coding! 🎨
