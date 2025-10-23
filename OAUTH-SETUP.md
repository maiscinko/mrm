# 🔐 MRM - OAuth Setup Instructions

## ⚠️ PROBLEMA ATUAL
OAuth redirect ainda aponta para `localhost:3000` porque as URLs precisam ser configuradas no **Supabase Dashboard**.

## ✅ CÓDIGO ATUALIZADO (COMPLETO)
- ✅ `app/login/page.tsx` - Usa `window.location.origin` para garantir redirect correto
- ✅ `app/api/auth/callback/route.ts` - Melhorado com error handling e logs
- ✅ Container rebuild completo e deploy feito
- ✅ Aplicação respondendo em https://mrm.a25.com.br

## 🎯 PRÓXIMO PASSO: CONFIGURAR SUPABASE DASHBOARD

### 1. ACESSAR SUPABASE DASHBOARD
```
URL: https://app.supabase.com
Projeto: odalyniwiubddowazovp (MRM Production)
```

### 2. NAVEGAR PARA AUTHENTICATION → URL CONFIGURATION
```
Settings → Authentication → URL Configuration
```

### 3. CONFIGURAR AS SEGUINTES URLs:

#### **Site URL** (URL principal da aplicação)
```
https://mrm.a25.com.br
```

#### **Redirect URLs** (URLs permitidas para OAuth callback)
Adicionar TODAS essas URLs (uma por linha):
```
https://mrm.a25.com.br/api/auth/callback
https://mrm.a25.com.br/dashboard
http://localhost:3000/api/auth/callback
http://localhost:3000/dashboard
```

> **Nota:** Mantemos localhost para desenvolvimento local.

#### **Additional Redirect URLs (opcional, mas recomendado)**
```
https://mrm.a25.com.br/*
http://localhost:3000/*
```

### 4. CONFIGURAR PROVIDERS OAUTH

#### **Google OAuth**
1. Ir em **Authentication → Providers → Google**
2. Enable Google provider
3. Adicionar Client ID e Client Secret (se ainda não configurado)
4. **Authorized redirect URIs no Google Console:**
   ```
   https://odalyniwiubddowazovp.supabase.co/auth/v1/callback
   ```

#### **LinkedIn OAuth**
1. Ir em **Authentication → Providers → LinkedIn (OIDC)**
2. Enable LinkedIn provider
3. Adicionar Client ID e Client Secret (se ainda não configurado)
4. **Authorized redirect URIs no LinkedIn Developer:**
   ```
   https://odalyniwiubddowazovp.supabase.co/auth/v1/callback
   ```

### 5. SALVAR CONFIGURAÇÕES
Clicar em **Save** em todas as seções alteradas.

---

## 🧪 COMO TESTAR APÓS CONFIGURAR

### 1. Acessar https://mrm.a25.com.br/login

### 2. Clicar "Sign in with Google"

### 3. VERIFICAR NO BROWSER CONSOLE (F12 → Console):
```javascript
[OAuth Debug] Redirecting to: https://mrm.a25.com.br/api/auth/callback
[OAuth Debug] Window origin: https://mrm.a25.com.br
[OAuth Debug] ENV APP_URL: https://mrm.a25.com.br
```

### 4. APÓS AUTORIZAR NO GOOGLE:
- Deve redirecionar para: `https://mrm.a25.com.br/api/auth/callback?code=...`
- Callback processa código
- Redireciona para: `https://mrm.a25.com.br/dashboard`

### 5. SE DER ERRO, VERIFICAR LOGS:
```bash
docker logs mrm-saas --tail 100 | grep -i auth
```

Procurar por:
```
[Auth Callback] Processing OAuth callback
[Auth Callback] Code: present
[Auth Callback] Session established successfully
[Auth Callback] Redirecting to: https://mrm.a25.com.br/dashboard
```

---

## 🐛 TROUBLESHOOTING

### ERRO: "redirect_uri_mismatch"
**Causa:** URL não está na lista de Redirect URLs do Supabase
**Solução:** Adicionar URL exata em Supabase Dashboard → URL Configuration

### ERRO: "Invalid redirect URL"
**Causa:** Site URL não está configurada corretamente
**Solução:** Definir Site URL como `https://mrm.a25.com.br`

### ERRO: Ainda redireciona para localhost
**Causa:** Browser cache ou cookies antigos
**Solução:**
1. Abrir DevTools (F12)
2. Application → Clear site data
3. Tentar novamente

### ERRO: "error=auth_failed" na URL
**Causa:** Código OAuth não pode ser trocado por sessão
**Solução:** Verificar logs do container e Supabase Auth logs

---

## 📝 MUDANÇAS NO CÓDIGO

### `app/login/page.tsx` (linhas 15-67)
```typescript
// ANTES: Usava process.env (server-side only)
const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://mrm.a25.com.br'

// DEPOIS: Usa window.location.origin (client-side correto)
useEffect(() => {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://mrm.a25.com.br'
  setRedirectUrl(`${origin}/api/auth/callback`)
}, [])
```

### `app/api/auth/callback/route.ts` (linhas 6-48)
- ✅ Error handling robusto (try/catch)
- ✅ Logs detalhados para debug (`[Auth Callback]`)
- ✅ Redirect para login com erro se falhar
- ✅ Usa `requestUrl.origin` ao invés de env var (garante mesmo domínio)

---

## ✅ CHECKLIST FINAL

- [x] Código atualizado (login + callback)
- [x] Docker rebuild completo
- [x] Container deployed e rodando
- [x] Aplicação respondendo HTTPS 200
- [ ] **PENDENTE:** Configurar URLs no Supabase Dashboard
- [ ] **PENDENTE:** Testar OAuth Google flow completo
- [ ] **PENDENTE:** Testar OAuth LinkedIn flow completo
- [ ] **PENDENTE:** Documentar resolução em mrm_memory

---

## 🎯 STATUS
**Código:** ✅ Pronto para produção
**Infra:** ✅ Deployed e rodando
**Config:** ⏳ Aguardando configuração Supabase Dashboard
**Teste:** ⏳ Pendente após config Dashboard

**PRÓXIMA AÇÃO:** Configurar URLs no Supabase Dashboard conforme instruções acima.
