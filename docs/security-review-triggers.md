# Security Review Triggers (Security Gate)

**Purpose:** Define conditions that require human review before proceeding with security-sensitive changes.

**Last Updated:** 2026-01-31

## Overview

The Security Gate is a hard stop for autonomous agents when encountering security-sensitive changes. Any trigger requires creating a HITL (Human-In-The-Loop) item and waiting for explicit approval before proceeding.

## Security Triggers

### **🔴 Critical Triggers (Must Stop)**
- **Authentication Changes**: Any modifications to auth logic, session management, or user permissions
- **Financial Operations**: Changes involving payment processing, billing, or financial data handling
- **Secret Management**: Addition, modification, or removal of API keys, tokens, or credentials
- **External API Integration**: New connections to third-party services or APIs
- **Database Schema Changes**: Modifications to user data, authentication tables, or sensitive information storage

### **🟡 High Priority Triggers**
- **Input Validation Changes**: Modifications to validation logic for user inputs
- **Access Control Updates**: Changes to permissions, roles, or access restrictions
- **Data Export Features**: New functionality for exporting sensitive data
- **File Upload Changes**: Modifications to file handling, storage, or processing
- **CORS/Security Headers**: Changes to cross-origin policies or security headers

### **🟠 Medium Priority Triggers**
- **Logging Changes**: Modifications to security event logging or monitoring
- **Error Handling**: Changes that might expose system internals in error messages
- **Dependency Updates**: Addition of new dependencies with security implications
- **Configuration Changes**: Modifications to security-related configuration

## Security Review Process

### **1. Trigger Detection**
When an agent encounters a security trigger, it must:
1. **Stop Work**: Immediately halt progress on the security-sensitive change
2. **Create HITL**: Generate a Human-In-The-Loop item with detailed context
3. **Document Risk**: Clearly explain the security implications and potential impact

### **2. HITL Creation**
Each security HITL must include:
- **Title**: Clear description of the security-sensitive change
- **Context**: Background on why this change is needed
- **Risk Assessment**: Potential security implications and impact
- **Proposed Solution**: Detailed implementation approach
- **Alternatives**: Alternative approaches with security trade-offs

### **3. Human Review**
Security review requires:
- **Security Expertise**: Review by someone with security knowledge
- **Risk Analysis**: Assessment of security impact and mitigation strategies
- **Approval Decision**: Explicit approval or rejection with reasoning
- **Conditions**: Any additional security measures required

### **4. Implementation**
After approval:
1. **Follow Requirements**: Implement exactly as approved or with required modifications
2. **Security Testing**: Add appropriate security tests and validations
3. **Documentation**: Update security documentation and runbooks
4. **Monitoring**: Ensure appropriate monitoring and alerting is in place

## Specific Security Areas

### **Authentication & Authorization**
- **Password Policies**: Changes to password requirements or hashing
- **Session Management**: Modifications to token handling, expiration, or refresh
- **Multi-Factor Auth**: Addition or changes to MFA implementations
- **OAuth/OpenID**: Changes to external authentication providers

### **Data Protection**
- **Encryption**: Changes to data encryption at rest or in transit
- **PII Handling**: Modifications to personally identifiable information processing
- **Data Retention**: Changes to data storage or deletion policies
- **Compliance**: Modifications affecting regulatory compliance (GDPR, SOC2, etc.)

### **Infrastructure Security**
- **Network Security**: Changes to firewalls, VPC configurations, or network access
- **Container Security**: Modifications to Docker images, Kubernetes configs
- **Secrets Management**: Changes to how secrets are stored or accessed
- **Monitoring**: Modifications to security monitoring or alerting

## Security Checklist

### **Before Implementation**
- [ ] Security implications identified and documented
- [ ] Risk assessment completed
- [ ] HITL created with all required information
- [ ] Security expert review scheduled

### **During Implementation**
- [ ] Following approved implementation approach
- [ ] Security tests being written alongside code
- [ ] No unauthorized deviations from approved plan
- [ ] Security considerations documented in code

### **After Implementation**
- [ ] Security tests passing
- [ ] Documentation updated
- [ ] Monitoring and alerting configured
- [ ] Security review completed and signed off

## Emergency Procedures

### **Security Incidents**
If a security vulnerability is discovered during implementation:
1. **Immediately Stop**: Halt all related work
2. **Report**: Create security incident HITL with highest priority
3. **Contain**: Implement immediate containment measures if possible
4. **Communicate**: Notify security team and stakeholders

### **Rollback Procedures**
For approved changes that cause security issues:
1. **Emergency HITL**: Create emergency rollback HITL
2. **Quick Rollback**: Implement immediate rollback if needed
3. **Investigation**: Document and investigate the security issue
4. **Prevention**: Update procedures to prevent recurrence

## Training and Resources

### **Security Guidelines**
- Follow OWASP security best practices
- Use secure coding standards
- Implement defense-in-depth principles
- Keep security dependencies updated

### **Review Resources**
- Security team documentation
- Industry security standards
- Company security policies
- Threat modeling guidelines
