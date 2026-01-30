# 7. Documentation Standards

**Prerequisites:** 
- [Section 0: Prerequisites](00-Prerequisites.md) - Complete decision points
- [Section 2: Source Code Layout](02-Source-Code-Layout.md) - Complete source structure before documenting it

**Principles:**
- [Documentation Principles](../principles/Documentation-Principles.md) - Core philosophy: *Documentation is code. It should be versioned, reviewed, tested, and kept current. Good documentation is findable, accessible, and written for its audience.*
  - Key concepts: Docs as code, living documentation, FAIR principles (Findable, Accessible, Interoperable, Reusable), audience awareness, examples over explanations

**Effort Estimate:**
- **Basic README.md:** 30-60 minutes
- **Complete documentation (README + docs/):** 2-4 hours
- **Developer onboarding guide:** 2-3 hours additional
- **API documentation (OpenAPI/Swagger):** 2-4 hours additional
- **Automated documentation generation:** 1-2 hours setup

## 🎯 What You're Trying to Accomplish
Create documentation that helps someone new understand, run, and contribute to the project without guessing.

## 🎓 Why This Section Exists
Good docs reduce support load and speed up onboarding. Poor docs slow everything down.

## 📚 Key Concepts (Mentor Mode)

### README
**Simple:** The front door of the project.
**Why it matters:** It’s the first file people read.

### Docs index
**Simple:** A map of all deeper documentation.
**Why it matters:** Prevents lost or duplicated docs.

### Audience awareness
**Simple:** Write for beginners first, experts second.
**Why it matters:** Improves adoption and success rate.

## ✅ Subtasks (With Owner Tags)

#### Subtask 7.1 — Inventory existing docs | **USER**
**Purpose:** Know what you already have.
**Expected outcome:** List of current docs and gaps.

#### Subtask 7.2 — Create docs index | **AGENT**
**Purpose:** Provide a clear navigation starting point.
**Expected outcome:** `docs/README.md` with links.

#### Subtask 7.3 — Update README essentials | **USER**
**Purpose:** Ensure basics are covered.
**Expected outcome:** README includes overview, install, usage.

#### Subtask 7.4 — Add contribution and support links | **AGENT**
**Purpose:** Make collaboration easy.
**Expected outcome:** Links to CONTRIBUTING, community, issues.

#### Subtask 7.5 — Validate doc links | **AGENT**
**Purpose:** Prevent broken navigation.
**Expected outcome:** Internal links verified.

## 📘 Detailed Reference (Original Guidance)

## Before/After Examples

### Example 1: README Improvement

**BEFORE (minimal README):**
```markdown
# My Project

Some code I wrote.
```

**AFTER (ALIGNMENT-compliant README):**
```markdown
# My Project

Brief description (1-2 sentences) of what this project does.

## Installation

\`\`\`bash
npm install
\`\`\`

## Usage

\`\`\`bash
npm start
\`\`\`

## Project Structure

- `src/` - Source code
- `tests/` - Test files
- `docs/` - Documentation

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md)

## License

MIT - See [LICENSE](LICENSE)
```

**Changes Made:**
- Added installation instructions
- Added usage examples
- Documented project structure
- Added contributing and license sections

### Example 2: Documentation Structure

**BEFORE (all docs in root):**
```
project/
├── README.md
├── SETUP.md
├── API.md
├── ARCHITECTURE.md
└── CONTRIBUTING.md
```

**AFTER (organized docs/ folder):**
```
project/
├── README.md
├── CONTRIBUTING.md
└── docs/
    ├── setup.md
    ├── api.md
    ├── architecture.md
    └── onboarding.md
```

**Changes Made:**
- Moved detailed docs → `docs/` folder
- Kept README and CONTRIBUTING in root (standard location)
- Organized by topic

## P0 — Required Actions

**Action:** Create essential documentation (see [Documentation Principles](../principles/Documentation-Principles.md) for foundational concepts) | **USER**
- [ ] Write `README.md` that answers in under 1 minute:
  - What the repo is
  - How to install/run it
  - Where the code lives (reference [Section 2](02-Source-Code-Layout.md) structure)
  - How to contribute and get help
- [ ] Apply docs as code principle (see [Documentation Principles](../principles/Documentation-Principles.md)):
  - [ ] Documentation versioned in repository
  - [ ] Documentation reviewed in PRs
  - [ ] Documentation updated when code changes
- [ ] Add `LICENSE` file (mandatory for public repos, optional for private)

See [Templates](Templates.md) for README template.

## P1 — Recommended Actions

**Action:** Expand documentation (see [Documentation Principles](../principles/Documentation-Principles.md) for organization principles) | **USER**
- [ ] Ensure `docs/` folder exists (should be created in [Section 1 P1](01-Root-Directory-Structure.md))
- [ ] Apply living documentation principle (see [Documentation Principles](../principles/Documentation-Principles.md)):
  - [ ] Update documentation when code changes
  - [ ] Review documentation in code reviews
  - [ ] Remove outdated documentation
  - [ ] Test examples to ensure they work
- [ ] Populate `docs/` folder with structure:
  - `docs/architecture.md` - System design
  - `docs/setup.md` - Detailed setup instructions
  - `docs/operations.md` - Operational procedures
  - `docs/onboarding.md` - Developer onboarding guide (see below)
- [ ] Write for your audience (see [Documentation Principles](../principles/Documentation-Principles.md)):
  - [ ] Users - How to use the software
  - [ ] Developers - How to contribute
  - [ ] Operators - How to run/deploy
- [ ] Use examples over explanations (see [Documentation Principles](../principles/Documentation-Principles.md)):
  - [ ] Show, don't just tell
  - [ ] Provide code examples
  - [ ] Make examples copy-paste ready
  - [ ] Test examples to ensure they work
- [ ] Add sub-READMEs in major directories (`src/README.md`, `infra/README.md`)
- [ ] Include diagrams (Mermaid or images) for complex systems
- [ ] For APIs: maintain OpenAPI/Swagger specs
- [ ] Ensure accessibility: alt text for images, screen reader compatibility

**Action:** Create developer onboarding documentation | **USER**
- [ ] Create `docs/onboarding.md` with:
  - Prerequisites: Required tools, versions, accounts, access requests
  - Local development setup: Step-by-step instructions to get running
  - First contribution walkthrough: End-to-end example (fork, branch, change, PR)
  - Common issues and solutions: Troubleshooting guide for frequent problems
  - Team communication: Channels, meeting times, key contacts
  - Code style and conventions: Quick reference to standards
  - Where to get help: Links to docs, Slack channels, etc.
- [ ] Link from README.md "Getting Started" or "Contributing" section
- [ ] Keep onboarding guide updated with codebase and process changes
- [ ] Consider adding a "Day 1" checklist for new developers

**Action:** Document API versioning strategy (for API projects) | **USER**
- [ ] Choose versioning scheme:
  - URL versioning: `/api/v1/`, `/api/v2/` (recommended for REST APIs)
  - Header versioning: `Accept: application/vnd.api+json;version=1` (for content negotiation)
- [ ] Document deprecation policy:
  - Deprecation notice period (typically 6-12 months before removal)
  - Breaking change communication process (changelog, release notes, announcements)
  - Migration guides for major versions
- [ ] Maintain version compatibility matrix in `docs/api.md` or `docs/architecture.md`
- [ ] Link to OpenAPI/Swagger specs (already in P1 above)
- [ ] Document versioning decisions in ADRs if significant (see P2 below)

**Action:** Implement FAIR Principles (Findable, Accessible, Interoperable, Reusable) | **USER**
- [ ] **Findable:**
  - [ ] Clear metadata in README (description, keywords, tags)
  - [ ] Standardized naming conventions
  - [ ] Repository description and topics configured
  - [ ] Persistent identifiers (DOI) if applicable
- [ ] **Accessible:**
  - [ ] Open licensing (LICENSE file)
  - [ ] Clear access procedures documented
  - [ ] Authentication/authorization documented
  - [ ] API access documented
- [ ] **Interoperable:**
  - [ ] Standard formats (JSON, YAML, OpenAPI)
  - [ ] API specifications (OpenAPI/Swagger)
  - [ ] Workflow descriptors (CWL, WDL, Nextflow)
  - [ ] Container specifications (Dockerfile)
- [ ] **Reusable:**
  - [ ] Clear licensing terms
  - [ ] Comprehensive documentation
  - [ ] Reproducibility guides
  - [ ] Usage examples
- [ ] Create FAIR metadata file:
  - [ ] ro-crate.json (RO-Crate format)
  - [ ] schema.org metadata
  - [ ] JSON-LD structured data
- [ ] Document FAIR compliance in `docs/fair-compliance.md`
- [ ] **Note:** Especially important for research/data repositories

**Action:** Set up automated documentation generation | **AGENT**
- [ ] Configure API documentation generation:
  - [ ] Generate from OpenAPI/Swagger specs
  - [ ] Use tools: Swagger UI, Redoc, or custom generator
  - [ ] Host generated docs (GitHub Pages, Netlify, etc.)
  - [ ] Auto-update on spec changes
- [ ] Configure code documentation generation:
  - [ ] JSDoc/TSDoc for JavaScript/TypeScript
  - [ ] GoDoc for Go
  - [ ] Sphinx for Python
  - [ ] Rustdoc for Rust
- [ ] Auto-update README:
  - [ ] Badge updates (build status, coverage, etc.)
  - [ ] Dependency version badges
  - [ ] Metrics and statistics
- [ ] Generate architecture diagrams:
  - [ ] From code structure
  - [ ] From dependency graphs
  - [ ] From API specifications
- [ ] CI job for documentation:
  - [ ] Validate documentation freshness
  - [ ] Rebuild docs on changes
  - [ ] Deploy updated docs
- [ ] Document process in `docs/automated-docs.md`

## P2 — Advanced Actions

**Action:** Advanced documentation | **USER**
- [ ] Create ADRs in `docs/adr/` following format: `####-decision-name.md`
- [ ] Add runbooks for operations and incident response
- [ ] Set up versioned documentation system (Docusaurus, MkDocs, etc.)
- [ ] Follow language-specific comment conventions (JSDoc, docstrings, etc.)

## Decision: What documentation do you need?

**From Section 0, determine your project type and document:**

**Library/Package:**
- [ ] **README content:** What installation steps are needed? What are the main usage examples?
- [ ] **API documentation:** Which functions/classes need documentation? What's the API surface?
- [ ] **Examples:** What example use cases should be demonstrated? Where should examples live?

**Application:**
- [ ] **README content:** What setup steps are required? What are the run commands?
- [ ] **Architecture:** What are the main components? How do they interact? What design decisions were made?
- [ ] **Onboarding:** What tools/accounts are needed? What's the first contribution workflow?

**API/Service:**
- [ ] **README content:** What's the API purpose? What are the main endpoints?
- [ ] **OpenAPI/Swagger:** What endpoints exist? What are request/response schemas?
- [ ] **Versioning:** What's the versioning strategy? How are breaking changes communicated?

**Infrastructure:**
- [ ] **README content:** What deployment steps are required? What environments exist?
- [ ] **Infrastructure docs:** What infrastructure components exist? How are they configured?
- [ ] **Environment setup:** What credentials/permissions are needed? How are environments provisioned?

## Verification

**Manual Check:**
- [ ] Verify `README.md` content is complete and accurate:
  - **What section:** Does it clearly explain the project's purpose?
  - **Install section:** Can a new user follow these steps successfully?
  - **Run section:** Are the commands correct and complete?
  - **Contribute section:** Is the contribution process clear?
- [ ] Check `LICENSE` file exists and matches your chosen license (if public repo)
- [ ] If `docs/` folder exists: verify structure is logical and files are findable
- [ ] **Test README:** Have someone unfamiliar with the project try to clone and run it - what issues do they encounter?
- [ ] Check for broken links: Use link checker tool
- [ ] Verify documentation matches current codebase: Are examples still valid? Are commands correct?

**Automated Check (Future):**
```bash
./scripts/validate-section-7.sh
```

**Done Criteria:**
- ✅ README.md exists and is complete
- ✅ LICENSE file exists (if public)
- ✅ Documentation is accurate and up-to-date
- ✅ No broken links in documentation
- ✅ Developer onboarding guide exists (if P1 completed)
- ✅ Documentation follows docs as code principle (versioned, reviewed, tested)
- ✅ Living documentation maintained (updated with code changes)
- ✅ Documentation written for audience (clear, examples, accessible)
- ✅ Documentation follows principles from [Documentation Principles](../principles/Documentation-Principles.md)

## Common Issues & Solutions

**Issue:** "My README is too long"  
- **Solution:** 
  - Keep README concise (under 1 minute read)
  - Move detailed docs to `docs/` folder
  - Use README as entry point with links to detailed docs

**Issue:** "I don't know what to put in README"  
- **Solution:** Use the template from [Templates.md](Templates.md)
- Must have: What it is, how to install, how to run, where code lives, how to contribute
- Should have: Badges, examples, screenshots (if applicable)

**Issue:** "docs/ folder doesn't exist"  
- **Solution:** 
  - Create it: `mkdir docs` (or `mkdir docs\` on Windows)
  - This is a P1 action, so it's okay to skip initially
  - Add it when you have more than README to document

**Issue:** "I don't know if I need API documentation"  
- **Solution:** 
  - If you have an API (REST, GraphQL, etc.) → Yes, document it
  - Use OpenAPI/Swagger for REST APIs
  - Use GraphQL schema documentation for GraphQL
  - If no API → Skip API-specific documentation

**Issue:** "My documentation is outdated"  
- **Solution:** 
  - Set up automated doc generation (P1 action)
  - Add documentation review to PR checklist
  - Update docs when code changes
  - Use "last updated" dates in docs

**Issue:** "I don't know what FAIR principles are"  
- **Solution:** 
  - FAIR = Findable, Accessible, Interoperable, Reusable
  - Important for research/data repositories
  - For most software projects, focus on basic documentation first
  - FAIR is P1/P2, so skip if not applicable