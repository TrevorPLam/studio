# Configuration Principles

**Related Standards:** [Section 3: Configuration & Environment](../standards/03-Configuration-Environment.md)  
**Related Research:** [Configuration & Environment Research](../research/03-Configuration-Environment-Research.md)

> **Core Principle:** Treat config like code: versioned, validated, layered, and boring.

This document defines the philosophical principles that guide configuration management. For implementation checklists and step-by-step guidance, see [Section 3: Configuration & Environment](../standards/03-Configuration-Environment.md).

---

## 1) Stay up to date

### Single source of truth + generated outputs

Keep *one* canonical config (or schema + defaults) and **generate** environment-specific variants so you don't hand-edit 6 places.

### Explicit ownership + change log

Each config file has an owner, a "why it exists" header, and changes go through PRs.

### Deprecation policy

Add new keys without breaking old ones, mark old keys deprecated, remove on a scheduled date.

---

## 2) Compliment one another (no overlap wars)

Use a strict **layering model** (this is the biggest unlock):

**Base → Env → Region/Tenant → Secrets → Runtime overrides**

* **Base (defaults):** safe, minimal, works locally.
* **Env (dev/stage/prod):** only the deltas from base.
* **Region/Tenant:** only what's truly region/tenant-specific.
* **Secrets:** stored separately (vault/secret manager), referenced by key name, never duplicated.
* **Runtime:** flags/overrides via env vars/CLI for debugging, not permanent state.

### Rules that prevent config hell

* **"One key, one home."** Every setting is owned by exactly one layer. No duplicates across files.
* **Deltas only.** Higher layers contain only what differs from lower layers.
* **Override rules are deterministic.** Document precedence and stick to it.

---

## 3) Don't cause problems—solve problems

### Schema + validation is non-negotiable

Define a schema (JSON Schema / Pydantic / Zod / Yup—pick your stack) and validate on:

* app startup
* CI (every PR)
* deployment

### Strong typing + constraints

Not just "string"—validate ranges, enums, URL formats, required/optional keys.

### Fail fast, fail loud

If required config is missing/invalid, crash early with a clear error message.

### Safe defaults

Defaults should be *secure* and *non-destructive* (e.g., no "delete all" flags defaulting true).

### Config is additive; migrations handle change

If changing config requires data changes, treat it like a migration with rollback.

### No "magic"

If config is computed, compute it in one place and log the final resolved config (redacting secrets).

---

## A practical file layout that works everywhere

* `config/schema.*` (the contract)
* `config/default.*` (base defaults)
* `config/env/dev.*`, `config/env/stage.*`, `config/env/prod.*` (deltas)
* `config/regions/*` or `config/tenants/*` (optional deltas)
* secrets live in secret manager; app gets them via env vars or injected files
* `config/loader.*` (the only code that merges layers + validates)

---

## "Golden rules" checklist

* No secrets in repo.
* No duplicate keys across layers.
* Every config change tested in CI.
* Every config key documented (what/why/default/owner).
* Merging + precedence is deterministic and logged.

---

## Implementation Guidance

For implementation guidance, see:
- **[Section 3: Configuration & Environment](../standards/03-Configuration-Environment.md)** - Step-by-step implementation checklists
- **[Configuration & Environment Research](../research/03-Configuration-Environment-Research.md)** - Evidence base and best practices

For stack-specific guidance:
- **[Language Quick Starts](../reference/Language-Quick-Starts.md)** - Language-specific configuration patterns
- **[Platform Quick Starts](../reference/Platform-Quick-Starts.md)** - CI/CD platform configuration guidance

---

## Stack-Specific Recommendations

If you tell us your stack (Node/TS, Python, Go, etc.) and where config comes from today (dotenv, YAML, Helm, etc.), we can provide the exact recommended schema/loader pattern and file structure for it.

See [Language Quick Starts](../reference/Language-Quick-Starts.md) for stack-specific guidance.
