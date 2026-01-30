#!/bin/bash
# Validation script for ALIGNMENT Section 8: Infrastructure / IaC
# Usage: ./scripts/validate-section-8.sh [repository-root]

set -e

REPO_ROOT="${1:-.}"
cd "$REPO_ROOT"

echo "🔍 Validating Section 8: Infrastructure / IaC"
echo "=============================================="
echo ""

ERRORS=0
WARNINGS=0

# Check if this is an infrastructure repository
HAS_INFRA=false
HAS_TERRAFORM=false
HAS_K8S=false
HAS_DOCKER=false
HAS_CLOUDFORMATION=false

# Check for infrastructure code
if [ -d "infra" ] || [ -d "infrastructure" ] || [ -d "terraform" ] || [ -d "k8s" ] || [ -d "kubernetes" ]; then
    HAS_INFRA=true
fi

# Check for Terraform
if find . -maxdepth 3 -name "*.tf" -o -name "*.tfvars" 2>/dev/null | head -1 | grep -q .; then
    HAS_TERRAFORM=true
    HAS_INFRA=true
    echo "✅ Terraform files found"
fi

# Check for Kubernetes manifests
if find . -maxdepth 3 -name "*.yaml" -o -name "*.yml" 2>/dev/null | xargs grep -l "kind:" 2>/dev/null | head -1 | grep -q .; then
    HAS_K8S=true
    HAS_INFRA=true
    echo "✅ Kubernetes manifests found"
fi

# Check for Docker Compose
if [ -f "docker-compose.yml" ] || [ -f "docker-compose.yaml" ] || [ -f "compose.yml" ] || [ -f "compose.yaml" ]; then
    HAS_DOCKER=true
    HAS_INFRA=true
    echo "✅ Docker Compose file found"
fi

# Check for CloudFormation/CDK
if find . -maxdepth 3 -name "*.template" -o -name "template.yaml" -o -name "template.yml" 2>/dev/null | head -1 | grep -q .; then
    HAS_CLOUDFORMATION=true
    HAS_INFRA=true
    echo "✅ CloudFormation template found"
fi

if [ -f "cdk.json" ] || find . -maxdepth 3 -name "*cdk*.ts" -o -name "*cdk*.py" 2>/dev/null | head -1 | grep -q .; then
    echo "✅ AWS CDK configuration found"
    HAS_INFRA=true
fi

# If no infrastructure code found, this section may not apply
if [ "$HAS_INFRA" = false ]; then
    echo "ℹ️  INFO: No infrastructure code detected - this section may not apply"
    echo "   If this is an application-only repository, you can skip Section 8"
    exit 0
fi

# Check for infra/ directory organization (P0 requirement)
if [ -d "infra" ] || [ -d "infrastructure" ]; then
    echo "✅ Infrastructure directory exists"
else
    # Check if infra files are scattered
    if [ "$HAS_TERRAFORM" = true ] || [ "$HAS_K8S" = true ]; then
        echo "⚠️  WARNING: Infrastructure code found but not in infra/ directory"
        echo "   Consider organizing infrastructure code in infra/ directory"
        WARNINGS=$((WARNINGS + 1))
    fi
fi

# Check for environment separation
if [ -d "infra" ]; then
    ENV_DIRS=$(find infra -maxdepth 1 -type d \( -name "dev" -o -name "staging" -o -name "prod" -o -name "production" -o -name "test" \) 2>/dev/null | wc -l | tr -d ' ')
    if [ "$ENV_DIRS" -gt 0 ]; then
        echo "✅ Environment separation found ($ENV_DIRS environment(s))"
    else
        echo "⚠️  WARNING: No environment-specific directories found (dev/, staging/, prod/)"
        echo "   Consider separating infrastructure by environment"
        WARNINGS=$((WARNINGS + 1))
    fi
fi

# Check for Terraform-specific structure
if [ "$HAS_TERRAFORM" = true ]; then
    # Check for .tfvars files (should not contain secrets)
    TFVARS_FILES=$(find . -name "*.tfvars" ! -name "*.example" ! -name "*.sample" 2>/dev/null | wc -l | tr -d ' ')
    if [ "$TFVARS_FILES" -gt 0 ]; then
        echo "⚠️  WARNING: Found $TFVARS_FILES .tfvars file(s) - ensure no secrets are committed"
        echo "   Use .tfvars.example for templates, keep actual values in secure storage"
        WARNINGS=$((WARNINGS + 1))
        
        # Check for obvious secrets in tfvars
        if find . -name "*.tfvars" ! -name "*.example" ! -name "*.sample" -exec grep -lE "password|secret|key.*=" {} \; 2>/dev/null | head -1 | grep -q .; then
            echo "❌ ERROR: Potential secrets found in .tfvars files (CRITICAL SECURITY ISSUE)"
            echo "   Review and remove secrets immediately, use environment variables or secret management"
            ERRORS=$((ERRORS + 1))
        fi
    fi
    
    # Check for terraform.tfstate (should not be committed)
    if find . -name "terraform.tfstate" ! -path "*/.terraform/*" 2>/dev/null | head -1 | grep -q .; then
        echo "❌ ERROR: terraform.tfstate found in repository (should not be committed)"
        echo "   Add terraform.tfstate* to .gitignore, use remote state backend"
        ERRORS=$((ERRORS + 1))
    fi
    
    # Check for .terraform directory (should be in .gitignore)
    if [ -d ".terraform" ]; then
        if [ -f ".gitignore" ] && grep -q ".terraform" .gitignore 2>/dev/null; then
            echo "✅ .terraform excluded in .gitignore"
        else
            echo "⚠️  WARNING: .terraform directory exists but may not be in .gitignore"
            WARNINGS=$((WARNINGS + 1))
        fi
    fi
fi

# Check for Kubernetes-specific structure
if [ "$HAS_K8S" = true ]; then
    # Check for k8s/ or kubernetes/ directory
    if [ -d "k8s" ] || [ -d "kubernetes" ] || [ -d "infra/k8s" ] || [ -d "infra/kubernetes" ]; then
        echo "✅ Kubernetes manifests organized in directory"
    fi
    
    # Check for base/overlays pattern (GitOps)
    if [ -d "k8s/base" ] || [ -d "kubernetes/base" ] || [ -d "infra/k8s/base" ]; then
        echo "✅ GitOps base/overlays pattern detected"
    fi
    
    # Check for secrets in YAML files
    if find . -name "*.yaml" -o -name "*.yml" | xargs grep -lE "password|secret|apiKey" 2>/dev/null | head -1 | grep -q .; then
        echo "⚠️  WARNING: Potential secrets found in Kubernetes YAML files"
        echo "   Use Kubernetes secrets or external secret management (Sealed Secrets, External Secrets Operator)"
        WARNINGS=$((WARNINGS + 1))
    fi
fi

# Check for Docker-specific structure
if [ "$HAS_DOCKER" = true ]; then
    if [ -f "Dockerfile" ]; then
        echo "✅ Dockerfile found"
    fi
    
    # Check for .dockerignore
    if [ -f ".dockerignore" ]; then
        echo "✅ .dockerignore found"
    else
        echo "⚠️  WARNING: .dockerignore missing (recommended to reduce image size)"
        WARNINGS=$((WARNINGS + 1))
    fi
fi

# Check for infrastructure README
if [ -d "infra" ] || [ -d "infrastructure" ]; then
    if [ -f "infra/README.md" ] || [ -f "infrastructure/README.md" ]; then
        echo "✅ Infrastructure README found"
    else
        echo "⚠️  WARNING: infra/README.md missing (P1 recommendation)"
        echo "   Should document: deployment process, environment setup, required credentials"
        WARNINGS=$((WARNINGS + 1))
    fi
fi

# Check for infrastructure tests
if [ "$HAS_TERRAFORM" = true ]; then
    if find . -path "*/test/*" -name "*_test.go" -o -path "*/tests/*" -name "*.go" 2>/dev/null | head -1 | grep -q .; then
        echo "✅ Infrastructure tests found (Terratest)"
    elif [ -d "infra/test" ] || [ -d "infra/tests" ]; then
        echo "✅ Infrastructure test directory found"
    else
        echo "ℹ️  INFO: Consider adding infrastructure tests (Terratest, kube-score, etc.)"
    fi
fi

echo ""
echo "=============================================="
echo "Summary:"
echo "  Errors: $ERRORS"
echo "  Warnings: $WARNINGS"
echo ""

if [ $ERRORS -gt 0 ]; then
    echo "❌ Validation failed with $ERRORS error(s)"
    exit 1
elif [ $WARNINGS -gt 0 ]; then
    echo "⚠️  Validation passed with $WARNINGS warning(s)"
    exit 0
else
    echo "✅ Validation passed!"
    exit 0
fi
