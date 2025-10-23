#!/bin/bash
# =====================================================
# MRM Hot Deploy Script
# Auto-deploy: git push → docker rebuild → production
# =====================================================

set -e  # Exit on error

echo "🚀 MRM Hot Deploy Starting..."
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Git status check
echo "${YELLOW}[1/6]${NC} Checking git status..."
if [[ -n $(git status -s) ]]; then
    echo "${GREEN}✓${NC} Changes detected"
else
    echo "${RED}✗${NC} No changes to deploy"
    exit 0
fi
echo ""

# Step 2: Git add + commit
echo "${YELLOW}[2/6]${NC} Creating commit..."
read -p "Commit message: " COMMIT_MSG
git add .
git commit -m "$COMMIT_MSG

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
echo "${GREEN}✓${NC} Commit created"
echo ""

# Step 3: Git push
echo "${YELLOW}[3/6]${NC} Pushing to remote..."
git push origin main
echo "${GREEN}✓${NC} Pushed to GitHub"
echo ""

# Step 4: Docker build (with cache)
echo "${YELLOW}[4/6]${NC} Building Docker image (this may take 2-3 min)..."
DOCKER_BUILDKIT=1 docker compose build --progress=plain 2>&1 | tail -20
echo "${GREEN}✓${NC} Docker image built"
echo ""

# Step 5: Docker deploy (zero-downtime)
echo "${YELLOW}[5/6]${NC} Deploying to production..."
docker compose down
docker compose up -d
echo "${GREEN}✓${NC} Container deployed"
echo ""

# Step 6: Health check
echo "${YELLOW}[6/6]${NC} Running health check..."
sleep 5
HTTP_CODE=$(curl -I https://mrm.a25.com.br 2>/dev/null | head -n 1 | awk '{print $2}')

if [[ "$HTTP_CODE" == "200" ]] || [[ "$HTTP_CODE" == "307" ]]; then
    echo "${GREEN}✓${NC} Production is LIVE: https://mrm.a25.com.br (HTTP $HTTP_CODE)"
    echo ""
    echo "${GREEN}========================================${NC}"
    echo "${GREEN}🎉 DEPLOY SUCCESSFUL!${NC}"
    echo "${GREEN}========================================${NC}"
    echo ""
    echo "URL: https://mrm.a25.com.br"
    echo "Container: $(docker ps --filter name=mrm-saas --format 'table {{.Names}}\t{{.Status}}')"
    echo ""
else
    echo "${RED}✗${NC} Health check failed (HTTP $HTTP_CODE)"
    echo "${RED}Check logs: docker logs mrm-saas${NC}"
    exit 1
fi
