# Contributing to ALIGNMENT Standard

Thank you for your interest in improving the ALIGNMENT repository standard! This document explains how to contribute.

## What Can You Contribute?

- **Bug fixes:** Fix errors, typos, or unclear instructions
- **Improvements:** Enhance clarity, add examples, or expand coverage
- **New sections:** Add guidance for new scenarios or technologies
- **Validation scripts:** Create automated checks for sections
- **Templates:** Add or improve file templates
- **Examples:** Add before/after examples or real-world scenarios
- **Platform support:** Add guidance for additional CI/CD platforms or languages
- **Migration guidance:** Improve migration strategies for existing repos

## How to Contribute

### 1. Propose Changes

**For small changes (typos, clarifications):**
- Open an issue describing the change
- Or submit a pull request directly

**For larger changes:**
- Open an issue first to discuss the change
- Wait for feedback before implementing
- This helps avoid wasted effort if the change doesn't align with goals

### 2. Make Changes

1. **Fork the repository** (if contributing externally)
2. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-change-name
   ```
3. **Make your changes:**
   - Follow existing formatting and style
   - Update relevant sections
   - Add examples where helpful
   - Update cross-references if needed
4. **Test your changes:**
   - Review formatting (markdown linting)
   - Check all links work
   - Verify examples are accurate
5. **Commit your changes:**
   ```bash
   git commit -m "docs: add platform-specific guidance for Azure DevOps"
   ```
   Use [Conventional Commits](https://www.conventionalcommits.org/) format:
   - `docs:` - Documentation changes
   - `feat:` - New features/sections
   - `fix:` - Bug fixes
   - `refactor:` - Restructuring without changing meaning

### 3. Submit Changes

1. **Push your branch:**
   ```bash
   git push origin feature/your-change-name
   ```
2. **Open a pull request:**
   - Describe what changed and why
   - Reference any related issues
   - Include examples if applicable
3. **Respond to feedback:**
   - Address review comments
   - Make requested changes
   - Keep discussion constructive

## Writing Guidelines

### Tone and Style

- **Human-friendly:** Write for humans, not robots
- **Clear and concise:** Get to the point quickly
- **Actionable:** Provide specific steps, not vague guidance
- **Inclusive:** Use inclusive language
- **Examples:** Show, don't just tell

### Structure

- **Use priority tiers:** P0 (required), P1 (recommended), P2 (advanced)
- **Include verification:** Every section should have verification steps
- **Add examples:** Before/after examples help clarify expectations
- **Link references:** Cross-reference related sections
- **Common issues:** Include troubleshooting guidance

### Formatting

- Use markdown formatting consistently
- Follow existing section structure
- Use code blocks for commands and examples
- Include line numbers for code examples when helpful
- Use checkboxes for actionable items: `- [ ]`

## Section Structure Template

When adding a new section, follow this structure:

```markdown
# X. Section Name

**Prerequisites:** [List prerequisite sections]

**Effort Estimate:** [Time estimate]

## Questions to Answer
[Decision points if applicable]

## P0 — Required Actions
[Required tasks]

## P1 — Recommended Actions
[Recommended tasks]

## P2 — Advanced Actions
[Advanced tasks]

## Verification
[How to verify completion]

## Common Issues & Solutions
[Troubleshooting guidance]
```

## Validation Scripts

When adding validation scripts:

1. **Follow naming:** `validate-section-X.sh` where X is section number
2. **Use consistent format:** See existing scripts for pattern
3. **Return codes:** 0 for success, 1 for failure
4. **Output format:** Use emoji indicators (✅ ❌ ⚠️ ℹ️)
5. **Documentation:** Update `scripts/README.md`

## Testing Your Changes

Before submitting:

- [ ] Markdown renders correctly
- [ ] All links work (internal and external)
- [ ] Examples are accurate and tested
- [ ] Formatting is consistent
- [ ] No broken references
- [ ] Cross-references updated if needed

## Review Process

1. **Initial review:** Maintainers review for completeness and clarity
2. **Feedback:** May request changes or ask questions
3. **Approval:** Once approved, changes are merged
4. **Versioning:** Significant changes may trigger version bump

## Versioning

ALIGNMENT uses [Semantic Versioning](https://semver.org/):

- **MAJOR** (X.0.0): Breaking changes or major restructuring
- **MINOR** (0.X.0): New sections or significant additions
- **PATCH** (0.0.X): Bug fixes, clarifications, small improvements

Version is tracked in `README.md`.

## Questions?

- Open an issue for questions or discussions
- Check [Getting Help](Getting-Help.md) for resources
- Review existing issues/PRs for examples

## Code of Conduct

- Be respectful and constructive
- Focus on the content, not the person
- Help others learn and improve
- Welcome newcomers and their contributions

## Recognition

Contributors will be:
- Listed in release notes (for significant contributions)
- Credited in relevant sections (for major additions)
- Appreciated by the community! 🙏

---

Thank you for helping make ALIGNMENT better for everyone!
