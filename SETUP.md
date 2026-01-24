# Setup Guide

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_OAUTH_CALLBACK_URL=http://localhost:9002/api/auth/callback/github

# NextAuth
NEXTAUTH_URL=http://localhost:9002
NEXTAUTH_SECRET=generate_a_random_secret_here

# AI Model API Keys
GOOGLE_AI_API_KEY=your_google_ai_api_key
OPENAI_API_KEY=your_openai_api_key_optional
ANTHROPIC_API_KEY=your_anthropic_api_key_optional

# Genkit
GENKIT_ENV=dev
```

## GitHub OAuth Setup

1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Click "New OAuth App"
3. Fill in:
   - Application name: Firebase Studio (or your choice)
   - Homepage URL: http://localhost:9002
   - Authorization callback URL: http://localhost:9002/api/auth/callback/github
4. Copy the Client ID and Client Secret to your `.env.local` file

## NextAuth Secret

Generate a random secret for NextAuth:

```bash
openssl rand -base64 32
```

Or use any random string generator. Add this to `NEXTAUTH_SECRET` in your `.env.local`.

## Google AI API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to `GOOGLE_AI_API_KEY` in your `.env.local`

## Installation

```bash
npm install
```

## Running the Application

```bash
# Start the Next.js dev server
npm run dev

# In another terminal, start Genkit (optional, for flow development)
npm run genkit:dev
```

The application will be available at http://localhost:9002

## Features

- **Home Page**: Navigate to Agents or Repositories
- **Agents**: Create and interact with AI agent sessions
- **Repositories**: View your GitHub repositories, browse code, view commits, and start agent sessions

## Troubleshooting

- If GitHub authentication fails, check that your OAuth callback URL matches exactly
- If AI responses fail, verify your `GOOGLE_AI_API_KEY` is set correctly
- Make sure all required environment variables are set in `.env.local`
