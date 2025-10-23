#!/bin/bash
# =====================================================
# MRM Rollback Script
# Emergency rollback to previous commit + redeploy
# =====================================================

set -e

echo "⚠️  MRM Rollback Starting..."
echo ""

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Show recent commits
echo "${YELLOW}Recent commits:${NC}"
git log --oneline -5
echo ""

# Confirm rollback
read -p "${RED}Rollback to previous commit? (yes/no): ${NC}" CONFIRM
if [[ "$CONFIRM" != "yes" ]]; then
    echo "Rollback cancelled"
    exit 0
fi
echo ""

# Step 1: Git rollback
echo "${YELLOW}[1/4]${NC} Rolling back git..."
git reset --hard HEAD~1
git push origin main --force
echo "${GREEN}✓${NC} Git rolled back"
echo ""

# Step 2: Rebuild Docker
echo "${YELLOW}[2/4]${NC} Rebuilding Docker image..."
DOCKER_BUILDKIT=1 docker compose build --progress=plain 2>&1 | tail -20
echo "${GREEN}✓${NC} Docker image rebuilt"
echo ""

# Step 3: Redeploy
echo "${YELLOW}[3/4]${NC} Redeploying..."
docker compose down
docker compose up -d
echo "${GREEN}✓${NC} Container redeployed"
echo ""

# Step 4: Health check
echo "${YELLOW}[4/4]${NC} Health check..."
sleep 5
HTTP_CODE=$(curl -I https://mrm.a25.com.br 2>/dev/null | head -n 1 | awk '{print $2}')

if [[ "$HTTP_CODE" == "200" ]] || [[ "$HTTP_CODE" == "307" ]]; then
    echo "${GREEN}✓${NC} Rollback successful (HTTP $HTTP_CODE)"
    echo ""
    echo "${GREEN}========================================${NC}"
    echo "${GREEN}✓ ROLLBACK COMPLETE${NC}"
    echo "${GREEN}========================================${NC}"
else
    echo "${RED}✗${NC} Rollback failed (HTTP $HTTP_CODE)"
    echo "Check logs: docker logs mrm-saas"
    exit 1
fi
