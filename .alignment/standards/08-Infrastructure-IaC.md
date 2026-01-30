# 8. Infrastructure / IaC Structure

**Prerequisites:** 
- [Section 0: Prerequisites](00-Prerequisites.md) - Complete decision points
- [Section 1: Root Directory Structure](01-Root-Directory-Structure.md)

**Effort Estimate:**
- **Basic infra documentation (P0):** 1-2 hours
- **IaC structure setup (P1):** 2-4 hours
- **GitOps setup (P2):** 4-8 hours
- **Multi-environment IaC:** 8-16 hours (varies by complexity)

## 🎯 What You're Trying to Accomplish
If you manage infrastructure as code, organize it so deployments are repeatable and safe.

## 🎓 Why This Section Exists
Infrastructure changes can break production. A clear IaC structure reduces risk and makes reviews easier.

## 📚 Key Concepts (Mentor Mode)

### Infrastructure as Code (IaC)
**Simple:** Define servers and cloud resources in code files.
**Why it matters:** Changes can be reviewed and versioned.

### Environments
**Simple:** Separate setups for dev, staging, and prod.
**Why it matters:** Prevents accidental changes to production.

### State
**Simple:** The record of what infrastructure exists right now.
**Why it matters:** Drift or lost state can cause outages.

## ✅ Subtasks (With Owner Tags)

#### Subtask 8.1 — Decide if IaC applies | **USER**
**Purpose:** Skip this section if there’s no infrastructure code.
**Expected outcome:** Clear “use” or “skip” decision.

#### Subtask 8.2 — Choose IaC tools | **USER**
**Purpose:** Pick Terraform, Pulumi, etc.
**Expected outcome:** Tool selected and documented.

#### Subtask 8.3 — Create infra directory structure | **AGENT**
**Purpose:** Organize IaC code by tool and environment.
**Expected outcome:** `infra/` structure created.

#### Subtask 8.4 — Document deployment steps | **USER**
**Purpose:** Make infra changes repeatable.
**Expected outcome:** Clear steps in docs.

#### Subtask 8.5 — Review for safety | **USER**
**Purpose:** Ensure production changes are controlled.
**Expected outcome:** Review checklist applied.

## 📘 Detailed Reference (Original Guidance)

## Questions to Answer

Before proceeding, answer these questions:

1. **What infrastructure needs to be managed?**
   - [ ] Cloud resources (compute, storage, networking) - **Which provider?** (AWS, Azure, GCP, etc.)
   - [ ] Kubernetes clusters and workloads - **What environments?** (dev, staging, prod)
   - [ ] Container orchestration (Docker Compose, Kubernetes) - **What services?** _______________
   - [ ] Configuration management (Ansible, Chef, Puppet) - **What systems?** _______________
   - [ ] No infrastructure code (application-only repository) - **Skip this section**

2. **What infrastructure tools will you use?**
   - [ ] Terraform - **What resources/modules?** _______________
   - [ ] CloudFormation/CDK - **Which cloud provider?** _______________
   - [ ] Pulumi - **What language?** (TypeScript, Python, Go, etc.)
   - [ ] Kubernetes manifests - **What workloads?** _______________
   - [ ] Docker Compose - **What services?** _______________
   - [ ] Other: _______________

**Note:** If you don't have infrastructure code, you can skip this section or mark it as "not applicable" in your progress tracker.

**Document your answers** in `alignment-progress.json` before proceeding.

## P0 — Required Actions

**Action:** Organize infrastructure code | **AGENT**
- [ ] Create `infra/` directory for infrastructure code
- [ ] Separate by tool: `infra/terraform/`, `infra/kubernetes/`, `infra/docker/`
- [ ] Ensure no environment-specific secrets are committed
- [ ] Isolate environments: `dev/` → `staging/` → `prod/`
- [ ] Use environment-specific configs, not hardcoded values

## P1 — Recommended Actions

**Action:** Improve infrastructure organization | **AGENT**
- [ ] Use modules for reuse (Terraform modules, Helm charts)
- [ ] Use overlays/values files for environment differences
- [ ] Create `infra/README.md` documenting:
  - How to deploy
  - Environment setup
  - Required credentials/secrets
- [ ] Add tests for infrastructure code (Terratest, kube-score, etc.)
- [ ] **Note:** For structured logging and observability (metrics, telemetry, error tracking), see [Observability & Monitoring](11-Observability-Monitoring.md)

## P2 — Advanced Actions

**Action:** Advanced infrastructure practices | **AGENT**
- [ ] Implement GitOps structure (`base/overlays` pattern)
- [ ] Add automated policy checks (OPA, Conftest)
- [ ] Set up infrastructure drift detection
- [ ] Document infrastructure decisions in ADRs

## Decision: Do you have infrastructure code?

**Check if your repository contains:**
- Terraform files → **Yes**
- Kubernetes manifests → **Yes**
- Docker Compose files → **Yes**
- CloudFormation/CDK → **Yes**
- Application code only → **No**

**If Yes:**
- [ ] Create `infra/` directory
- [ ] Organize by tool: `infra/terraform/`, `infra/kubernetes/`, etc.
- [ ] Separate environments: `infra/dev/`, `infra/staging/`, `infra/prod/`

**If No:**
- [ ] Skip this section
- [ ] You can return here when you add infrastructure code

## Verification

**Manual Check:**
- [ ] Verify `infra/` directory exists (if you have infrastructure code)
- [ ] Check no secrets are hardcoded in infrastructure files
- [ ] Verify environment-specific configs are used (not hardcoded values)
- [ ] Check `infra/README.md` exists and documents deployment process
- [ ] Verify infrastructure code is tested (Terratest, kube-score, etc. if P1 completed)

**Automated Check (Future):**
```bash
./scripts/validate-section-8.sh
```

**Done Criteria:**
- ✅ Infrastructure code organized in `infra/` directory (if applicable)
- ✅ No secrets committed in infrastructure files
- ✅ Environment-specific configs used
- ✅ Infrastructure documented (if P1 completed)

## Common Issues & Solutions

**Issue:** "I don't have infrastructure code"  
- **Solution:** 
  - Skip this section
  - Return when you add Terraform, Kubernetes, or other IaC
  - This section is optional if you're just building an application

**Issue:** "I have infrastructure code scattered in root"  
- **Solution:** 
  - Create `infra/` directory
  - Move all infrastructure files there
  - Organize by tool: `infra/terraform/`, `infra/kubernetes/`
  - Update any references to old paths

**Issue:** "I have secrets in my infrastructure files"  
- **Solution:** 
  - **Immediate:** Rotate all exposed secrets
  - Remove secrets from git history: `git filter-branch` or BFG
  - Use environment variables or secret management (AWS Secrets Manager, etc.)
  - Never commit secrets to git

**Issue:** "I don't know how to separate environments"  
- **Solution:** 
  - Use separate directories: `infra/dev/`, `infra/staging/`, `infra/prod/`
  - Or use overlays/values files (Kubernetes, Helm)
  - Or use Terraform workspaces
  - Document your approach in `infra/README.md`

**Issue:** "I'm not sure what infrastructure tools to use"  
- **Solution:** 
  - Cloud provider → Use their IaC (CloudFormation, ARM templates)
  - Multi-cloud → Terraform or Pulumi
  - Kubernetes → Helm charts or Kustomize
  - Docker → Docker Compose or Kubernetes
  - Start simple, add complexity as needed