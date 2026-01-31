#!/usr/bin/env node

// filepath: agents/intelligence/workflow-intelligence.js
// purpose: Workflow intelligence layer for advanced automation
// last updated: 2026-01-30
// related tasks: Phase 3 autonomous enhancement

const fs = require('fs');
const path = require('path');
const AgentMemory = require('../memory/agent-memory');
const TaskPrioritizer = require('./task-prioritizer');

class WorkflowIntelligence {
  constructor() {
    this.repoPath = process.cwd();
    this.memory = new AgentMemory();
    this.prioritizer = new TaskPrioritizer();
    this.intelligencePath = path.join(this.repoPath, 'agents', 'intelligence');
  }

  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    console.log(logEntry);
  }

  analyzeWorkflow() {
    this.log('Starting comprehensive workflow analysis');

    const analysis = {
      timestamp: new Date().toISOString(),
      repository: path.basename(this.repoPath),
      workflow_health: this.analyzeWorkflowHealth(),
      task_analysis: this.analyzeTaskPatterns(),
      performance_analysis: this.analyzePerformancePatterns(),
      recommendations: this.generateIntelligentRecommendations(),
      automation_opportunities: this.identifyAutomationOpportunities()
    };

    this.saveAnalysis(analysis);
    return analysis;
  }

  analyzeWorkflowHealth() {
    const memorySummary = this.memory.getMemorySummary();
    const tasks = this.prioritizer.loadTasks();

    const health = {
      session_success_rate: parseFloat(memorySummary.success_rate) || 0,
      task_completion_rate: this.calculateTaskCompletionRate(tasks),
      overdue_task_ratio: this.calculateOverdueTaskRatio(tasks),
      dependency_complexity: this.calculateDependencyComplexity(tasks),
      workflow_efficiency: this.calculateWorkflowEfficiency()
    };

    health.overall_score = Math.round(
      (health.session_success_rate * 0.3 +
       health.task_completion_rate * 0.25 +
       (100 - health.overdue_task_ratio) * 0.2 +
       (100 - Math.min(health.dependency_complexity, 100)) * 0.15 +
       health.workflow_efficiency * 0.1)
    );

    return health;
  }

  calculateTaskCompletionRate(tasks) {
    const completedTasks = tasks.filter(t => t.status === 'Completed').length;
    const totalTasks = tasks.length;
    return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  }

  calculateOverdueTaskRatio(tasks) {
    const today = new Date();
    const overdueTasks = tasks.filter(t => {
      if (!t.due || t.status === 'Completed') return false;
      return new Date(t.due) < today;
    }).length;
    const activeTasks = tasks.filter(t => t.status !== 'Completed').length;
    return activeTasks > 0 ? Math.round((overdueTasks / activeTasks) * 100) : 0;
  }

  calculateDependencyComplexity(tasks) {
    if (tasks.length === 0) return 0;
    const dependencyCounts = tasks.map(t => {
      if (!t.dependencies) return 0;
      return t.dependencies.split(/\s+/).filter(Boolean).length;
    });

    const avgDependencies = dependencyCounts.reduce((a, b) => a + b, 0) / tasks.length;
    return Math.min(Math.round(avgDependencies * 20), 100);
  }

  calculateWorkflowEfficiency() {
    const memory = this.memory.memory;
    const recentSessions = (memory.sessions || []).slice(-10);

    if (recentSessions.length === 0) return 50;

    const durations = recentSessions
      .filter(s => s.outcomes && s.outcomes.length > 0)
      .map(s => s.outcomes[0].session_duration)
      .filter(d => d > 0);

    if (durations.length === 0) return 50;

    const avgSessionDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
    const efficiencyScore = Math.max(0, 100 - (avgSessionDuration / (30 * 60 * 1000)) * 100);
    return Math.round(efficiencyScore);
  }

  analyzeTaskPatterns() {
    const tasks = this.prioritizer.loadTasks();
    const prioritizedTasks = this.prioritizer.prioritizeTasks();

    return {
      task_distribution: this.analyzeTaskDistribution(tasks),
      priority_effectiveness: this.analyzePriorityEffectiveness(prioritizedTasks),
      completion_patterns: { message: 'Use metrics/collect.js for detailed analysis' },
      bottleneck_analysis: { message: 'Use metrics/collect.js for detailed analysis' }
    };
  }

  analyzeTaskDistribution(tasks) {
    const distribution = {
      by_status: {},
      by_priority: {},
      by_actor: {},
      by_complexity: { low: 0, medium: 0, high: 0 }
    };

    tasks.forEach(task => {
      distribution.by_status[task.status] = (distribution.by_status[task.status] || 0) + 1;
      distribution.by_priority[task.priority] = (distribution.by_priority[task.priority] || 0) + 1;
      distribution.by_actor[task.actor] = (distribution.by_actor[task.actor] || 0) + 1;

      const complexity = this.prioritizer.estimateComplexity(task);
      if (complexity <= 2) distribution.by_complexity.low++;
      else if (complexity <= 3.5) distribution.by_complexity.medium++;
      else distribution.by_complexity.high++;
    });

    return distribution;
  }

  analyzePriorityEffectiveness(prioritizedTasks) {
    const highPriorityTasks = prioritizedTasks.filter(t => ['P0', 'P1'].includes(t.priority));
    const highImpactTasks = prioritizedTasks.filter(t => t.blocking_count > 0);
    const overlap = highPriorityTasks.filter(t => highImpactTasks.some(h => h.id === t.id)).length;
    const effectiveness = highPriorityTasks.length > 0 ?
      (overlap / highPriorityTasks.length) * 100 : 0;

    return {
      priority_alignment: Math.round(effectiveness),
      high_priority_count: highPriorityTasks.length,
      high_impact_count: highImpactTasks.length,
      overlap_count: overlap
    };
  }

  analyzePerformancePatterns() {
    const memory = this.memory.memory;
    const recentSessions = (memory.sessions || []).slice(-20);

    return {
      session_performance: { message: 'Use metrics/collect.js for detailed analysis' },
      learning_patterns: { learned_patterns: (memory.context && memory.context.learned_patterns && memory.context.learned_patterns.length) || 0 },
      error_patterns: { message: 'Use agent-memory for error history' },
      optimization_opportunities: ['workflow_health_monitoring', 'metrics_collection']
    };
  }

  generateIntelligentRecommendations() {
    const workflowHealth = this.analyzeWorkflowHealth();
    const taskAnalysis = this.analyzeTaskPatterns();
    const recommendations = [];

    if (workflowHealth.overall_score < 70) {
      recommendations.push({
        type: 'workflow_health',
        priority: 'high',
        recommendation: 'Overall workflow health is below optimal - review processes and tools',
        impact: 'high'
      });
    }

    if (taskAnalysis.priority_effectiveness.priority_alignment < 60) {
      recommendations.push({
        type: 'task_management',
        priority: 'medium',
        recommendation: 'Priority assignments don\'t match actual impact - reconsider task prioritization',
        impact: 'medium'
      });
    }

    return recommendations;
  }

  identifyAutomationOpportunities() {
    return {
      immediate: ['automated_task_prioritization', 'workflow_health_monitoring', 'performance_metrics_collection'],
      short_term: ['intelligent_task_routing', 'automated_dependency_resolution', 'predictive_task_estimation'],
      long_term: ['autonomous_workflow_optimization', 'self_healing_workflows', 'predictive_error_prevention']
    };
  }

  saveAnalysis(analysis) {
    if (!fs.existsSync(this.intelligencePath)) {
      fs.mkdirSync(this.intelligencePath, { recursive: true });
    }

    const analysisPath = path.join(this.intelligencePath, 'workflow-analysis.json');
    fs.writeFileSync(analysisPath, JSON.stringify(analysis, null, 2));

    this.log(`Workflow analysis saved to ${analysisPath}`);
  }

  run() {
    this.log('Starting workflow intelligence analysis');

    const analysis = this.analyzeWorkflow();

    console.log('\n=== Workflow Intelligence Summary ===');
    console.log(`Overall Health Score: ${analysis.workflow_health.overall_score}/100`);
    console.log(`Task Completion Rate: ${analysis.workflow_health.task_completion_rate}%`);
    console.log(`Session Success Rate: ${analysis.workflow_health.session_success_rate}%`);
    console.log(`Total Recommendations: ${analysis.recommendations.length}`);
    console.log(`Automation Opportunities: ${analysis.automation_opportunities.immediate.length + analysis.automation_opportunities.short_term.length + analysis.automation_opportunities.long_term.length}`);

    if (analysis.recommendations.length > 0) {
      console.log('\nTop Recommendations:');
      analysis.recommendations.slice(0, 3).forEach(rec => {
        console.log(`  - ${rec.recommendation} (${rec.priority} priority)`);
      });
    }

    this.log('Workflow intelligence analysis completed');
  }
}

// CLI interface
if (require.main === module) {
  const intelligence = new WorkflowIntelligence();
  intelligence.run();
}

module.exports = WorkflowIntelligence;
