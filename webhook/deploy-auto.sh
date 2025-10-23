#!/bin/bash
# Auto-deploy triggered by webhook (no user input)
set -e
cd /home/devuser/Desktop/abckx/mrm

echo "📥 Pulling latest..."
git pull origin main

echo "🐳 Building Docker..."
DOCKER_BUILDKIT=1 docker compose build

echo "🚀 Deploying..."
docker compose down && docker compose up -d

echo "✅ Done!"
curl -I https://mrm.a25.com.br
