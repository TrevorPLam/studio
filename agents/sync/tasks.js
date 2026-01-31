#!/usr/bin/env node

// filepath: agents/sync/tasks.js
// purpose: Cross-repository task synchronization utility
// last updated: 2026-01-30
// related tasks: Phase 1 foundation enhancement

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class TaskSynchronizer {
  constructor() {
    this.repoPath = process.cwd();
    this.repos = this.loadRepoConfig();
    this.syncLog = [];
  }

  loadRepoConfig() {
    const configPath = path.join(this.repoPath, 'agents', 'sync', 'repos.json');
    const defaultRepos = [{ name: path.basename(this.repoPath), path: this.repoPath }];

    if (!fs.existsSync(configPath)) {
      return defaultRepos;
    }

    try {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      const repos = config.repos || [];

      if (repos.length === 0) {
        return defaultRepos;
      }

      return repos.map((r, i) => ({
        name: typeof r === 'string' ? path.basename(path.resolve(this.repoPath, r)) : (r.name || `repo-${i}`),
        path: path.resolve(this.repoPath, typeof r === 'string' ? r : r.path)
      })).filter(r => fs.existsSync(r.path));
    } catch (error) {
      this.log(`Error loading repos config: ${error.message}`, 'warn');
      return defaultRepos;
    }
  }

  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    this.syncLog.push(logEntry);
    console.log(logEntry);
  }

  readTodoFile(repoPath) {
    const todoPath = path.join(repoPath, 'agents', 'tasks', 'TODO.toon');
    if (!fs.existsSync(todoPath)) {
      this.log(`TODO.toon not found in ${repoPath}`, 'warn');
      return null;
    }

    try {
      const content = fs.readFileSync(todoPath, 'utf8');
      return this.parseToon(content);
    } catch (error) {
      this.log(`Error reading TODO.toon in ${repoPath}: ${error.message}`, 'error');
      return null;
    }
  }

  parseToon(content) {
    const lines = content.split('\n');
    const result = { meta: {}, active_work: [], completed: [] };
    let currentArray = null;

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;

      if (trimmed.startsWith('meta{')) {
        currentArray = null;
        const matches = trimmed.match(/meta{([^}]+)}/);
        if (matches) {
          const parts = matches[1].split(',').map(p => p.trim());
          result.meta = { status: parts[0], owner: parts[1], last_updated: parts[2] || '' };
        }
      } else if (trimmed.startsWith('active_work[')) {
        currentArray = 'active_work';
        result.active_work = [];
      } else if (trimmed.startsWith('completed[')) {
        currentArray = 'completed';
        result.completed = [];
      } else if (currentArray && trimmed.includes(',')) {
        const parts = trimmed.split(',').map(p => p.trim());
        if (parts.length >= 12) {
          const task = {
            id: parts[0], parent_id: parts[1] || '', title: parts[2], status: parts[3],
            priority: parts[4], owner: parts[5], actor: parts[6], due: parts[7],
            description: parts[8], acceptance_criteria: parts[9], dependencies: parts[10] || '', notes: parts[11] || ''
          };
          result[currentArray].push(task);
        }
      }
    }

    return result;
  }

  synchronizeTasks() {
    this.log('Starting task synchronization');

    const repoData = {};
    for (const repo of this.repos) {
      const data = this.readTodoFile(repo.path);
      if (data) {
        repoData[repo.name] = data;
        this.log(`Loaded ${data.active_work.length} active + ${data.completed.length} completed tasks from ${repo.name}`);
      }
    }

    const report = this.generateSyncReport(repoData);
    this.saveReport(report);

    this.log('Task synchronization completed');
    return this.syncLog;
  }

  generateSyncReport(repoData) {
    const report = {
      timestamp: new Date().toISOString(),
      repositories: {},
      summary: {
        total_repos: Object.keys(repoData).length,
        total_active_tasks: 0,
        total_completed_tasks: 0
      }
    };

    for (const [repoName, data] of Object.entries(repoData)) {
      report.repositories[repoName] = {
        active_tasks: data.active_work.length,
        completed_tasks: data.completed.length,
        last_updated: data.meta.last_updated || ''
      };
      report.summary.total_active_tasks += data.active_work.length;
      report.summary.total_completed_tasks += data.completed.length;
    }

    return report;
  }

  saveReport(report) {
    const syncDir = path.join(this.repoPath, 'agents', 'sync');
    if (!fs.existsSync(syncDir)) {
      fs.mkdirSync(syncDir, { recursive: true });
    }
    const reportPath = path.join(syncDir, 'latest-sync.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    this.log(`Sync report written to ${reportPath}`);
  }
}

// CLI interface
if (require.main === module) {
  const synchronizer = new TaskSynchronizer();
  const result = synchronizer.synchronizeTasks();

  if (result.length > 0) {
    console.log('\n=== Synchronization Summary ===');
    console.log(`Total operations: ${result.length}`);
  }
}

module.exports = TaskSynchronizer;
