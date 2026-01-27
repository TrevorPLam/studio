#!/usr/bin/env node
/**
 * Add Governance Comments to Codebase
 *
 * This script adds constitution, principles, and best practices comments
 * throughout the codebase in strategic locations:
 * - Below metaheaders (after JSDoc)
 * - At the end of code files
 * - In index files
 *
 * Usage: node scripts/add-governance-comments.mjs [--dry-run]
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, "..");

const DRY_RUN = process.argv.includes("--dry-run");

// Governance snippets
const GOVERNANCE_SNIPPETS = {
  // For files with metaheaders (after JSDoc)
  afterMetaheader: `/**
 * Governance & Best Practices
 * 
 * Constitution (Article 2): Verifiable over Persuasive
 * - All changes must include verification evidence
 * - Proof beats persuasion - show test results, not assumptions
 * 
 * Constitution (Article 6): Safety Before Speed
 * - Security, data integrity, and user safety take priority
 * - For risky changes: STOP → ASK (HITL) → VERIFY → THEN PROCEED
 * 
 * Principles:
 * - Evidence Over Vibes (P6): Cite filepaths, show output, reference docs
 * - Assumptions Must Be Declared (P9): Document all assumptions explicitly
 * - Rollback Thinking (P12): Consider how to undo changes
 * - Respect Boundaries by Default (P13): Follow architectural boundaries
 * 
 * Best Practices:
 * - Use existing patterns from similar files
 * - TypeScript strict mode (no \`any\` without justification)
 * - Validate inputs with Zod schemas (server) or TypeScript (client)
 * - Test user flows, not implementation details
 * 
 * See: .repo/policy/constitution.json for full governance rules
 */`,

  // For end of code files
  endOfFile: `
// ============================================================================
// Governance Notes
// ============================================================================
// 
// Constitution (Article 5): Strict Traceability
// - Every change must be traceable to a task and include verification
// - Completed tasks must be archived
// 
// Principles:
// - Make It Shippable (P4): Changes should be complete and testable
// - Don't Break Surprises (P5): Preserve existing behavior unless intentional
// - Docs Age With Code (P19): Update documentation when code changes
// 
// Best Practices:
// - Follow existing patterns in this codebase
// - Use TypeScript strict mode
// - Include error handling and edge cases
// - Document complex logic with inline comments
// 
// See: .repo/policy/constitution.json
`,

  // For index files (TypeScript/JavaScript)
  indexFile: `/**
 * Governance & Best Practices
 * 
 * This index file exports public APIs following repository boundaries.
 * 
 * Constitution (Article 4): Incremental Delivery
 * - Export only what's needed, keep APIs small and focused
 * - Each export should be independently testable
 * 
 * Principles:
 * - Respect Boundaries by Default (P13): Follow import direction rules
 * - Consistency Beats Novelty (P15): Match existing index patterns
 * - Naming Matters (P21): Use clear, descriptive export names
 * 
 * Best Practices:
 * - Export types, functions, and components that are part of public API
 * - Re-export from subdirectories to provide clean import paths
 * - Group related exports logically
 * - Document complex exports with JSDoc
 * 
 * See: .repo/policy/BOUNDARIES.md for import rules
 * See: .repo/policy/constitution.json for governance
 */`,

  // For markdown INDEX files
  markdownIndex: `
---

## Governance & Best Practices

**Constitution (Article 8): HITL for External Systems**
- Changes to external integrations, credentials, or production systems require human approval

**Principles:**
- **Read Repo First (P8)**: Check existing docs and code before making assumptions
- **Evidence Over Vibes (P6)**: Cite specific filepaths and show verification
- **Respect Boundaries by Default (P13)**: Follow architectural boundaries defined in \`.repo/policy/BOUNDARIES.md\`

**Best Practices:**
- Follow existing patterns in similar modules
- Update this index when adding new files
- Keep navigation clear and logical
- Link to related documentation

**See Also:**
- [\`.repo/policy/constitution.json\`](../../.repo/policy/constitution.json) - Full governance rules
- [\`.repo/policy/BOUNDARIES.md\`](../../.repo/policy/BOUNDARIES.md) - Architectural boundaries
- [\`docs/decisions/\`](../../docs/decisions/) - Architecture Decision Records
`,
};

/**
 * Check if file has a metaheader (JSDoc comment at start)
 */
function hasMetaheader(content) {
  return /^\/\*\*[\s\S]*?\*\//.test(content.trim());
}

/**
 * Check if file is an index file
 */
function isIndexFile(filepath) {
  const basename = filepath.split(/[/\\]/).pop();
  return (
    basename === "index.ts" ||
    basename === "index.tsx" ||
    basename === "index.js" ||
    basename === "index.jsx" ||
    basename === "INDEX.md"
  );
}

/**
 * Add governance comment after metaheader
 */
function addAfterMetaheader(content) {
  const metaheaderMatch = content.match(/^(\/\*\*[\s\S]*?\*\/)/);
  if (!metaheaderMatch) return content;

  const metaheader = metaheaderMatch[1];
  const rest = content.slice(metaheader.length);

  // Check if governance comment already exists
  if (content.includes("Governance & Best Practices")) {
    return content;
  }

  return metaheader + "\n\n" + GOVERNANCE_SNIPPETS.afterMetaheader + rest;
}

/**
 * Add governance comment at end of file
 */
function addEndOfFile(content, filepath) {
  // Skip if already has governance comment
  if (
    content.includes("Governance Notes") ||
    content.includes("Constitution (Article")
  ) {
    return content;
  }

  // Skip index files (they get special treatment)
  if (isIndexFile(filepath)) {
    return content;
  }

  // Skip if file is too short (likely a simple export)
  if (content.split("\n").length < 10) {
    return content;
  }

  // Add at end, before any trailing newlines
  const trimmed = content.trimEnd();
  return trimmed + "\n" + GOVERNANCE_SNIPPETS.endOfFile;
}

/**
 * Add governance comment to index file
 */
function addToIndexFile(content, filepath) {
  // Check if already has governance section
  if (content.includes("Governance & Best Practices")) {
    return content;
  }

  if (filepath.endsWith(".md")) {
    // Markdown index file
    return content.trimEnd() + "\n" + GOVERNANCE_SNIPPETS.markdownIndex;
  } else {
    // TypeScript/JavaScript index file
    // Add after any existing comments, before exports
    const exportMatch = content.match(/^(.*?)(export\s)/s);
    if (exportMatch) {
      const beforeExports = exportMatch[1];
      const exports = content.slice(
        exportMatch[0].length - exportMatch[2].length,
      );

      // Check if there's already a comment
      if (beforeExports.trim().endsWith("*/")) {
        return (
          beforeExports +
          "\n\n" +
          GOVERNANCE_SNIPPETS.indexFile +
          "\n" +
          exports
        );
      } else {
        return GOVERNANCE_SNIPPETS.indexFile + "\n" + content;
      }
    }

    // No exports found, add at start
    return GOVERNANCE_SNIPPETS.indexFile + "\n" + content;
  }
}

/**
 * Process a single file
 */
function processFile(filepath) {
  if (!existsSync(filepath)) {
    console.warn(`File not found: ${filepath}`);
    return false;
  }

  let content = readFileSync(filepath, "utf-8");
  const originalContent = content;

  // Process based on file type
  if (isIndexFile(filepath)) {
    content = addToIndexFile(content, filepath);
  } else {
    // Regular code file
    if (hasMetaheader(content)) {
      content = addAfterMetaheader(content);
    }
    content = addEndOfFile(content, filepath);
  }

  if (content !== originalContent) {
    if (DRY_RUN) {
      console.log(`[DRY RUN] Would update: ${filepath}`);
    } else {
      writeFileSync(filepath, content, "utf-8");
      console.log(`Updated: ${filepath}`);
    }
    return true;
  }

  return false;
}

// Main execution
const filesToProcess = [
  // Key entry points
  join(rootDir, "apps/mobile/index.js"),
  join(rootDir, "apps/api/index.ts"),

  // Package index files
  join(rootDir, "packages/contracts/index.ts"),
  join(rootDir, "packages/design-system/index.ts"),
  join(rootDir, "packages/platform/index.ts"),

  // Key middleware/utils
  join(rootDir, "apps/api/middleware/errorHandler.ts"),
  join(rootDir, "apps/api/utils/logger.ts"),

  // Markdown indexes
  join(rootDir, "apps/INDEX.md"),
  join(rootDir, "packages/INDEX.md"),
];

console.log(
  DRY_RUN
    ? "DRY RUN MODE - No files will be modified\n"
    : "Adding governance comments...\n",
);

let updatedCount = 0;
for (const file of filesToProcess) {
  if (processFile(file)) {
    updatedCount++;
  }
}

console.log(
  `\n${DRY_RUN ? "Would update" : "Updated"} ${updatedCount} file(s).`,
);
