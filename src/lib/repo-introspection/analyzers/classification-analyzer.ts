/**
 * ============================================================================
 * SERVICE VS LIBRARY CLASSIFICATION ANALYZER
 * ============================================================================
 *
 * @file src/lib/repo-introspection/analyzers/classification-analyzer.ts
 * @module classification-analyzer
 *
 * PURPOSE:
 * Classifies repository as service (runs as server/app) or library (imported by others).
 *
 * ============================================================================
 */

import type { ProjectClassification, ProjectType } from '../types';

/**
 * Service indicator patterns.
 */
const SERVICE_INDICATORS = {
  serverStartup: [
    /next\.config/,
    /express/,
    /fastify/,
    /koa/,
    /server\.(js|ts)/,
    /app\.(js|ts)/,
    /index\.(js|ts)/,
    /main\.(js|ts)/,
    /start\.(js|ts)/,
  ],
  apiRoutes: [/app\/api\//, /pages\/api\//, /routes\//, /api\/.*\.(js|ts)/],
  deploymentConfig: [
    /Dockerfile/,
    /docker-compose/,
    /\.github\/workflows/,
    /vercel\.json/,
    /netlify\.toml/,
    /apphosting\.yaml/,
    /kubernetes/,
    /k8s/,
    /\.platform/,
  ],
  envConfig: [/\.env/, /\.env\.example/, /\.env\.local/, /config\.(js|ts|json)/, /environment/],
  database: [
    /database/,
    /db\.(js|ts)/,
    /prisma/,
    /mongoose/,
    /sequelize/,
    /typeorm/,
    /firebase/,
    /supabase/,
  ],
  auth: [/auth/, /next-auth/, /passport/, /jwt/, /oauth/, /login/, /session/],
  webFramework: [/next\.config/, /react/, /vue/, /angular/, /svelte/],
};

/**
 * Library indicator patterns.
 */
const LIBRARY_INDICATORS = {
  exports: [/export\s+(function|class|const|let|var|default)/, /module\.exports/, /exports\./],
  packageExports: [/"main":/, /"module":/, /"exports":/, /"types":/],
  noServerCode: true, // Will be checked by absence of service indicators
  isInstallable: [/package\.json/, /setup\.py/, /Cargo\.toml/],
  typeDefinitions: [/\.d\.ts$/, /types\//, /@types\//],
};

/**
 * Classify project as service or library.
 *
 * @param fileTree - Array of file paths
 * @param fileContents - Map of file paths to their contents
 * @returns Project classification
 */
export function classifyProject(
  fileTree: string[],
  fileContents: Map<string, string>
): ProjectClassification {
  const serviceIndicators = {
    hasServerStartup: false,
    hasApiRoutes: false,
    hasDeploymentConfig: false,
    hasEnvConfig: false,
    hasDatabase: false,
    hasAuth: false,
    hasWebFramework: false,
  };

  const libraryIndicators = {
    hasExports: false,
    hasPackageExports: false,
    noServerCode: true,
    isInstallable: false,
    hasTypeDefinitions: false,
  };

  const frameworks: string[] = [];
  const deploymentTargets: string[] = [];
  const reasoning: string[] = [];

  // Check service indicators
  for (const file of fileTree) {
    // Server startup
    if (SERVICE_INDICATORS.serverStartup.some((pattern) => pattern.test(file))) {
      serviceIndicators.hasServerStartup = true;
      reasoning.push(`Found server startup code: ${file}`);
    }

    // API routes
    if (SERVICE_INDICATORS.apiRoutes.some((pattern) => pattern.test(file))) {
      serviceIndicators.hasApiRoutes = true;
      reasoning.push(`Found API routes: ${file}`);
    }

    // Deployment config
    if (SERVICE_INDICATORS.deploymentConfig.some((pattern) => pattern.test(file))) {
      serviceIndicators.hasDeploymentConfig = true;
      const target = detectDeploymentTarget(file);
      if (target) {
        deploymentTargets.push(target);
      }
      reasoning.push(`Found deployment config: ${file}`);
    }

    // Environment config
    if (SERVICE_INDICATORS.envConfig.some((pattern) => pattern.test(file))) {
      serviceIndicators.hasEnvConfig = true;
    }

    // Database
    if (SERVICE_INDICATORS.database.some((pattern) => pattern.test(file))) {
      serviceIndicators.hasDatabase = true;
      reasoning.push(`Found database code: ${file}`);
    }

    // Auth
    if (SERVICE_INDICATORS.auth.some((pattern) => pattern.test(file))) {
      serviceIndicators.hasAuth = true;
      reasoning.push(`Found authentication code: ${file}`);
    }

    // Web framework
    if (SERVICE_INDICATORS.webFramework.some((pattern) => pattern.test(file))) {
      serviceIndicators.hasWebFramework = true;
      const framework = detectFramework(file);
      if (framework) {
        frameworks.push(framework);
      }
    }
  }

  // Check library indicators
  const packageJson = fileContents.get('package.json');
  if (packageJson) {
    libraryIndicators.isInstallable = true;

    try {
      const pkg = JSON.parse(packageJson);

      // Check for package exports
      if (pkg.main || pkg.module || pkg.exports || pkg.types) {
        libraryIndicators.hasPackageExports = true;
        reasoning.push('Has package.json exports (main/module/exports/types)');
      }

      // Check for type definitions
      if (pkg.types || pkg.typings) {
        libraryIndicators.hasTypeDefinitions = true;
      }
    } catch {
      // Invalid JSON
    }
  }

  // Check source files for exports
  for (const [file, content] of fileContents.entries()) {
    if (
      file.endsWith('.ts') ||
      file.endsWith('.js') ||
      file.endsWith('.tsx') ||
      file.endsWith('.jsx')
    ) {
      if (LIBRARY_INDICATORS.exports.some((pattern) => pattern.test(content))) {
        libraryIndicators.hasExports = true;
        break;
      }
    }
  }

  // Determine if no server code (absence of service indicators)
  libraryIndicators.noServerCode = !(
    serviceIndicators.hasServerStartup ||
    serviceIndicators.hasApiRoutes ||
    serviceIndicators.hasWebFramework
  );

  // Calculate confidence and determine type
  const serviceScore = Object.values(serviceIndicators).filter(Boolean).length;
  const libraryScore = Object.values(libraryIndicators).filter(Boolean).length;

  let type: ProjectType;
  let confidence: number;

  if (serviceScore > libraryScore && serviceScore >= 3) {
    type = 'service';
    confidence = Math.min(100, 50 + serviceScore * 10);
    reasoning.push(`Classified as service (score: ${serviceScore} service indicators)`);
  } else if (libraryScore > serviceScore && libraryScore >= 2) {
    type = 'library';
    confidence = Math.min(100, 50 + libraryScore * 10);
    reasoning.push(`Classified as library (score: ${libraryScore} library indicators)`);
  } else if (serviceScore > 0 && libraryScore > 0) {
    type = 'hybrid';
    confidence = 60;
    reasoning.push('Classified as hybrid (has both service and library characteristics)');
  } else {
    type = 'unknown';
    confidence = 30;
    reasoning.push('Unable to determine type (insufficient indicators)');
  }

  return {
    type,
    indicators: {
      serviceIndicators,
      libraryIndicators,
      confidence,
      reasoning,
    },
    frameworks: [...new Set(frameworks)],
    deploymentTargets: deploymentTargets.length > 0 ? [...new Set(deploymentTargets)] : undefined,
  };
}

/**
 * Detect deployment target from file path.
 *
 * @param filePath - File path
 * @returns Deployment target name or undefined
 */
function detectDeploymentTarget(filePath: string): string | undefined {
  if (filePath.includes('vercel')) return 'Vercel';
  if (filePath.includes('netlify')) return 'Netlify';
  if (filePath.includes('github/workflows')) return 'GitHub Actions';
  if (filePath.includes('docker')) return 'Docker';
  if (filePath.includes('kubernetes') || filePath.includes('k8s')) return 'Kubernetes';
  if (filePath.includes('apphosting')) return 'Firebase App Hosting';
  return undefined;
}

/**
 * Detect framework from file path.
 *
 * @param filePath - File path
 * @returns Framework name or undefined
 */
function detectFramework(filePath: string): string | undefined {
  if (filePath.includes('next.config')) return 'Next.js';
  if (filePath.includes('react')) return 'React';
  if (filePath.includes('vue')) return 'Vue';
  if (filePath.includes('angular')) return 'Angular';
  if (filePath.includes('express')) return 'Express';
  if (filePath.includes('fastify')) return 'Fastify';
  if (filePath.includes('koa')) return 'Koa';
  return undefined;
}
