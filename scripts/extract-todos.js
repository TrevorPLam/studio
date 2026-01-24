/**
 * ============================================================================
 * TODO EXTRACTION SCRIPT
 * ============================================================================
 *
 * @file scripts/extract-todos.js
 * @epic BP-TOOL-013
 *
 * PURPOSE:
 * Extracts TODO/FIXME comments from staged files and either:
 * - Blocks commit until TODOs are manually added to TODO.md, OR
 * - Auto-extracts and appends TODOs to TODO.md
 *
 * CONFIGURATION:
 * Set EXTRACT_TODOS_MODE environment variable:
 * - "block" - Block commit if TODOs found (default)
 * - "auto" - Auto-extract and append to TODO.md
 *
 * @see TODO.md BP-TOOL-013
 *
 * ============================================================================
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const MODE = process.env.EXTRACT_TODOS_MODE || 'block';
const TODO_FILE = path.join(process.cwd(), 'TODO.md');

/**
 * Get list of staged files.
 */
function getStagedFiles() {
  try {
    const output = execSync('git diff --cached --name-only --diff-filter=ACM', {
      encoding: 'utf-8',
    });
    return output
      .split('\n')
      .filter((line) => line.trim())
      .filter((line) => {
        // Only process source files
        return /\.(ts|tsx|js|jsx|py|go|java|rs)$/.test(line);
      });
  } catch (error) {
    console.error('Error getting staged files:', error.message);
    return [];
  }
}

/**
 * Extract TODO/FIXME comments from a file.
 */
function extractTodosFromFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const todos = [];

    lines.forEach((line, index) => {
      // Match TODO/FIXME comments (single-line and multi-line)
      const todoMatch = line.match(/(?:TODO|FIXME|XXX|HACK|NOTE|BUG):\s*(.+)/i);
      if (todoMatch) {
        todos.push({
          file: filePath,
          line: index + 1,
          text: todoMatch[1].trim(),
          fullLine: line.trim(),
        });
      }
    });

    return todos;
  } catch (error) {
    // File might not exist or be unreadable, skip it
    return [];
  }
}

/**
 * Format TODO entry for TODO.md.
 */
function formatTodoEntry(todo) {
  return `- [ ] **${todo.file}:${todo.line}** - ${todo.text}`;
}

/**
 * Check if TODO already exists in TODO.md.
 */
function todoExistsInFile(todo, todoFileContent) {
  const searchText = `${todo.file}:${todo.line}`;
  return todoFileContent.includes(searchText);
}

/**
 * Main execution.
 */
function main() {
  const stagedFiles = getStagedFiles();
  if (stagedFiles.length === 0) {
    console.log('No staged files to check for TODOs.');
    return;
  }

  console.log(`Checking ${stagedFiles.length} staged file(s) for TODOs...`);

  const allTodos = [];
  stagedFiles.forEach((file) => {
    const todos = extractTodosFromFile(file);
    allTodos.push(...todos);
  });

  if (allTodos.length === 0) {
    console.log('No TODO comments found in staged files.');
    return;
  }

  console.log(`Found ${allTodos.length} TODO comment(s):`);
  allTodos.forEach((todo) => {
    console.log(`  - ${todo.file}:${todo.line} - ${todo.text}`);
  });

  if (MODE === 'block') {
    console.error('\n❌ Commit blocked: TODO comments found in staged files.');
    console.error('Please either:');
    console.error('  1. Remove the TODO comments, or');
    console.error('  2. Add them to TODO.md manually, or');
    console.error('  3. Set EXTRACT_TODOS_MODE=auto to auto-extract');
    process.exit(1);
  } else if (MODE === 'auto') {
    // Read existing TODO.md
    let todoFileContent = '';
    if (fs.existsSync(TODO_FILE)) {
      todoFileContent = fs.readFileSync(TODO_FILE, 'utf-8');
    }

    // Filter out TODOs that already exist
    const newTodos = allTodos.filter((todo) => !todoExistsInFile(todo, todoFileContent));

    if (newTodos.length === 0) {
      console.log('All TODOs already exist in TODO.md.');
      return;
    }

    // Append new TODOs to TODO.md
    const timestamp = new Date().toISOString();
    const section = `\n\n## Auto-extracted TODOs (${timestamp})\n\n${newTodos.map(formatTodoEntry).join('\n')}\n`;

    fs.appendFileSync(TODO_FILE, section, 'utf-8');
    console.log(`✅ Added ${newTodos.length} new TODO(s) to TODO.md`);
  } else {
    console.error(`Invalid EXTRACT_TODOS_MODE: ${MODE}. Must be 'block' or 'auto'.`);
    process.exit(1);
  }
}

main();
