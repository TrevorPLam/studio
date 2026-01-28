/**
 * ============================================================================
 * REPOSITORY INTROSPECTION TYPES
 * ============================================================================
 *
 * @file src/lib/repo-introspection/types.ts
 * @module repo-introspection-types
 *
 * PURPOSE:
 * Type definitions for repository metadata extraction and analysis.
 *
 * RELATED FILES:
 * - src/lib/repo-introspection/introspector.ts (Main orchestrator)
 * - src/lib/repo-introspection/analyzers/* (Individual analyzers)
 *
 * ============================================================================
 */

// ============================================================================
// SECTION: LANGUAGE DETECTION
// ============================================================================

/**
 * Detected programming language with statistics.
 */
export interface DetectedLanguage {
  /** Language name (e.g., "TypeScript", "JavaScript") */
  name: string;

  /** File extension (e.g., ".ts", ".js") */
  extension: string;

  /** Number of files in this language */
  fileCount: number;

  /** Total bytes of code in this language */
  totalBytes: number;

  /** Percentage of total codebase (by file count) */
  percentage: number;

  /** Sample file paths (up to 10) */
  sampleFiles: string[];
}

/**
 * Language detection results.
 */
export interface LanguageDetection {
  /** Primary language (highest percentage) */
  primary: DetectedLanguage;

  /** All detected languages, sorted by file count */
  languages: DetectedLanguage[];

  /** Total number of code files analyzed */
  totalFiles: number;

  /** Total bytes of code */
  totalBytes: number;
}

// ============================================================================
// SECTION: DEPENDENCY GRAPH
// ============================================================================

/**
 * Dependency information from package manager files.
 */
export interface DependencyInfo {
  /** Package name */
  name: string;

  /** Package version (semver) */
  version: string;

  /** Dependency type: direct, dev, peer, optional */
  type: 'direct' | 'dev' | 'peer' | 'optional' | 'transitive';

  /** Package manager source (npm, yarn, pnpm, pip, cargo, etc.) */
  source: string;
}

/**
 * Dependency graph summary.
 */
export interface DependencyGraph {
  /** Direct dependencies (explicitly declared) */
  direct: DependencyInfo[];

  /** Development dependencies */
  devDependencies: DependencyInfo[];

  /** Transitive dependencies (dependencies of dependencies) */
  transitive: DependencyInfo[];

  /** Package manager files found */
  packageManagers: {
    /** Package manager name (npm, yarn, pip, etc.) */
    name: string;

    /** Config file path (package.json, requirements.txt, etc.) */
    configFile: string;

    /** Lock file path if present */
    lockFile?: string;
  }[];

  /** Total dependency count (direct + transitive) */
  totalDependencies: number;

  /** Estimated bundle size impact (if applicable) */
  estimatedBundleSize?: {
    /** Size in bytes */
    bytes: number;

    /** Human-readable size */
    humanReadable: string;
  };
}

// ============================================================================
// SECTION: ENTRY POINTS & EXECUTABLES
// ============================================================================

/**
 * Application entry point.
 */
export interface EntryPoint {
  /** Entry point type */
  type: 'main' | 'api-route' | 'page' | 'cli' | 'script' | 'config';

  /** File path */
  path: string;

  /** Framework or runtime (Next.js, Express, etc.) */
  framework?: string;

  /** HTTP method (for API routes) */
  method?: string;

  /** Route path (for API routes/pages) */
  route?: string;
}

/**
 * Executable script or command.
 */
export interface Executable {
  /** Script name (from package.json scripts, etc.) */
  name: string;

  /** Command to execute */
  command: string;

  /** Script description (if available) */
  description?: string;

  /** Script type */
  type: 'npm-script' | 'binary' | 'shell' | 'python' | 'other';
}

/**
 * Entry points and executables summary.
 */
export interface EntryPointsSummary {
  /** Main application entry points */
  entryPoints: EntryPoint[];

  /** Executable scripts and commands */
  executables: Executable[];

  /** Primary entry point (main application file) */
  primaryEntryPoint?: EntryPoint;

  /** Framework detected (Next.js, React, etc.) */
  framework?: string;
}

// ============================================================================
// SECTION: TEST LOCATIONS
// ============================================================================

/**
 * Test file information.
 */
export interface TestFile {
  /** Test file path */
  path: string;

  /** Test type */
  type: 'unit' | 'integration' | 'e2e' | 'security' | 'performance' | 'other';

  /** Test framework (Jest, Vitest, Mocha, etc.) */
  framework: string;

  /** Related source file (if detectable) */
  sourceFile?: string;

  /** Test suite name (if detectable) */
  suiteName?: string;
}

/**
 * Test locations summary.
 */
export interface TestLocations {
  /** All test files found */
  testFiles: TestFile[];

  /** Test files grouped by type */
  byType: {
    unit: TestFile[];
    integration: TestFile[];
    e2e: TestFile[];
    security: TestFile[];
    performance: TestFile[];
    other: TestFile[];
  };

  /** Test framework detected */
  framework: string;

  /** Test directory patterns found */
  testDirectories: string[];

  /** Total test file count */
  totalTests: number;

  /** Test coverage configuration (if present) */
  coverageConfig?: {
    /** Coverage tool (jest, nyc, etc.) */
    tool: string;

    /** Coverage thresholds (if configured) */
    thresholds?: {
      lines?: number;
      functions?: number;
      branches?: number;
      statements?: number;
    };
  };
}

// ============================================================================
// SECTION: SERVICE VS LIBRARY CLASSIFICATION
// ============================================================================

/**
 * Classification result: service or library.
 */
export type ProjectType = 'service' | 'library' | 'hybrid' | 'unknown';

/**
 * Classification indicators.
 */
export interface ClassificationIndicators {
  /** Service indicators found */
  serviceIndicators: {
    /** Has server startup code */
    hasServerStartup: boolean;

    /** Has API routes/endpoints */
    hasApiRoutes: boolean;

    /** Has deployment configuration */
    hasDeploymentConfig: boolean;

    /** Has environment variable configuration */
    hasEnvConfig: boolean;

    /** Has database connections */
    hasDatabase: boolean;

    /** Has authentication/authorization */
    hasAuth: boolean;

    /** Has web framework */
    hasWebFramework: boolean;
  };

  /** Library indicators found */
  libraryIndicators: {
    /** Exports functions/classes for import */
    hasExports: boolean;

    /** Has main/module/exports in package.json */
    hasPackageExports: boolean;

    /** No server startup code */
    noServerCode: boolean;

    /** Designed to be installed by others */
    isInstallable: boolean;

    /** Has TypeScript definitions */
    hasTypeDefinitions: boolean;
  };

  /** Confidence score (0-100) */
  confidence: number;

  /** Reasoning for classification */
  reasoning: string[];
}

/**
 * Service vs library classification result.
 */
export interface ProjectClassification {
  /** Project type */
  type: ProjectType;

  /** Classification indicators */
  indicators: ClassificationIndicators;

  /** Detected frameworks and tools */
  frameworks: string[];

  /** Deployment targets (if service) */
  deploymentTargets?: string[];
}

// ============================================================================
// SECTION: COMPLETE REPOSITORY METADATA
// ============================================================================

/**
 * Complete repository introspection metadata.
 */
export interface RepositoryMetadata {
  /** Repository identifier */
  repository: {
    owner: string;
    name: string;
    defaultBranch: string;
  };

  /** Language detection results */
  languages: LanguageDetection;

  /** Dependency graph summary */
  dependencies: DependencyGraph;

  /** Entry points and executables */
  entryPoints: EntryPointsSummary;

  /** Test locations */
  tests: TestLocations;

  /** Service vs library classification */
  classification: ProjectClassification;

  /** Metadata generation timestamp */
  generatedAt: string;

  /** Analysis version */
  version: string;
}

/**
 * Options for repository introspection.
 */
export interface IntrospectionOptions {
  /** Maximum files to analyze (for performance) */
  maxFiles?: number;

  /** Maximum depth for directory traversal */
  maxDepth?: number;

  /** Include transitive dependencies (may be slow) */
  includeTransitiveDeps?: boolean;

  /** Branch/ref to analyze (default: default branch) */
  ref?: string;

  /** Timeout in milliseconds */
  timeout?: number;
}
