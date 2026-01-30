# Cloud-Specific ALIGNMENT Guidance

Guidance for implementing ALIGNMENT standards in cloud-native environments.

## AWS (Amazon Web Services)

### Infrastructure as Code

**Terraform:**
```
infra/
├── terraform/
│   ├── main.tf
│   ├── variables.tf
│   ├── outputs.tf
│   └── environments/
│       ├── dev/
│       ├── staging/
│       └── prod/
```

**CloudFormation/CDK:**
```
infra/
├── cloudformation/
│   └── templates/
└── cdk/
    └── lib/
```

### CI/CD Integration

**GitHub Actions with AWS:**
```yaml
- name: Configure AWS credentials
  uses: aws-actions/configure-aws-credentials@v2
  with:
    aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
    aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
    aws-region: us-east-1

- name: Deploy to AWS
  run: |
    aws s3 sync dist/ s3://my-bucket/
    aws cloudfront create-invalidation --distribution-id $DIST_ID --paths "/*"
```

### Secret Management

- **AWS Secrets Manager:** Store application secrets
- **Parameter Store:** Configuration parameters
- **IAM Roles:** Use roles instead of access keys when possible

### Monitoring & Observability

- **CloudWatch:** Logs and metrics
- **X-Ray:** Distributed tracing
- **CloudWatch Insights:** Log analysis

## Azure

### Infrastructure as Code

**Terraform:**
```
infra/
├── terraform/
│   ├── main.tf
│   └── environments/
│       ├── dev/
│       ├── staging/
│       └── prod/
```

**ARM Templates / Bicep:**
```
infra/
├── arm/
│   └── templates/
└── bicep/
    └── modules/
```

### CI/CD Integration

**Azure DevOps:**
```yaml
- task: AzureCLI@2
  inputs:
    azureSubscription: 'MySubscription'
    scriptType: 'bash'
    scriptLocation: 'inlineScript'
    inlineScript: |
      az webapp deploy --name myapp --resource-group myrg --src-path dist/
```

**GitHub Actions with Azure:**
```yaml
- name: Azure Login
  uses: azure/login@v1
  with:
    creds: ${{ secrets.AZURE_CREDENTIALS }}

- name: Deploy to Azure
  run: |
    az webapp deploy --name myapp --resource-group myrg
```

### Secret Management

- **Azure Key Vault:** Centralized secret management
- **Managed Identities:** Use instead of service principals when possible
- **App Configuration:** Feature flags and configuration

### Monitoring & Observability

- **Application Insights:** Application performance monitoring
- **Log Analytics:** Centralized logging
- **Azure Monitor:** Metrics and alerts

## GCP (Google Cloud Platform)

### Infrastructure as Code

**Terraform:**
```
infra/
├── terraform/
│   ├── main.tf
│   └── environments/
│       ├── dev/
│       ├── staging/
│       └── prod/
```

**Deployment Manager:**
```
infra/
└── deployment-manager/
    └── configs/
```

### CI/CD Integration

**Cloud Build:**
```yaml
# cloudbuild.yaml
steps:
  - name: 'gcr.io/cloud-builders/npm'
    args: ['ci']
  - name: 'gcr.io/cloud-builders/npm'
    args: ['run', 'build']
  - name: 'gcr.io/cloud-builders/npm'
    args: ['test']
  - name: 'gcr.io/cloud-builders/gcloud'
    args: ['app', 'deploy']
```

**GitHub Actions with GCP:**
```yaml
- name: Authenticate to Google Cloud
  uses: google-github-actions/auth@v1
  with:
    credentials_json: ${{ secrets.GCP_SA_KEY }}

- name: Deploy to GCP
  run: |
    gcloud app deploy app.yaml
```

### Secret Management

- **Secret Manager:** Centralized secret storage
- **Workload Identity:** Use instead of service account keys
- **Cloud KMS:** Key management

### Monitoring & Observability

- **Cloud Monitoring:** Metrics and dashboards
- **Cloud Logging:** Centralized logs
- **Cloud Trace:** Distributed tracing
- **Error Reporting:** Error tracking

## Multi-Cloud Considerations

### Abstraction Layers

**Terraform:**
- Use cloud-agnostic resources when possible
- Separate cloud-specific modules
- Environment-specific configurations

**Kubernetes:**
- Use Kubernetes for portability
- Cloud-specific services via operators
- Helm charts for deployment

### Configuration Management

**Environment Variables:**
```bash
# .env.example
CLOUD_PROVIDER=aws  # or azure, gcp
AWS_REGION=us-east-1
AZURE_RESOURCE_GROUP=my-rg
GCP_PROJECT_ID=my-project
```

**Feature Flags:**
- Use cloud-agnostic feature flag services
- Or cloud-native services (AWS AppConfig, Azure App Configuration)

## Cloud-Specific ALIGNMENT Sections

### Section 8: Infrastructure / IaC

**Cloud Considerations:**
- Organize by cloud provider
- Use cloud-specific modules
- Environment separation (dev/staging/prod)
- Cost management tags

### Section 10: Security & Compliance

**Cloud Security:**
- IAM/RBAC configuration
- Network security groups
- Encryption at rest and in transit
- Compliance certifications (SOC 2, ISO 27001)

### Section 11: Observability & Monitoring

**Cloud Observability:**
- Cloud-native logging services
- Metrics and dashboards
- Alerting and notification
- Cost monitoring

## Best Practices

### Cost Management

- **Tagging:** Tag all resources for cost tracking
- **Budgets:** Set up budget alerts
- **Right-sizing:** Regular resource review
- **Reserved Instances:** For predictable workloads

### Disaster Recovery

- **Backups:** Automated backup strategies
- **Multi-region:** Deploy to multiple regions
- **Failover:** Automated failover procedures
- **RTO/RPO:** Define recovery objectives

### Compliance

- **Data Residency:** Understand data location requirements
- **Compliance Certifications:** Leverage cloud provider certifications
- **Audit Logging:** Enable comprehensive audit logs
- **Data Encryption:** Encrypt sensitive data

## References

- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)
- [Azure Well-Architected Framework](https://learn.microsoft.com/en-us/azure/architecture/framework/)
- [Google Cloud Architecture Framework](https://cloud.google.com/architecture/framework)
- [Terraform Cloud Providers](https://registry.terraform.io/browse/providers)
