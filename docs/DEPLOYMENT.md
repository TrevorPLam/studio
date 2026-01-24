# Deployment Guide

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Environment Configuration](#environment-configuration)
- [Build Process](#build-process)
- [Deployment Options](#deployment-options)
  - [Vercel](#option-1-vercel-recommended)
  - [Docker](#option-2-docker)
  - [Traditional Server](#option-3-traditional-server)
- [Database Setup](#database-setup)
- [Health Checks](#health-checks)
- [Scaling Considerations](#scaling-considerations)
- [Security Checklist](#security-checklist)
- [Rollback Procedure](#rollback-procedure)
- [Post-Deployment](#post-deployment)
- [Troubleshooting](#troubleshooting)
- [CI/CD Pipeline](#cicd-pipeline)
- [Backup Strategy](#backup-strategy)
- [Performance Optimization](#performance-optimization)
- [Maintenance](#maintenance)
- [Support](#support)
- [Related Documentation](#related-documentation)

---

## Overview

This guide covers deploying Firebase Studio to production environments.

## Prerequisites

- Node.js 20+ installed
- npm or yarn package manager
- Environment variables configured
- GitHub OAuth app created
- GitHub App created (if using GitHub App features)
- AI API keys (Google AI, OpenAI, Anthropic)

## Environment Configuration

### Required Environment Variables

Create a `.env.production` file with:

```env
# NextAuth
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-production-secret

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_OAUTH_CALLBACK_URL=https://your-domain.com/api/auth/callback/github

# GitHub App (if using)
GITHUB_APP_ID=your_app_id
GITHUB_APP_PRIVATE_KEY=your_private_key
GITHUB_APP_INSTALLATION_ID=your_installation_id

# AI Model API Keys
GOOGLE_AI_API_KEY=your_google_ai_api_key
OPENAI_API_KEY=your_openai_api_key_optional
ANTHROPIC_API_KEY=your_anthropic_api_key_optional

# Genkit
GENKIT_ENV=production

# Node Environment
NODE_ENV=production
```

### Generating NextAuth Secret

```bash
openssl rand -base64 32
```

## Build Process

### 1. Install Dependencies

```bash
npm ci
```

### 2. Build Application

```bash
npm run build
```

This creates an optimized production build in `.next/` directory.

### 3. Verify Build

```bash
npm run typecheck
```

## Deployment Options

### Option 1: Vercel (Recommended)

Vercel provides seamless Next.js deployment.

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel --prod
   ```

3. **Configure Environment Variables:**
   - Go to Vercel dashboard
   - Project Settings → Environment Variables
   - Add all required variables

4. **Configure Build Settings:**
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm ci`

### Option 2: Docker

1. **Create Dockerfile:**
   ```dockerfile
   FROM node:20-alpine AS base

   # Install dependencies only when needed
   FROM base AS deps
   RUN apk add --no-cache libc6-compat
   WORKDIR /app
   COPY package.json package-lock.json ./
   RUN npm ci

   # Rebuild the source code only when needed
   FROM base AS builder
   WORKDIR /app
   COPY --from=deps /app/node_modules ./node_modules
   COPY . .
   RUN npm run build

   # Production image
   FROM base AS runner
   WORKDIR /app
   ENV NODE_ENV production
   RUN addgroup --system --gid 1001 nodejs
   RUN adduser --system --uid 1001 nextjs

   COPY --from=builder /app/public ./public
   COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
   COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

   USER nextjs
   EXPOSE 3000
   ENV PORT 3000
   CMD ["node", "server.js"]
   ```

2. **Update next.config.ts:**
   ```typescript
   output: 'standalone'
   ```

3. **Build and Run:**
   ```bash
   docker build -t firebase-studio .
   docker run -p 3000:3000 --env-file .env.production firebase-studio
   ```

### Option 3: Traditional Server

1. **Build on Server:**
   ```bash
   npm ci
   npm run build
   ```

2. **Start Production Server:**
   ```bash
   npm start
   ```

3. **Use Process Manager (PM2):**
   ```bash
   npm install -g pm2
   pm2 start npm --name "firebase-studio" -- start
   pm2 save
   pm2 startup
   ```

## Database Setup

### Current: File-based Storage

The application currently uses file-based JSON storage. Ensure:

1. **Create Data Directory:**
   ```bash
   mkdir -p .data
   chmod 755 .data
   ```

2. **Backup Strategy:**
   - Regularly backup `.data/agent-sessions.json`
   - Consider automated backups

### Future: Database Migration

When migrating to a database:

1. **Choose Database:** PostgreSQL or MongoDB
2. **Run Migrations:** Create schema
3. **Migrate Data:** Export from JSON, import to database
4. **Update Code:** Replace file-based storage with database client

## Health Checks

### Health Check Endpoint

Create a health check endpoint at `/api/health`:

```typescript
export async function GET() {
  return NextResponse.json({ 
    status: 'ok',
    timestamp: new Date().toISOString()
  });
}
```

### Monitoring

- **Uptime Monitoring:** Use services like UptimeRobot
- **Error Tracking:** Integrate Sentry or similar
- **Logging:** Centralized logging (e.g., Logtail, Datadog)

## Scaling Considerations

### Horizontal Scaling

Current limitations:
- File-based storage doesn't scale horizontally
- In-memory cache is per-instance

Solutions:
- Migrate to database (PostgreSQL/MongoDB)
- Use Redis for distributed caching
- Use load balancer for multiple instances

### Vertical Scaling

- Increase server resources (CPU, RAM)
- Optimize application code
- Enable Next.js caching

## Security Checklist

- [ ] Environment variables secured (not in code)
- [ ] HTTPS enabled
- [ ] NextAuth secret is strong and unique
- [ ] GitHub OAuth callback URL matches production
- [ ] API keys rotated regularly
- [ ] File permissions secured (`.data/` directory)
- [ ] CORS configured (if needed)
- [ ] Rate limiting enabled (future)
- [ ] Security headers configured

## Rollback Procedure

### Vercel

1. Go to project dashboard
2. Deployments → Select previous deployment
3. Click "Promote to Production"

### Docker

1. Tag previous image
2. Deploy previous image
3. Update load balancer

### Traditional Server

1. Keep previous build in backup
2. Stop current server
3. Restore previous build
4. Restart server

## Post-Deployment

### Verification Steps

1. **Check Health:**
   ```bash
   curl https://your-domain.com/api/health
   ```

2. **Test Authentication:**
   - Visit homepage
   - Click "Sign in with GitHub"
   - Verify OAuth flow

3. **Test API Endpoints:**
   - Create a session
   - Send a chat message
   - List repositories

4. **Check Logs:**
   - Monitor for errors
   - Verify logging works

### Monitoring Setup

1. **Error Tracking:**
   - Set up Sentry or similar
   - Configure error alerts

2. **Performance Monitoring:**
   - Set up APM (Application Performance Monitoring)
   - Monitor response times

3. **Uptime Monitoring:**
   - Configure uptime checks
   - Set up alerts

## Troubleshooting

### Common Issues

**Issue:** Build fails
- **Solution:** Check Node.js version (20+)
- **Solution:** Clear `.next` and `node_modules`, reinstall

**Issue:** Environment variables not loading
- **Solution:** Verify `.env.production` file exists
- **Solution:** Check variable names match exactly

**Issue:** Authentication not working
- **Solution:** Verify `NEXTAUTH_URL` matches production URL
- **Solution:** Check GitHub OAuth callback URL

**Issue:** Database/file errors
- **Solution:** Check file permissions on `.data/` directory
- **Solution:** Verify disk space available

## CI/CD Pipeline

### GitHub Actions Example

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run build
      - run: npm run typecheck
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## Backup Strategy

### Data Backup

1. **Automated Backups:**
   - Schedule daily backups of `.data/` directory
   - Store backups in secure location (S3, etc.)

2. **Manual Backup:**
   ```bash
   cp .data/agent-sessions.json backups/sessions-$(date +%Y%m%d).json
   ```

3. **Restore:**
   ```bash
   cp backups/sessions-YYYYMMDD.json .data/agent-sessions.json
   ```

## Performance Optimization

### Production Optimizations

1. **Enable Compression:**
   - Next.js automatically enables gzip
   - Configure CDN for static assets

2. **Caching:**
   - Enable Next.js caching
   - Configure CDN caching headers

3. **Database Optimization:**
   - Add indexes (when using database)
   - Optimize queries

## Maintenance

### Regular Tasks

- **Weekly:** Review error logs
- **Monthly:** Rotate API keys
- **Quarterly:** Update dependencies
- **As needed:** Scale resources

### Dependency Updates

```bash
npm outdated
npm update
npm audit
npm audit fix
```

## Support

For deployment issues:
1. Check logs
2. Review this guide
3. Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
4. Review GitHub issues

---

## Related Documentation

- **[CONFIGURATION.md](./CONFIGURATION.md)** - Complete configuration reference
- **[SECURITY.md](./SECURITY.md)** - Security best practices
- **[MONITORING.md](./MONITORING.md)** - Monitoring and logging setup
- **[PERFORMANCE.md](./PERFORMANCE.md)** - Performance optimization
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System architecture
- **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Common deployment issues

## Deployment Checklist

### Pre-Deployment

- [ ] Environment variables configured
- [ ] Secrets secured (not in code)
- [ ] Build succeeds locally
- [ ] Tests pass
- [ ] Type checking passes
- [ ] Security review completed
- [ ] Database backup strategy in place
- [ ] Monitoring configured
- [ ] Health checks implemented
- [ ] Rollback plan documented

### Post-Deployment

- [ ] Health check endpoint responds
- [ ] Authentication works
- [ ] API endpoints functional
- [ ] Error tracking configured
- [ ] Logs accessible
- [ ] Performance metrics baseline established
- [ ] Alerts configured
- [ ] Documentation updated with production URLs
