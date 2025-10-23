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
