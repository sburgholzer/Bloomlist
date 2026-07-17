# Deployment

## Overview

Bloomlist is deployed as a static site on AWS using:

- **S3** — Stores the built HTML/CSS/JS files
- **CloudFront** — CDN for global distribution + HTTPS
- **ACM** — TLS certificate for the custom domain
- **Route 53** — DNS pointing to CloudFront

Infrastructure is managed with AWS CDK (TypeScript) in the `infra/` directory.

## Prerequisites

- AWS CLI configured with credentials (`aws configure`)
- Node.js 18+
- CDK bootstrapped in us-east-1:
  ```bash
  cd infra && npx cdk bootstrap aws://ACCOUNT_ID/us-east-1
  ```

## Deploy

One command builds and deploys everything:

```bash
npm run deploy
```

This does:
1. Runs `tsc` (type-check) + `vite build` (production bundle to `dist/`)
2. Synthesizes the CDK stack
3. Uploads `dist/` to S3
4. Invalidates the CloudFront cache

First deploy takes ~5 minutes (certificate validation + CloudFront distribution creation). Subsequent deploys take ~1-2 minutes.

## Infrastructure Details

| Resource | Purpose |
|----------|---------|
| S3 Bucket | Static file storage, private (no public access) |
| CloudFront Distribution | HTTPS, CDN, SPA routing (404→index.html) |
| ACM Certificate | TLS for custom domain, DNS-validated |
| Route 53 A Record | Points domain to CloudFront |
| Origin Access Control | Allows CloudFront to read from private S3 bucket |

## Configuration

Domain settings live in `infra/cdk.json` (gitignored). Copy the example to get started:

```bash
cp infra/cdk.json.example infra/cdk.json
```

Then edit `infra/cdk.json` with your values:

```json
{
  "app": "npx ts-node --prefer-ts-exts bin/app.ts",
  "context": {
    "domainName": "bloomlist.yourdomain.com",
    "hostedZoneName": "yourdomain.com"
  }
}
```

- `domainName` — The full subdomain for the site
- `hostedZoneName` — The Route 53 hosted zone (usually the root domain)

To change the domain, update these values and redeploy.

## CDK Commands

Run these from the `infra/` directory:

```bash
npx cdk synth      # Generate CloudFormation template (dry run)
npx cdk diff       # Show what would change
npx cdk deploy     # Deploy (use npm run deploy from root instead)
npx cdk destroy    # Tear down all resources
```

## Tear Down

To remove all AWS resources:

```bash
cd infra && npx cdk destroy
```

This deletes the S3 bucket (including contents), CloudFront distribution, certificate, and DNS record.

## Troubleshooting

**Certificate stuck in pending validation**
- Verify the hosted zone in Route 53 matches `hostedZoneName` in cdk.json
- CDK creates DNS validation records automatically — check they exist in Route 53

**403 after deploy**
- CloudFront cache may be stale. Run: `aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"` (find the ID in the CDK deploy output)

**Deploy fails with "bucket already exists"**
- S3 bucket names are globally unique. If the name is taken, change `domainName` in cdk.json

**Changes not showing up**
- The deploy command invalidates CloudFront cache automatically. If still stale, wait 1-2 minutes or check in an incognito window.

## Cost

For a low-traffic static site like this, expect ~$1-2/month:
- S3: pennies (a few MB of storage)
- CloudFront: free tier covers 1 TB/month
- Route 53: $0.50/month for the hosted zone
- ACM: free
