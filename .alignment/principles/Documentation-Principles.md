# Documentation Principles

**Related Standards:** [Section 7: Documentation Standards](../standards/07-Documentation-Standards.md)  
**Related Research:** [Documentation Standards Research](../research/07-Documentation-Standards-Research.md)

> **Core Principle:** Documentation is code. It should be versioned, reviewed, tested, and kept current. Good documentation is findable, accessible, and written for its audience.

This document defines the philosophical principles that guide documentation practices. For implementation checklists and step-by-step guidance, see [Section 7: Documentation Standards](../standards/07-Documentation-Standards.md).

---

## 1) Docs as code

### Documentation is code

Documentation should be treated like code:
- **Versioned** - In the same repository as code
- **Reviewed** - Through pull requests
- **Tested** - Examples and commands are validated
- **Maintained** - Updated when code changes

### Benefits of docs as code

- **Single source of truth** - Documentation lives with code
- **Version control** - Track changes, see history
- **Code review** - Documentation reviewed with code
- **Automation** - Generate docs from code
- **Consistency** - Same process as code changes

### Documentation debt is technical debt

- Outdated documentation is as bad as broken code
- Update documentation when code changes
- Review documentation in code reviews
- Treat documentation bugs like code bugs

---

## 2) Living documentation

### Documentation stays current

Documentation should reflect the current state of the codebase. Stale documentation is worse than no documentation.

**Keep documentation current:**
- **Update with code** - Change docs when code changes
- **Review in PRs** - Check docs in code reviews
- **Test examples** - Validate examples work
- **Remove outdated** - Delete obsolete documentation

### Documentation lifecycle

- **Create** - Write docs when creating features
- **Update** - Update docs when changing features
- **Review** - Review docs in code reviews
- **Remove** - Delete docs for removed features

### Automation helps

- **Generate from code** - API docs from code
- **Validate examples** - Test code examples
- **Check freshness** - Alert on stale docs
- **Auto-update** - Update badges, versions

---

## 3) FAIR principles

### Findable

Documentation should be easy to find:
- **Clear structure** - Logical organization
- **Standard locations** - README, docs/, etc.
- **Searchable** - Good titles, keywords
- **Linked** - Cross-references work

### Accessible

Documentation should be accessible:
- **Open licensing** - Clear license terms
- **Available** - Not behind paywalls
- **Formats** - Multiple formats when needed
- **Accessibility** - Screen reader compatible

### Interoperable

Documentation should work with tools:
- **Standard formats** - Markdown, OpenAPI, etc.
- **Machine-readable** - APIs, schemas
- **Tool integration** - Works with IDEs, tools
- **Exportable** - Can be exported/imported

### Reusable

Documentation should be reusable:
- **Clear licensing** - Can be reused
- **Modular** - Can be used in parts
- **Examples** - Can be copied/adapted
- **Templates** - Can be used as templates

---

## 4) Audience awareness

### Write for your audience

Documentation should be written for its intended audience:
- **Users** - How to use the software
- **Developers** - How to contribute
- **Operators** - How to run/deploy
- **Newcomers** - Getting started guides

### Know your audience

- **Technical level** - Match audience expertise
- **Use cases** - Address their needs
- **Context** - Provide necessary context
- **Examples** - Show real-world usage

### Multiple audiences, multiple docs

- **README** - Entry point for all
- **User docs** - How to use
- **Developer docs** - How to contribute
- **API docs** - How to integrate
- **Operations docs** - How to deploy

---

## 5) Examples over explanations

### Show, don't just tell

Examples are more valuable than explanations:
- **Code examples** - Show how to use
- **Before/after** - Show transformation
- **Real scenarios** - Show real usage
- **Copy-paste ready** - Can be used directly

### Good examples

- **Complete** - Can run as-is
- **Realistic** - Real-world scenarios
- **Annotated** - Explain what's happening
- **Tested** - Examples are validated

### Bad examples

- **Incomplete** - Missing context
- **Theoretical** - Not realistic
- **Outdated** - Don't work anymore
- **Unclear** - Hard to understand

---

## 6) Clarity and simplicity

### Clear and concise

Documentation should be:
- **Clear** - Easy to understand
- **Concise** - No unnecessary words
- **Organized** - Logical structure
- **Scannable** - Easy to scan

### Writing principles

- **Plain language** - Avoid jargon when possible
- **Short sentences** - One idea per sentence
- **Active voice** - "Do this" not "This should be done"
- **Lists** - Use lists for multiple items
- **Headings** - Clear hierarchy

### Structure matters

- **Table of contents** - For long docs
- **Clear headings** - Describe content
- **Logical flow** - Start to finish
- **Cross-references** - Link related content

---

## 7) Documentation types

### Different docs for different needs

- **README** - Project overview, quick start
- **API docs** - Function/endpoint reference
- **Guides** - Step-by-step tutorials
- **Architecture** - System design
- **Onboarding** - Getting started
- **Runbooks** - Operational procedures

### Each type has a purpose

- **Reference** - Complete, detailed
- **Tutorial** - Step-by-step, learning
- **Guide** - How-to, problem-solving
- **Explanation** - Why, concepts

---

## "Golden rules" checklist

* Documentation is code - versioned, reviewed, tested
* Keep documentation current - update with code
* Write for your audience - know who you're writing for
* Examples over explanations - show, don't just tell
* Clear and concise - easy to understand
* Structure matters - logical organization
* Test examples - validate code examples
* Review documentation - in code reviews
* Remove outdated docs - delete obsolete content
* Documentation debt is technical debt

---

## Implementation Guidance

For implementation guidance, see:
- **[Section 7: Documentation Standards](../standards/07-Documentation-Standards.md)** - Step-by-step implementation checklists
- **[Documentation Standards Research](../research/07-Documentation-Standards-Research.md)** - Evidence base and best practices

For related guidance:
- **[Section 12: Change Management](../standards/12-Change-Management.md)** - Changelog documentation

---

## External Standards & References

- [FAIR Principles](https://www.go-fair.org/fair-principles/) - Findable, Accessible, Interoperable, Reusable
- [Write the Docs](https://www.writethedocs.org/) - Documentation community
- [Docs as Code](https://www.writethedocs.org/guide/docs-as-code/) - Documentation methodology

---

## Documentation Best Practices

### README Best Practices

- **Clear title** - What the project is
- **Description** - Brief overview
- **Installation** - How to install
- **Usage** - How to use
- **Examples** - Code examples
- **Contributing** - How to contribute
- **License** - License information

### API Documentation

- **OpenAPI/Swagger** - Standard format
- **Examples** - Request/response examples
- **Error codes** - Error documentation
- **Authentication** - Auth documentation
- **Versioning** - API versioning

### Code Documentation

- **Comments** - Explain why, not what
- **Docstrings** - Function documentation
- **Type hints** - Type information
- **Examples** - Usage examples

---

## Documentation Automation

### Generate from code

- **API docs** - From OpenAPI/Swagger
- **Code docs** - From docstrings
- **Architecture** - From code structure
- **Dependencies** - From dependency files

### Validate documentation

- **Link checking** - Validate links
- **Example testing** - Test code examples
- **Spell checking** - Check spelling
- **Format validation** - Validate formats

### Keep current

- **Auto-update** - Update badges, versions
- **Freshness checks** - Alert on stale docs
- **CI integration** - Validate in CI/CD
- **Automated generation** - Generate from source

---

## Documentation Maintenance

### Regular updates

- **With code changes** - Update when code changes
- **Regular reviews** - Review periodically
- **User feedback** - Incorporate feedback
- **Version updates** - Update for new versions

### Remove outdated

- **Delete obsolete** - Remove outdated docs
- **Archive old** - Archive if needed
- **Update references** - Fix broken links
- **Version history** - Keep in git history

### Documentation metrics

- **Coverage** - What's documented
- **Freshness** - How current
- **Usage** - What's used
- **Feedback** - User feedback
