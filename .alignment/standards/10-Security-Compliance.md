# 10. Security & Compliance

**Prerequisites:** 
- [Section 0: Prerequisites](00-Prerequisites.md) - Complete decision points
- [Section 3: Configuration & Environment](03-Configuration-Environment.md)
- [Section 4: Dependency Management](04-Dependency-Management.md)
- [Section 5: CI/CD Structure](05-CI-CD-Structure.md) - Phase 1 (bootstrap) should be complete

**Principles:**
- [Security Principles](../principles/Security-Principles.md) - Core philosophy: *Security is not a feature—it's a fundamental requirement. Apply defense in depth, least privilege, and secure by default to every layer.*
  - Key concepts: Defense in depth (multiple security layers), least privilege (minimum necessary access), secure by default (security built-in), never trust input, security as shared responsibility

## 🎯 What You're Trying to Accomplish
Protect users and systems by establishing baseline security practices and compliance requirements.

## 🎓 Why This Section Exists
Security is easiest when it’s built into everyday workflows. Clear policies reduce risk and avoid emergency fixes later.

## 📚 Key Concepts (Mentor Mode)

### Defense in depth
**Simple:** Multiple layers of protection instead of one big lock.
**Why it matters:** If one layer fails, others still protect you.

### Least privilege
**Simple:** Give only the minimum access needed.
**Why it matters:** Limits damage if something is compromised.

### Compliance
**Simple:** Required security rules for your industry or users.
**Why it matters:** Non‑compliance can cause legal and financial issues.

## ✅ Subtasks (With Owner Tags)

#### Subtask 10.1 — Classify security level | **USER**
**Purpose:** Choose the right level of controls.
**Expected outcome:** Basic, standard, or high‑security path selected.

#### Subtask 10.2 — Add a SECURITY policy | **AGENT**
**Purpose:** Provide a clear security contact and disclosure process.
**Expected outcome:** SECURITY.md added.

#### Subtask 10.3 — Configure security scans | **AGENT**
**Purpose:** Automate SAST, dependency, and secret checks.
**Expected outcome:** Scans run in CI.

#### Subtask 10.4 — Document data handling | **USER**
**Purpose:** Ensure sensitive data rules are explicit.
**Expected outcome:** Data handling policy documented.

#### Subtask 10.5 — Review incident response | **USER**
**Purpose:** Be prepared for security events.
**Expected outcome:** Incident response steps documented.

## 📘 Detailed Reference (Original Guidance)

## Questions to Answer

Before proceeding, answer these questions:

1. **What security requirements apply to your project?**
   - [ ] Basic security (public repos, no sensitive data)
   - [ ] Standard security (production apps, user data)
   - [ ] High security (financial, healthcare, critical infrastructure)
   - [ ] Compliance requirements (SOC2, HIPAA, PCI-DSS, GDPR, etc.) - **Which ones?** _______________

2. **What sensitive data does your application handle?**
   - [ ] Personal Identifiable Information (PII) - **What types?** _______________
   - [ ] Authentication credentials (passwords, tokens)
   - [ ] Financial data (payment info, transactions)
   - [ ] Health data (medical records, PHI)
   - [ ] Other sensitive data: _______________
   - [ ] None (no sensitive data)

**Note:** If secrets exist in repository (from Section 0 Question 9 or Section 3 Question 1), they must be remediated before proceeding.

**Document your answers** in `alignment-progress.json` before proceeding.

**Effort Estimate:**
- **Basic security (P0):** 1-2 hours
- **Standard security (P0 + P1):** 3-5 hours
- **High security (P0 + P1 + P2):** 8-16 hours
- **Compliance-specific (SOC2, HIPAA, etc.):** 16-40 hours (varies by requirement)
- **Secret remediation (if needed):** 2-8 hours (depends on scope)

## Before/After Examples

### Example 1: SECURITY.md Creation

**BEFORE (no security documentation):**
```
project/
├── README.md
└── (no security policy)
```

**AFTER (SECURITY.md added):**
```
project/
├── README.md
└── SECURITY.md
```

**SECURITY.md contents:**
```markdown
# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

Please report vulnerabilities to: security@example.com

## Response SLA
- Critical (CVSS 9.0+): 7 days
- High (CVSS 7.0-8.9): 30 days
- Medium/Low: Next release cycle
```

**Changes Made:**
- Created SECURITY.md with disclosure process
- Defined response SLAs
- Added security contact information

### Example 2: Secret Scanning Setup

**BEFORE (no secret scanning):**
```
project/
├── .gitignore
└── (secrets may be committed)
```

**AFTER (secret scanning configured):**
```
project/
├── .gitignore  (excludes .env*)
├── .pre-commit-config.yaml  (includes git-secrets)
└── .github/workflows/ci.yml  (includes truffleHog scan)
```

**Changes Made:**
- Pre-commit hook scans for secrets before commit
- CI/CD scans git history for secrets
- Prevents future secret commits

## P0 — Required Actions

**Action:** Implement security basics (see [Security Principles](../principles/Security-Principles.md) for foundational concepts) | **AGENT**
- [ ] Create `SECURITY.md` with:
  - Vulnerability disclosure process (see [Security Principles](../principles/Security-Principles.md) - responsible disclosure)
  - Security contact information
  - Supported versions
- [ ] Apply defense in depth (see [Security Principles](../principles/Security-Principles.md)):
  - [ ] Multiple security layers (application, infrastructure, data, access control)
  - [ ] No single point of failure
  - [ ] Fail-secure defaults (deny access when uncertain)
- [ ] Configure automated secret scanning (should already be in CI/CD from [Section 5](05-CI-CD-Structure.md)):
  - [ ] Pre-commit hooks (e.g., git-secrets, truffleHog)
  - [ ] CI pipeline scanning
  - [ ] Follow "no secrets in code" principle (see [Security Principles](../principles/Security-Principles.md))
- [ ] Set up dependency vulnerability scanning with SLAs (should already be in CI/CD from [Section 5](05-CI-CD-Structure.md)):
  - Critical (CVSS 9.0+): 7 days response
  - High (CVSS 7.0-8.9): 30 days response
  - Medium/Low: Tracked in maintenance cycles
- [ ] Configure license compliance checking
- [ ] For projects with releases: generate SBOM (SPDX or CycloneDX format)

See [Templates](Templates.md) for SECURITY.md template.

## P1 — Recommended Actions

**Action:** Enhance security (see [Security Principles](../principles/Security-Principles.md) for advanced concepts) | **AGENT**
- [ ] Apply least privilege principle (see [Security Principles](../principles/Security-Principles.md)):
  - [ ] Grant minimum necessary access to users, services, and systems
  - [ ] Use role-based access control (RBAC)
  - [ ] Review access regularly and revoke when no longer needed
- [ ] Implement secure by default (see [Security Principles](../principles/Security-Principles.md)):
  - [ ] Security built-in from design, not added later
  - [ ] Secure default configurations
  - [ ] No "magic" security - explicit security controls
- [ ] Never trust input (see [Security Principles](../principles/Security-Principles.md)):
  - [ ] Validate all input at boundaries
  - [ ] Use whitelist validation (allow only known good values)
  - [ ] Encode output to prevent injection attacks
- [ ] Add security review gates for:
  - Infrastructure changes
  - Sensitive code changes
- [ ] For containerized apps: add container image scanning
- [ ] For web apps: add DAST (Dynamic Application Security Testing)
- [ ] Implement security policy enforcement (OPA policies for infra)
- [ ] Schedule regular security audits and dependency reviews
- [ ] Apply security as shared responsibility (see [Security Principles](../principles/Security-Principles.md)):
  - [ ] Security in code review process
  - [ ] Security training for developers
  - [ ] Security metrics and goals

## P2 — Advanced Actions

**Action:** Advanced security (see [Security Principles](../principles/Security-Principles.md) for advanced practices) | **AGENT**
- [ ] Implement continuous security improvement (see [Security Principles](../principles/Security-Principles.md)):
  - [ ] Regular security audits and reviews
  - [ ] Update threat models as system evolves
  - [ ] Security training and skill development
  - [ ] Track security metrics and goals
- [ ] Document threat modeling (see [Security Principles](../principles/Security-Principles.md) - STRIDE model):
  - [ ] Identify assets, threats, and vulnerabilities
  - [ ] Assess risk and impact
  - [ ] Mitigate high-risk threats
- [ ] Create security incident response plan (see [Security Principles](../principles/Security-Principles.md)):
  - [ ] Detection, containment, eradication, recovery
  - [ ] Define roles and responsibilities
  - [ ] Practice incident response
- [ ] Set up automated compliance scanning (export controls, GDPR, etc.)
- [ ] Create security metrics dashboard
- [ ] Integrate penetration testing
- [ ] Ensure security follows "Golden rules" from [Security Principles](../principles/Security-Principles.md):
  - [ ] Defense in depth implemented
  - [ ] Least privilege applied
  - [ ] Secure by default configured
  - [ ] Input validation at all boundaries
  - [ ] Security monitoring and alerting

**Action:** Achieve SLSA Compliance (Supply Chain Security) | **AGENT**
- [ ] Understand SLSA levels (Level 1-4):
  - Level 1: Scripted builds, provenance available
  - Level 2: Version controlled, hosted source, ephemeral environment
  - Level 3: Non-falsifiable provenance, authenticated build
  - Level 4: Two-person review, hardened build
- [ ] Generate build attestations:
  - [ ] Use in-toto attestations format
  - [ ] Include build provenance (source, dependencies, environment)
  - [ ] Sign attestations cryptographically
  - [ ] Store attestations in artifact registry
- [ ] Verify source authenticity:
  - [ ] Require signed commits (GPG signatures)
  - [ ] Verify commit signatures in CI/CD
  - [ ] Document source verification process
- [ ] Track build environment:
  - [ ] Document build environment (OS, tools, versions)
  - [ ] Use reproducible build tools
  - [ ] Lock build dependencies
- [ ] Document SLSA level achieved in `docs/slsa-compliance.md`:
  - [ ] Current SLSA level
  - [ ] Attestation generation process
  - [ ] Verification procedures
  - [ ] Roadmap to higher levels
- [ ] Integrate with CI/CD (Section 5):
  - [ ] Generate attestations in build pipeline
  - [ ] Verify attestations before deployment
  - [ ] Store attestations with artifacts
- [ ] **Note:** SLSA Level 3+ recommended for production systems

See [Templates](Templates.md) for SLSA Compliance Documentation template.

## Decision: What security level do you need?

**Assess your security requirements:**

**Basic Security (All Projects):**
- [ ] SECURITY.md with disclosure process
- [ ] Secret scanning (pre-commit + CI)
- [ ] Dependency vulnerability scanning
- [ ] License compliance checking

**Enhanced Security (Production Apps):**
- [ ] Security review gates
- [ ] Container image scanning (if using containers)
- [ ] DAST for web apps
- [ ] Regular security audits

**Advanced Security (High-Stakes Systems):**
- [ ] SLSA Level 3+ compliance
- [ ] Automated compliance scanning
- [ ] Threat modeling
- [ ] Penetration testing

**Action:** Implement security appropriate to your project | **USER**
- [ ] Start with basic security (P0)
- [ ] Add enhanced security for production (P1)
- [ ] Consider advanced security for critical systems (P2)

## Verification

**Manual Check:**
- [ ] Verify `SECURITY.md` exists with disclosure process
- [ ] Check secret scanning is configured (pre-commit + CI)
- [ ] Verify dependency scanning runs in CI/CD
- [ ] Check license compliance is validated
- [ ] If releases: Verify SBOM generation (if P0 completed)
- [ ] Test secret scanning: Try committing a test secret (should be blocked)

**Automated Check (Future):**
```bash
./scripts/validate-section-10.sh
```

**Done Criteria:**
- ✅ SECURITY.md exists and is complete
- ✅ Secret scanning configured and working
- ✅ Dependency vulnerability scanning configured
- ✅ License compliance checking configured
- ✅ No secrets committed to repository
- ✅ Defense in depth implemented (multiple security layers)
- ✅ Least privilege applied (minimum necessary access)
- ✅ Secure by default configured (security built-in)
- ✅ Input validation implemented (never trust input)
- ✅ Security follows principles from [Security Principles](../principles/Security-Principles.md)

## Common Issues & Solutions

**Issue:** "I don't know what SECURITY.md should contain"  
- **Solution:** 
  - Use template from [Templates.md](Templates.md)
  - Must have: Vulnerability disclosure process, security contact, supported versions
  - Add: Response SLAs, reporting instructions
  - Keep it simple for small projects

**Issue:** "Secret scanning isn't finding secrets"  
- **Solution:** 
  - Use multiple tools: git-secrets (pre-commit) + truffleHog (CI)
  - Configure custom patterns for your secret formats
  - Scan git history: `trufflehog git file://. --json`
  - Rotate any found secrets immediately

**Issue:** "I have too many dependency vulnerabilities"  
- **Solution:** 
  - Start with critical vulnerabilities first (CVSS 9.0+)
  - Update dependencies incrementally
  - Use Dependabot/Renovate for automated updates
  - Document why vulnerabilities can't be fixed (if applicable)

**Issue:** "I don't know if I need SLSA compliance"  
- **Solution:** 
  - SLSA = Supply Chain Levels for Software Artifacts
  - Required for: Production systems, published packages, critical infrastructure
  - Start with SLSA Level 1 (scripted builds)
  - Work toward Level 3+ for production
  - This is P2, so skip if not needed yet

**Issue:** "License compliance checking is complicated"  
- **Solution:** 
  - Use automated tools: license-checker (npm), pip-licenses (Python)
  - Focus on incompatible licenses (GPL if your project isn't GPL)
  - Document license decisions in `docs/licenses.md`
  - Most permissive licenses (MIT, Apache) are compatible with everything