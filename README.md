# Studio

Next.js application for repository management and AI-powered development tools.

This repo follows the **Repository Alignment Standard** (see [.alignment/README.md](.alignment/README.md)).

## Developer Setup

### Prerequisites

- Node.js 20+ 
- pnpm 8.0.0 (specified in package.json)

### Installation

```bash
# Clone the repository
git clone https://github.com/TrevorPLam/studio.git
cd studio

# Install dependencies
pnpm install

# Copy environment template
cp .env.example .env.local
```

### Required Environment Variables

Configure the following in `.env.local`:

- `NEXTAUTH_URL` - Your application URL (e.g., `http://localhost:3000`)
- `NEXTAUTH_SECRET` - Secret for NextAuth.js session encryption
- `ADMIN_EMAILS` - Comma-separated list of admin email addresses
- `GITHUB_APP_ID` - GitHub App ID for repository integration
- `GITHUB_APP_PRIVATE_KEY` - GitHub App private key
- `GITHUB_APP_INSTALLATION_ID` - GitHub App installation ID
- `GOOGLE_GENAI_API_KEY` - Google Generative AI API key

See `.env.example` for a complete list of configuration options.

## Usage

```bash
# Run development server
pnpm dev

# Build all packages
pnpm build

# Run linter
pnpm lint

# Type check
pnpm type-check

# Run tests
pnpm test
```

## Project Structure

- `apps/web/` - Main Next.js application with AI features
- `packages/contracts/` - Shared TypeScript types and Zod schemas
- `packages/api-sdk/` - API client SDK
- `packages/ui/` - Shared design system components
- `packages/utils/` - Shared utilities
- `packages/config/` - Shared configuration (TypeScript, etc.)
- `scripts/` - Development and build scripts
- `.alignment/` - Repository alignment standards and documentation
- `.agents/` - AI agent configurations and task tracking (TOON format)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to contribute to this project.

## License

Proprietary - See [LICENSE](LICENSE) for details.
