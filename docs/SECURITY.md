# Security Documentation

## Table of Contents

- [Security Model](#security-model)
- [Authentication](#authentication)
- [Authorization](#authorization)
- [Data Protection](#data-protection)
- [State Machine Security](#state-machine-security)
- [Kill-Switch](#kill-switch)
- [Threat Model](#threat-model)
- [Security Best Practices](#security-best-practices)
- [Security Headers](#security-headers)
- [Logging Security](#logging-security)
- [Vulnerability Management](#vulnerability-management)
- [Compliance](#compliance)
- [Security Checklist](#security-checklist)
- [Future Security Enhancements](#future-security-enhancements)
- [Security Resources](#security-resources)
- [Incident Response](#incident-response)
- [Related Documentation](#related-documentation)

---

## Security Model

Firebase Studio follows a **fail-closed security model** - deny by default, require explicit approval for risky operations.

## Authentication

### NextAuth Session

- **Method:** Server-side session cookies
- **Provider:** GitHub OAuth
- **User Identification:** Email (primary) or name (fallback)
- **Session Storage:** Server-side (encrypted cookies)

### GitHub Authentication

- **OAuth:** For user repository access
- **GitHub App:** For installation token generation
- **Token Caching:** Installation tokens cached with 60s early expiration

## Authorization

### User Isolation

All database queries are filtered by `userId`:

```typescript
// Only returns sessions for the authenticated user
const sessions = await listAgentSessions(userId);
```

**Enforcement:**
- All session operations require `userId`
- Cross-user access is prevented
- API endpoints validate user identity

### Path Policy

Repository file access is restricted by path policy:

**Allowed Paths:**
- `docs/` prefix
- `.repo/` prefix
- `README.md` exact match

**Forbidden Paths:**
- `.github/workflows/` prefix
- `package.json` and lockfiles
- `.env` files

**Override Mechanism:**
- Requires explicit `allowForbidden` or `allowNonWhitelisted` flags
- Should only be used with user approval

See [PATH_POLICY.md](./PATH_POLICY.md) for details.

## Data Protection

### Secrets Management

**Location:** Environment variables only

**Never:**
- Commit secrets to version control
- Log secrets in application logs
- Expose secrets in API responses

**Secrets:**
- `NEXTAUTH_SECRET`
- `GITHUB_CLIENT_SECRET`
- `GITHUB_APP_PRIVATE_KEY`
- AI API keys

### Input Validation

All user inputs are validated using Zod schemas:

```typescript
const input = validateRequest(createAgentSessionSchema, body);
```

**Validation Rules:**
- Required fields enforced
- Type checking
- Length limits
- Format validation

### Output Sanitization

- **XSS Prevention:** React automatically escapes content
- **Path Traversal:** Path normalization prevents `../` attacks
- **SQL Injection:** Not applicable (no SQL queries)

## State Machine Security

### Transition Enforcement

Invalid state transitions are rejected:

```typescript
// Invalid: created → applying
// Valid: created → planning → preview_ready → ...
```

**Security Benefit:** Prevents unauthorized state changes

## Kill-Switch

### Read-Only Mode

Emergency mechanism to disable all write operations:

```typescript
setAgentReadOnlyMode(true); // Blocks all writes
```

**Current Implementation:**
- Basic read-only mode for session writes
- Not yet centralized for all operations

**Future:**
- Redis-based feature flag
- Admin API endpoint
- Protection for all mutative actions

## Threat Model

### Identified Threats

1. **Unauthorized Access**
   - **Mitigation:** Authentication required for all endpoints
   - **Mitigation:** User isolation enforced

2. **Path Traversal**
   - **Mitigation:** Path normalization
   - **Mitigation:** Path policy enforcement

3. **Prompt Injection**
   - **Status:** Not yet implemented (PALADIN framework planned)
   - **Future:** Policy-proxy LLM to block injections

4. **Hidden Unicode**
   - **Status:** Not yet implemented
   - **Future:** Sanitizer to strip zero-width/bidi chars

5. **Rate Limiting**
   - **Status:** Not yet implemented
   - **Future:** Per-user and per-endpoint limits

6. **CSRF**
   - **Mitigation:** NextAuth handles CSRF protection
   - **Mitigation:** SameSite cookies

### Attack Vectors

**API Endpoints:**
- All endpoints require authentication
- Input validation on all requests
- Error messages don't leak sensitive info

**File System:**
- Path policy restricts file access
- Only `.data/` directory writable
- Critical files protected

**Database:**
- User isolation prevents cross-user access
- State machine prevents invalid transitions

## Security Best Practices

### Development

1. **Never commit secrets**
2. **Use environment variables**
3. **Validate all inputs**
4. **Sanitize all outputs**
5. **Follow principle of least privilege**

### Production

1. **Rotate secrets regularly**
2. **Monitor for suspicious activity**
3. **Keep dependencies updated**
4. **Enable HTTPS only**
5. **Configure security headers**

## Security Headers

### Recommended Headers

```typescript
// next.config.ts
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  }
];
```

## Logging Security

### What to Log

- **User actions:** With user ID
- **Errors:** With context (no secrets)
- **API calls:** With request metadata

### What NOT to Log

- **Secrets:** API keys, tokens, passwords
- **Sensitive data:** Full request bodies with secrets
- **Personal information:** Unless necessary

### Log Format

```typescript
logger.info('Session created', {
  sessionId: '...',
  userId: '...', // OK
  // Never log: apiKey, token, password
});
```

## Vulnerability Management

### Dependency Updates

```bash
npm audit
npm audit fix
```

### Security Advisories

- Monitor GitHub security advisories
- Check npm security advisories
- Review dependency updates

### Reporting Security Issues

**Process:**
1. **DO NOT** create public GitHub issues
2. Email security team (if available)
3. Include:
   - Description of vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix

## Compliance

### Data Privacy

- **User Data:** Stored securely
- **Session Data:** Isolated per user
- **Logs:** No PII unless necessary

### GDPR Considerations

- **Right to Access:** Users can view their data
- **Right to Deletion:** Users can delete sessions
- **Data Minimization:** Only collect necessary data

## Security Checklist

### Pre-Deployment

- [ ] All secrets in environment variables
- [ ] No secrets in code or logs
- [ ] HTTPS enabled
- [ ] Authentication required for all endpoints
- [ ] Input validation on all inputs
- [ ] Path policy enforced
- [ ] User isolation verified
- [ ] Security headers configured
- [ ] Dependencies updated
- [ ] Security audit passed

### Post-Deployment

- [ ] Monitor error logs
- [ ] Monitor authentication failures
- [ ] Review access patterns
- [ ] Check for suspicious activity

## Future Security Enhancements

### Planned Features

1. **PALADIN Framework:** Prompt injection detection
2. **Unicode Sanitization:** Strip hidden characters
3. **Rate Limiting:** Prevent abuse
4. **IP Allowlist:** Restrict webhook endpoints
5. **Audit Logging:** Track all security events
6. **2FA Support:** Additional authentication factor

## Security Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/configuring/security-headers)
- [GitHub Security](https://docs.github.com/en/code-security)

## Incident Response

### If Security Breach Detected

1. **Immediate:**
   - Enable kill-switch (read-only mode)
   - Rotate all secrets
   - Review access logs

2. **Investigation:**
   - Identify affected users
   - Determine scope of breach
   - Document timeline

3. **Remediation:**
   - Fix vulnerability
   - Notify affected users
   - Update security measures

4. **Prevention:**
   - Review security practices
   - Implement additional safeguards
   - Update documentation

---

## Related Documentation

- **[PATH_POLICY.md](./PATH_POLICY.md)** - Path policy enforcement
- **[STATE_MACHINE.md](./STATE_MACHINE.md)** - State machine security
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Production security checklist
- **[MONITORING.md](./MONITORING.md)** - Security monitoring
- **[API.md](./API.md)** - API security considerations
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Security architecture

## Security Architecture Diagram

```
┌─────────────────────────────────────────────────┐
│           Security Layers                        │
├─────────────────────────────────────────────────┤
│ 1. Authentication (NextAuth)                    │
│    └─→ User Identity Verified                  │
├─────────────────────────────────────────────────┤
│ 2. Authorization (User Isolation)              │
│    └─→ userId Filtering                         │
├─────────────────────────────────────────────────┤
│ 3. Path Policy (Repository Files)               │
│    └─→ Allowlist + Forbidden List                 │
├─────────────────────────────────────────────────┤
│ 4. State Machine (Transitions)                 │
│    └─→ Valid Transitions Only                   │
├─────────────────────────────────────────────────┤
│ 5. Input Validation (Zod)                      │
│    └─→ Schema Validation                        │
├─────────────────────────────────────────────────┤
│ 6. Kill-Switch (Emergency)                     │
│    └─→ Read-Only Mode                          │
└─────────────────────────────────────────────────┘
```
