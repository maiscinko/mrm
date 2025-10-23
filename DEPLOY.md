# 🚀 MRM Deploy Workflow

**Status:** ✅ CI/CD Ready - Hot Deploy Automático

---

## 📋 **Quick Commands**

```bash
# Development (local hot reload)
npm run dev               # Runs on http://localhost:3030

# Build test (verify no errors)
npm run build

# Deploy to Production (one command - does everything)
./deploy.sh              # git commit → push → docker build → deploy → health check

# Rollback (if deploy breaks)
./rollback.sh            # git reset → force push → rebuild → redeploy

# Production logs
docker logs mrm-saas     # Real-time logs
docker logs -f mrm-saas  # Follow logs

# Stop production
docker compose down
```

---

## 🔄 **Development Workflow**

### **1. Local Development (Hot Reload)**
```bash
# Make changes in code
npm run dev

# Test locally: http://localhost:3030
# Changes auto-reload (Next.js Fast Refresh)
```

### **2. Deploy to Production**
```bash
# One command does everything:
./deploy.sh

# What happens automatically:
# ✓ [1/6] Git status check
# ✓ [2/6] Git commit (prompts for message)
# ✓ [3/6] Git push to origin/main
# ✓ [4/6] Docker build (with cache, ~2-3 min)
# ✓ [5/6] Docker deploy (zero-downtime restart)
# ✓ [6/6] Health check (curl https://mrm.a25.com.br)
```

### **3. If Deploy Breaks (Emergency Rollback)**
```bash
./rollback.sh

# What happens:
# ✓ Git reset to previous commit
# ✓ Force push to origin/main
# ✓ Rebuild Docker image
# ✓ Redeploy container
# ✓ Health check
```

---

## 🎯 **Production URLs**

- **App:** https://mrm.a25.com.br
- **Health Check:** `curl -I https://mrm.a25.com.br` (expect HTTP 200 or 307)

---

## 📦 **Docker Architecture**

- **Image:** `mrm-saas` (multi-stage build, optimized)
- **Network:** `aleff-public` (Traefik external)
- **SSL:** Let's Encrypt (auto-renew via Traefik)
- **Port:** Internal 3000 → External 443 (HTTPS)

---

## 🔐 **Environment Variables**

**Required in `.env` (NOT committed to git):**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://odalyniwiubddowazovp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
OPENAI_API_KEY=sk-proj-...
NEXT_PUBLIC_APP_URL=https://mrm.a25.com.br
```

**Security:** `.env` is in `.gitignore` ✅ Never commit production keys.

---

## ⚡ **Performance**

- **Local dev:** Hot reload (~300ms)
- **Production build:** ~2-3 min (with Docker cache)
- **Deploy time:** ~3-4 min total (build + restart + health check)
- **Rollback time:** ~3-4 min (same as deploy)

---

## 🐛 **Troubleshooting**

### **Deploy fails at Docker build**
```bash
# Check Docker logs
docker logs mrm-saas

# Manual rebuild (no cache)
docker compose build --no-cache
docker compose up -d
```

### **Production not accessible**
```bash
# Check container status
docker ps | grep mrm-saas

# Check Traefik routing
docker logs traefik | grep mrm

# Restart container
docker compose restart
```

### **Need to test without deploying**
```bash
# Build locally first
npm run build

# If build passes, then deploy
./deploy.sh
```

---

## 📝 **Commit Message Convention**

**Format (auto-added by deploy.sh):**
```
feat(mrm): Your commit message here

Details about changes...

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

---

## 🎯 **Next Steps**

1. **Test deploy.sh:** Make small change → `./deploy.sh` → Verify production
2. **Test rollback.sh:** If deploy breaks → `./rollback.sh` → Verify rollback works
3. **Complete onboarding:** Create first mentor profile in production
4. **Add first mentee:** Test full workflow (session + deliverables + Chat IA)
5. **Pilot recruitment:** CSO André recruits 3-5 mentors MLS (30/10 - 15/11)

---

**Last Updated:** 2025-10-23
**Version:** 1.0 (CI/CD Hot Deploy Ready)
**Owner:** PM Melisa
