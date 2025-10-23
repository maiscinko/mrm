#!/usr/bin/env node
// Secure GitHub Webhook → Auto Deploy
const http = require('http');
const crypto = require('crypto');
const { exec } = require('child_process');

const PORT = 8887;
const SECRET = process.env.WEBHOOK_SECRET || 'CHANGE_THIS_SECRET';
const DEPLOY_SCRIPT = '/home/devuser/Desktop/abckx/mrm/deploy-auto.sh';

http.createServer((req, res) => {
  if (req.method !== 'POST' || req.url !== '/deploy') {
    res.writeHead(404);
    res.end('Not Found');
    return;
  }

  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', () => {
    // Verify GitHub signature (HMAC SHA256)
    const signature = req.headers['x-hub-signature-256'];
    const hash = 'sha256=' + crypto.createHmac('sha256', SECRET).update(body).digest('hex');

    if (signature !== hash) {
      console.log('❌ Invalid signature');
      res.writeHead(403);
      res.end(JSON.stringify({error: 'Invalid signature'}));
      return;
    }

    console.log('✅ Webhook verified, starting deploy...');

    exec(DEPLOY_SCRIPT, (err, stdout, stderr) => {
      const status = err ? 'failed' : 'success';
      console.log(`Deploy ${status}\n${stdout}\n${stderr}`);
    });

    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({status: 'deploying', message: 'Deploy started'}));
  });
}).listen(PORT, '0.0.0.0', () => {
  console.log(`🎧 Webhook listening on port ${PORT}`);
});
