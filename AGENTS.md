```markdown
# AGENTS.md

This repository uses **TOON (Token‑Oriented Object Notation)** to store structured, agent-friendly data with lower token overhead than JSON. TOON files declare a schema once and list rows as compact tables, making them efficient for AI agents to parse.

## Canonical Agents Registry

The canonical registry of agents for this repo is:
- `AGENTS/AGENTS.toon`

`AGENTS/AGENTS.toon` is the single source of truth. If an agent definition changes, update that file.

## Related Files

- `AGENTS/TOON.toon` — format definition and examples
- `AGENTS/tasks/BACKLOG.toon` — idea intake
- `AGENTS/tasks/TODO.toon` — active work
- `AGENTS/tasks/ARCHIVE.toon` — completed work
```
