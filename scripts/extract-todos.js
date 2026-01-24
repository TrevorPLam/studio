#!/usr/bin/env node

/**
 * ============================================================================
 * TODO EXTRACTION SCRIPT
 * ============================================================================
 * 
 * Extracts TODO/FIXME/XXX comments from staged files and either:
 * 1. Blocks commit until TODOs are manually added to TODO.md, OR
 * 2. Auto-extracts and appends TODOs to TODO.md
 * 
 * Usage:
 *   node scripts/extract-todos.js [--auto] [--block]
 * 
 * Default: --block (requires manual addition to TODO.md)
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const MODE = process.argv.includes('--auto') ? 'auto' : 'block';
const TODO_FILE = path.join(process.cwd(), 'TODO.md');
const EXCLUDE_PATTERNS = [
  /node_modules/,
  /\.next/,
  /\.git/,
  /dist/,
  /build/,
  /coverage/,
  /TODO\.md$/,
];

// ============================================================================
// SECTION: GIT HELPERS
// ============================================================================

/**
 * Get list of staged files.
 * 
 * @returns {string[]} Array of staged file paths
 */
function getStagedFiles() {
  try {
    const output = execSync('git diff --cached --name-only --diff-filter=ACM', {
      encoding: 'utf-8',
    });
    return output
      .split('\n')
      .filter((line) => line.trim())
      .filter((file) => {
        // Exclude files matching patterns
        return !EXCLUDE_PATTERNS.some((pattern) => pattern.test(file));
      });
  } catch (error) {
    console.error('Error getting staged files:', error.message);
    return [];
  }
}

/**
 * Get file content from git index (staged version).
 * 
 * @param {string} filePath - Path to file
 * @returns {string} File content
 */
function getStagedFileContent(filePath) {
  try {
    return execSync(`git show :${filePath}`, { encoding: 'utf-8' });
  } catch (error) {
    // Fallback to reading from filesystem if not in index
    try {
      return fs.readFileSync(filePath, 'utf-8');
    } catch {
      return '';
    }
  }
}

// ============================================================================
// SECTION: TODO EXTRACTION
// ============================================================================

/**
 * Extract TODO/FIXME/XXX comments from file content.
 * 
 * @param {string} content - File content
 * @param {string} filePath - File path
 * @returns {Array<{file: string, line: number, type: string, message: string}>}
 */
function extractTodos(content, filePath) {
  const todos = [];
  const lines = content.split('\n');

  // Patterns to match TODO comments
  const patterns = [
    /\/\/\s*(TODO|FIXME|XXX|HACK|NOTE|BUG):\s*(.+)/i,
    /\/\*\s*(TODO|FIXME|XXX|HACK|NOTE|BUG):\s*(.+?)\*\//i,
    /#\s*(TODO|FIXME|XXX|HACK|NOTE|BUG):\s*(.+)/i,
  ];

  lines.forEach((line, index) => {
    for (const pattern of patterns) {
      const match = line.match(pattern);
      if (match) {
        const type = match[1].toUpperCase();
        const message = match[2].trim();
        todos.push({
          file: filePath,
          line: index + 1,
          type,
          message,
        });
        break;
      }
    }
  });

  return todos;
}

/**
 * Format TODO entry for TODO.md.
 * 
 * @param {Object} todo - TODO object
 * @returns {string} Formatted TODO entry
 */
function formatTodoEntry(todo) {
  const relativePath = path.relative(process.cwd(), todo.file);
  return `- [ ] **${todo.type}** (${relativePath}:${todo.line}): ${todo.message}`;
}

// ============================================================================
// SECTION: TODO.MD MANAGEMENT
// ============================================================================

/**
 * Check if TODO already exists in TODO.md.
 * 
 * @param {string} todoEntry - Formatted TODO entry
 * @returns {boolean} True if TODO exists
 */
function todoExists(todoEntry) {
  if (!fs.existsSync(TODO_FILE)) {
    return false;
  }

  const content = fs.readFileSync(TODO_FILE, 'utf-8');
  // Simple check - see if file path and line number match
  const match = todoEntry.match(/\(([^:]+):(\d+)\)/);
  if (!match) {
    return false;
  }

  const [, filePath, lineNum] = match;
  return content.includes(filePath) && content.includes(`:${lineNum}`);
}

/**
 * Append TODOs to TODO.md.
 * 
 * @param {Array} todos - Array of TODO objects
 */
function appendTodosToFile(todos) {
  if (todos.length === 0) {
    return;
  }

  let content = '';
  if (fs.existsSync(TODO_FILE)) {
    content = fs.readFileSync(TODO_FILE, 'utf-8');
  }

  // Find insertion point (before "## 3. Epics & Tasks" or at end)
  const insertionMarker = '## 3. Epics & Tasks';
  const insertionIndex = content.indexOf(insertionMarker);

  const newSection = `\n## 2.2. Extracted TODOs from Code (Auto-Generated)\n\n**Last Updated:** ${new Date().toISOString()}\n\n**Note:** These TODOs were automatically extracted from code comments. Review and integrate into appropriate epics.\n\n${todos.map(formatTodoEntry).join('\n')}\n\n---\n\n`;

  if (insertionIndex !== -1) {
    content = content.slice(0, insertionIndex) + newSection + content.slice(insertionIndex);
  } else {
    content += newSection;
  }

  fs.writeFileSync(TODO_FILE, content, 'utf-8');
  console.log(`✅ Added ${todos.length} TODO(s) to TODO.md`);
}

// ============================================================================
// SECTION: MAIN EXECUTION
// ============================================================================

function main() {
  console.log('🔍 Scanning staged files for TODOs...\n');

  const stagedFiles = getStagedFiles();
  if (stagedFiles.length === 0) {
    console.log('✅ No staged files to scan');
    process.exit(0);
  }

  const allTodos = [];

  stagedFiles.forEach((file) => {
    const content = getStagedFileContent(file);
    const todos = extractTodos(content, file);
    allTodos.push(...todos);

    if (todos.length > 0) {
      console.log(`📝 Found ${todos.length} TODO(s) in ${file}`);
      todos.forEach((todo) => {
        console.log(`   ${todo.type}: ${todo.message} (line ${todo.line})`);
      });
    }
  });

  if (allTodos.length === 0) {
    console.log('\n✅ No TODOs found in staged files');
    process.exit(0);
  }

  console.log(`\n📋 Total TODOs found: ${allTodos.length}`);

  // Filter out TODOs that already exist
  const newTodos = allTodos.filter((todo) => !todoExists(formatTodoEntry(todo)));

  if (newTodos.length === 0) {
    console.log('✅ All TODOs already exist in TODO.md');
    process.exit(0);
  }

  if (MODE === 'auto') {
    console.log('\n🤖 Auto-mode: Adding TODOs to TODO.md...');
    appendTodosToFile(newTodos);
    console.log('✅ Commit can proceed');
    process.exit(0);
  } else {
    console.log('\n🚫 Block-mode: Commit blocked until TODOs are added to TODO.md');
    console.log('\nTo proceed:');
    console.log('  1. Manually add these TODOs to TODO.md, OR');
    console.log('  2. Run with --auto flag: node scripts/extract-todos.js --auto');
    console.log('\nTODOs to add:');
    newTodos.forEach((todo) => {
      console.log(`  ${formatTodoEntry(todo)}`);
    });
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { extractTodos, formatTodoEntry };
