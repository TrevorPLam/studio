```markdown
# AGENTS.md

This repository uses **TOON (Token‑Oriented Object Notation)** to store structured, agent-friendly data with lower token overhead than JSON. TOON files declare a schema once and list rows as compact tables, making them efficient for AI agents to parse.

## Canonical Agents Registry

The canonical registry of agents for this repo is:
- `.agents/AGENTS.toon`

`.agents/AGENTS.toon` is the single source of truth. If an agent definition changes, update that file.

## Related Files

- `.agents/TOON.toon` — format definition and examples
- `.agents/tasks/BACKLOG.toon` — idea intake
- `.agents/tasks/TODO.toon` — active work
- `.agents/tasks/ARCHIVE.toon` — completed work
```
