# GitHub App Setup Guide

## Table of Contents

- [Overview](#overview)
- [Why GitHub App?](#why-github-app)
- [Step 1: Create GitHub App](#step-1-create-github-app)
- [Step 2: Generate Private Key](#step-2-generate-private-key)
- [Step 3: Install GitHub App](#step-3-install-github-app)
- [Step 4: Configure Environment Variables](#step-4-configure-environment-variables)
- [Step 5: Verify Installation](#step-5-verify-installation)
- [Troubleshooting](#troubleshooting)
- [Permission Reference](#permission-reference)
- [Token Management](#token-management)
- [Finding Installation ID](#finding-installation-id)
- [Multiple Installations](#multiple-installations)
- [Security Best Practices](#security-best-practices)
- [Production Checklist](#production-checklist)
- [Resources](#resources)
- [Related Documentation](#related-documentation)

---

## Overview

This guide covers setting up a GitHub App for Firebase Studio to access GitHub repositories with fine-grained permissions.

## Why GitHub App?

GitHub Apps provide:
- **Fine-grained permissions** (read-only vs write)
- **Per-installation tokens** (better security)
- **Organization-level installation** (access to multiple repos)
- **Better rate limits** (higher limits than OAuth)

## Prerequisites

- GitHub account
- Admin access to organization (if installing on org)
- Access to repository (if installing on repo)

## Step 1: Create GitHub App

1. **Navigate to GitHub Settings:**
   - Go to your organization or user settings
   - Click "Developer settings"
   - Click "GitHub Apps"
   - Click "New GitHub App"

2. **Configure Basic Information:**
   - **GitHub App name:** Firebase Studio (or your choice)
   - **Homepage URL:** `https://your-domain.com`
   - **User authorization callback URL:** `https://your-domain.com/api/auth/callback/github`
   - **Webhook URL:** (optional, for future webhook support)
   - **Webhook secret:** (optional, generate random string)

3. **Configure Permissions:**

   **Repository Permissions:**
   - **Contents:** Read (for reading files)
   - **Contents:** Write (for creating commits/PRs)
   - **Metadata:** Read (always required)
   - **Pull requests:** Read (for viewing PRs)
   - **Pull requests:** Write (for creating PRs)

   **Account Permissions:**
   - **Email addresses:** Read (optional, for user identification)

4. **Subscribe to Events (Optional):**
   - **Pull request** (for PR updates)
   - **Push** (for commit notifications)

5. **Where can this GitHub App be installed?**
   - **Only on this account** (for personal use)
   - **Any account** (for distribution)

6. **Click "Create GitHub App"**

## Step 2: Generate Private Key

1. **After creating the app:**
   - Scroll to "Private keys" section
   - Click "Generate a private key"
   - Download the `.pem` file
   - **IMPORTANT:** Save this file securely (you can only download once)

2. **Convert to Environment Variable Format:**
   ```bash
   # The private key contains newlines, convert to single line with \n
   cat private-key.pem | tr '\n' '\\n'
   ```

## Step 3: Install GitHub App

1. **Install on Account/Organization:**
   - Go to your GitHub App settings
   - Click "Install App"
   - Choose account or organization
   - Choose repositories:
     - **All repositories** (recommended for development)
     - **Only select repositories** (for production)

2. **Note the Installation ID:**
   - After installation, note the installation ID from the URL
   - Format: `https://github.com/settings/installations/[INSTALLATION_ID]`

## Step 4: Configure Environment Variables

Add to your `.env.local` or `.env.production`:

```env
# GitHub App Configuration
GITHUB_APP_ID=123456
GITHUB_APP_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\nMIIEpAIBAAKCAQEA...\n-----END RSA PRIVATE KEY-----\n"
GITHUB_APP_INSTALLATION_ID=12345678
```

**Important Notes:**
- `GITHUB_APP_PRIVATE_KEY` must include `\n` for newlines
- Keep the private key secure (never commit to git)
- `GITHUB_APP_INSTALLATION_ID` is optional if you want to specify per-request

## Step 5: Verify Installation

### Test Authentication

```typescript
import { getInstallationToken } from '@/lib/github-app';

// Test token generation
const token = await getInstallationToken();
console.log('Token generated:', token.substring(0, 20) + '...');
```

### Test Repository Access

```typescript
import { getReaderToken } from '@/lib/github-app';
import { Octokit } from '@octokit/rest';

const token = await getReaderToken();
const octokit = new Octokit({ auth: token });

// Test repository access
const { data: repo } = await octokit.repos.get({
  owner: 'your-username',
  repo: 'your-repo'
});

console.log('Repository:', repo.name);
```

## Troubleshooting

### Issue: "Installation ID is required"

**Solution:**
- Set `GITHUB_APP_INSTALLATION_ID` in environment variables
- Or pass installation ID to `getInstallationToken(installationId)`

### Issue: "Bad credentials"

**Solution:**
- Verify `GITHUB_APP_ID` is correct
- Verify `GITHUB_APP_PRIVATE_KEY` includes `\n` for newlines
- Verify private key matches the app

### Issue: "Resource not accessible by integration"

**Solution:**
- Verify app is installed on the repository
- Verify app has required permissions
- Check if repository is private (app needs access)

### Issue: Token generation fails

**Solution:**
- Check network connectivity
- Verify GitHub API is accessible
- Check rate limits (unlikely for token generation)

## Permission Reference

### Required Permissions

**For Reading Repositories:**
- `contents: read`
- `metadata: read`
- `pull_requests: read`

**For Writing (Creating PRs):**
- `contents: write`
- `metadata: read`
- `pull_requests: write`

### Permission Scopes

The application uses two permission sets:

1. **Reader Token:**
   ```typescript
   {
     contents: 'read',
     metadata: 'read',
     pull_requests: 'read'
   }
   ```

2. **Actor Token:**
   ```typescript
   {
     contents: 'write',
     metadata: 'read',
     pull_requests: 'write'
   }
   ```

## Token Management

### Token Caching

Installation tokens are cached with:
- **Expiration:** 1 hour (3600 seconds)
- **Early expiration:** 60 seconds before actual expiration
- **Cache key:** Installation ID + permissions

### Clearing Cache

```typescript
import { clearTokenCache } from '@/lib/github-app';

// Clear all tokens
clearTokenCache();

// Clear specific installation
clearTokenCache(installationId);
```

## Finding Installation ID

### Method 1: From URL

After installing the app, the URL contains the installation ID:
```
https://github.com/settings/installations/12345678
                                    ^^^^^^^^^ Installation ID
```

### Method 2: From API

```typescript
import { getInstallationIdForRepo } from '@/lib/github-app';

const installationId = await getInstallationIdForRepo('owner', 'repo');
console.log('Installation ID:', installationId);
```

## Multiple Installations

If you have multiple installations (e.g., personal + organization):

```typescript
// Use specific installation ID
const personalToken = await getInstallationToken(personalInstallationId);
const orgToken = await getInstallationToken(orgInstallationId);
```

## Security Best Practices

1. **Private Key Security:**
   - Never commit private key to git
   - Store in secure environment variables
   - Rotate keys periodically

2. **Installation Access:**
   - Install only on necessary repositories
   - Use "Only select repositories" in production
   - Review installed apps regularly

3. **Permission Principle:**
   - Grant minimum required permissions
   - Use read-only tokens when possible
   - Use write tokens only when needed

## Production Checklist

- [ ] GitHub App created
- [ ] Private key generated and secured
- [ ] App installed on target repositories
- [ ] Environment variables configured
- [ ] Permissions verified
- [ ] Token generation tested
- [ ] Repository access tested
- [ ] Error handling verified

## Resources

- [GitHub Apps Documentation](https://docs.github.com/en/apps)
- [Creating a GitHub App](https://docs.github.com/en/apps/creating-github-apps/creating-github-apps)
- [Installing GitHub Apps](https://docs.github.com/en/apps/using-github-apps/installing-github-apps)
- [Authenticating with GitHub Apps](https://docs.github.com/en/apps/creating-github-apps/authenticating-with-github-apps)

---

## Related Documentation

- **[CONFIGURATION.md](./CONFIGURATION.md)** - Configuration reference
- **[SECURITY.md](./SECURITY.md)** - Security best practices
- **[API.md](./API.md)** - GitHub API endpoints
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - GitHub integration architecture

## GitHub App Authentication Flow

```
Application
    │
    ▼
Generate JWT (from private key)
    │
    ▼
Exchange JWT for Installation Token
    │
    ├─→ Check Cache
    │   ├─→ Valid? ──→ ✅ Use cached token
    │   └─→ Expired? ──→ Generate new
    │
    └─→ Generate New Token
        │
        ▼
    Cache Token (with 60s early expiration)
        │
        ▼
    Use Token for GitHub API Calls
```

## Token Lifecycle

```
Token Generated
    │
    ▼
Cached (1 hour TTL)
    │
    ├─→ Used (within 59 minutes) ──→ ✅ Valid
    │
    └─→ Expired (after 59 minutes) ──→ ❌ Generate new
```
