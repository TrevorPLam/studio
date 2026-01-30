# Change Management Principles

**Related Standards:** [Section 12: Change Management](../standards/12-Change-Management.md)  
**Related Research:** [Change Management Research](../research/12-Change-Management-Research.md)

> **Core Principle:** Version numbers communicate intent. Changes communicate impact. Breaking changes require planning, deprecation, and clear communication.

This document defines the philosophical principles that guide change management practices. For implementation checklists and step-by-step guidance, see [Section 12: Change Management](../standards/12-Change-Management.md).

---

## 1) Semantic Versioning communicates intent

### Version numbers are promises

Version numbers communicate what users can expect from a release. They are promises about compatibility and change impact.

**Semantic Versioning (SemVer):**
- **MAJOR.MINOR.PATCH** (e.g., 1.2.3)
- **MAJOR** - Breaking changes (incompatible API changes)
- **MINOR** - New features (backward compatible)
- **PATCH** - Bug fixes (backward compatible)

### Version number meaning

- **1.0.0 → 2.0.0** - "This release has breaking changes. You'll need to update your code."
- **1.0.0 → 1.1.0** - "This release adds new features. Your existing code will still work."
- **1.0.0 → 1.0.1** - "This release fixes bugs. Your existing code will still work."

### Pre-release versions

- **1.0.0-alpha.1** - Early preview, unstable
- **1.0.0-beta.1** - Feature complete, testing
- **1.0.0-rc.1** - Release candidate, stable

---

## 2) Breaking changes require planning

### Breaking changes are costly

Breaking changes force users to update their code. This is costly for users and can break their systems. Minimize breaking changes.

**What is a breaking change?**
- Removing or renaming public APIs
- Changing function signatures
- Removing configuration options
- Changing default behavior
- Removing features

### Plan breaking changes

- **Announce early** - Give users time to prepare
- **Deprecate first** - Mark features as deprecated before removing
- **Provide migration guides** - Help users transition
- **Version appropriately** - Use MAJOR version bump
- **Communicate clearly** - Explain why and how to migrate

### Minimize breaking changes

- Prefer additive changes (add new, don't remove old)
- Maintain backward compatibility when possible
- Use feature flags for experimental features
- Version APIs separately when possible

---

## 3) Deprecation before removal

### Deprecation strategy

Never remove features without deprecation. Deprecation gives users time to adapt.

**Deprecation process:**
1. **Mark as deprecated** - Add deprecation notice
2. **Document migration path** - Show how to update
3. **Set removal timeline** - Tell users when it will be removed
4. **Remove in next MAJOR** - Remove only in MAJOR version bump

### Deprecation timeline

- **Deprecate** - Mark feature as deprecated in MINOR release
- **Warn** - Show warnings when deprecated feature is used
- **Remove** - Remove in next MAJOR release (at least one release cycle later)

### Clear deprecation notices

- **In code** - Deprecation annotations/comments
- **In documentation** - Clear deprecation notices
- **In changelog** - Document deprecations
- **In release notes** - Highlight deprecations

---

## 4) Change communication is essential

### Communicate all changes

Users need to know what changed, why it changed, and how it affects them.

**What to communicate:**
- **What changed** - Clear description of changes
- **Why it changed** - Rationale for the change
- **Impact** - How it affects users
- **Migration** - How to update code

### Changelog is the source of truth

- **CHANGELOG.md** - Human-readable change log
- **Keep a Changelog format** - Standard format
- **Categorized changes** - Added, Changed, Deprecated, Removed, Fixed, Security
- **Versioned entries** - One entry per version

### Release notes for users

- **User-focused** - Explain impact to users
- **Highlight breaking changes** - Make them obvious
- **Migration guides** - Step-by-step instructions
- **Examples** - Show before/after code

---

## 5) Commit messages document history

### Commit messages are documentation

Commit messages document what changed and why. They enable automatic changelog generation and help future developers understand history.

**Conventional Commits format:**
```
type(scope): description

[optional body]

[optional footer]
```

### Commit message principles

- **Imperative mood** - "Add feature" not "Added feature"
- **Clear and concise** - First line < 50 characters
- **Descriptive** - Explain what and why
- **Reference issues** - Link to issues/PRs
- **Mark breaking changes** - Use `!` or `BREAKING CHANGE:`

### Commit types

- **feat** - New feature
- **fix** - Bug fix
- **docs** - Documentation
- **style** - Formatting
- **refactor** - Code restructuring
- **test** - Tests
- **chore** - Maintenance
- **perf** - Performance
- **ci** - CI/CD changes
- **build** - Build system changes
- **revert** - Revert previous commit

---

## 6) Automated change management

### Automate what can be automated

- **Changelog generation** - From commit messages
- **Version bumping** - Based on commit types
- **Release notes** - Generated from changelog
- **Tagging** - Automatic version tags

### Benefits of automation

- **Consistency** - Same format every time
- **Accuracy** - No missed changes
- **Time savings** - Less manual work
- **Less errors** - Automated validation

### Manual review still required

- **Review generated changelog** - Ensure accuracy
- **Edit for clarity** - Improve descriptions
- **Add context** - Explain why, not just what
- **Highlight important changes** - Make breaking changes obvious

---

## 7) Change impact assessment

### Assess change impact

Before making changes, assess the impact:
- **Who is affected?** - Users, developers, systems
- **What breaks?** - APIs, configurations, workflows
- **How severe?** - Minor inconvenience vs. system breakage
- **Migration effort?** - Easy update vs. major rewrite

### Version accordingly

- **MAJOR** - Breaking changes, high impact
- **MINOR** - New features, low impact
- **PATCH** - Bug fixes, no impact

### Communicate impact

- **Changelog** - Document impact
- **Release notes** - Explain impact to users
- **Migration guides** - Help users adapt
- **Deprecation notices** - Warn about future changes

---

## "Golden rules" checklist

* Version numbers communicate intent
* Breaking changes require planning
* Deprecate before removing
* Communicate changes clearly
* Commit messages document history
* Automate change management
* Assess change impact
* Provide migration paths
* Changelog is the source of truth
* Release notes are user-focused

---

## Implementation Guidance

For implementation guidance, see:
- **[Section 12: Change Management](../standards/12-Change-Management.md)** - Step-by-step implementation checklists
- **[Change Management Research](../research/12-Change-Management-Research.md)** - Evidence base and best practices

For related guidance:
- **[Section 0: Prerequisites](../standards/00-Prerequisites.md)** - Versioning decision
- **[Section 7: Documentation Standards](../standards/07-Documentation-Standards.md)** - Changelog format

---

## External Standards & References

- [Semantic Versioning 2.0.0](https://semver.org/) - Version number specification
- [Conventional Commits](https://www.conventionalcommits.org/) - Commit message specification
- [Keep a Changelog](https://keepachangelog.com/) - Changelog format specification
- [Semantic Release](https://semantic-release.gitbook.io/) - Automated release management

---

## Versioning Strategies

### Semantic Versioning (SemVer)

**Format:** MAJOR.MINOR.PATCH

- **MAJOR** - Breaking changes
- **MINOR** - New features, backward compatible
- **PATCH** - Bug fixes, backward compatible

**Best for:** Libraries, APIs, published packages

### Calendar Versioning (CalVer)

**Format:** YYYY.MM.DD or YYYY.MM

- Based on release date
- Predictable version numbers
- No breaking change indication

**Best for:** Operating systems, applications with regular releases

### Custom Schemes

- Project-specific versioning
- Must be documented clearly
- Should follow similar principles

---

## Breaking Changes Philosophy

### When to make breaking changes

- **Security fixes** - Security takes priority
- **Major architectural changes** - Necessary improvements
- **Removing deprecated features** - After deprecation period
- **Fixing design mistakes** - Better to fix than maintain

### How to minimize impact

- **Deprecate first** - Give users time
- **Provide migration guides** - Help users adapt
- **Version appropriately** - Use MAJOR version
- **Communicate clearly** - Explain why and how

### Breaking change communication

- **Announce early** - Before release
- **Deprecation period** - At least one release cycle
- **Migration guide** - Step-by-step instructions
- **Support period** - Help users migrate

---

## Changelog Best Practices

### Keep a Changelog format

```markdown
## [1.2.0] - 2026-01-28

### Added
- New feature X

### Changed
- Improved Y

### Deprecated
- Feature Z (will be removed in 2.0.0)

### Removed
- Old feature (was deprecated in 1.1.0)

### Fixed
- Bug fix

### Security
- Vulnerability fix
```

### Changelog principles

- **Chronological** - Newest first
- **Categorized** - Group by type
- **Descriptive** - Clear descriptions
- **User-focused** - Explain impact
- **Complete** - All changes documented

---

## Commit Message Best Practices

### Conventional Commits format

```
type(scope): description

[optional body explaining why]

[optional footer with references]
```

### Good commit messages

```
feat(auth): add OAuth2 support

Implements OAuth2 authentication flow to enable
third-party login providers.

Closes #123
```

```
fix(api): handle null response in user endpoint

Prevents crash when user data is missing.

Fixes #456
```

```
refactor!: rename UserService to UserManager

BREAKING CHANGE: UserService class renamed to UserManager.
Update imports: import { UserManager } from './services'

Closes #789
```

### Bad commit messages

```
fix bug
update code
changes
wip
```

---

## Release Management

### Release process

1. **Development** - Feature development
2. **Testing** - QA and testing
3. **Version bump** - Update version number
4. **Changelog** - Update changelog
5. **Tag** - Create version tag
6. **Release notes** - Generate release notes
7. **Deploy** - Deploy to production

### Release automation

- **Automatic versioning** - Based on commit types
- **Automatic changelog** - Generated from commits
- **Automatic tagging** - Version tags
- **Automatic deployment** - Deploy on release

### Release communication

- **Release notes** - User-facing changes
- **Breaking changes** - Highlighted clearly
- **Migration guides** - Step-by-step instructions
- **Support** - Help users migrate

---

## Change Impact Analysis

### Assess before changing

- **Who is affected?** - Users, developers, systems
- **What breaks?** - APIs, configurations, workflows
- **How severe?** - Impact assessment
- **Migration effort?** - Update complexity

### Version accordingly

- **MAJOR** - High impact, breaking changes
- **MINOR** - Low impact, new features
- **PATCH** - No impact, bug fixes

### Communicate impact

- **Changelog** - Document impact
- **Release notes** - Explain to users
- **Migration guides** - Help adapt
- **Deprecation notices** - Warn about future
