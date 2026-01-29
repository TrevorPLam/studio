# Platform-Specific Quick Start Guides

Quick start guides for common CI/CD platforms. Get CI/CD running quickly.

## GitHub Actions Quick Start

### Setup (5 minutes)

1. **Create workflow directory:**
```bash
mkdir -p .github/workflows
```

2. **Create CI workflow (.github/workflows/ci.yml):**
```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Lint
        run: npm run lint
      
      - name: Test
        run: npm test
      
      - name: Security audit
        run: npm audit --audit-level=moderate
```

3. **Push to GitHub:**
```bash
git add .github/workflows/ci.yml
git commit -m "ci: add GitHub Actions workflow"
git push
```

### Branch Protection Setup

1. Go to repository Settings → Branches
2. Add rule for `main` branch:
   - ✅ Require pull request reviews
   - ✅ Require status checks to pass
   - ✅ Require branches to be up to date
   - Select `build` job

### Time Estimate: 15-30 minutes

## GitLab CI Quick Start

### Setup (5 minutes)

1. **Create .gitlab-ci.yml in root:**
```yaml
stages:
  - build
  - test
  - security

variables:
  NODE_VERSION: "18"

build:
  stage: build
  image: node:${NODE_VERSION}
  script:
    - npm ci
    - npm run build
  artifacts:
    paths:
      - dist/
    expire_in: 1 hour

test:
  stage: test
  image: node:${NODE_VERSION}
  script:
    - npm ci
    - npm test
  coverage: '/Coverage: \d+\.\d+%/'

lint:
  stage: test
  image: node:${NODE_VERSION}
  script:
    - npm ci
    - npm run lint

security:
  stage: security
  image: node:${NODE_VERSION}
  script:
    - npm ci
    - npm audit --audit-level=moderate
```

2. **Push to GitLab:**
```bash
git add .gitlab-ci.yml
git commit -m "ci: add GitLab CI configuration"
git push
```

### Merge Request Settings

1. Go to Settings → Merge requests
2. Enable:
   - ✅ Pipelines must succeed
   - ✅ All discussions must be resolved

### Time Estimate: 15-30 minutes

## Azure DevOps Quick Start

### Setup (10 minutes)

1. **Create azure-pipelines.yml in root:**
```yaml
trigger:
  branches:
    include:
      - main
      - develop

pool:
  vmImage: 'ubuntu-latest'

stages:
  - stage: Build
    displayName: 'Build and Test'
    jobs:
      - job: Build
        displayName: 'Build'
        steps:
          - task: NodeTool@0
            inputs:
              versionSpec: '18.x'
            displayName: 'Install Node.js'
          
          - script: |
              npm ci
              npm run build
            displayName: 'Build'
          
          - script: |
              npm run lint
            displayName: 'Lint'
          
          - script: |
              npm test
            displayName: 'Test'
            continueOnError: false
          
          - script: |
              npm audit --audit-level=moderate
            displayName: 'Security Audit'
```

2. **Create pipeline:**
   - Go to Pipelines → New Pipeline
   - Select repository
   - Choose "Existing Azure Pipelines YAML file"
   - Select `azure-pipelines.yml`
   - Run pipeline

### Branch Policy Setup

1. Go to Repos → Branches
2. Select `main` branch → Branch policies
3. Add build validation:
   - ✅ Require a successful build
   - Select build pipeline

### Time Estimate: 20-40 minutes

## CircleCI Quick Start

### Setup (10 minutes)

1. **Create .circleci/config.yml:**
```yaml
version: 2.1

jobs:
  build:
    docker:
      - image: cimg/node:18.0
    steps:
      - checkout
      - restore_cache:
          keys:
            - v1-dependencies-{{ checksum "package-lock.json" }}
      - run:
          name: Install dependencies
          command: npm ci
      - save_cache:
          paths:
            - node_modules
          key: v1-dependencies-{{ checksum "package-lock.json" }}
      - run:
          name: Build
          command: npm run build
      - run:
          name: Test
          command: npm test
      - run:
          name: Lint
          command: npm run lint

workflows:
  version: 2
  build-and-test:
    jobs:
      - build
```

2. **Connect repository:**
   - Go to CircleCI dashboard
   - Add project
   - Select repository
   - Start building

### Time Estimate: 15-30 minutes

## Bitbucket Pipelines Quick Start

### Setup (10 minutes)

1. **Create bitbucket-pipelines.yml in root:**
```yaml
image: node:18

pipelines:
  default:
    - step:
        name: Build and Test
        caches:
          - node
        script:
          - npm ci
          - npm run build
          - npm run lint
          - npm test
        artifacts:
          - dist/**
  branches:
    main:
      - step:
          name: Build and Test
          caches:
            - node
          script:
            - npm ci
            - npm run build
            - npm run lint
            - npm test
            - npm audit --audit-level=moderate
```

2. **Enable Pipelines:**
   - Go to repository Settings → Pipelines
   - Enable Pipelines
   - Push changes

### Time Estimate: 15-30 minutes

## Jenkins Quick Start

### Setup (20 minutes)

1. **Create Jenkinsfile in root:**
```groovy
pipeline {
    agent any
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Build') {
            steps {
                sh 'npm ci'
                sh 'npm run build'
            }
        }
        
        stage('Test') {
            steps {
                sh 'npm test'
            }
        }
        
        stage('Lint') {
            steps {
                sh 'npm run lint'
            }
        }
        
        stage('Security') {
            steps {
                sh 'npm audit --audit-level=moderate'
            }
        }
    }
    
    post {
        always {
            cleanWs()
        }
    }
}
```

2. **Create Pipeline Job:**
   - New Item → Pipeline
   - Configure → Pipeline script from SCM
   - Select Git, enter repository URL
   - Script Path: `Jenkinsfile`

### Time Estimate: 30-60 minutes (includes Jenkins setup)

## Platform Comparison

| Feature | GitHub Actions | GitLab CI | Azure DevOps | CircleCI | Bitbucket | Jenkins |
|---------|---------------|-----------|--------------|----------|-----------|---------|
| **Config Location** | `.github/workflows/*.yml` | `.gitlab-ci.yml` | `azure-pipelines.yml` | `.circleci/config.yml` | `bitbucket-pipelines.yml` | `Jenkinsfile` |
| **Free Tier** | ✅ (public) | ✅ | ✅ (limited) | ✅ (limited) | ✅ (limited) | ✅ (self-hosted) |
| **Self-Hosted** | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| **Matrix Builds** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Caching** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Setup Time** | 15-30 min | 15-30 min | 20-40 min | 15-30 min | 15-30 min | 30-60 min |

## Common CI/CD Patterns

### Caching Dependencies

**GitHub Actions:**
```yaml
- uses: actions/setup-node@v4
  with:
    cache: 'npm'
```

**GitLab CI:**
```yaml
cache:
  paths:
    - node_modules/
```

**Azure DevOps:**
```yaml
- task: Cache@2
  inputs:
    key: 'npm | package-lock.json'
    path: 'node_modules'
```

### Matrix Builds (Multiple Versions)

**GitHub Actions:**
```yaml
strategy:
  matrix:
    node-version: [16, 18, 20]
```

**GitLab CI:**
```yaml
test:
  parallel:
    matrix:
      - NODE_VERSION: ["16", "18", "20"]
```

**Azure DevOps:**
```yaml
strategy:
  matrix:
    Node16:
      nodeVersion: '16.x'
    Node18:
      nodeVersion: '18.x'
```

### Conditional Steps

**All Platforms:**
```yaml
# Only run on main branch
if: github.ref == 'refs/heads/main'  # GitHub
if: '$CI_COMMIT_BRANCH == "main"'    # GitLab
condition: eq(variables['Build.SourceBranch'], 'refs/heads/main')  # Azure
```

## Next Steps

After quick start:
1. Add security scanning (see [Section 5](05-CI-CD-Structure.md))
2. Add deployment steps (if applicable)
3. Configure branch protection
4. Set up dependency automation (Dependabot/Renovate)

## Troubleshooting

### GitHub Actions
- **Issue:** Workflow not running
  - **Solution:** Check workflow file syntax, ensure it's in `.github/workflows/`
- **Issue:** Secrets not available
  - **Solution:** Add secrets in Settings → Secrets and variables → Actions

### GitLab CI
- **Issue:** Pipeline not running
  - **Solution:** Check `.gitlab-ci.yml` syntax, verify GitLab Runner is active
- **Issue:** Jobs failing
  - **Solution:** Check job logs, verify Docker image availability

### Azure DevOps
- **Issue:** Pipeline not found
  - **Solution:** Ensure `azure-pipelines.yml` is in root, create pipeline manually
- **Issue:** Build failing
  - **Solution:** Check build logs, verify agent pool availability

---

**Remember:** Start simple, add complexity as needed. Basic CI/CD is better than no CI/CD!
