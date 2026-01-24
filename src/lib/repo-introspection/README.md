# Repository Introspection Module

A comprehensive module for extracting metadata from GitHub repositories, including language detection, dependency analysis, entry point identification, test location mapping, and service vs library classification.

## Features

1. **Language Detection** - Identifies programming languages used in the repository
2. **Dependency Graph Summaries** - Analyzes package manager files and dependency relationships
3. **Entry Points & Executables** - Finds application entry points, API routes, and executable scripts
4. **Test Locations** - Maps test files, frameworks, and test organization
5. **Service vs Library Classification** - Determines if repository is a service or library

## Usage

### Basic Usage

```typescript
import { GitHubClient } from '@/lib/github-client';
import { introspectRepository } from '@/lib/repo-introspection';

// Create GitHub client
const client = new GitHubClient({ token: 'your-github-token' });

// Introspect repository
const metadata = await introspectRepository(client, 'owner', 'repo-name', {
  maxFiles: 1000,
  maxDepth: 10,
  ref: 'main', // optional, defaults to default branch
});

console.log(metadata.languages.primary.name); // "TypeScript"
console.log(metadata.classification.type); // "service" or "library"
```

### Quick Summary

For faster analysis with limited metadata:

```typescript
import { getRepositorySummary } from '@/lib/repo-introspection';

const summary = await getRepositorySummary(client, 'owner', 'repo-name');
// Returns: repository, languages, classification
```

### API Endpoint

Use the provided API endpoint:

```bash
GET /api/github/repositories/{owner}/{repo}/introspect?quick=true
GET /api/github/repositories/{owner}/{repo}/introspect?maxFiles=500&maxDepth=5
```

## Metadata Structure

### Language Detection

```typescript
{
  primary: {
    name: "TypeScript",
    extension: ".ts",
    fileCount: 150,
    totalBytes: 500000,
    percentage: 65.2,
    sampleFiles: ["src/index.ts", ...]
  },
  languages: [...], // All detected languages
  totalFiles: 230,
  totalBytes: 1000000
}
```

### Dependency Graph

```typescript
{
  direct: [
    { name: "next", version: "^15.3.8", type: "direct", source: "npm" },
    ...
  ],
  devDependencies: [...],
  transitive: [...],
  packageManagers: [
    { name: "npm", configFile: "package.json", lockFile: "package-lock.json" }
  ],
  totalDependencies: 150
}
```

### Entry Points

```typescript
{
  entryPoints: [
    {
      type: "page",
      path: "app/page.tsx",
      framework: "Next.js",
      route: "/"
    },
    {
      type: "api-route",
      path: "app/api/sessions/route.ts",
      framework: "Next.js",
      route: "/api/sessions",
      method: "GET"
    }
  ],
  executables: [
    { name: "dev", command: "next dev", type: "npm-script" },
    ...
  ],
  primaryEntryPoint: {...},
  framework: "Next.js"
}
```

### Test Locations

```typescript
{
  testFiles: [
    {
      path: "tests/unit/lib/utils.test.ts",
      type: "unit",
      framework: "Jest",
      sourceFile: "src/lib/utils.ts"
    },
    ...
  ],
  byType: {
    unit: [...],
    integration: [...],
    e2e: [...],
    ...
  },
  framework: "Jest",
  testDirectories: ["tests/", "tests/unit/", ...],
  totalTests: 45
}
```

### Classification

```typescript
{
  type: "service", // or "library", "hybrid", "unknown"
  indicators: {
    serviceIndicators: {
      hasServerStartup: true,
      hasApiRoutes: true,
      hasDeploymentConfig: true,
      ...
    },
    libraryIndicators: {
      hasExports: false,
      hasPackageExports: false,
      ...
    },
    confidence: 85,
    reasoning: ["Found server startup code: next.config.ts", ...]
  },
  frameworks: ["Next.js", "React"],
  deploymentTargets: ["Vercel", "Docker"]
}
```

## Individual Analyzers

You can also use individual analyzers directly:

```typescript
import {
  detectLanguages,
  analyzeDependencies,
  analyzeEntryPoints,
  analyzeTestLocations,
  classifyProject
} from '@/lib/repo-introspection';

const fileTree = ['src/index.ts', 'package.json', ...];
const fileContents = new Map([['package.json', '...']]);

const languages = detectLanguages(fileTree);
const dependencies = analyzeDependencies(fileContents);
const entryPoints = analyzeEntryPoints(fileTree, fileContents);
const tests = analyzeTestLocations(fileTree, fileContents);
const classification = classifyProject(fileTree, fileContents);
```

## Performance Considerations

- **Full introspection** can take 10-60 seconds depending on repository size
- **Quick summary** typically takes 2-5 seconds
- Set `maxFiles` and `maxDepth` to limit analysis scope
- Results can be cached for frequently accessed repositories

## Limitations

- Transitive dependencies require parsing lock files (not fully implemented)
- File size estimates are approximate (assumes 1KB per file)
- Some framework detection relies on file patterns and may miss edge cases
- Test file to source file mapping is best-effort

## Related Files

- `src/lib/repo-introspection/types.ts` - Type definitions
- `src/lib/repo-introspection/introspector.ts` - Main orchestrator
- `src/lib/repo-introspection/analyzers/*` - Individual analyzers
- `src/app/api/github/repositories/[owner]/[repo]/introspect/route.ts` - API endpoint
