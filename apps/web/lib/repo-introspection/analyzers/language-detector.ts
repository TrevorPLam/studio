/**
 * ============================================================================
 * LANGUAGE DETECTION ANALYZER
 * ============================================================================
 *
 * @file src/lib/repo-introspection/analyzers/language-detector.ts
 * @module language-detector
 *
 * PURPOSE:
 * Detects programming languages used in a repository by analyzing file extensions
 * and content patterns.
 *
 * ============================================================================
 */

import type { DetectedLanguage, LanguageDetection } from '../types';

/**
 * Language mapping: extension -> language name.
 */
const LANGUAGE_MAP: Record<string, string> = {
  // TypeScript/JavaScript
  '.ts': 'TypeScript',
  '.tsx': 'TypeScript',
  '.js': 'JavaScript',
  '.jsx': 'JavaScript',
  '.mjs': 'JavaScript',
  '.cjs': 'JavaScript',

  // Python
  '.py': 'Python',
  '.pyw': 'Python',
  '.pyi': 'Python',

  // Java
  '.java': 'Java',
  '.kt': 'Kotlin',
  '.scala': 'Scala',

  // C/C++
  '.c': 'C',
  '.cpp': 'C++',
  '.cc': 'C++',
  '.cxx': 'C++',
  '.h': 'C/C++',
  '.hpp': 'C++',

  // Go
  '.go': 'Go',

  // Rust
  '.rs': 'Rust',

  // Ruby
  '.rb': 'Ruby',
  '.rake': 'Ruby',

  // PHP
  '.php': 'PHP',

  // Swift
  '.swift': 'Swift',

  // C#
  '.cs': 'C#',

  // Shell
  '.sh': 'Shell',
  '.bash': 'Bash',
  '.zsh': 'Zsh',
  '.fish': 'Fish',

  // Configuration/Markup
  '.json': 'JSON',
  '.yaml': 'YAML',
  '.yml': 'YAML',
  '.toml': 'TOML',
  '.xml': 'XML',
  '.html': 'HTML',
  '.css': 'CSS',
  '.scss': 'SCSS',
  '.sass': 'Sass',
  '.less': 'Less',
  '.md': 'Markdown',
  '.markdown': 'Markdown',

  // SQL
  '.sql': 'SQL',

  // Docker
  '.dockerfile': 'Dockerfile',
  '.dockerignore': 'Dockerfile',

  // Other
  '.r': 'R',
  '.m': 'MATLAB',
  '.lua': 'Lua',
  '.pl': 'Perl',
  '.ps1': 'PowerShell',
  '.psm1': 'PowerShell',
  '.bat': 'Batch',
  '.cmd': 'Batch',
};

/**
 * File extensions to ignore (not considered code).
 */
const IGNORED_EXTENSIONS = new Set([
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.svg',
  '.ico',
  '.webp', // Images
  '.woff',
  '.woff2',
  '.ttf',
  '.otf',
  '.eot', // Fonts
  '.pdf',
  '.zip',
  '.tar',
  '.gz',
  '.7z', // Archives
  '.mp4',
  '.mp3',
  '.wav',
  '.avi', // Media
  '.exe',
  '.dll',
  '.so',
  '.dylib', // Binaries
  '.log',
  '.lock', // Generated files
]);

/**
 * Directories to ignore.
 */
const IGNORED_DIRECTORIES = new Set([
  'node_modules',
  '.git',
  '.next',
  'dist',
  'build',
  '.cache',
  'coverage',
  '.nyc_output',
  '.vscode',
  '.idea',
  '__pycache__',
  '.pytest_cache',
  'target', // Rust/Java
  'venv',
  'env',
  '.venv',
]);

/**
 * Detect languages from file tree.
 *
 * @param fileTree - Array of file paths from repository
 * @returns Language detection results
 */
export function detectLanguages(fileTree: string[]): LanguageDetection {
  const languageStats = new Map<
    string,
    {
      extension: string;
      fileCount: number;
      totalBytes: number;
      files: string[];
    }
  >();

  let totalFiles = 0;
  let totalBytes = 0;

  // Process each file
  for (const filePath of fileTree) {
    // Skip ignored directories
    if (
      Array.from(IGNORED_DIRECTORIES).some(
        (dir: string) => filePath.includes(`/${dir}/`) || filePath.startsWith(`${dir}/`)
      )
    ) {
      continue;
    }

    // Extract extension
    const extension = getExtension(filePath);

    // Skip if no extension or ignored
    if (!extension || IGNORED_EXTENSIONS.has(extension.toLowerCase())) {
      continue;
    }

    // Get language name
    const languageName = LANGUAGE_MAP[extension.toLowerCase()];
    if (!languageName) {
      continue; // Unknown language, skip
    }

    // Update stats
    const existing = languageStats.get(languageName) || {
      extension,
      fileCount: 0,
      totalBytes: 0,
      files: [] as string[],
    };

    existing.fileCount++;
    totalFiles++;

    // Estimate bytes (we don't have actual file sizes here, so we'll use file count as proxy)
    // In a real implementation, you'd fetch file sizes from GitHub API
    existing.totalBytes += 1000; // Placeholder: assume 1KB per file
    totalBytes += 1000;

    // Keep sample files (max 10)
    if (existing.files.length < 10) {
      existing.files.push(filePath);
    }

    languageStats.set(languageName, existing);
  }

  // Convert to DetectedLanguage array
  const languages: DetectedLanguage[] = Array.from(languageStats.entries())
    .map(([name, stats]) => ({
      name,
      extension: stats.extension,
      fileCount: stats.fileCount,
      totalBytes: stats.totalBytes,
      percentage: totalFiles > 0 ? (stats.fileCount / totalFiles) * 100 : 0,
      sampleFiles: stats.files,
    }))
    .sort((a, b) => b.fileCount - a.fileCount); // Sort by file count descending

  // Get primary language (highest percentage)
  const primary = languages[0] || {
    name: 'Unknown',
    extension: '',
    fileCount: 0,
    totalBytes: 0,
    percentage: 0,
    sampleFiles: [],
  };

  return {
    primary,
    languages,
    totalFiles,
    totalBytes,
  };
}

/**
 * Get file extension from path.
 *
 * @param filePath - File path
 * @returns File extension (with dot) or empty string
 */
function getExtension(filePath: string): string {
  const lastDot = filePath.lastIndexOf('.');
  const lastSlash = Math.max(filePath.lastIndexOf('/'), filePath.lastIndexOf('\\'));

  if (lastDot > lastSlash && lastDot !== -1) {
    return filePath.substring(lastDot).toLowerCase();
  }

  // Handle special cases (Dockerfile, Makefile, etc.)
  const filename = filePath.substring(lastSlash + 1).toLowerCase();
  if (filename === 'dockerfile' || filename.startsWith('dockerfile.')) {
    return '.dockerfile';
  }
  if (filename === 'makefile') {
    return '.makefile';
  }

  return '';
}
