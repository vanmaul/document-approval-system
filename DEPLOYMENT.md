# Deployment & Secrets

This project is configured to deploy to Vercel via GitHub Actions. The workflow is located at:

- `.github/workflows/deploy-vercel.yml`

## Required Secrets (GitHub repository)

Add these repository secrets in GitHub (Settings → Secrets → Actions) for the deployment workflow to run successfully:

- `VERCEL_TOKEN` – A personal token from your Vercel account (User > Settings > Tokens). Used to authenticate the deployment.
- `VERCEL_ORG_ID` – Your Vercel organization ID (you can get this from the Project Settings → General or via the Vercel dashboard/API).
- `VERCEL_PROJECT_ID` – Your Vercel project ID (from Project Settings → General or via Vercel dashboard/API).

Optional but recommended secrets for production:

- `DATABASE_URL` – Production database connection string (e.g., `postgresql://user:pass@host:5432/dbname`).
- `NEXTAUTH_SECRET` – A strong (32+ bytes) secret for NextAuth JWT/session signing. Generate with `openssl rand -base64 32` or similar.
- `NEXTAUTH_URL` – Public URL for your deployment (e.g., `https://your-domain.com`).

## How to add secrets via GitHub UI

1. Open the repository on GitHub: `https://github.com/<owner>/<repo>`.
2. Click `Settings` → `Secrets` → `Actions`.
3. Click `New repository secret` and add the name/value pairs listed above.

## How to add secrets via `gh` CLI

If you have the GitHub CLI installed and authenticated (`gh auth login`), you can add secrets from your terminal:

```powershell
# example: set VERCEL_TOKEN
gh secret set VERCEL_TOKEN --body "<your-vercel-token>" 
gh secret set VERCEL_ORG_ID --body "<your-org-id>"
gh secret set VERCEL_PROJECT_ID --body "<your-project-id>"
gh secret set NEXTAUTH_SECRET --body "$(openssl rand -base64 32)"
gh secret set DATABASE_URL --body "postgresql://user:pass@host:5432/db"
```

Note: Windows users may need to install OpenSSL or generate a base64 secret using PowerShell:

```powershell
# PowerShell base64 secret (32 bytes)
[Convert]::ToBase64String((1..32 | ForEach-Object {Get-Random -Maximum 256}) -as [byte[]])
```

## Vercel project setup

1. Create a project in Vercel and link it to this GitHub repository.
2. Note the `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID` from the project settings.
3. Add the three Vercel secrets to GitHub (token/org/project id).
4. On push to `main`, the GitHub Action `deploy-vercel.yml` will deploy to production.

## Troubleshooting

- If the workflow fails with authentication errors, verify `VERCEL_TOKEN` and the org/project IDs.
- If build errors occur, check the `Build` step output in the Actions run and ensure your Node version and environment variables are correct.

