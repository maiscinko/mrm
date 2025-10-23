# Webhook Auto-Deploy

**Secure GitHub Webhook → Auto-deploy on push**

## Setup (5 min)

```bash
# 1. Generate secret
openssl rand -hex 32 > webhook/.secret

# 2. Start webhook (port 8887)
WEBHOOK_SECRET=$(cat webhook/.secret) node webhook/deploy.js &

# 3. Add to GitHub
# Settings → Webhooks → Add webhook
# URL: http://IP:8887/deploy
# Secret: (paste from webhook/.secret)
# Events: Just push (main branch)
```

## Security

✅ HMAC SHA256 signature verification
✅ Token shared only GitHub ↔ Server
✅ No external access needed (GitHub → IP:8887)
✅ Auto-deploy runs in background

## Test

```bash
# Local test (requires secret)
curl -X POST http://localhost:8887/deploy \
  -H "X-Hub-Signature-256: sha256=$(echo -n '{}' | openssl dgst -sha256 -hmac "$(cat webhook/.secret)" | cut -d' ' -f2)"
```

## Systemd Service

```bash
sudo cp webhook/mrm-webhook.service /etc/systemd/system/
sudo systemctl enable mrm-webhook
sudo systemctl start mrm-webhook
```
# Webhook Test - Thu Oct 23 08:37:50 PM UTC 2025
# Webhook Test 2 - Thu Oct 23 08:44:56 PM UTC 2025
# Webhook Test 3 - Secret Updated - Thu Oct 23 08:46:14 PM UTC 2025
# Debug test - Thu Oct 23 08:48:40 PM UTC 2025
