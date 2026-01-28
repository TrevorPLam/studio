/**
 * ============================================================================
 * REPOSITORY INTROSPECTION MODULE
 * ============================================================================
 *
 * @file src/lib/repo-introspection/index.ts
 * @module repo-introspection
 *
 * PURPOSE:
 * Main export file for repository introspection functionality.
 *
 * ============================================================================
 */

export * from './types';
export { introspectRepository, getRepositorySummary } from './introspector';
export { detectLanguages } from './analyzers/language-detector';
export { analyzeDependencies } from './analyzers/dependency-analyzer';
export { analyzeEntryPoints } from './analyzers/entry-points-analyzer';
export { analyzeTestLocations } from './analyzers/test-locations-analyzer';
export { classifyProject } from './analyzers/classification-analyzer';
