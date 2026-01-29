# Contributing

Thank you for your interest in contributing to Studio! This document provides guidelines and instructions for contributing.

## Getting Started

1. **Fork the repository** (if you don't have direct access)
2. **Clone your fork** or the main repository
3. **Create a feature branch** from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Setup

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Run the development server:**
   ```bash
   pnpm dev
   ```

3. **Build all packages:**
   ```bash
   pnpm build
   ```

## Making Changes

### Code Style

- Follow the existing code style and patterns
- Run the linter before committing:
  ```bash
  pnpm lint
  ```
- Ensure TypeScript types are correct:
  ```bash
  pnpm type-check
   ```

### Project Structure

- **Apps** (`apps/`) - Next.js web application with AI features
- **Packages** (`packages/`) - Shared UI components and utilities
- **Infrastructure** (`infrastructure/`) - Deployment and infrastructure configs

## Pull Request Process

1. **Ensure your code builds:**
   ```bash
   pnpm build
   pnpm lint
   pnpm type-check
   ```

2. **Update documentation** if you've changed functionality

3. **Create a pull request** with:
   - Clear description of changes
   - Reference to related issues
   - Screenshots (if UI changes)

4. **Get approval** from code owners (see CODEOWNERS file)

5. **Ensure CI checks pass** before requesting review

## Reporting Issues

- Use GitHub Issues to report bugs or request features
- Include:
  - Clear description of the issue
  - Steps to reproduce
  - Expected vs actual behavior
  - Environment details (OS, Node version, etc.)

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow

## Questions?

If you have questions, please open an issue or contact the maintainers listed in CODEOWNERS.
