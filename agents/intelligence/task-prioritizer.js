#!/usr/bin/env node

// filepath: agents/intelligence/task-prioritizer.js
// purpose: Dynamic task prioritization based on multiple factors
// last updated: 2026-01-30
// related tasks: Phase 2 advanced features

const fs = require('fs');
const path = require('path');

class TaskPrioritizer {
  constructor() {
    this.repoPath = process.cwd();
    this.weights = {
      priority: 0.4,        // P0 > P1 > P2 > P3
      overdue: 0.25,       // Overdue tasks get boost
      dependencies: 0.15,  // Tasks blocking others get boost
      complexity: 0.1,     // Simpler tasks get slight boost
      actor: 0.1          // AGENT tasks get slight boost
    };
  }

  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    console.log(logEntry);
  }

  loadTasks() {
    const todoPath = path.join(this.repoPath, 'agents', 'tasks', 'TODO.toon');
    if (!fs.existsSync(todoPath)) {
      this.log('TODO.toon not found', 'error');
      return [];
    }

    try {
      const content = fs.readFileSync(todoPath, 'utf8');
      return this.parseTasks(content);
    } catch (error) {
      this.log(`Error parsing tasks: ${error.message}`, 'error');
      return [];
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

  calculatePriorityScore(task, allTasks) {
    let score = 0;

    const priorityValue = { 'P0': 4, 'P1': 3, 'P2': 2, 'P3': 1 };
    score += (priorityValue[task.priority] || 1) * this.weights.priority * 25;

    if (task.due && task.status !== 'Completed') {
      const dueDate = new Date(task.due);
      const today = new Date();
      const daysOverdue = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));

      if (daysOverdue > 0) {
        score += Math.min(daysOverdue * 2, 20) * this.weights.overdue;
      } else if (daysOverdue < -7) {
        score += daysOverdue * 0.5 * this.weights.overdue;
      }
    }

    const blockingCount = this.countBlockingTasks(task, allTasks);
    score += blockingCount * 5 * this.weights.dependencies;

    const complexityScore = this.estimateComplexity(task);
    score += (5 - complexityScore) * this.weights.complexity;

    if (task.actor === 'AGENT') {
      score += 2 * this.weights.actor;
    }

    return Math.round(score * 100) / 100;
  }

  countBlockingTasks(task, allTasks) {
    return allTasks.filter(t =>
      t.dependencies &&
      t.dependencies.includes(task.id) &&
      t.status !== 'Completed'
    ).length;
  }

  estimateComplexity(task) {
    let complexity = 1;

    if (task.title && task.title.length > 50) complexity += 0.5;
    if (task.title && task.title.toLowerCase().includes('refactor')) complexity += 1;
    if (task.title && task.title.toLowerCase().includes('migration')) complexity += 2;
    if (task.title && task.title.toLowerCase().includes('security')) complexity += 1;

    if (task.description && task.description.length > 200) complexity += 0.5;

    const criteria = task.acceptance_criteria || '';
    const criteriaCount = criteria.split(';').length;
    complexity += Math.min(criteriaCount * 0.3, 2);

    if (task.dependencies) {
      const depCount = task.dependencies.split(/\s+/).filter(Boolean).length;
      complexity += Math.min(depCount * 0.2, 1);
    }

    return Math.min(Math.round(complexity * 10) / 10, 5);
  }

  prioritizeTasks() {
    this.log('Starting task prioritization');

    const tasks = this.loadTasks();
    const activeTasks = tasks.filter(t => t.status !== 'Completed');

    const scoredTasks = activeTasks.map(task => ({
      ...task,
      priority_score: this.calculatePriorityScore(task, tasks),
      blocking_count: this.countBlockingTasks(task, tasks),
      complexity: this.estimateComplexity(task)
    }));

    scoredTasks.sort((a, b) => b.priority_score - a.priority_score);

    return scoredTasks.map((task, index) => ({
      rank: index + 1,
      id: task.id,
      title: task.title,
      priority: task.priority,
      status: task.status,
      actor: task.actor,
      due: task.due,
      priority_score: task.priority_score,
      blocking_count: task.blocking_count,
      complexity: task.complexity,
      recommendations: this.generateRecommendations(task, scoredTasks)
    }));
  }

  generateRecommendations(task, allTasks) {
    const recommendations = [];

    if (task.blocking_count > 2) {
      recommendations.push('High impact - blocks multiple other tasks');
    }

    if (task.due) {
      const dueDate = new Date(task.due);
      const today = new Date();
      const daysUntilDue = Math.floor((dueDate - today) / (1000 * 60 * 60 * 24));

      if (daysUntilDue < 0) {
        recommendations.push(`Overdue by ${Math.abs(daysUntilDue)} days`);
      } else if (daysUntilDue <= 3) {
        recommendations.push(`Due soon (${daysUntilDue} days)`);
      }
    }

    const complexity = this.estimateComplexity(task);
    if (complexity <= 2) {
      recommendations.push('Quick win - low complexity');
    } else if (complexity >= 4) {
      recommendations.push('High complexity - consider breaking down');
    }

    if (task.actor === 'USER') {
      recommendations.push('Requires human input');
    }

    if (task.dependencies) {
      const deps = task.dependencies.split(/\s+/).filter(Boolean);
      if (deps.length > 1) {
        recommendations.push('Multiple dependencies - verify they are complete');
      }
    }

    return recommendations;
  }

  generateWorkflowPlan(prioritizedTasks, batchSize = 5) {
    const plan = {
      generated_at: new Date().toISOString(),
      total_tasks: prioritizedTasks.length,
      batches: [],
      recommendations: []
    };

    for (let i = 0; i < prioritizedTasks.length; i += batchSize) {
      const batch = prioritizedTasks.slice(i, i + batchSize);
      const batchScore = batch.reduce((sum, task) => sum + task.priority_score, 0);

      plan.batches.push({
        batch_number: Math.floor(i / batchSize) + 1,
        tasks: batch.map(t => t.id),
        total_priority_score: Math.round(batchScore * 100) / 100,
        estimated_complexity: batch.reduce((sum, t) => sum + t.complexity, 0),
        actor_distribution: this.getActorDistribution(batch)
      });
    }

    plan.recommendations = this.generatePlanRecommendations(prioritizedTasks);

    return plan;
  }

  getActorDistribution(batch) {
    const distribution = { AGENT: 0, USER: 0 };
    batch.forEach(task => {
      distribution[task.actor] = (distribution[task.actor] || 0) + 1;
    });
    return distribution;
  }

  generatePlanRecommendations(tasks) {
    const recommendations = [];

    const userTasks = tasks.filter(t => t.actor === 'USER');
    const overdueTasks = tasks.filter(t => {
      if (!t.due) return false;
      return new Date(t.due) < new Date();
    });

    if (userTasks.length > 0) {
      recommendations.push(`${userTasks.length} task(s) require human input - schedule review`);
    }

    if (overdueTasks.length > 0) {
      recommendations.push(`${overdueTasks.length} task(s) are overdue - prioritize immediately`);
    }

    const highComplexityTasks = tasks.filter(t => t.complexity >= 4);
    if (highComplexityTasks.length > 0) {
      recommendations.push(`${highComplexityTasks.length} high-complexity task(s) - consider breaking down`);
    }

    const blockingTasks = tasks.filter(t => t.blocking_count > 0);
    if (blockingTasks.length > 0) {
      recommendations.push(`${blockingTasks.length} task(s) are blocking other work - prioritize these`);
    }

    return recommendations;
  }

  savePrioritizedTasks(prioritizedTasks) {
    const intelPath = path.join(this.repoPath, 'agents', 'intelligence');
    if (!fs.existsSync(intelPath)) {
      fs.mkdirSync(intelPath, { recursive: true });
    }
    const outputPath = path.join(intelPath, 'prioritized-tasks.json');

    const data = {
      generated_at: new Date().toISOString(),
      weights_used: this.weights,
      total_tasks: prioritizedTasks.length,
      tasks: prioritizedTasks
    };

    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
    this.log(`Prioritized tasks saved to ${outputPath}`);
  }

  saveWorkflowPlan(plan) {
    const intelPath = path.join(this.repoPath, 'agents', 'intelligence');
    if (!fs.existsSync(intelPath)) {
      fs.mkdirSync(intelPath, { recursive: true });
    }
    const outputPath = path.join(intelPath, 'workflow-plan.json');
    fs.writeFileSync(outputPath, JSON.stringify(plan, null, 2));
    this.log(`Workflow plan saved to ${outputPath}`);
  }

  run() {
    this.log('Starting dynamic task prioritization');

    const prioritizedTasks = this.prioritizeTasks();
    const workflowPlan = this.generateWorkflowPlan(prioritizedTasks);

    this.savePrioritizedTasks(prioritizedTasks);
    this.saveWorkflowPlan(workflowPlan);

    console.log('\n=== Task Prioritization Summary ===');
    console.log(`Total tasks analyzed: ${prioritizedTasks.length}`);
    console.log(`Workflow batches: ${workflowPlan.batches.length}`);
    console.log('Top 5 tasks:');

    prioritizedTasks.slice(0, 5).forEach((task, index) => {
      console.log(`  ${index + 1}. ${task.id}: ${task.title} (Score: ${task.priority_score})`);
    });

    if (workflowPlan.recommendations.length > 0) {
      console.log('\nRecommendations:');
      workflowPlan.recommendations.forEach(rec => {
        console.log(`  - ${rec}`);
      });
    }

    this.log('Task prioritization completed');
  }
}

// CLI interface
if (require.main === module) {
  const prioritizer = new TaskPrioritizer();
  prioritizer.run();
}

module.exports = TaskPrioritizer;
