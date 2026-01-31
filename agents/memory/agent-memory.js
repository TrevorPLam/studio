#!/usr/bin/env node

// filepath: agents/memory/agent-memory.js
// purpose: Persistent memory system for agentic workflow
// last updated: 2026-01-30
// related tasks: Phase 2 advanced features

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class AgentMemory {
  constructor() {
    this.repoPath = process.cwd();
    this.memoryPath = path.join(this.repoPath, 'agents', 'memory');
    this.memoryFile = path.join(this.memoryPath, 'agent-memory.json');
    this.sessionId = this.generateSessionId();
    this.memory = this.loadMemory();
  }

  generateSessionId() {
    return `session-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
  }

  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    console.log(logEntry);
  }

  loadMemory() {
    if (!fs.existsSync(this.memoryPath)) {
      fs.mkdirSync(this.memoryPath, { recursive: true });
    }

    if (fs.existsSync(this.memoryFile)) {
      try {
        const content = fs.readFileSync(this.memoryFile, 'utf8');
        return JSON.parse(content);
      } catch (error) {
        this.log(`Error loading memory: ${error.message}`, 'warn');
        return this.initializeMemory();
      }
    }

    return this.initializeMemory();
  }

  initializeMemory() {
    const memory = {
      version: '2.1.0',
      created_at: new Date().toISOString(),
      last_updated: new Date().toISOString(),
      sessions: [],
      context: {
        current_tasks: [],
        recent_decisions: [],
        learned_patterns: [],
        error_history: [],
        success_patterns: []
      },
      knowledge: {
        repository_structure: {},
        common_patterns: {},
        troubleshooting_solutions: {},
        performance_baselines: {}
      },
      preferences: {
        coding_style: {},
        testing_approaches: {},
        documentation_format: {}
      }
    };

    this.saveMemory(memory);
    return memory;
  }

  saveMemory(memory = this.memory) {
    memory.last_updated = new Date().toISOString();
    fs.writeFileSync(this.memoryFile, JSON.stringify(memory, null, 2));
    this.memory = memory;
  }

  startSession(context = {}) {
    const session = {
      id: this.sessionId,
      started_at: new Date().toISOString(),
      context: context,
      actions: [],
      decisions: [],
      outcomes: [],
      status: 'active'
    };

    this.memory.sessions.push(session);
    this.saveMemory();

    this.log(`Started session ${this.sessionId}`);
    return session.id;
  }

  recordAction(sessionId, action, result = null, metadata = {}) {
    const session = this.memory.sessions.find(s => s.id === sessionId);
    if (!session) {
      this.log(`Session ${sessionId} not found`, 'warn');
      return;
    }

    const actionRecord = {
      timestamp: new Date().toISOString(),
      action: action,
      result: result,
      metadata: metadata,
      success: result && !result.error
    };

    session.actions.push(actionRecord);
    this.saveMemory();

    this.log(`Recorded action: ${action}`);
  }

  recordDecision(sessionId, decision, rationale, options = {}) {
    const session = this.memory.sessions.find(s => s.id === sessionId);
    if (!session) {
      this.log(`Session ${sessionId} not found`, 'warn');
      return;
    }

    const decisionRecord = {
      timestamp: new Date().toISOString(),
      decision: decision,
      rationale: rationale,
      options_considered: options,
      context: this.getCurrentContext()
    };

    session.decisions.push(decisionRecord);
    this.memory.context.recent_decisions.push(decisionRecord);

    // Keep only last 50 decisions in context
    if (this.memory.context.recent_decisions.length > 50) {
      this.memory.context.recent_decisions.shift();
    }

    this.saveMemory();
    this.log(`Recorded decision: ${decision}`);
  }

  recordOutcome(sessionId, outcome, success = true, lessons = []) {
    const session = this.memory.sessions.find(s => s.id === sessionId);
    if (!session) {
      this.log(`Session ${sessionId} not found`, 'warn');
      return;
    }

    const outcomeRecord = {
      timestamp: new Date().toISOString(),
      outcome: outcome,
      success: success,
      lessons_learned: lessons,
      session_duration: Date.now() - new Date(session.started_at).getTime()
    };

    session.outcomes.push(outcomeRecord);
    session.status = 'completed';

    // Update learned patterns
    if (success && lessons.length > 0) {
      this.memory.context.learned_patterns.push(...lessons);
      if (this.memory.context.learned_patterns.length > 100) {
        this.memory.context.learned_patterns.shift();
      }
    }

    // Update success/error patterns
    if (success) {
      this.memory.context.success_patterns.push(outcomeRecord);
    } else {
      this.memory.context.error_history.push(outcomeRecord);
    }

    this.saveMemory();
    this.log(`Recorded outcome: ${outcome} (success: ${success})`);
  }

  getCurrentContext() {
    return {
      active_tasks: this.memory.context.current_tasks,
      recent_decisions: this.memory.context.recent_decisions.slice(-10),
      session_count: this.memory.sessions.length,
      last_session: this.memory.sessions[this.memory.sessions.length - 1]
    };
  }

  updateRepositoryStructure(structure) {
    this.memory.knowledge.repository_structure = {
      ...this.memory.knowledge.repository_structure,
      ...structure,
      last_updated: new Date().toISOString()
    };
    this.saveMemory();
  }

  recordPattern(pattern, type, success_rate = null) {
    const patternRecord = {
      pattern: pattern,
      type: type, // 'success', 'error', 'optimization'
      success_rate: success_rate,
      recorded_at: new Date().toISOString(),
      usage_count: 1
    };

    const key = `${type}_${pattern}`;
    if (!this.memory.knowledge.common_patterns[key]) {
      this.memory.knowledge.common_patterns[key] = patternRecord;
    } else {
      this.memory.knowledge.common_patterns[key].usage_count++;
      if (success_rate !== null) {
        this.memory.knowledge.common_patterns[key].success_rate = success_rate;
      }
    }

    this.saveMemory();
  }

  recordTroubleshootingSolution(problem, solution, effectiveness = null) {
    const solutionRecord = {
      problem: problem,
      solution: solution,
      effectiveness: effectiveness, // 1-10 scale
      recorded_at: new Date().toISOString(),
      usage_count: 0
    };

    const key = crypto.createHash('md5').update(problem).digest('hex');
    this.memory.knowledge.troubleshooting_solutions[key] = solutionRecord;
    this.saveMemory();
  }

  findSimilarProblems(problem) {
    const solutions = [];
    const problemHash = crypto.createHash('md5').update(problem).digest('hex');

    for (const [key, solution] of Object.entries(this.memory.knowledge.troubleshooting_solutions)) {
      // Simple similarity check - could be enhanced with NLP
      if (key === problemHash || solution.problem.toLowerCase().includes(problem.toLowerCase())) {
        solutions.push(solution);
      }
    }

    return solutions.sort((a, b) => (b.effectiveness || 0) - (a.effectiveness || 0));
  }

  getPerformanceBaseline(operation) {
    return this.memory.knowledge.performance_baselines[operation] || null;
  }

  setPerformanceBaseline(operation, baseline) {
    this.memory.knowledge.performance_baselines[operation] = {
      ...baseline,
      recorded_at: new Date().toISOString()
    };
    this.saveMemory();
  }

  updatePreferences(category, preferences) {
    this.memory.preferences[category] = {
      ...this.memory.preferences[category],
      ...preferences,
      last_updated: new Date().toISOString()
    };
    this.saveMemory();
  }

  getMemorySummary() {
    const totalSessions = this.memory.sessions.length;
    const successfulSessions = this.memory.sessions.filter(s =>
      s.outcomes && s.outcomes.some(o => o.success)
    ).length;

    return {
      memory_version: this.memory.version,
      total_sessions: totalSessions,
      success_rate: totalSessions > 0 ? (successfulSessions / totalSessions * 100).toFixed(2) : 0,
      learned_patterns: this.memory.context.learned_patterns.length,
      recorded_solutions: Object.keys(this.memory.knowledge.troubleshooting_solutions).length,
      last_updated: this.memory.last_updated
    };
  }

  cleanupOldSessions(keepCount = 100) {
    if (this.memory.sessions.length <= keepCount) return;

    const completedSessions = this.memory.sessions.filter(s => s.status === 'completed');
    const activeSessions = this.memory.sessions.filter(s => s.status === 'active');

    completedSessions.sort((a, b) => new Date(b.started_at) - new Date(a.started_at));

    const sessionsToKeep = completedSessions.slice(0, keepCount - activeSessions.length);
    this.memory.sessions = [...activeSessions, ...sessionsToKeep];

    this.saveMemory();
    this.log(`Cleaned up old sessions, kept ${this.memory.sessions.length}`);
  }

  exportMemory(filePath) {
    const exportData = {
      ...this.memory,
      exported_at: new Date().toISOString(),
      export_version: '2.1.0'
    };

    fs.writeFileSync(filePath, JSON.stringify(exportData, null, 2));
    this.log(`Memory exported to ${filePath}`);
  }

  importMemory(filePath) {
    try {
      const importedData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

      if (importedData.version !== this.memory.version) {
        this.log(`Version mismatch: imported ${importedData.version}, current ${this.memory.version}`, 'warn');
      }

      this.memory = {
        ...this.memory,
        ...importedData,
        last_updated: new Date().toISOString()
      };

      this.saveMemory();
      this.log(`Memory imported from ${filePath}`);
    } catch (error) {
      this.log(`Error importing memory: ${error.message}`, 'error');
    }
  }
}

// CLI interface
if (require.main === module) {
  const memory = new AgentMemory();

  const command = process.argv[2];

  switch (command) {
    case 'summary':
      console.log(JSON.stringify(memory.getMemorySummary(), null, 2));
      break;
    case 'cleanup':
      memory.cleanupOldSessions(parseInt(process.argv[3]) || 100);
      break;
    case 'export':
      memory.exportMemory(process.argv[3] || 'agent-memory-export.json');
      break;
    case 'import':
      memory.importMemory(process.argv[3]);
      break;
    default:
      console.log('Usage: node agent-memory.js [summary|cleanup|export|import] [args]');
  }
}

module.exports = AgentMemory;
