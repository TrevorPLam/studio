# Team Training Guide - Studio Repository

This guide provides comprehensive training for team members working with the Studio web development repository.

## Quick Start

### For New Team Members

1. **Repository Overview**
   - Studio is a web development-focused repository
   - React/Next.js web application with emphasis on developer experience
   - Shared UI component library with Storybook
   - API integration packages and development tools
   - Focus on fast iteration and high-quality code

2. **Initial Setup**
   ```bash
   # Clone repository
   git clone <your-fork>
   cd studio
   
   # Install dependencies
   npm install
   
   # Start development server
   npm run dev
   ```

3. **Daily Development Workflow**
   - Create feature branch from `main`
   - Make changes following React/Next.js best practices
   - Test components with Storybook
   - Run tests and linting before committing
   - Create pull request with proper templates

## Repository Structure

### Core Components

```
studio/
├── apps/
│   └── web/                # React/Next.js web application
│       ├── app/            # Next.js app router pages
│       ├── components/     # Page-specific components
│       ├── hooks/          # Custom React hooks
│       └── styles/         # Global styles
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
| Framework | React + Next.js | Web application framework |
| Language | TypeScript | Type-safe JavaScript |
| Styling | CSS Modules + Tailwind | Component styling |
| State | React Query + Context | Server and client state |
| Testing | Jest + React Testing Library | Unit and integration tests |
| UI Development | Storybook | Component development and testing |
| Code Quality | ESLint + Prettier | Code formatting and linting |
| Build | Next.js + SWC | Fast development and production builds |

## Development Environment

### 1. Prerequisites

**Required Software:**
- Node.js 18+ 
- npm or yarn
- Git
- Modern web browser (Chrome, Firefox, Safari)

**Recommended Tools:**
- VS Code with extensions:
  - ES7+ React/Redux/React-Native snippets
  - Prettier - Code formatter
  - ESLint
  - Auto Rename Tag
  - Bracket Pair Colorizer
  - GitLens

### 2. Setup Process

```bash
# 1. Clone the repository
git clone <your-fork>
cd studio

# 2. Install dependencies
npm install

# 3. Copy environment file
cp .env.example .env.local

# 4. Start development server
npm run dev

# 5. Open browser to http://localhost:3000
# 6. Open Storybook (separate terminal)
npm run storybook
```

### 3. Environment Configuration

**.env.local:**
```bash
# Development configuration
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=Studio Dev
NEXT_PUBLIC_ENABLE_AI_FEATURES=true
```

## Development Workflows

### 1. Feature Development

**Step 1: Planning and Setup**
```bash
# Create feature branch
git checkout -b feature/new-feature

# Understand requirements
# Review existing components and patterns
# Plan component structure
```

**Step 2: Component Development**
```bash
# Start development server
npm run dev

# Create new component
mkdir src/components/NewFeature
touch src/components/NewFeature/index.tsx
touch src/components/NewFeature/NewFeature.module.css
touch src/components/NewFeature/NewFeature.test.tsx
touch src/components/NewFeature/NewFeature.stories.tsx
```

**Component Template:**
```tsx
// src/components/NewFeature/index.tsx
import React from 'react';
import styles from './NewFeature.module.css';

interface NewFeatureProps {
  title: string;
  description?: string;
  onAction?: () => void;
}

export const NewFeature: React.FC<NewFeatureProps> = ({
  title,
  description,
  onAction,
}) => {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{title}</h2>
      {description && (
        <p className={styles.description}>{description}</p>
      )}
      {onAction && (
        <button onClick={onAction} className={styles.button}>
          Get Started
        </button>
      )}
    </div>
  );
};
```

**CSS Modules:**
```css
/* src/components/NewFeature/NewFeature.module.css */
.container {
  padding: 2rem;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  background: #ffffff;
}

.title {
  margin: 0 0 1rem 0;
  color: #1a202c;
  font-size: 1.5rem;
  font-weight: 600;
}

.description {
  margin: 0 0 1.5rem 0;
  color: #4a5568;
  line-height: 1.6;
}

.button {
  padding: 0.75rem 1.5rem;
  background: #3182ce;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.button:hover {
  background: #2c5282;
}
```

**Step 3: Testing**
```tsx
// src/components/NewFeature/NewFeature.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { NewFeature } from './index';

describe('NewFeature', () => {
  it('renders title correctly', () => {
    render(<NewFeature title="Test Feature" />);
    expect(screen.getByText('Test Feature')).toBeInTheDocument();
  });

  it('renders description when provided', () => {
    render(
      <NewFeature title="Test" description="Test description" />
    );
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('calls onAction when button is clicked', () => {
    const handleClick = jest.fn();
    render(
      <NewFeature title="Test" onAction={handleClick} />
    );
    
    fireEvent.click(screen.getByText('Get Started'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

**Step 4: Storybook Development**
```tsx
// src/components/NewFeature/NewFeature.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { NewFeature } from './index';

const meta: Meta<typeof NewFeature> = {
  title: 'Components/NewFeature',
  component: NewFeature,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A feature showcase component with title, description, and action button.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'New Feature Available',
    description: 'Check out our latest feature that makes development easier.',
  },
};

export const WithoutDescription: Story = {
  args: {
    title: 'Simple Feature',
  },
};

export const WithAction: Story = {
  args: {
    title: 'Interactive Feature',
    description: 'Click the button to get started.',
    onAction: () => alert('Action clicked!'),
  },
};
```

### 2. UI Component Library Development

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
│   │   ├── Input/
│   │   ├── Modal/
│   │   └── index.ts
│   ├── hooks/
│   │   ├── useTheme.ts
│   │   └── useLocalStorage.ts
│   ├── utils/
│   │   ├── cn.ts
│   │   └── format.ts
│   └── styles/
│       ├── globals.css
│       └── theme.css
├── package.json
├── tsconfig.json
└── .storybook/
```

**Reusable Component Pattern:**
```tsx
// packages/ui/src/components/Button/index.tsx
import React from 'react';
import { cn } from '../utils/cn';
import styles from './Button.module.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
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
      {loading && <span className={styles.spinner} />}
      {icon && <span className={styles.icon}>{icon}</span>}
      {children}
    </button>
  );
};
```

**Utility Functions:**
```tsx
// packages/ui/src/utils/cn.ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### 3. API Integration

**React Query Setup:**
```tsx
// apps/web/src/providers/QueryProvider.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      retry: 3,
    },
  },
});

export const QueryProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};
```

**API Hook Pattern:**
```tsx
// apps/web/src/hooks/useApi.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@studio/api-sdk';

export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => apiClient.users.getAll(),
  });
};

export const useUser = (id: string) => {
  return useQuery({
    queryKey: ['users', id],
    queryFn: () => apiClient.users.getById(id),
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: apiClient.users.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};
```

### 4. Page Development (Next.js App Router)

**Page Structure:**
```tsx
// apps/web/app/features/[id]/page.tsx
import { notFound } from 'next/navigation';
import { useFeature } from '@/hooks/useFeatures';
import { FeatureDisplay } from '@/components/FeatureDisplay';

interface FeaturePageProps {
  params: { id: string };
}

export default async function FeaturePage({ params }: FeaturePageProps) {
  const feature = await getFeature(params.id);
  
  if (!feature) {
    notFound();
  }

  return (
    <main className="container mx-auto py-8">
      <FeatureDisplay feature={feature} />
    </main>
  );
}

async function getFeature(id: string) {
  // Fetch feature data
  const response = await fetch(`${process.env.API_URL}/features/${id}`);
  return response.json();
}
```

**Layout Components:**
```tsx
// apps/web/app/layout.tsx
import { QueryProvider } from '@/providers/QueryProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <QueryProvider>
            {children}
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

## Essential Commands

### Development Commands

```bash
# Start development server
npm run dev

# Start Storybook
npm run storybook

# Run tests in watch mode
npm run test:watch

# Run linting in watch mode
npm run lint:watch

# Type checking
npm run type-check
```

### Build Commands

```bash
# Build for production
npm run build

# Start production server
npm run start

# Analyze bundle size
npm run analyze

# Export static site
npm run export
```

### Testing Commands

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- Button.test.tsx

# Update test snapshots
npm test -- --updateSnapshot
```

### Code Quality Commands

```bash
# Run ESLint
npm run lint

# Fix ESLint issues
npm run lint:fix

# Format code with Prettier
npm run format

# Type check
npm run type-check
```

## Testing Strategy

### 1. Unit Testing

**Component Testing Best Practices:**
- Test component behavior, not implementation
- Use meaningful test descriptions
- Test edge cases and error states
- Mock external dependencies
- Use React Testing Library queries

**Example:**
```tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UserForm } from './UserForm';

describe('UserForm', () => {
  it('submits form with valid data', async () => {
    const handleSubmit = jest.fn();
    render(<UserForm onSubmit={handleSubmit} />);
    
    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: 'John Doe' }
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'john@example.com' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    
    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com'
      });
    });
  });

  it('shows validation errors for invalid data', async () => {
    render(<UserForm onSubmit={jest.fn()} />);
    
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });
  });
});
```

### 2. Integration Testing

**API Integration Testing:**
```tsx
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useUsers } from './useApi';

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

describe('useUsers', () => {
  it('fetches and returns users', async () => {
    const { result } = renderHook(() => useUsers(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.data).toHaveLength(3);
      expect(result.current.isLoading).toBe(false);
    });
  });
});
```

### 3. E2E Testing

**Playwright Setup:**
```typescript
// e2e/tests/user-journey.spec.ts
import { test, expect } from '@playwright/test';

test.describe('User Journey', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('user can navigate and interact with features', async ({ page }) => {
    // Navigate to features
    await page.click('[data-testid="nav-features"]');
    
    // Wait for page load
    await expect(page.locator('h1')).toContainText('Features');
    
    // Interact with feature cards
    await page.click('[data-testid="feature-card"]:first-child');
    
    // Verify feature details
    await expect(page.locator('[data-testid="feature-title"]')).toBeVisible();
    await expect(page.locator('[data-testid="feature-description"]')).toBeVisible();
  });

  test('user can search and filter features', async ({ page }) => {
    // Enter search term
    await page.fill('[data-testid="search-input"]', 'development');
    
    // Verify filtered results
    await expect(page.locator('[data-testid="feature-card"]')).toHaveCount(2);
    
    // Clear search
    await page.click('[data-testid="clear-search"]');
    
    // Verify all results are shown
    await expect(page.locator('[data-testid="feature-card"]')).toHaveCountGreaterThan(2);
  });
});
```

## Performance Optimization

### 1. Development Performance

**Fast Refresh Optimization:**
```javascript
// next.config.js
module.exports = {
  experimental: {
    appDir: true,
  },
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    return config;
  },
};
```

### 2. Production Performance

**Bundle Optimization:**
```javascript
// next.config.js
module.exports = {
  experimental: {
    optimizePackageImports: ['@studio/ui'],
    optimizeCss: true,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  images: {
    domains: ['example.com'],
    formats: ['image/webp', 'image/avif'],
  },
};
```

### 3. Component Performance

**React Optimization:**
```tsx
import React, { memo, useMemo, useCallback } from 'react';

interface ExpensiveComponentProps {
  data: any[];
  onItemClick: (item: any) => void;
}

export const ExpensiveComponent = memo<ExpensiveComponentProps>(({
  data,
  onItemClick,
}) => {
  const processedData = useMemo(() => {
    return data.map(item => ({
      ...item,
      processed: true,
    }));
  }, [data]);

  const handleClick = useCallback((item: any) => {
    onItemClick(item);
  }, [onItemClick]);

  return (
    <div>
      {processedData.map(item => (
        <div key={item.id} onClick={() => handleClick(item)}>
          {item.name}
        </div>
      ))}
    </div>
  );
});
```

## Code Quality Standards

### 1. TypeScript Best Practices

**Type Definitions:**
```tsx
// Define clear interfaces
interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt?: Date;
}

// Use union types for variants
type ButtonVariant = 'primary' | 'secondary' | 'outline';

// Use generics for reusable components
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  keyExtractor: (item: T) => string;
}

export function List<T>({ items, renderItem, keyExtractor }: ListProps<T>) {
  return (
    <div>
      {items.map(item => (
        <div key={keyExtractor(item)}>
          {renderItem(item)}
        </div>
      ))}
    </div>
  );
}
```

### 2. React Best Practices

**Component Structure:**
```tsx
// Good: Clear separation of concerns
import React, { useState, useEffect } from 'react';
import { useUserData } from '@/hooks/useUserData';

interface UserProfileProps {
  userId: string;
}

export const UserProfile: React.FC<UserProfileProps> = ({ userId }) => {
  const { data: user, isLoading, error } = useUserData(userId);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!user) return <div>User not found</div>;

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
};
```

### 3. CSS Best Practices

**CSS Modules:**
```css
/* Use BEM-like naming */
.container {
  padding: 1rem;
}

.container__title {
  font-size: 1.5rem;
  font-weight: bold;
}

.container__title--highlighted {
  color: #3182ce;
}

.container__button {
  padding: 0.5rem 1rem;
  background: #3182ce;
  color: white;
  border: none;
  border-radius: 4px;
}

.container__button:hover {
  background: #2c5282;
}
```

## Troubleshooting Guide

### Common Issues

**1. Hot Reload Not Working**
```bash
# Check Next.js version compatibility
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

# Update types
npm update @types/react @types/node
```

**3. Test Failures**
```bash
# Run tests with verbose output
npm test -- --verbose

# Update snapshots
npm test -- --updateSnapshot

# Run specific test
npm test -- UserProfile.test.tsx
```

**4. Storybook Issues**
```bash
# Clear Storybook cache
rm -rf .storybook-out

# Rebuild Storybook
npm run storybook

# Check for addon conflicts
npm list @storybook/*
```

### Performance Issues

**1. Slow Development Server**
```bash
# Check for large dependencies
npm ls --depth=0

# Remove unused dependencies
npm uninstall <package>

# Optimize imports
```

**2. Slow Build Times**
```bash
# Analyze bundle
npm run analyze

# Implement code splitting
# Use dynamic imports
```

## Best Practices Summary

### Do's

1. ✅ Use TypeScript for all new code
2. ✅ Write tests for all components
3. ✅ Use Storybook for component development
4. ✅ Follow React best practices
5. ✅ Implement proper error handling
6. ✅ Use CSS Modules for styling
7. ✅ Optimize for performance
8. ✅ Document complex logic

### Don'ts

1. ❌ Use `any` type unnecessarily
2. ❌ Skip testing components
3. ❌ Ignore accessibility
4. ❌ Use inline styles excessively
5. ❌ Forget error boundaries
6. ❌ Ignore performance warnings
7. ❌ Skip code reviews
8. ❌ Commit without testing

## Resources

### Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)
- [Storybook Documentation](https://storybook.js.org/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library)

### Tools

- [React Developer Tools](https://chrome.google.com/webstore/detail/react-developer-tools/)
- [Next.js Dev Tools](https://chrome.google.com/webstore/detail/nextjs-devtools/)
- [Bundle Analyzer](https://www.npmjs.com/package/@next/bundle-analyzer)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)

### Community

- Next.js Discord
- React community forums
- Stack Overflow tags
- GitHub discussions

## Assessment

### Knowledge Check

After completing this training, you should be able to:

1. ✅ Set up development environment
2. ✅ Create React components with TypeScript
3. ✅ Use Storybook for component development
4. ✅ Write effective tests
5. ✅ Implement API integrations
6. ✅ Optimize performance
7. ✅ Troubleshoot common issues

### Next Steps

1. **Complete setup** on your local machine
2. **Explore the codebase** structure
3. **Create a small component** to practice workflow
4. **Write tests** for your component
5. **Add Storybook stories** for visualization
6. **Ask questions** when unsure about something

---

**Welcome to the Studio team!** 🎨

We're excited to have you contribute to our web development platform. Focus on writing clean, performant code and creating great user experiences. Happy coding!
