# Troubleshooting Guide

## Table of Contents

- [Common Issues and Solutions](#common-issues-and-solutions)
  - [Authentication Issues](#authentication-issues)
  - [API Issues](#api-issues)
  - [Database/Storage Issues](#databasestorage-issues)
  - [GitHub Integration Issues](#github-integration-issues)
  - [AI/Genkit Issues](#aigenkit-issues)
  - [Development Issues](#development-issues)
  - [Configuration Issues](#configuration-issues)
- [Debugging Steps](#debugging-steps)
- [Getting Help](#getting-help)
- [Prevention](#prevention)
- [Related Documentation](#related-documentation)

---

## Common Issues and Solutions

### Authentication Issues

#### Issue: "Unauthorized" (401) on API calls

**Symptoms:**
- API endpoints return 401
- User not authenticated

**Solutions:**
1. Check if user is signed in
2. Verify session cookie is present
3. Check `NEXTAUTH_URL` matches current URL
4. Clear cookies and sign in again

#### Issue: GitHub OAuth not working

**Symptoms:**
- OAuth redirect fails
- "Bad credentials" error

**Solutions:**
1. Verify `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` are correct
2. Check callback URL matches GitHub app settings exactly
3. Verify GitHub app is active
4. Check network connectivity

### API Issues

#### Issue: "Validation error" (400)

**Symptoms:**
- API returns 400 with validation error
- Field path in error message

**Solutions:**
1. Check error message for field path
2. Verify required fields are provided
3. Check field formats (types, lengths)
4. Review API documentation for requirements

#### Issue: "Session not found" (404)

**Symptoms:**
- GET /api/sessions/[id] returns 404
- Session exists but not accessible

**Solutions:**
1. Verify session ID is correct
2. Check if session belongs to current user
3. Verify user authentication
4. Check if session was deleted

#### Issue: "Invalid session state transition" (500)

**Symptoms:**
- PATCH /api/sessions/[id] returns 500
- Error message about state transition

**Solutions:**
1. Review state machine documentation
2. Check current session state
3. Verify requested transition is valid
4. Use retry flow for failed sessions

### Database/Storage Issues

#### Issue: File not found errors

**Symptoms:**
- "ENOENT" errors
- Session data not persisting

**Solutions:**
1. Check `.data/` directory exists
2. Verify file permissions (read/write)
3. Check disk space
4. Verify process has write permissions

#### Issue: Concurrent write errors

**Symptoms:**
- File corruption
- Data loss

**Solutions:**
1. Write queue should handle this automatically
2. Check for multiple instances running
3. Verify write queue is working
4. Restore from backup if corrupted

### GitHub Integration Issues

#### Issue: "Installation ID is required"

**Symptoms:**
- GitHub App authentication fails
- Error about missing installation ID

**Solutions:**
1. Set `GITHUB_APP_INSTALLATION_ID` in environment
2. Or pass installation ID to function
3. Verify app is installed on repository
4. Check installation ID is correct

#### Issue: "Resource not accessible by integration"

**Symptoms:**
- GitHub API returns 404
- Repository not accessible

**Solutions:**
1. Verify app is installed on repository
2. Check app has required permissions
3. Verify repository is accessible
4. Check if repository is private (app needs access)

#### Issue: Rate limit exceeded

**Symptoms:**
- GitHub API returns 403
- Rate limit error

**Solutions:**
1. Check rate limit status
2. Wait for rate limit reset
3. Use caching to reduce API calls
4. Implement rate limit handling

### AI/Genkit Issues

#### Issue: AI API timeout

**Symptoms:**
- Request times out after 30 seconds
- No response from AI

**Solutions:**
1. Check AI API key is valid
2. Verify network connectivity
3. Check AI service status
4. Try simpler prompt
5. Increase timeout (if needed)

#### Issue: AI API error

**Symptoms:**
- AI API returns error
- Invalid response

**Solutions:**
1. Check API key is correct
2. Verify API quota/limits
3. Check request format
4. Review AI service documentation

### Development Issues

#### Issue: TypeScript errors

**Symptoms:**
- Type errors in IDE
- Build fails

**Solutions:**
1. Run `npm run typecheck`
2. Fix type errors
3. Restart TypeScript server (VS Code)
4. Clear `.next` directory

#### Issue: Module not found

**Symptoms:**
- "Cannot find module" errors
- Import errors

**Solutions:**
1. Run `npm install`
2. Check import paths
3. Verify file exists
4. Clear `.next` and `node_modules`, reinstall

#### Issue: Port already in use

**Symptoms:**
- "Port 9002 is already in use"
- Server won't start

**Solutions:**
```bash
# Find process using port
lsof -ti:9002

# Kill process
lsof -ti:9002 | xargs kill

# Or use different port
npm run dev -- -p 9003
```

### Configuration Issues

#### Issue: Environment variables not loading

**Symptoms:**
- Variables undefined
- Configuration errors

**Solutions:**
1. Verify `.env.local` file exists
2. Check variable names match exactly
3. Restart development server
4. Check file is in project root

#### Issue: Invalid configuration

**Symptoms:**
- Validation errors
- Configuration errors

**Solutions:**
1. Check required variables are set
2. Verify variable formats
3. Review configuration documentation
4. Check for typos

## Debugging Steps

### 1. Check Logs

```bash
# Development: Check console output
# Production: Check logging service
```

### 2. Verify Environment

```bash
# Check environment variables
node -e "console.log(process.env.NEXTAUTH_URL)"
```

### 3. Test Components

```bash
# Run tests
npm test

# Check types
npm run typecheck
```

### 4. Check Network

```bash
# Test API endpoints
curl http://localhost:9002/api/health
```

## Getting Help

### Before Asking

1. **Check Documentation:**
   - This guide
   - API documentation
   - Architecture docs

2. **Search Issues:**
   - GitHub issues
   - Stack Overflow

3. **Review Logs:**
   - Check error messages
   - Review context

### When Asking for Help

Include:
- **Error message:** Full error text
- **Steps to reproduce:** What you did
- **Expected behavior:** What should happen
- **Actual behavior:** What actually happens
- **Environment:** OS, Node version, etc.
- **Logs:** Relevant log entries

## Prevention

### Best Practices

1. **Regular Updates:**
   - Keep dependencies updated
   - Update Node.js version
   - Review security advisories

2. **Testing:**
   - Write tests
   - Test before deploying
   - Monitor in production

3. **Monitoring:**
   - Set up error tracking
   - Monitor performance
   - Review logs regularly

## Related Documentation

- **[SETUP.md](../SETUP.md)** - Setup guide
- **[DEVELOPMENT.md](./DEVELOPMENT.md)** - Development guide
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Deployment guide
- **[API.md](./API.md)** - API documentation
- **[CONFIGURATION.md](./CONFIGURATION.md)** - Configuration reference
- **[MONITORING.md](./MONITORING.md)** - Debugging with logs

## Troubleshooting Decision Tree

```
Issue Occurs
    │
    ├─→ Authentication? ──→ Check session, OAuth config
    │
    ├─→ API Error? ──→ Check validation, error logs
    │
    ├─→ Database? ──→ Check file permissions, disk space
    │
    ├─→ GitHub? ──→ Check tokens, permissions, rate limits
    │
    ├─→ AI/Genkit? ──→ Check API keys, network, timeout
    │
    └─→ Configuration? ──→ Check env vars, file format
```

## Error Resolution Workflow

```
1. Identify Error
    │
    ▼
2. Check Error Message
    │
    ▼
3. Review Documentation
    │
    ▼
4. Check Logs
    │
    ▼
5. Verify Configuration
    │
    ▼
6. Test Solution
    │
    ▼
7. Document Solution
```
