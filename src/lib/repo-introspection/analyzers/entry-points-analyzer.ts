/**
 * ============================================================================
 * ENTRY POINTS & EXECUTABLES ANALYZER
 * ============================================================================
 *
 * @file src/lib/repo-introspection/analyzers/entry-points-analyzer.ts
 * @module entry-points-analyzer
 *
 * PURPOSE:
 * Identifies application entry points, API routes, and executable scripts.
 *
 * ============================================================================
 */

import type { EntryPoint, EntryPointsSummary, Executable } from '../types';

/**
 * Framework detection patterns.
 */
const FRAMEWORK_PATTERNS = {
  'Next.js': [
    /next\.config\.(js|ts|mjs)/,
    /app\/.*\/page\.(tsx|jsx|ts|js)/,
    /pages\/.*\.(tsx|jsx|ts|js)/,
    /app\/api\/.*\/route\.(ts|js)/,
  ],
  React: [/src\/.*\.(tsx|jsx)/, /react/],
  Express: [/express/, /server\.(js|ts)/, /app\.(js|ts)/, /index\.(js|ts)/],
  Vue: [/vue\.config\.(js|ts)/, /\.vue$/],
  Angular: [/angular\.json/, /\.component\.(ts|js)/],
};

/**
 * Analyze entry points and executables.
 *
 * @param fileTree - Array of file paths
 * @param fileContents - Map of file paths to their contents
 * @returns Entry points and executables summary
 */
export function analyzeEntryPoints(
  fileTree: string[],
  fileContents: Map<string, string>
): EntryPointsSummary {
  const entryPoints: EntryPoint[] = [];
  const executables: Executable[] = [];
  let detectedFramework: string | undefined;

  // Analyze package.json for scripts and main entry
  const packageJsonContent = fileContents.get('package.json');
  if (packageJsonContent) {
    try {
      const pkg = JSON.parse(packageJsonContent);

      // Extract npm scripts
      if (pkg.scripts) {
        for (const [name, command] of Object.entries(pkg.scripts)) {
          executables.push({
            name,
            command: String(command),
            type: 'npm-script',
            description: getScriptDescription(name),
          });
        }
      }

      // Check for main entry point
      if (pkg.main) {
        entryPoints.push({
          type: 'main',
          path: pkg.main,
          framework: detectedFramework,
        });
      }

      // Check for module entry point (ESM)
      if (pkg.module) {
        entryPoints.push({
          type: 'main',
          path: pkg.module,
          framework: detectedFramework,
        });
      }
    } catch {
      // Invalid JSON, skip
    }
  }

  // Detect framework and find entry points
  for (const [framework, patterns] of Object.entries(FRAMEWORK_PATTERNS)) {
    const matches = fileTree.filter((file) => patterns.some((pattern) => pattern.test(file)));

    if (matches.length > 0 && !detectedFramework) {
      detectedFramework = framework;
    }
  }

  // Find Next.js App Router pages
  const nextAppPages = fileTree.filter((file) => /^app\/.*\/page\.(tsx|jsx|ts|js)$/.test(file));
  for (const page of nextAppPages) {
    const route = page.replace(/^app\//, '').replace(/\/page\.(tsx|jsx|ts|js)$/, '');
    entryPoints.push({
      type: 'page',
      path: page,
      framework: 'Next.js',
      route: route === 'page' ? '/' : `/${route}`,
    });
  }

  // Find Next.js API routes
  const nextApiRoutes = fileTree.filter((file) => /^app\/api\/.*\/route\.(ts|js)$/.test(file));
  for (const route of nextApiRoutes) {
    const apiRoute = route.replace(/^app\/api\//, '').replace(/\/route\.(ts|js)$/, '');
    entryPoints.push({
      type: 'api-route',
      path: route,
      framework: 'Next.js',
      route: `/api/${apiRoute}`,
      method: 'GET', // Default, would need to parse file to detect actual methods
    });
  }

  // Find Next.js Pages Router pages
  const nextPages = fileTree.filter(
    (file) =>
      /^pages\/.*\.(tsx|jsx|ts|js)$/.test(file) &&
      !file.includes('_app') &&
      !file.includes('_document')
  );
  for (const page of nextPages) {
    const route = page.replace(/^pages\//, '').replace(/\.(tsx|jsx|ts|js)$/, '');
    entryPoints.push({
      type: 'page',
      path: page,
      framework: 'Next.js',
      route: route === 'index' ? '/' : `/${route}`,
    });
  }

  // Find Express/Node.js entry points
  const expressEntryPoints = fileTree.filter(
    (file) =>
      /^(src\/|app\/|server\.|index\.)(js|ts|mjs)$/.test(file) &&
      !file.includes('test') &&
      !file.includes('spec')
  );
  for (const entry of expressEntryPoints) {
    entryPoints.push({
      type: 'main',
      path: entry,
      framework: detectedFramework || 'Node.js',
    });
  }

  // Find CLI scripts
  const cliScripts = fileTree.filter(
    (file) => /^(bin\/|scripts\/|cli\.|cli\/)/.test(file) && /\.(js|ts|py|sh)$/.test(file)
  );
  for (const script of cliScripts) {
    const ext = script.match(/\.(\w+)$/)?.[1];
    entryPoints.push({
      type: 'cli',
      path: script,
      framework: ext === 'py' ? 'Python' : ext === 'sh' ? 'Shell' : 'Node.js',
    });
  }

  // Find configuration files as entry points
  const configFiles = fileTree.filter((file) =>
    /^(next\.config|vite\.config|webpack\.config|rollup\.config|tsconfig|jest\.config)/.test(file)
  );
  for (const config of configFiles) {
    entryPoints.push({
      type: 'config',
      path: config,
    });
  }

  // Determine primary entry point
  const primaryEntryPoint =
    entryPoints.find((ep) => ep.type === 'main') ||
    entryPoints.find((ep) => ep.type === 'page') ||
    entryPoints[0];

  return {
    entryPoints,
    executables,
    primaryEntryPoint,
    framework: detectedFramework,
  };
}

/**
 * Get human-readable description for common npm scripts.
 *
 * @param scriptName - Script name
 * @returns Description or undefined
 */
function getScriptDescription(scriptName: string): string | undefined {
  const descriptions: Record<string, string> = {
    dev: 'Start development server',
    start: 'Start production server',
    build: 'Build for production',
    test: 'Run tests',
    lint: 'Run linter',
    typecheck: 'Run TypeScript type checker',
    format: 'Format code',
    coverage: 'Generate test coverage report',
  };

  return descriptions[scriptName];
}
