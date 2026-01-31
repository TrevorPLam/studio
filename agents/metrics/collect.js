#!/usr/bin/env node

// filepath: agents/metrics/collect.js
// purpose: Performance metrics collection for agentic workflow
// last updated: 2026-01-30
// related tasks: Phase 1 foundation enhancement

const fs = require('fs');
const path = require('path');

class MetricsCollector {
  constructor() {
    this.repoPath = process.cwd();
    this.metrics = {
      timestamp: new Date().toISOString(),
      repository: path.basename(this.repoPath),
      workflow_metrics: {},
      performance_metrics: {},
      task_metrics: {},
      system_metrics: {}
    };
  }

  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    console.log(logEntry);
  }

  collectWorkflowMetrics() {
    this.log('Collecting workflow metrics');

    const agentsPath = path.join(this.repoPath, 'agents');

    const workflowFiles = this.countFiles(agentsPath, ['.toon', '.md']);
    this.metrics.workflow_metrics = {
      total_workflow_files: workflowFiles.total,
      toon_files: workflowFiles.toon,
      markdown_files: workflowFiles.markdown,
      hitl_items: this.countHITLItems(),
      templates: this.countTemplates(),
      last_updated: this.getLastWorkflowUpdate()
    };
  }

  countFiles(dirPath) {
    let count = { total: 0, toon: 0, markdown: 0 };

    if (!fs.existsSync(dirPath)) return count;

    const walk = (dir) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isFile()) {
          count.total++;
          if (entry.name.endsWith('.toon')) count.toon++;
          if (entry.name.endsWith('.md')) count.markdown++;
        } else if (entry.isDirectory()) {
          walk(fullPath);
        }
      }
    };
    walk(dirPath);

    return count;
  }

  countHITLItems() {
    const hitlPath = path.join(this.repoPath, 'agents', 'hitl');
    if (!fs.existsSync(hitlPath)) return 0;

    const files = fs.readdirSync(hitlPath);
    return files.filter(f => f.startsWith('HITL-') && f.endsWith('.md')).length;
  }

  countTemplates() {
    const templatesPath = path.join(this.repoPath, 'agents', 'tasks', 'templates');
    if (!fs.existsSync(templatesPath)) return 0;

    const files = fs.readdirSync(templatesPath);
    return files.filter(f => f.endsWith('.toon')).length;
  }

  getLastWorkflowUpdate() {
    const agentsPath = path.join(this.repoPath, 'agents');
    let latestTime = 0;

    const updateFiles = ['AGENTS.toon', 'tasks/TODO.toon', 'tasks/BACKLOG.toon'];

    for (const file of updateFiles) {
      const filePath = path.join(agentsPath, file);
      if (fs.existsSync(filePath)) {
        const stat = fs.statSync(filePath);
        latestTime = Math.max(latestTime, stat.mtime.getTime());
      }
    }

    return latestTime > 0 ? new Date(latestTime).toISOString() : null;
  }

  collectTaskMetrics() {
    this.log('Collecting task metrics');

    const todoPath = path.join(this.repoPath, 'agents', 'tasks', 'TODO.toon');
    if (!fs.existsSync(todoPath)) {
      this.metrics.task_metrics = { error: 'TODO.toon not found' };
      return;
    }

    try {
      const content = fs.readFileSync(todoPath, 'utf8');
      const tasks = this.parseTasks(content);

      const statusCounts = {};
      const priorityCounts = {};
      const actorCounts = {};
      let overdueCount = 0;

      const today = new Date();

      for (const task of tasks) {
        statusCounts[task.status] = (statusCounts[task.status] || 0) + 1;
        priorityCounts[task.priority] = (priorityCounts[task.priority] || 0) + 1;
        actorCounts[task.actor] = (actorCounts[task.actor] || 0) + 1;

        if (task.due) {
          const dueDate = new Date(task.due);
          if (dueDate < today && task.status !== 'Completed') {
            overdueCount++;
          }
        }
      }

      this.metrics.task_metrics = {
        total_tasks: tasks.length,
        status_distribution: statusCounts,
        priority_distribution: priorityCounts,
        actor_distribution: actorCounts,
        overdue_tasks: overdueCount,
        completion_rate: statusCounts['Completed'] ? (statusCounts['Completed'] / tasks.length * 100).toFixed(2) : 0
      };
    } catch (error) {
      this.metrics.task_metrics = { error: error.message };
    }
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
            title: parts[2],
            status: parts[3],
            priority: parts[4],
            actor: parts[6],
            due: parts[7]
          });
        }
      }
    }

    return tasks;
  }

  collectPerformanceMetrics() {
    this.log('Collecting performance metrics');

    const startTime = Date.now();
    const memUsage = process.memoryUsage();

    this.metrics.performance_metrics = {
      collection_time_ms: Date.now() - startTime,
      memory_usage_mb: (memUsage.heapUsed / 1024 / 1024).toFixed(2),
      cpu_usage: process.cpuUsage()
    };
  }

  collectSystemMetrics() {
    this.log('Collecting system metrics');

    let gitMetrics = {};
    try {
      const { execSync } = require('child_process');

      const lastCommit = execSync('git log -1 --format="%H|%s|%ci"', { encoding: 'utf8' }).trim();
      const [hash, subject, date] = lastCommit.split('|');

      const totalCommits = execSync('git rev-list --count HEAD', { encoding: 'utf8' }).trim();
      const currentBranch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();

      gitMetrics = {
        last_commit_hash: hash,
        last_commit_subject: subject,
        last_commit_date: date,
        total_commits: parseInt(totalCommits),
        current_branch: currentBranch
      };
    } catch (error) {
      gitMetrics = { error: 'Git not available' };
    }

    this.metrics.system_metrics = {
      node_version: process.version,
      platform: process.platform,
      arch: process.arch,
      git_metrics: gitMetrics
    };
  }

  saveMetrics() {
    const metricsDir = path.join(this.repoPath, 'agents', 'metrics');
    if (!fs.existsSync(metricsDir)) {
      fs.mkdirSync(metricsDir, { recursive: true });
    }

    const metricsPath = path.join(metricsDir, 'latest.json');
    fs.writeFileSync(metricsPath, JSON.stringify(this.metrics, null, 2));

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const historicalPath = path.join(metricsDir, `metrics-${timestamp}.json`);
    fs.writeFileSync(historicalPath, JSON.stringify(this.metrics, null, 2));

    this.log(`Metrics saved to ${metricsPath}`);
  }

  generateSummary() {
    const summary = {
      collection_time: this.metrics.timestamp,
      repository: this.metrics.repository,
      workflow_health: {
        total_files: this.metrics.workflow_metrics.total_workflow_files || 0,
        hitl_items: this.metrics.workflow_metrics.hitl_items || 0,
        templates: this.metrics.workflow_metrics.templates || 0
      },
      task_health: {
        total_tasks: this.metrics.task_metrics.total_tasks || 0,
        completion_rate: this.metrics.task_metrics.completion_rate || 0,
        overdue_tasks: this.metrics.task_metrics.overdue_tasks || 0
      },
      performance: {
        collection_time_ms: this.metrics.performance_metrics.collection_time_ms || 0,
        memory_usage_mb: this.metrics.performance_metrics.memory_usage_mb || 0
      }
    };

    console.log('\n=== Metrics Summary ===');
    console.log(`Repository: ${summary.repository}`);
    console.log(`Workflow Files: ${summary.workflow_health.total_files}`);
    console.log(`Active Tasks: ${summary.task_health.total_tasks}`);
    console.log(`Completion Rate: ${summary.task_health.completion_rate}%`);
    console.log(`Overdue Tasks: ${summary.task_health.overdue_tasks}`);
    console.log(`Collection Time: ${summary.performance.collection_time_ms}ms`);

    return summary;
  }

  run() {
    this.log('Starting metrics collection');

    this.collectWorkflowMetrics();
    this.collectTaskMetrics();
    this.collectPerformanceMetrics();
    this.collectSystemMetrics();

    this.saveMetrics();
    this.generateSummary();

    this.log('Metrics collection completed');
  }
}

// CLI interface
if (require.main === module) {
  const collector = new MetricsCollector();
  collector.run();
}

module.exports = MetricsCollector;
