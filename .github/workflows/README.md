# GitHub Actions Setup

## Required Secrets

Add these in **GitHub → Settings → Secrets and variables → Actions**:

### 1. `SSH_PRIVATE_KEY_DEV01`
SSH private key to access dev01 server (dev.a25.com.br).

**Generate:**
```bash
# On dev server
ssh-keygen -t ed25519 -C "github-actions-mrm-dev01"
cat ~/.ssh/id_ed25519.pub >> ~/.ssh/authorized_keys
cat ~/.ssh/id_ed25519  # Copy this to GitHub secret
```

**Note:** Use `_DEV01`, `_PROD01`, etc. to identify different environments.

### 2. `SERVER_HOST_DEV01`
Dev server hostname or IP.

**Example:** `dev.a25.com.br`

### 3. `SERVER_USER_DEV01`
SSH user on dev server.

**Example:** `git-user`

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
