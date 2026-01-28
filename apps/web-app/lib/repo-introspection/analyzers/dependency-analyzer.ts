/**
 * ============================================================================
 * DEPENDENCY GRAPH ANALYZER
 * ============================================================================
 *
 * @file src/lib/repo-introspection/analyzers/dependency-analyzer.ts
 * @module dependency-analyzer
 *
 * PURPOSE:
 * Analyzes dependency graphs from package manager files (package.json, requirements.txt, etc.).
 *
 * ============================================================================
 */

import type { DependencyGraph, DependencyInfo } from '../types';

/**
 * Package manager configuration file patterns.
 */
interface PackageManagerConfig {
  name: string;
  configFile: string;
  lockFile?: string;
  parseFunction: (content: string) => {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
    peerDependencies?: Record<string, string>;
    optionalDependencies?: Record<string, string>;
  };
}

/**
 * Parse package.json content.
 */
function parsePackageJson(content: string) {
  try {
    const parsed = JSON.parse(content);
    return {
      dependencies: parsed.dependencies || {},
      devDependencies: parsed.devDependencies || {},
      peerDependencies: parsed.peerDependencies || {},
      optionalDependencies: parsed.optionalDependencies || {},
    };
  } catch {
    return {};
  }
}

/**
 * Parse requirements.txt content (Python).
 */
function parseRequirementsTxt(content: string) {
  const dependencies: Record<string, string> = {};
  const lines = content.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    // Parse format: package==version or package>=version, etc.
    const match = trimmed.match(/^([a-zA-Z0-9_-]+(?:\[[^\]]+\])?)([<>=!]+)?(.+)?$/);
    if (match) {
      const name = match[1].split('[')[0]; // Remove extras like "package[extra]"
      const version = match[3] || match[2] || '*';
      dependencies[name] = version;
    }
  }

  return { dependencies };
}

/**
 * Parse Cargo.toml content (Rust).
 */
function parseCargoToml(content: string) {
  const dependencies: Record<string, string> = {};

  // Simple TOML parsing (basic implementation)
  const depSection = content.match(/\[dependencies\]([\s\S]*?)(?=\[|$)/);
  if (depSection) {
    const lines = depSection[1].split('\n');
    for (const line of lines) {
      const match = line.match(/^(\w+)\s*=\s*"([^"]+)"|^(\w+)\s*=\s*\{/);
      if (match) {
        const name = match[1] || match[3];
        const version = match[2] || '*';
        dependencies[name] = version;
      }
    }
  }

  return { dependencies };
}

/**
 * Package manager configurations.
 */
const PACKAGE_MANAGERS: PackageManagerConfig[] = [
  {
    name: 'npm',
    configFile: 'package.json',
    lockFile: 'package-lock.json',
    parseFunction: parsePackageJson,
  },
  {
    name: 'yarn',
    configFile: 'package.json',
    lockFile: 'yarn.lock',
    parseFunction: parsePackageJson,
  },
  {
    name: 'pnpm',
    configFile: 'package.json',
    lockFile: 'pnpm-lock.yaml',
    parseFunction: parsePackageJson,
  },
  {
    name: 'pip',
    configFile: 'requirements.txt',
    lockFile: 'requirements.lock',
    parseFunction: parseRequirementsTxt,
  },
  {
    name: 'cargo',
    configFile: 'Cargo.toml',
    lockFile: 'Cargo.lock',
    parseFunction: parseCargoToml,
  },
];

/**
 * Analyze dependencies from repository files.
 *
 * @param fileContents - Map of file paths to their contents
 * @returns Dependency graph summary
 */
export function analyzeDependencies(fileContents: Map<string, string>): DependencyGraph {
  const direct: DependencyInfo[] = [];
  const devDependencies: DependencyInfo[] = [];
  const transitive: DependencyInfo[] = [];
  const packageManagers: DependencyGraph['packageManagers'] = [];

  // Find and parse package manager files
  for (const pm of PACKAGE_MANAGERS) {
    const configContent = fileContents.get(pm.configFile);
    if (!configContent) continue;

    // Check for lock file
    const lockContent = pm.lockFile ? fileContents.get(pm.lockFile) : undefined;
    const hasLockFile = !!lockContent;

    packageManagers.push({
      name: pm.name,
      configFile: pm.configFile,
      lockFile: hasLockFile ? pm.lockFile : undefined,
    });

    // Parse dependencies
    const parsed = pm.parseFunction(configContent);

    // Add direct dependencies
    if (parsed.dependencies) {
      for (const [name, version] of Object.entries(parsed.dependencies)) {
        direct.push({
          name,
          version,
          type: 'direct',
          source: pm.name,
        });
      }
    }

    // Add dev dependencies
    if (parsed.devDependencies) {
      for (const [name, version] of Object.entries(parsed.devDependencies)) {
        devDependencies.push({
          name,
          version,
          type: 'dev',
          source: pm.name,
        });
      }
    }

    // Add peer dependencies
    if (parsed.peerDependencies) {
      for (const [name, version] of Object.entries(parsed.peerDependencies)) {
        direct.push({
          name,
          version,
          type: 'peer',
          source: pm.name,
        });
      }
    }

    // Add optional dependencies
    if (parsed.optionalDependencies) {
      for (const [name, version] of Object.entries(parsed.optionalDependencies)) {
        direct.push({
          name,
          version,
          type: 'optional',
          source: pm.name,
        });
      }
    }

    // Note: Transitive dependencies would require parsing lock files
    // This is a simplified implementation
    // In production, you'd parse package-lock.json, yarn.lock, etc.
  }

  return {
    direct,
    devDependencies,
    transitive, // Would be populated by parsing lock files
    packageManagers,
    totalDependencies: direct.length + devDependencies.length + transitive.length,
  };
}
