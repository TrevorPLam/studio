# 11. Observability & Monitoring

**Prerequisites:** 
- [Section 0: Prerequisites](00-Prerequisites.md) - Complete decision points
- [Section 2: Source Code Layout](02-Source-Code-Layout.md)
- **Recommended:** [Section 5: CI/CD Structure](05-CI-CD-Structure.md) (for CI/CD health checks)

**Effort Estimate:**
- **Structured logging (P0):** 2-4 hours
- **Basic monitoring (P1):** 4-8 hours
- **Full observability stack (P1 + P2):** 8-16 hours
- **Distributed tracing (P2):** 4-8 hours additional

## 🎯 What You're Trying to Accomplish
Make the system observable so you can detect issues quickly and understand what’s happening in production.

## 🎓 Why This Section Exists
Without observability, problems show up as user complaints. Logs, metrics, and alerts help you fix issues before they escalate.

## 📚 Key Concepts (Mentor Mode)

### Structured logging
**Simple:** Logs in a consistent, machine‑readable format (often JSON).
**Why it matters:** Makes searching and alerting easier.

### Metrics
**Simple:** Numeric signals about system health.
**Why it matters:** Helps you detect performance regressions.

### Tracing
**Simple:** Follow a request across services.
**Why it matters:** Identifies slow or failing components.

## ✅ Subtasks (With Owner Tags)

#### Subtask 11.1 — Define observability goals | **USER**
**Purpose:** Decide what “healthy” looks like.
**Expected outcome:** Key signals selected (logs, metrics, traces).

#### Subtask 11.2 — Implement structured logging | **AGENT**
**Purpose:** Ensure logs are consistent.
**Expected outcome:** JSON or structured logs enabled.

#### Subtask 11.3 — Add health checks | **AGENT**
**Purpose:** Provide a quick service status endpoint.
**Expected outcome:** Health check endpoint available.

#### Subtask 11.4 — Configure alerts | **USER**
**Purpose:** Catch issues early.
**Expected outcome:** Alert thresholds documented.

#### Subtask 11.5 — Document runbooks | **USER**
**Purpose:** Make incident response repeatable.
**Expected outcome:** Runbooks or playbooks created.

## 📘 Detailed Reference (Original Guidance)

## Questions to Answer

Before proceeding, answer these questions:

1. **What observability do you need?**
   - [ ] Logging (application events, errors, debug info) - **What should be logged?** _______________
   - [ ] Error tracking (exceptions, crashes, failures) - **Which service?** (Sentry, Rollbar, etc.)
   - [ ] Metrics (performance, business metrics, system health) - **What metrics matter?** _______________
   - [ ] Distributed tracing (request flows across services) - **Do you have microservices?**
   - [ ] Health checks (service availability, dependencies) - **What endpoints/services?** _______________

2. **What logging format will you use?**
   - [ ] Structured JSON (recommended for production)
   - [ ] Semi-structured (custom format)
   - [ ] Unstructured (simple text) - **Note:** Consider migrating to structured

**Document your answers** in `alignment-progress.json` before proceeding.

## P0 — Required Actions

**Action:** Implement basic logging | **AGENT**
- [ ] Configure structured logging (JSON format recommended)
- [ ] Ensure errors include sufficient context:
  - Error message
  - Stack trace
  - Request ID (if applicable)
  - User context (if applicable, respecting privacy)
- [ ] Document logging format and levels

## P1 — Recommended Actions

**Action:** Create health dashboard | **AGENT**
- [ ] Create `HEALTHCHECK.md` summarizing:
  - Current build status
  - Test status and coverage
  - Dependency freshness
  - Known issues
- [ ] Set up regular cleanup of:
  - Dead files
  - Unused code
  - Outdated dependencies
- [ ] Document health check process

See [Templates](Templates.md) for HEALTHCHECK.md template.

**Action:** Document incident response process | **USER**
- [ ] Define incident severity levels:
  - P0/Critical: Service down, data loss, security breach
  - P1/High: Major feature broken, significant performance degradation
  - P2/Medium: Minor feature broken, some users affected
  - P3/Low: Cosmetic issues, edge cases, non-critical bugs
- [ ] Document response SLAs per severity:
  - P0: Immediate response, 1-hour resolution target
  - P1: 15-minute response, 4-hour resolution target
  - P2: 1-hour response, 24-hour resolution target
  - P3: 24-hour response, next release cycle
- [ ] Set up on-call rotation and escalation process:
  - Primary on-call (first responder)
  - Secondary on-call (escalation)
  - Engineering manager/lead (for P0/P1)
- [ ] Create incident communication channels (Slack, PagerDuty, etc.)
- [ ] Document post-mortem process:
  - Blameless culture: Focus on process, not people
  - Conduct within 5 days of incident resolution
  - Document: timeline, root cause, impact, action items, follow-ups
  - Share learnings with team
- [ ] Create runbook templates in `docs/runbooks/` for common incidents
- [ ] Link from `docs/operations.md` (see [Section 7 P1](07-Documentation-Standards.md))
- [ ] Integrate with monitoring/alerting (see P2 below)

**Action:** Implement AI-Native Provenance Tracking (for AI/agent repositories) | **AGENT**
- [ ] Set up provenance tracking system for AI agent interactions:
  - [ ] Track prompts and responses with metadata (timestamp, model, version)
  - [ ] Capture decision rationale and context
  - [ ] Store interaction chains and dependencies
  - [ ] Enable error traceability to source (hallucination detection)
- [ ] Choose provenance format:
  - [ ] W3C PROV (PROV-O) for standard compliance
  - [ ] JSON-LD for structured metadata
  - [ ] Custom schema aligned with PROV-AGENT model
- [ ] Integrate with observability systems:
  - [ ] Store provenance data in structured logging (Section 11 P0)
  - [ ] Include provenance in error traces
  - [ ] Create provenance visualization dashboard
- [ ] Document provenance schema and usage in `docs/ai-provenance.md`
- [ ] Add provenance validation to CI/CD (Section 5) for AI-native repos
- [ ] **Note:** Required for repositories using AI agents, LLMs, or automated decision systems

See [Templates](Templates.md) for AI Provenance Schema template.

## P2 — Advanced Actions

**Action:** Automate health checks | **AGENT**
- [ ] Set up automated repository linting (structure linter)
- [ ] Schedule weekly or monthly repo audits
- [ ] Create health check automation script
- [ ] Track health metrics over time

**Action:** Set up experiment tracking (for AI/ML repositories) | **AGENT**
- [ ] Choose experiment tracking framework:
  - [ ] MLflow
  - [ ] Weights & Biases
  - [ ] TensorBoard
  - [ ] Custom solution
- [ ] Configure experiment tracking:
  - [ ] Track hyperparameters
  - [ ] Log metrics and artifacts
  - [ ] Version models and datasets
- [ ] Dataset versioning:
  - [ ] DVC (Data Version Control)
  - [ ] Git LFS for large files
- [ ] Document experiment tracking setup in `docs/experiment-tracking.md`
- [ ] **Note:** Required for repositories with machine learning or AI model training

## Decision: What observability do you need?

**Assess your requirements:**

**Basic Logging (All Projects):**
- [ ] Structured logging (JSON format)
- [ ] Error context (message, stack trace, request ID)
- [ ] Logging levels documented

**Health Monitoring (Production Apps):**
- [ ] HEALTHCHECK.md file
- [ ] Health check endpoints (if applicable)
- [ ] Incident response process

**Advanced Observability (Complex Systems):**
- [ ] Metrics/telemetry collection
- [ ] Error tracking (Sentry, Rollbar)
- [ ] Distributed tracing
- [ ] Performance monitoring

**AI/ML Specific (If Applicable):**
- [ ] AI provenance tracking
- [ ] Experiment tracking (MLflow, W&B)
- [ ] Model versioning

**Action:** Implement observability appropriate to your project | **USER**
- [ ] Start with basic logging (P0)
- [ ] Add health monitoring for production (P1)
- [ ] Consider advanced observability for complex systems (P2)

## Verification

**Manual Check:**
- [ ] Verify structured logging is configured (JSON format)
- [ ] Check errors include sufficient context
- [ ] Verify logging format is documented
- [ ] If P1 completed: Check HEALTHCHECK.md exists
- [ ] If P1 completed: Verify incident response process is documented
- [ ] Test logging: Generate an error and verify it's logged correctly

**Automated Check (Future):**
```bash
./scripts/validate-section-11.sh
```

**Done Criteria:**
- ✅ Structured logging configured
- ✅ Errors include sufficient context
- ✅ Logging format documented
- ✅ HEALTHCHECK.md exists (if P1 completed)
- ✅ Incident response process documented (if P1 completed)

## Common Issues & Solutions

**Issue:** "I don't know what structured logging means"  
- **Solution:** 
  - Structured = Consistent format (usually JSON)
  - Example: `{"level":"error","message":"Failed to connect","timestamp":"2026-01-28T10:00:00Z"}`
  - Use logging libraries: Winston (Node.js), structlog (Python), logrus (Go)
  - Enables better search and analysis

**Issue:** "My logs are too verbose"  
- **Solution:** 
  - Use log levels: DEBUG, INFO, WARN, ERROR
  - Set appropriate level for environment (DEBUG in dev, INFO in prod)
  - Filter logs by level in production
  - Don't log sensitive information (passwords, tokens)

**Issue:** "I don't know if I need HEALTHCHECK.md"  
- **Solution:** 
  - HEALTHCHECK.md = Repository health status
  - Useful for: Tracking build status, test coverage, dependency freshness
  - Start simple: Build status, test status, known issues
  - Update regularly (weekly or monthly)

**Issue:** "Incident response seems too formal"  
- **Solution:** 
  - Start with basic severity levels (P0-P3)
  - Define simple SLAs (response time, resolution time)
  - Add more process as team grows
  - Focus on blameless culture and learning

**Issue:** "I don't know if I need AI provenance tracking"  
- **Solution:** 
  - Only needed if: Using AI agents, LLMs, automated decision systems
  - Tracks: Prompts, responses, decisions, context
  - Helps with: Debugging, auditing, compliance
  - Skip if not using AI/ML