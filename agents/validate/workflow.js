#!/usr/bin/env node

// filepath: agents/validate/workflow.js
// purpose: Workflow validation and schema compliance checker
// last updated: 2026-01-30
// related tasks: Phase 1 foundation enhancement

const fs = require('fs');
const path = require('path');

class WorkflowValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.repoPath = process.cwd();
  }

  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    console.log(logEntry);
  }

  validateSchema() {
    this.log('Validating workflow schema compliance');

    const agentsPath = path.join(this.repoPath, 'agents');
    const requiredFiles = [
      'AGENTS.toon',
      'tasks/TODO.toon',
      'tasks/BACKLOG.toon',
      'tasks/ARCHIVE.toon'
    ];

    for (const file of requiredFiles) {
      const filePath = path.join(agentsPath, file);
      if (!fs.existsSync(filePath)) {
        this.errors.push(`Missing required file: ${file}`);
      } else {
        this.validateToonFile(filePath);
      }
    }

    return this.errors.length === 0;
  }

  validateToonFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');

      let hasMeta = false;
      let hasValidStructure = false;

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('meta{')) {
          hasMeta = true;
          const metaMatch = trimmed.match(/meta{([^}]+)}/);
          if (metaMatch) {
            const metaContent = metaMatch[1];
            const metaFields = metaContent.split(',').map(f => f.trim());
            if (metaFields.length >= 3) {
              hasValidStructure = true;
            }
          }
        }
      }

      if (!hasMeta) {
        this.errors.push(`Missing meta section in ${path.basename(filePath)}`);
      }

      if (!hasValidStructure) {
        this.warnings.push(`Invalid meta structure in ${path.basename(filePath)}`);
      }
    } catch (error) {
      this.errors.push(`Error reading ${filePath}: ${error.message}`);
    }
  }

  validateTasks() {
    this.log('Validating task compliance');

    const todoPath = path.join(this.repoPath, 'agents', 'tasks', 'TODO.toon');
    if (!fs.existsSync(todoPath)) {
      this.errors.push('TODO.toon file not found');
      return false;
    }

    try {
      const content = fs.readFileSync(todoPath, 'utf8');
      const tasks = this.parseTasks(content);

      for (const task of tasks) {
        this.validateTask(task);
      }

      this.log(`Validated ${tasks.length} tasks`);
    } catch (error) {
      this.errors.push(`Error parsing tasks: ${error.message}`);
    }

    return this.errors.length === 0;
  }

  parseTasks(content) {
    const lines = content.split('\n');
    const tasks = [];
    let inActiveWork = false;

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('active_work[')) {
        inActiveWork = true;
      } else if (inActiveWork && trimmed.includes(',') && !trimmed.startsWith('#')) {
        const parts = trimmed.split(',').map(p => p.trim());
        if (parts.length >= 12) {
          tasks.push({
            id: parts[0],
            parent_id: parts[1] || '',
            title: parts[2],
            status: parts[3],
            priority: parts[4],
            owner: parts[5],
            actor: parts[6],
            due: parts[7],
            description: parts[8],
            acceptance_criteria: parts[9],
            dependencies: parts[10] || '',
            notes: parts[11] || ''
          });
        }
      }
    }

    return tasks;
  }

  validateTask(task) {
    const requiredFields = ['id', 'title', 'status', 'priority', 'owner', 'actor', 'due', 'description', 'acceptance_criteria'];
    for (const field of requiredFields) {
      if (!task[field] || task[field] === '') {
        this.errors.push(`Task ${task.id}: Missing required field '${field}'`);
      }
    }

    if (task.id && !/^[A-Z]+-\d+[a-z]?$/i.test(task.id)) {
      this.warnings.push(`Task ${task.id}: ID format may not follow standard (PREFIX-NNN)`);
    }

    if (task.status && !['Not Started', 'In Progress', 'Blocked', 'Completed', 'Partially Complete'].includes(task.status)) {
      this.errors.push(`Task ${task.id}: Invalid status '${task.status}'`);
    }

    if (task.priority && !/^P[0-3]$/.test(task.priority)) {
      this.errors.push(`Task ${task.id}: Invalid priority '${task.priority}'`);
    }

    if (task.actor && !['AGENT', 'USER'].includes(task.actor)) {
      this.errors.push(`Task ${task.id}: Invalid actor '${task.actor}'`);
    }

    if (task.due && task.due !== '' && !/^\d{4}-\d{2}-\d{2}$/.test(task.due)) {
      this.warnings.push(`Task ${task.id}: Due date format may be invalid (expected YYYY-MM-DD)`);
    }

    if (task.title && task.title.toLowerCase().includes('security') && task.actor !== 'USER') {
      this.warnings.push(`Task ${task.id}: Security-related task should have actor=USER`);
    }
  }

  validateTemplates() {
    this.log('Validating workflow templates');

    const templatesPath = path.join(this.repoPath, 'agents', 'tasks', 'templates');
    if (!fs.existsSync(templatesPath)) {
      this.warnings.push('Templates directory not found');
      return true;
    }

    const requiredTemplates = [
      'FEATURE-WORKFLOW.toon',
      'BUG-WORKFLOW.toon',
      'DOCS-WORKFLOW.toon',
      'SECURITY-WORKFLOW.toon'
    ];

    for (const template of requiredTemplates) {
      const templatePath = path.join(templatesPath, template);
      if (!fs.existsSync(templatePath)) {
        this.warnings.push(`Missing template: ${template}`);
      }
    }

    return this.errors.length === 0;
  }

  validateHITL() {
    this.log('Validating HITL items');

    const hitlPath = path.join(this.repoPath, 'agents', 'hitl');
    if (!fs.existsSync(hitlPath)) {
      this.warnings.push('HITL directory not found');
      return true;
    }

    try {
      const hitlFiles = fs.readdirSync(hitlPath).filter(f => f.endsWith('.md') && f.startsWith('HITL-'));

      for (const file of hitlFiles) {
        const filePath = path.join(hitlPath, file);
        const content = fs.readFileSync(filePath, 'utf8');

        if (!content.includes('HITL-') && !content.includes('#')) {
          this.warnings.push(`HITL file ${file} may not follow standard format`);
        }
      }

      this.log(`Validated ${hitlFiles.length} HITL items`);
    } catch (error) {
      this.errors.push(`Error validating HITL: ${error.message}`);
    }

    return this.errors.length === 0;
  }

  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      repository: this.repoPath,
      validation_results: {
        schema: this.errors.filter(e => e.includes('schema') || e.includes('meta')).length === 0,
        tasks: this.errors.filter(e => e.includes('Task')).length === 0,
        templates: this.errors.filter(e => e.includes('template')).length === 0,
        hitl: this.errors.filter(e => e.includes('HITL')).length === 0
      },
      errors: this.errors,
      warnings: this.warnings,
      summary: {
        total_errors: this.errors.length,
        total_warnings: this.warnings.length,
        validation_passed: this.errors.length === 0
      }
    };

    const validateDir = path.join(this.repoPath, 'agents', 'validate');
    if (!fs.existsSync(validateDir)) {
      fs.mkdirSync(validateDir, { recursive: true });
    }
    const reportPath = path.join(validateDir, 'latest-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    this.log(`Validation report written to ${reportPath}`);

    return report;
  }

  run() {
    this.log('Starting workflow validation');

    const validations = [
      () => this.validateSchema(),
      () => this.validateTasks(),
      () => this.validateTemplates(),
      () => this.validateHITL()
    ];

    validations.forEach(fn => fn());
    const report = this.generateReport();

    if (this.errors.length === 0) {
      this.log('Workflow validation passed');
      process.exit(0);
    } else {
      this.log(`Workflow validation failed with ${this.errors.length} errors and ${this.warnings.length} warnings`);
      process.exit(1);
    }
  }
}

// CLI interface
if (require.main === module) {
  const validator = new WorkflowValidator();
  validator.run();
}

module.exports = WorkflowValidator;
