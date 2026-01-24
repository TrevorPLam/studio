# Firebase Studio

A Next.js application for AI-powered agent sessions and GitHub repository management.

## Quick Start

1. See [SETUP.md](./SETUP.md) for detailed setup instructions
2. Install dependencies: `npm install`
3. Configure environment variables (see [SETUP.md](./SETUP.md) or [docs/CONFIGURATION.md](./docs/CONFIGURATION.md))
4. Run the development server: `npm run dev`

## Features

- **AI Agent Sessions** - Create and manage AI-powered task executions with state tracking
- **Streaming Chat** - Real-time AI responses via Server-Sent Events (SSE)
- **GitHub Integration** - Access repositories, browse commits, and manage GitHub App authentication
- **Multi-Model AI Support** - Support for Google AI, OpenAI, and Anthropic models
- **Session State Machine** - Enforced lifecycle transitions with retry capabilities
- **Path Policy** - Security restrictions on repository file modifications
- **Response Caching** - Optimized performance with intelligent caching
- **Structured Logging** - Comprehensive observability and debugging
- **Authentication** - NextAuth with GitHub OAuth integration

## Documentation

### Getting Started

- **[SETUP.md](./SETUP.md)** - Environment setup and configuration guide
- **[docs/CONFIGURATION.md](./docs/CONFIGURATION.md)** - Complete configuration reference

### Core Documentation

- **[docs/API.md](./docs/API.md)** - Complete API endpoint reference
- **[docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)** - System architecture and design
- **[docs/FEATURES.md](./docs/FEATURES.md)** - Feature documentation and usage examples

### Development

- **[docs/DEVELOPMENT.md](./docs/DEVELOPMENT.md)** - Development workflow and guidelines
- **[docs/CODE_STYLE.md](./docs/CODE_STYLE.md)** - Coding standards and conventions
- **[docs/CONTRIBUTING.md](./docs/CONTRIBUTING.md)** - Contribution guidelines
- **[docs/TESTING.md](./docs/TESTING.md)** - Testing guide and best practices
- **[TESTS.md](./TESTS.md)** - Comprehensive test plan

### Deployment & Operations

- **[docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)** - Production deployment guide
- **[docs/MONITORING.md](./docs/MONITORING.md)** - Logging and monitoring guide
- **[docs/PERFORMANCE.md](./docs/PERFORMANCE.md)** - Performance optimization guide
- **[docs/TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md)** - Common issues and solutions

### Security & Configuration

- **[docs/SECURITY.md](./docs/SECURITY.md)** - Security model and best practices
- **[docs/PATH_POLICY.md](./docs/PATH_POLICY.md)** - Path policy documentation
- **[docs/GITHUB_APP_SETUP.md](./docs/GITHUB_APP_SETUP.md)** - GitHub App setup guide

### Technical Reference

- **[docs/DATABASE.md](./docs/DATABASE.md)** - Database schema and data models
- **[docs/STATE_MACHINE.md](./docs/STATE_MACHINE.md)** - Session state machine documentation
- **[docs/CHANGELOG.md](./docs/CHANGELOG.md)** - Version history and changes

### Project Management

- **[TODO.md](./TODO.md)** - Task list and development roadmap
- **[docs/archive/01.24.2026/2026_ENHANCEMENTS.md](./docs/archive/01.24.2026/2026_ENHANCEMENTS.md)** - Recent feature additions

## Project Structure

```
├── src/                    # Source code
│   ├── app/               # Next.js App Router (pages & API routes)
│   ├── components/        # React components
│   ├── lib/              # Core business logic
│   ├── hooks/            # React hooks
│   └── ai/               # AI/Genkit integration
├── tests/                 # Test suite
│   ├── unit/             # Unit tests
│   ├── integration/      # Integration tests
│   ├── e2e/              # End-to-end tests
│   └── security/         # Security tests
└── docs/                  # Documentation
```

## Technology Stack

- **Framework:** Next.js 15.3.8 (App Router)
- **Language:** TypeScript 5
- **UI:** React 18.3.1, Tailwind CSS, Radix UI
- **Authentication:** NextAuth.js 4.24.13
- **AI:** Google Genkit 1.20.0
- **GitHub:** Octokit (@octokit/auth-app, @octokit/rest)
- **Validation:** Zod 3.24.2
- **Testing:** Jest, Testing Library

## Development

### Prerequisites

- Node.js 20+
- npm or yarn
- GitHub account (for OAuth)
- AI API keys (Google AI, OpenAI, or Anthropic)

### Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run genkit:dev       # Start Genkit development server

# Building
npm run build            # Build for production
npm start                # Start production server

# Quality
npm run lint             # Run ESLint
npm run typecheck        # TypeScript type checking

# Testing
npm test                 # Run all tests
npm run test:unit        # Run unit tests only
npm run test:integration # Run integration tests only
npm run test:security    # Run security tests
npm run test:e2e         # Run E2E tests
npm run test:coverage    # Run tests with coverage
npm run test:watch       # Run tests in watch mode
```

## Security

Firebase Studio follows a **fail-closed security model** - deny by default, require explicit approval for risky operations.

Key security features:

- User isolation enforced
- Path policy for repository files
- Kill-switch (read-only mode)
- Secret management
- Input validation

See [docs/SECURITY.md](./docs/SECURITY.md) for complete security documentation.

## Contributing

We welcome contributions! Please see [docs/CONTRIBUTING.md](./docs/CONTRIBUTING.md) for guidelines.

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

[Add license information here]

## Support

- **Documentation:** See [docs/](./docs/) directory
- **Issues:** [GitHub Issues](https://github.com/your-repo/issues)
- **Troubleshooting:** See [docs/TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md)
