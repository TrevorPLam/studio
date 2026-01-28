# AI Agent Instructions - Studio

## Repository Overview
This is a Next.js application for managing AI agents, repositories, and sessions. It includes GitHub integration and observability features.

## Architecture
- **Framework**: Next.js with App Router
- **Features**: Agents, Repositories, Sessions, GitHub integration
- **UI**: shadcn/ui components

## Key Conventions
- Features organized in `features/` with components/, lib/, types/ subfolders
- UI components in `components/ui/` (shadcn/ui)
- Server actions and API routes in `app/api/`
- Shared utilities in `lib/`

## Common Tasks
- **Adding a feature**: Create in `features/[feature-name]/` with components/, lib/, types/
- **Adding API route**: Create in `app/api/[route]/route.ts`
- **Adding UI component**: Use shadcn/ui components from `components/ui/`
