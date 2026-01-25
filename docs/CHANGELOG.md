# Changelog

All notable changes to Firebase Studio will be documented in this file.

## Table of Contents

- [Unreleased](#unreleased)
- [0.1.0 - 2025-01-24](#010---2025-01-24)
- [Future Releases](#future-releases)
- [Version History](#version-history)
- [Migration Guides](#migration-guides)
- [Breaking Changes](#breaking-changes)
- [Deprecations](#deprecations)
- [Related Documentation](#related-documentation)

---

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **Repository Access Operations (RA-01, RA-02, RA-03)**: Safe repository access with bounds
  - Default branch resolution via `getRepositoryInfo()`
  - Bounded branch listing with pagination (max 100 per page)
  - Tree fetching with recursion limits (max 10000 entries, max depth 10)
  - Typed interfaces for repository info, branches, and trees
  - 21 unit tests for repository reader module
  - Automatic truncation detection for large repositories
  - Error handling for API failures
- **Observability System (BP-OBS-005)**: Comprehensive OpenTelemetry metrics and tracing
  - Prometheus-compatible metrics export at `/api/metrics` endpoint
  - HTTP request metrics (count, duration, error rates)
  - Business metrics (session_created, preview_generated, etc.)
  - Distributed tracing with span creation and management
  - Integration with existing correlation IDs
  - Instrumentation for sessions API endpoint
  - 46 unit tests for metrics and tracing modules
- Comprehensive test suite (17 test files)
- Complete API documentation
- Architecture documentation
- Security documentation
- Development guide
- Testing guide
- Database schema documentation
- GitHub App setup guide
- State machine documentation
- Path policy documentation
- Contributing guide
- Code style guide
- Features documentation
- Configuration reference
- Performance guide
- Monitoring guide
- Troubleshooting guide
- Changelog

### Changed

- Improved documentation structure
- Enhanced code comments

## [0.1.0] - 2025-01-24

### Added

- Agent session management
- Session state machine
- Step timeline tracking
- AI chat integration (streaming and non-streaming)
- GitHub repository integration
- GitHub App authentication
- Path policy enforcement
- Kill-switch (read-only mode)
- Structured logging
- Response caching
- Multi-model AI support
- NextAuth authentication
- File-based session storage

### Security

- User isolation enforcement
- Path policy for repository files
- Fail-closed security model
- Secret management

## Future Releases

### Planned

- Preview/Apply workflow
- Approval system
- PALADIN framework
- Unicode sanitization
- Rate limiting
- Database migration
- Webhook support
- Enhanced monitoring

---

## Version History

- **0.1.0** - Initial release with core features
- **Unreleased** - Documentation and test suite additions

## Migration Guides

### No migrations required for current version

Future versions may require:

- Database migration (from file-based to database)
- Configuration updates
- API versioning

## Breaking Changes

### None yet

Future breaking changes will be documented here with migration instructions.

## Deprecations

### repository field

The `repository` string field is deprecated in favor of `repo` object.

**Migration:**

```typescript
// Old
{ repository: "owner/repo" }

// New
{ repo: { owner: "owner", name: "repo", baseBranch: "main" } }
```

### name field in steps

The `name` field in `AgentSessionStep` is deprecated in favor of `type`.

**Migration:**

```typescript
// Old
{ name: "plan", type: "plan" }

// New
{ type: "plan" }
```

### timestamp field in steps

The `timestamp` field is deprecated in favor of `startedAt`/`endedAt`.

**Migration:**

```typescript
// Old
{ timestamp: "2025-01-24T00:00:00.000Z" }

// New
{ startedAt: "2025-01-24T00:00:00.000Z", endedAt: "2025-01-24T00:05:00.000Z" }
```

## Related Documentation

- **[README.md](../README.md)** - Project overview
- **[TODO.md](../TODO.md)** - Development roadmap
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Deployment guide
- **[API.md](./API.md)** - API changes

## Version Compatibility Matrix

| Version    | Node.js | Next.js | Breaking Changes |
| ---------- | ------- | ------- | ---------------- |
| 0.1.0      | 20+     | 15.3.8  | None             |
| Unreleased | 20+     | 15.3.8  | None (yet)       |

## Change Types

- **Added:** New features
- **Changed:** Changes in existing functionality
- **Deprecated:** Soon-to-be removed features
- **Removed:** Removed features
- **Fixed:** Bug fixes
- **Security:** Security fixes
