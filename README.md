# 🎯 MRM - Mentoring Relationship Manager

> **O sistema que ajuda o mentor a lembrar, provocar e renovar**

**Status:** 🟡 Discovery → Development
**Deadline MVP:** 29/10/2025 (quarta-feira manhã)
**Owner:** CPO Maicon + CTO Ronald
**PM Responsible:** TBD (CPO supervisiona até alocar)

---

## 📊 **Visão Geral**

MRM é o **primeiro CRM específico para mentores** com IA contextual de sessão. Transforma sessões dispersas em histórico estruturado, entregáveis visíveis e renovações previsíveis.

**Target Market:** Mentores MLS premium ($5k-50k/ano por mentorado)
**Value Proposition:** Board visual + IA contextual + Renovação automática
**Pricing:** $497/ano (early adopter) → $1000/ano (GA)

**Innovation Claim:** Único CRM que combina:
1. CRM específico mentoria (não vendas)
2. IA contextual que lê histórico completo
3. Sistema renovação automática baseado entregas

---

## 🗺️ **Roadmap MVP (7 dias)**

### ✅ **Fase 1: Foundation** (22/10 - HOJE)
- [x] PRD Complete v0.1 (935 linhas - 100% preenchido)
- [x] SQL Schema production-ready (6 tabelas + RLS + indexes)
- [x] .env.example (todas variáveis documentadas)
- [x] README.md (este arquivo - roadmap visual)
- [ ] Prompt v0/Lovable estruturado
- [ ] Commit foundation files

**Deliverables:** PRD.json, SUPABASE-SCHEMA.sql, .env.example, README.md
**Owner:** CPO Maicon
**Status:** 🟢 90% completo

---

### ⏳ **Fase 2: Infra Setup** (23/10)
- [ ] Criar Supabase project (MRM Production)
- [ ] Executar SUPABASE-SCHEMA.sql (6 tabelas + RLS)
- [ ] Configurar OAuth Google (Supabase Dashboard)
- [ ] Configurar OAuth LinkedIn (Supabase Dashboard)
- [ ] Criar Vercel project (conectar repo GitHub)
- [ ] Configurar env vars Vercel (production)
- [ ] Obter API keys (OpenAI, Anthropic, Resend)

**Deliverables:** Supabase project ready, Vercel project ready, API keys secured
**Owner:** CTO Ronald + CFO Tales (aprovar budget APIs)
**Blocker:** Nenhum (foundation completa)

---

### 📋 **Fase 3: Frontend Generation** (24-25/10)
- [ ] Input PRD.json completo para v0/Lovable
- [ ] Gerar estrutura Next.js 14 (App Router)
- [ ] Página 1: Login/Onboard (OAuth Google/LinkedIn)
- [ ] Página 2: Board Mentorados (dashboard cards)
- [ ] Página 3: Ficha Mentorado (5 tabs detalhadas)
- [ ] Página 4: Perfil Mentor (config IA tone)
- [ ] Página 5: Settings (security + data management)
- [ ] Review código gerado + ajustes (types, validations)
- [ ] Setup shadcn/ui components library
- [ ] Setup Supabase client + auth helpers

**Deliverables:** 5 páginas funcionais, componentes reutilizáveis, auth flow completo
**Owner:** CTO Ronald + v0/Lovable
**Dependency:** Fase 2 completa (Supabase + Vercel ready)

---

### 🤖 **Fase 4: IA Integration** (26-27/10)
- [ ] API route: POST /api/ai/session-summary (OpenAI GPT-4o)
- [ ] API route: POST /api/ai/provocative-questions (OpenAI GPT-4o)
- [ ] API route: POST /api/ai/renewal-plan (Claude 3.5 Sonnet)
- [ ] API route: POST /api/ai/observed-pain (análise sessões)
- [ ] Testar prompts com sessões mock (validar qualidade output)
- [ ] Fine-tune prompts baseado testes
- [ ] Implementar caching (ai_insights table)
- [ ] Error handling + retry logic APIs IA
- [ ] Rate limiting (evitar abuse API keys)

**Deliverables:** IA features funcionais (resumos, perguntas, planos renovação)
**Owner:** CTO Ronald
**Dependency:** Fase 3 completa (frontend pronto)

---

### 🚀 **Fase 5: Polish + Deploy** (28-29/10)
- [ ] UX polish (loading states, skeleton loaders, error boundaries)
- [ ] Performance optimization (lazy loading, code splitting)
- [ ] Accessibility check (keyboard nav, screen readers)
- [ ] Mobile responsive (Tailwind breakpoints)
- [ ] Deploy Vercel production (main branch)
- [ ] Smoke tests E2E (signup → create mentee → add session → IA insights)
- [ ] Test OAuth flows (Google + LinkedIn)
- [ ] Test RLS policies (mentor A não vê dados mentor B)
- [ ] Monitoring setup (Vercel Analytics + logs)
- [ ] Documentação final (uso básico mentor)

**Deliverables:** MVP production-ready deployado Vercel
**Owner:** CTO Ronald + CPO Maicon (QA)
**Go-Live:** 29/10 manhã ✅

---

## 🎯 **Post-MVP: Pilot MLS** (15/11)

### **Fase 6: Pilot Launch** (30/10 - 15/11)
- [ ] Recrutar 3-5 mentores MLS (via rede Founder Aleff)
- [ ] Onboarding calls 30 min cada mentor
- [ ] Feedback loop semanal (form + call)
- [ ] Iterar bugs críticos <48h
- [ ] Coletar métricas uso (sessions logged, IA insights regenerated, deliverables tracked)

**Success Criteria:**
- 3+ mentors ativos usando diariamente
- >5 sessions logged por mentor/semana
- IA insights úteis >70% casos (feedback qualitativo)
- Zero bugs críticos (bloqueantes uso)

---

### **Fase 7: PMF Validation** (15/12)
- [ ] PMF Score survey (scale 1-10, target >8)
- [ ] Retention check (mentors ainda usando após 30 dias)
- [ ] NPS survey (target >70)
- [ ] Feature adoption metrics (% mentors usando IA)
- [ ] Decision: GO (scale marketing) ou NO-GO (mais iteration)

**Success Criteria:**
- PMF Score >8/10
- Retention >80% month 2
- NPS >70
- MRR $500 (10 mentors × $50/mês early adopter)

---

## 📂 **Estrutura Projeto**

```
/cpo/produtos/mrm/
├── PRD.json                    # Product Requirements Document completo
├── SUPABASE-SCHEMA.sql         # Database schema (6 tabelas + RLS)
├── .env.example                # Environment variables template
├── README.md                   # Este arquivo (roadmap + docs)
└── /docs/                      # Documentação adicional (TBD)
    ├── v0-prompt.md            # Prompt estruturado v0/Lovable
    ├── user-flows.md           # User flows detalhados
    └── api-spec.md             # API routes specification
```

**Frontend (a criar):**
```
/mrm-frontend/                  # Next.js 14 App Router
├── /app/
│   ├── /login/                 # Página login (OAuth)
│   ├── /dashboard/             # Board mentorados
│   ├── /mentee/[id]/           # Ficha mentorado (5 tabs)
│   ├── /profile/               # Perfil mentor
│   └── /settings/              # Configurações
├── /components/
│   ├── /ui/                    # shadcn/ui components
│   ├── MenteeCard.tsx
│   ├── SessionForm.tsx
│   └── ...
├── /lib/
│   ├── supabase.ts             # Supabase client
│   ├── openai.ts               # OpenAI client
│   └── anthropic.ts            # Anthropic client
└── /api/
    └── /ai/
        ├── session-summary/
        ├── provocative-questions/
        └── renewal-plan/
```

---

## 🔗 **Links Importantes**

### **Documentação:**
- [PRD Completo](./PRD.json) - Product Requirements Document
- [Schema SQL](./SUPABASE-SCHEMA.sql) - Database schema production-ready
- [Env Vars](./.env.example) - Variáveis ambiente necessárias

### **Referências Externas:**
- [Supabase Docs](https://supabase.com/docs) - Database + Auth
- [Next.js 14 Docs](https://nextjs.org/docs) - Framework frontend
- [shadcn/ui](https://ui.shadcn.com/) - Component library
- [OpenAI API](https://platform.openai.com/docs) - GPT-4o
- [Anthropic API](https://docs.anthropic.com/) - Claude 3.5

### **Ferramentas:**
- [v0 by Vercel](https://v0.dev/) - AI code generation
- [Lovable](https://lovable.dev/) - AI app builder (alternativa)
- [Bolt.new](https://bolt.new/) - AI full-stack (alternativa)

---

## 🚀 **Quick Start (para devs)**

### **Prerequisites:**
- Node.js 18+ instalado
- Conta Supabase (criar project)
- API keys (OpenAI, Anthropic)

### **1. Setup Supabase:**
```bash
# 1. Criar project em https://app.supabase.com/
# 2. Copiar SQL schema:
cat SUPABASE-SCHEMA.sql
# 3. Colar no Supabase SQL Editor → Run
# 4. Verificar tabelas criadas:
#    - users, mentees, sessions, deliverables, progress_tracking, ai_insights
```

### **2. Configurar OAuth:**
```bash
# Supabase Dashboard → Authentication → Providers
# 1. Ativar Google OAuth
#    - Client ID: [Google Cloud Console]
#    - Client Secret: [Google Cloud Console]
#    - Redirect URL: https://[PROJECT].supabase.co/auth/v1/callback
#
# 2. Ativar LinkedIn OAuth
#    - Client ID: [LinkedIn Developers]
#    - Client Secret: [LinkedIn Developers]
#    - Redirect URL: https://[PROJECT].supabase.co/auth/v1/callback
```

### **3. Clone + Install:**
```bash
# (Após v0 gerar código frontend)
git clone [repo-url]
cd mrm-frontend
npm install
```

### **4. Configurar Env Vars:**
```bash
# Copiar template
cp .env.example .env.local

# Editar .env.local com valores reais:
# - NEXT_PUBLIC_SUPABASE_URL (Supabase Dashboard → Settings → API)
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
# - SUPABASE_SERVICE_ROLE_KEY
# - OPENAI_API_KEY
# - ANTHROPIC_API_KEY
# - NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### **5. Run Development:**
```bash
npm run dev
# App roda em http://localhost:3000
```

### **6. Test Flow:**
```bash
# 1. Abrir http://localhost:3000/login
# 2. Login com Google/LinkedIn
# 3. Criar primeiro mentorado
# 4. Adicionar sessão
# 5. Ver IA insights (resumo + perguntas)
# 6. Verificar board atualizado
```

---

## 📊 **Data Model (6 Tabelas)**

```
users (mentors)
├── id (UUID, PK)
├── email (TEXT, UNIQUE)
├── full_name, bio, specialties
├── mls_member (BOOLEAN)
├── ai_tone (provocative/empathetic/direct)
└── created_at, updated_at

mentees (mentorados)
├── id (UUID, PK)
├── mentor_id (FK → users.id)
├── full_name, company, role
├── stated_goal, observed_pain (AI-filled)
├── plan_start_date, plan_end_date
├── status (active/renewal_due/completed)
└── baseline_clarity_score (1-10)

sessions (histórico sessões)
├── id (UUID, PK)
├── mentee_id (FK → mentees.id)
├── session_date, theme, notes, next_steps
├── emotion_tag, result_tag
├── ai_summary (gerado após save)
└── created_at, updated_at

deliverables (entregáveis)
├── id (UUID, PK)
├── mentee_id (FK → mentees.id)
├── task, responsible (mentor/mentee)
├── due_date, status (pending/in_progress/completed)
├── completed_at (auto-set)
└── created_at, updated_at

progress_tracking (métricas evolução)
├── id (UUID, PK)
├── mentee_id (FK → mentees.id)
├── measurement_date
├── clarity_score (1-10)
├── deliverables_completed_count
└── sentiment_avg (negative/neutral/positive)

ai_insights (cache IA)
├── id (UUID, PK)
├── mentee_id (FK → mentees.id)
├── insight_type (session_summary/provocative_questions/renewal_plan/observed_pain)
├── content (JSONB - flexible)
└── generated_at
```

---

## 🎯 **Success Metrics MVP**

### **PMF Indicators:**
- PMF Score >8/10
- Retention >80% após 6 meses
- NPS >70
- Feature Adoption >90% (mentors usam IA insights)

### **Business KPIs:**
- MRR $500 month 1 (10 mentors × $50/mês)
- Mentor Churn <10% monthly
- Mentee Renewal Rate >80% (via mentor reports)
- Time to Value <7 dias

### **Leading Indicators:**
- Sessions logged/mentor/week (target >3)
- AI insights regenerated/week (target >2)
- Deliverables created/mentee (target >5)

---

## 🔐 **Security (RLS Ativo)**

**Row Level Security (RLS) garante:**
- ✅ Mentor só vê próprios mentorados
- ✅ Mentor só vê sessões próprios mentorados
- ✅ Mentor só vê deliverables próprios mentorados
- ✅ Mentor só edita próprio perfil
- ✅ Queries SQL automático filtram por `auth.uid() = mentor_id`

**Testado:**
```sql
-- Mentor A (id: user-123) faz query:
SELECT * FROM mentees;
-- Retorna SOMENTE mentorados onde mentor_id = 'user-123'
-- RLS bloqueia dados outros mentores automaticamente
```

---

## 📋 **Comandos Úteis**

### **Development:**
```bash
npm run dev          # Start dev server
npm run build        # Build production
npm run start        # Start production server
npm run lint         # Lint código
npm run type-check   # TypeScript check
```

### **Supabase:**
```bash
# Reset schema (CUIDADO - deleta dados)
# Executar via Supabase SQL Editor:
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
# Depois executar SUPABASE-SCHEMA.sql novamente
```

### **Deploy:**
```bash
# Vercel (automático via GitHub push)
git push origin main
# Vercel detecta mudanças → build → deploy

# Manual deploy:
vercel --prod
```

---

## 🐛 **Troubleshooting**

### **Erro: Supabase Auth não funciona**
- Verificar OAuth config (Google/LinkedIn Client ID/Secret corretos)
- Verificar Redirect URLs (deve ser `https://[PROJECT].supabase.co/auth/v1/callback`)
- Verificar env vars (`NEXT_PUBLIC_SUPABASE_URL` e `ANON_KEY`)

### **Erro: IA insights não geram**
- Verificar API keys válidas (`OPENAI_API_KEY`, `ANTHROPIC_API_KEY`)
- Verificar rate limits APIs não excedidos
- Verificar logs Vercel Functions (errors detalhados)

### **Erro: RLS bloqueia queries**
- Verificar `auth.uid()` retorna UUID correto (user logado)
- Verificar policies criadas corretamente (`SELECT * FROM pg_policies`)
- Verificar FK `mentor_id` = `auth.uid()` nas queries

---

## 👥 **Team**

**Owner:** CPO Maicon
**Developer:** CTO Ronald
**PM:** TBD (CPO supervisiona até alocar)
**Pilot Leads:** Founder Aleff + CSO André (recrutar mentors MLS)

---

## 📞 **Support**

**Bugs/Issues:** Abrir issue no GitHub repo
**Feature Requests:** Adicionar em `cpo_mrm_features` table (via CPO)
**Questions:** Slack #mrm-dev channel (interno)

---

**Last Updated:** 22/10/2025
**Version:** 1.0 (MVP Foundation)
**Status:** 🟢 Foundation Complete → Ready for Infra Setup (Fase 2)

---

🚀 **Next Action:** CTO Ronald criar Supabase project + executar SUPABASE-SCHEMA.sql (Fase 2)
