/**
 * ============================================================================
 * TEST LOCATIONS ANALYZER
 * ============================================================================
 *
 * @file src/lib/repo-introspection/analyzers/test-locations-analyzer.ts
 * @module test-locations-analyzer
 *
 * PURPOSE:
 * Identifies test files, test frameworks, and test organization patterns.
 *
 * ============================================================================
 */

import type { TestFile, TestLocations } from '../types';

/**
 * Test framework detection patterns.
 */
const TEST_FRAMEWORK_PATTERNS = {
  Jest: [
    /jest\.config\.(js|ts|json)/,
    /jest\.setup\.(js|ts)/,
    /\.test\.(js|ts|jsx|tsx)/,
    /\.spec\.(js|ts|jsx|tsx)/,
  ],
  Vitest: [/vitest\.config\.(js|ts)/, /vite\.config\.(js|ts)/],
  Mocha: [/mocha\.opts/, /\.test\.(js|ts)/],
  Pytest: [/pytest\.ini/, /conftest\.py/, /test_.*\.py/, /.*_test\.py/],
  JUnit: [/.*Test\.java/],
  'Go Test': [/.*_test\.go/],
};

/**
 * Test type detection patterns.
 */
const TEST_TYPE_PATTERNS = {
  unit: [/unit/, /test\/unit/, /__tests__\/unit/, /\.unit\.test\./, /\.unit\.spec\./],
  integration: [
    /integration/,
    /test\/integration/,
    /__tests__\/integration/,
    /\.integration\.test\./,
    /\.integration\.spec\./,
  ],
  e2e: [
    /e2e/,
    /end-to-end/,
    /test\/e2e/,
    /\.e2e\.test\./,
    /\.e2e\.spec\./,
    /cypress/,
    /playwright/,
    /puppeteer/,
  ],
  security: [/security/, /test\/security/, /\.security\.test\./, /\.security\.spec\./],
  performance: [
    /performance/,
    /perf/,
    /test\/performance/,
    /\.performance\.test\./,
    /\.perf\.test\./,
  ],
};

/**
 * Analyze test locations.
 *
 * @param fileTree - Array of file paths
 * @param fileContents - Map of file paths to their contents
 * @returns Test locations summary
 */
export function analyzeTestLocations(
  fileTree: string[],
  fileContents: Map<string, string>
): TestLocations {
  const testFiles: TestFile[] = [];
  const testDirectories: string[] = [];
  let detectedFramework = 'Unknown';

  // Detect test framework
  for (const [framework, patterns] of Object.entries(TEST_FRAMEWORK_PATTERNS)) {
    const matches = fileTree.filter((file) => patterns.some((pattern) => pattern.test(file)));

    if (matches.length > 0) {
      detectedFramework = framework;
      break;
    }
  }

  // Find test directories
  const uniqueDirs = new Set<string>();
  for (const file of fileTree) {
    if (file.includes('test') || file.includes('spec') || file.includes('__tests__')) {
      const dir = file.substring(0, file.lastIndexOf('/'));
      if (dir) {
        uniqueDirs.add(dir);
      }
    }
  }
  testDirectories.push(...Array.from(uniqueDirs));

  // Find test files
  for (const file of fileTree) {
    const testType = detectTestType(file);
    const framework = detectTestFramework(file, detectedFramework);

    if (testType || framework !== 'Unknown' || isTestFile(file)) {
      // Try to find related source file
      const sourceFile = findSourceFile(file, fileTree);

      testFiles.push({
        path: file,
        type: testType || 'other',
        framework,
        sourceFile,
      });
    }
  }

  // Group by type
  const byType = {
    unit: testFiles.filter((t) => t.type === 'unit'),
    integration: testFiles.filter((t) => t.type === 'integration'),
    e2e: testFiles.filter((t) => t.type === 'e2e'),
    security: testFiles.filter((t) => t.type === 'security'),
    performance: testFiles.filter((t) => t.type === 'performance'),
    other: testFiles.filter((t) => t.type === 'other'),
  };

  // Detect coverage configuration
  const coverageConfig = detectCoverageConfig(fileContents);

  return {
    testFiles,
    byType,
    framework: detectedFramework,
    testDirectories,
    totalTests: testFiles.length,
    coverageConfig,
  };
}

/**
 * Detect test type from file path.
 *
 * @param filePath - File path
 * @returns Test type or undefined
 */
function detectTestType(filePath: string): TestFile['type'] | undefined {
  for (const [type, patterns] of Object.entries(TEST_TYPE_PATTERNS)) {
    if (patterns.some((pattern) => pattern.test(filePath))) {
      return type as TestFile['type'];
    }
  }
  return undefined;
}

/**
 * Detect test framework from file path.
 *
 * @param filePath - File path
 * @param defaultFramework - Default framework if not detected
 * @returns Framework name
 */
function detectTestFramework(filePath: string, defaultFramework: string): string {
  for (const [framework, patterns] of Object.entries(TEST_FRAMEWORK_PATTERNS)) {
    if (patterns.some((pattern) => pattern.test(filePath))) {
      return framework;
    }
  }
  return defaultFramework;
}

/**
 * Check if file is a test file based on naming patterns.
 *
 * @param filePath - File path
 * @returns true if likely a test file
 */
function isTestFile(filePath: string): boolean {
  const testPatterns = [
    /\.test\.(js|ts|jsx|tsx|py|java|go)$/,
    /\.spec\.(js|ts|jsx|tsx|py|java|go)$/,
    /test_.*\.(js|ts|jsx|tsx|py|java|go)$/,
    /.*_test\.(js|ts|jsx|tsx|py|java|go)$/,
    /.*Test\.(js|ts|jsx|tsx|java)$/,
    /.*Spec\.(js|ts|jsx|tsx)$/,
  ];

  return testPatterns.some((pattern) => pattern.test(filePath));
}

/**
 * Find related source file for a test file.
 *
 * @param testFile - Test file path
 * @param fileTree - All files in repository
 * @returns Source file path or undefined
 */
function findSourceFile(testFile: string, fileTree: string[]): string | undefined {
  // Remove test directory and test suffix
  const sourcePath = testFile
    .replace(/\/test\//, '/')
    .replace(/\/__tests__\//, '/')
    .replace(/\.test\./, '.')
    .replace(/\.spec\./, '.')
    .replace(/_test\./, '.')
    .replace(/Test\./, '.');

  // Try to find matching source file
  return fileTree.find(
    (file) =>
      file === sourcePath ||
      file === sourcePath.replace(/\.ts$/, '.js') ||
      file === sourcePath.replace(/\.tsx$/, '.jsx')
  );
}

/**
 * Detect coverage configuration from config files.
 *
 * @param fileContents - Map of file paths to contents
 * @returns Coverage configuration or undefined
 */
function detectCoverageConfig(
  fileContents: Map<string, string>
): TestLocations['coverageConfig'] | undefined {
  // Check jest.config.js/ts
  const jestConfig =
    fileContents.get('jest.config.js') ||
    fileContents.get('jest.config.ts') ||
    fileContents.get('jest.config.json');

  if (jestConfig) {
    try {
      const config = typeof jestConfig === 'string' ? JSON.parse(jestConfig) : jestConfig;
      if (config.coverageThreshold) {
        return {
          tool: 'jest',
          thresholds: config.coverageThreshold,
        };
      }
    } catch {
      // Not JSON or invalid
    }
  }

  // Check package.json for coverage config
  const packageJson = fileContents.get('package.json');
  if (packageJson) {
    try {
      const pkg = JSON.parse(packageJson);
      if (pkg.jest?.coverageThreshold) {
        return {
          tool: 'jest',
          thresholds: pkg.jest.coverageThreshold,
        };
      }
    } catch {
      // Invalid JSON
    }
  }

  return undefined;
}
