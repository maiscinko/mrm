# GitHub Actions Setup

## Required Secrets

Add these in **GitHub → Settings → Secrets and variables → Actions**:

### 1. `SSH_PRIVATE_KEY`
SSH private key to access production server.

**Generate:**
```bash
# On production server
ssh-keygen -t ed25519 -C "github-actions-mrm"
cat ~/.ssh/id_ed25519.pub >> ~/.ssh/authorized_keys
cat ~/.ssh/id_ed25519  # Copy this to GitHub secret
```

### 2. `SERVER_HOST`
Production server hostname or IP.

**Example:** `mrm.a25.com.br` or `123.456.789.0`

### 3. `SERVER_USER`
SSH user on production server.

**Example:** `devuser`

---

## Workflow

**Trigger:** Push to `main` branch

**Steps:**
1. Checkout code
2. Setup SSH connection
3. SSH into production server
4. Pull latest changes
5. Rebuild Docker image
6. Restart container
7. Health check

**Duration:** ~3-4 minutes (runs in background)

---

## Testing

```bash
# Make change
echo "test" >> test.txt

# Commit + push
git add test.txt
git commit -m "test: GitHub Actions deploy"
git push origin main

# Watch Action run
# GitHub → Actions tab → See deploy progress
```

---

## Benefits

✅ **Automated:** Push to main = auto-deploy
✅ **Background:** Continue working while build runs
✅ **Logs:** All build logs in GitHub Actions tab
✅ **Rollback:** Git revert + push = auto-rollback

---

## Fallback

If GitHub Actions fails, use manual deploy:

```bash
./deploy.sh
```
