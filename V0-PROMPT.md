# 🎯 V0.DEV PRODUCTION-READY PROMPT - MRM

**Product:** MRM - Mentoring Relationship Manager
**Tech Stack:** Next.js 14 + Supabase + shadcn/ui + TypeScript
**Version:** 2.2 (MVP + Chat IA POST + i18n + Prompts Editáveis)
**Owner:** PM Melisa

---

## 📋 HOW TO USE

1. Copy **PROMPT 1** below → Paste in v0.dev → Send
2. Wait for v0 to respond "Yes, ready" or similar
3. Copy **entire PRD.json** + **PROMPT 2** → Paste in v0.dev → Send
4. Wait for v0 to generate code (~2-5 min)
5. Iterate if needed (refinement prompts at bottom)
6. Download code → Git push → PM Melisa refines

---

## 🚀 PROMPT 1: INITIAL SETUP (Copy everything below)

```
You are an expert Next.js 14 + Supabase + TypeScript full-stack developer building a production-ready SaaS application.

I will provide a complete PRD (Product Requirements Document) in JSON format.
Generate production-ready code following exact specifications below.

TECH STACK (MANDATORY - DO NOT DEVIATE):
- Next.js 14.2+ (App Router ONLY, NOT Pages Router)
- TypeScript 5.0+ (strict mode, no 'any' types)
- Tailwind CSS 3.4+
- shadcn/ui components (https://ui.shadcn.com/)
- Supabase (@supabase/supabase-js ^2.39.0)
- @supabase/auth-helpers-nextjs (SSR support)
- React Hook Form + Zod validation
- Lucide React icons
- Recharts (charts)
- jsPDF (PDF export)

PROJECT STRUCTURE:
/app/                           # Next.js 14 App Router
├── layout.tsx                  # Root layout (providers, theme)
├── page.tsx                    # Landing/redirect
├── login/page.tsx              # OAuth (Google + LinkedIn)
├── dashboard/page.tsx          # Mentee board (cards grid)
├── mentee/[id]/page.tsx        # Mentee detail (5 tabs)
├── profile/page.tsx            # Mentor profile
├── settings/page.tsx           # Security + data
└── api/ai/
    ├── session-summary/route.ts
    ├── provocative-questions/route.ts
    └── renewal-plan/route.ts

/components/
├── ui/                         # shadcn/ui base
├── MenteeCard.tsx
├── SessionForm.tsx
├── DeliverablesList.tsx
├── ProgressCharts.tsx
├── TabNavigation.tsx
├── ChatAISidebar.tsx           # Atlas-style chat sidebar
└── LanguageToggle.tsx          # EN/PT-BR switcher

/lib/
├── supabase/
│   ├── client.ts              # Browser client
│   ├── server.ts              # Server client (cookies)
│   └── database.types.ts      # Generated types
├── validations/
│   ├── mentee.ts              # Zod schemas
│   ├── session.ts
│   └── deliverable.ts
├── i18n/
│   ├── request.ts             # next-intl config
│   └── locales/
│       ├── en.json            # English (default)
│       └── pt-br.json         # Portuguese Brazil (structure only)
└── utils.ts

SUPABASE DATABASE (9 tables already created with RLS enabled):
1. users (mentors) - id = auth.users(id)
2. mentees - mentor_id FK → users
3. sessions - mentee_id FK → mentees
4. deliverables - mentee_id FK → mentees
5. progress_tracking - mentee_id FK → mentees
6. ai_insights - mentee_id FK → mentees
7. ai_chat_history - mentee_id FK → mentees (Chat IA sidebar history)
8. mentee_notes - mentee_id FK → mentees (CS/Support internal notes)
9. ai_prompts - Editable AI prompts (zero-downtime updates)

ALL tables have RLS (Row Level Security) enabled.
Mentors can ONLY see their own data (auth.uid() = mentor_id filter automatic).
CS/Support role can add mentee_notes (feeds AI context).
ai_prompts = System prompts editáveis (update sem deploy).

AUTHENTICATION (Supabase Auth):
- OAuth: Google + LinkedIn
- Middleware: /middleware.ts (protect /dashboard, /mentee, /profile, /settings)
- Login flow: /login → OAuth → /dashboard
- Session: Supabase Auth handles (cookies via auth-helpers)
- SSR: Use createServerClient for server components

TYPESCRIPT & VALIDATION (CRITICAL):
1. Generate database types:
   - Create lib/supabase/database.types.ts
   - Export Database, Tables, Enums types
   - Type all Supabase queries with Database generic

2. Zod schemas (lib/validations/):
   - mentee.ts: createMenteeSchema, updateMenteeSchema
   - session.ts: createSessionSchema
   - deliverable.ts: createDeliverableSchema
   - Export types: z.infer<typeof schema>

3. API responses:
   - Create lib/types/api.ts
   - Type all API route responses
   - Error handling types

4. Component props:
   - Type ALL component props (no implicit any)
   - Use Database types for data props
   - Export prop types for reusability

DESIGN TOKENS & VARIABLES (CSS Variables - NOT utility classes):
Create /app/globals.css with CSS variables:

:root {
  /* Colors - Light Mode */
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --primary: 262 83% 58%;  /* #7B61FF */
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96.1%;
  --secondary-foreground: 222.2 47.4% 11.2%;
  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --accent: 210 40% 96.1%;
  --accent-foreground: 222.2 47.4% 11.2%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 40% 98%;
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 262 83% 58%;
  --radius: 0.5rem;
}

.dark {
  /* Colors - Dark Mode (DEFAULT) */
  --background: 222 47% 5%;  /* #0F0F13 */
  --foreground: 210 40% 98%;
  --card: 222 47% 8%;
  --card-foreground: 210 40% 98%;
  --primary: 262 83% 68%;  /* #7B61FF lighter */
  --primary-foreground: 222 47% 5%;
  --secondary: 217 33% 17%;
  --secondary-foreground: 210 40% 98%;
  --muted: 217 33% 17%;
  --muted-foreground: 215 20% 65%;
  --accent: 217 33% 17%;
  --accent-foreground: 210 40% 98%;
  --destructive: 0 62.8% 50.6%;
  --destructive-foreground: 210 40% 98%;
  --border: 217 33% 17%;
  --input: 217 33% 17%;
  --ring: 262 83% 68%;
}

Tailwind config uses these variables: bg-background, text-foreground, etc.

THEME SETUP (Dark default, toggle light):
1. Install: npm install next-themes
2. app/layout.tsx:
   - <html suppressHydrationWarning>
   - Wrap children with <ThemeProvider attribute="class" defaultTheme="dark">
3. Add theme toggle in /settings page

INTERNATIONALIZATION (i18n):
1. Install: npm install next-intl
2. Setup: lib/i18n/request.ts (middleware integration)
3. Locales: lib/i18n/locales/en.json (default, all translations)
4. Locales: lib/i18n/locales/pt-br.json (structure only, empty strings for now)
5. Usage: const t = useTranslations(); t('dashboard.title')
6. Language toggle: LanguageToggle component in /settings
7. Default: EN (English) - PT-BR added later by PM

CRITICAL RULES (NON-NEGOTIABLE):
1. RLS SECURITY:
   - ALL Supabase queries respect RLS (authenticated users only)
   - Add indexes: CREATE INDEX user_id_idx ON mentees(mentor_id)
   - Explicit filters even if redundant (Postgres query optimizer)
   - NEVER use service_role client-side (bypasses RLS)

2. AI API CALLS:
   - MUST be in /app/api/ routes (server-side ONLY)
   - NEVER call OpenAI/Anthropic from client components
   - Check auth.uid() in ALL API routes before processing

3. FORMS & VALIDATION:
   - React Hook Form + Zod schemas (lib/validations/)
   - Client validation + server validation (API routes)
   - Type-safe forms with zodResolver

4. LOADING & ERROR STATES:
   - Suspense boundaries with skeleton loaders
   - Error boundaries for all pages
   - Optimistic UI updates (mutations)

5. PERFORMANCE:
   - Server Components default ('use client' ONLY when needed)
   - Dynamic imports for heavy components (Recharts, jsPDF)
   - next/image for all images
   - optimizePackageImports in next.config.js for lucide-react
   - Target: <200KB initial bundle

6. CODE QUALITY:
   - Functional components (no classes)
   - Async/await (never .then())
   - Early returns (reduce nesting)
   - Descriptive names (no single letters except i, j)
   - TypeScript strict (no 'any' types)
   - File naming: kebab-case (mentee-card.tsx)
   - Component naming: PascalCase (MenteeCard)
   - Function naming: camelCase (getMentees)

UI/UX REQUIREMENTS:
- Dark theme DEFAULT (light available via toggle)
- Color palette: CSS variables (see above)
- Typography: Inter font (next/font/google)
- Border radius: 8px (cards), 4px (buttons) via --radius
- Shadows: Subtle (not heavy)
- Spacing: Tailwind scale (4px base)
- Animations: 300ms transitions
- Accessibility: WCAG AA (keyboard, aria-labels, screen readers)
- Responsive: Mobile-first (sm:, md:, lg: breakpoints)

GENERATION ORDER:
1. /app/layout.tsx (providers: Supabase, Theme)
2. /lib/supabase/client.ts + server.ts (createClient functions)
3. /lib/supabase/database.types.ts (placeholder - will generate from schema)
4. /middleware.ts (route protection)
5. /app/globals.css (CSS variables, theme)
6. /app/login/page.tsx (OAuth buttons)
7. /components/ui/ (shadcn/ui: button, card, input, etc)
8. /app/dashboard/page.tsx (Server Component)
9. /components/MenteeCard.tsx (Client Component)
10. /app/mentee/[id]/page.tsx (5 tabs)
11. /lib/validations/ (Zod schemas)
12. /app/profile/page.tsx
13. /app/settings/page.tsx
14. API routes /app/api/ai/* (placeholder AI logic)

COMPLETE CODE ONLY:
- Generate 100% complete code (no TODOs, no placeholders except AI logic)
- All imports must be valid
- All types must be defined
- Production-ready from start

Now I will paste the PRD JSON with full specifications.

Ready to receive the PRD?
```

---

## 🎯 PROMPT 2: PRD + MVP FOCUS (Copy everything below AFTER v0 accepts)

```
[PASTE ENTIRE PRD.JSON HERE]

Above is the complete PRD in JSON format.

FOCUS: MVP SCOPE ONLY
Implement ONLY features marked "must_have" in product_requirements.mvp_scope.
Ignore "should_have", "could_have", "won't_have_v1".

MVP PAGES (5 pages):
1. /login
   - OAuth buttons (Google + LinkedIn)
   - Supabase Auth flow
   - Redirect to /dashboard on success

2. /dashboard
   - Server Component (fetch mentees server-side)
   - Grid of MenteeCard components (responsive: 1 col mobile, 2 md, 3 lg)
   - Each card: photo/initial, name, progress bar, days remaining badge, status color
   - Status colors: green (active), orange (renewal <30 days), gray (completed)
   - "Add Mentee" button → modal form

3. /mentee/[id]
   - 5 TABS (TabNavigation component):
     a) Summary: Goal, observed pain (AI), progress %, days remaining
     b) Sessions: Timeline cards, SessionForm modal (date, theme, notes, next steps)
     c) Deliverables: Table (task, responsible, due date, status), progress bar
     d) Progress: Recharts (line: clarity score, bar: deliverables completed)
     e) Renewal: Alert badges (30/15/7 days), AI renewal plan display
   - Dynamic imports for Recharts (performance)

4. /profile
   - Form: name, bio, specialties, AI tone (select: provocative/empathetic/direct)
   - MLS badge if mls_member = true
   - React Hook Form + Zod validation

5. /settings
   - Security: change password, enable 2FA
   - Data management: delete mentee (confirm dialog), export data
   - Theme toggle: dark ↔ light
   - Language toggle: EN ↔ PT-BR (LanguageToggle component)

CRITICAL COMPONENTS:

MenteeCard (Client Component):
- Props: mentee (Database['public']['Tables']['mentees']['Row'])
- Display: photo_url or initials, full_name, company
- Progress bar: calculate % from deliverables (COUNT completed / COUNT total)
- Days remaining: plan_end_date - today
- Status badge: auto-calculate based on days remaining
- onClick: router.push(`/mentee/${id}`)

SessionForm (Client Component):
- Modal (shadcn/ui Dialog)
- React Hook Form + createSessionSchema (Zod)
- Fields: session_date (default today), theme, notes (textarea), next_steps (textarea)
- Tags: emotion_tag (select), result_tag (select)
- Submit: POST to Supabase sessions table
- After submit: trigger AI summary generation (call /api/ai/session-summary)

DeliverablesList (Client Component):
- Props: menteeId, deliverables array
- Table: task, responsible (mentor/mentee), due_date, status, actions
- Add deliverable: inline form or modal
- Update status: optimistic UI update
- Progress bar: % completed

ProgressCharts (Client Component):
- Dynamic import: const Recharts = dynamic(() => import('recharts'))
- Line chart: clarity_score over time (from progress_tracking)
- Bar chart: deliverables completed by month
- Responsive: full width mobile, half width desktop

TabNavigation (Client Component):
- shadcn/ui Tabs component
- 5 tabs: Summary, Sessions, Deliverables, Progress, Renewal
- Active state styling
- URL hash support: /mentee/[id]#sessions

ChatAISidebar (Client Component) - CRITICAL DIFERENCIAL:
- Atlas-style sidebar (slide-in from right, toggle button top-right)
- Fixed position, overlay on mobile, sidebar on desktop
- Chat interface: message list + input field + send button
- Props: menteeId (context for AI)
- POST request to /api/ai/chat (NOT streaming, simple await response)
- AI reads context automatically from DB (mentor doesn't copy/paste):
  * ALL sessions (last 3 detailed)
  * ALL deliverables status
  * ALL mentee_notes (CS/Support internal)
  * Mentee goal, company, days remaining
- Examples:
  * Mentor: "What did we discuss about leadership with João?"
  * AI: "In last 3 sessions, João mentioned difficulty delegating. You suggested framework XYZ in session 2."
  * Mentor: "Suggest 3 questions about this for next session"
  * AI: [Generates 3 contextual provocative questions]
- Loading state while waiting response (spinner + "AI is thinking...")
- Save conversation to ai_chat_history table (both user + assistant messages)
- shadcn/ui Sheet component (sidebar base)
- Toggle: Button with MessageSquare icon (lucide-react)
- History: Load last 10 messages on mount (pagination if needed later)

CS/Support Notes System:
- mentee_notes table (internal notes, not visible to mentee)
- CS/Support role can add notes via simple form in /mentee/[id] page
- Examples: "Mentee contacted support about issue X", "Payment delay - context Y"
- AI automatically reads these notes in context (mentor doesn't see notes unless clicks "Internal Notes" tab)
- RLS: mentor_id = auth.uid() OR role = 'support'
- Mentor can add own notes too (created_by_role = 'mentor')

API ROUTES (Server-side):

/api/ai/session-summary/route.ts:
- Input: POST { menteeId, sessionIds (last 3) }
- Auth check: verify auth.uid() owns mentee
- Fetch sessions from Supabase
- Call OpenAI GPT-4o: "Summarize these 3 mentoring sessions in 200 words..."
- Response: { summary: string, highlights: string[] }
- Cache result in ai_insights table

/api/ai/provocative-questions/route.ts:
- Input: POST { menteeId }
- Fetch: mentee goal, session history
- Call OpenAI GPT-4o: "Generate 3 provocative questions..."
- Response: { questions: string[] }

/api/ai/renewal-plan/route.ts:
- Input: POST { menteeId }
- Fetch: progress, gaps, deliverables
- Call Anthropic Claude 3.5 Sonnet: "Generate renewal proposal..."
- Response: { proposal: string (3 paragraphs) }

/api/ai/chat/route.ts (CRITICAL - Prompt Editável):
- Input: POST { menteeId, message }
- Auth check: verify auth.uid() owns mentee
- Fetch context parallel (Promise.all for performance):
  * Mentee data (goal, company, role, days_remaining)
  * Mentor data (full_name, ai_tone)
  * Recent sessions (last 3, order by date DESC)
  * Deliverables status (count completed vs total)
  * Internal notes (mentee_notes, all)
- Load editable prompt from ai_prompts table:
  * SELECT system_prompt FROM ai_prompts WHERE prompt_name = 'chat_assistant' AND is_active = true
- Replace variables in prompt template:
  * {{mentor_name}}, {{mentee_name}}, {{mentee_goal}}, {{recent_sessions}}, etc.
- Call OpenAI GPT-4o (await, NOT streaming):
  * Model: gpt-4o
  * Messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: message }]
  * Temperature: 0.7
- Save to ai_chat_history: INSERT user message + INSERT AI response
- Response: { response: string }
- BENEFIT: Update prompt in DB (ai_prompts table) = zero downtime, no deploy
- Example prompt variables: {{mentor_name}}, {{mentee_goal}}, {{recent_sessions}}, {{deliverables_status}}, {{internal_notes}}, {{mentor_ai_tone}}

TYPES & VALIDATION:

Generate lib/supabase/database.types.ts:
```typescript
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: { id: string; email: string; full_name: string | null; ... }
        Insert: { id: string; email: string; ... }
        Update: { id?: string; email?: string; ... }
      }
      mentees: { ... }
      sessions: { ... }
      deliverables: { ... }
      progress_tracking: { ... }
      ai_insights: { ... }
      ai_chat_history: {
        Row: { id: string; mentee_id: string; mentor_id: string; message: string; role: 'user' | 'assistant'; created_at: string; ... }
        Insert: { mentee_id: string; message: string; role: 'user' | 'assistant'; ... }
        Update: { message?: string; ... }
      }
      mentee_notes: {
        Row: { id: string; mentee_id: string; mentor_id: string; note_text: string; note_type: string; created_by_role: string; created_at: string; ... }
        Insert: { mentee_id: string; note_text: string; note_type: string; ... }
        Update: { note_text?: string; ... }
      }
      ai_prompts: {
        Row: { id: string; prompt_name: string; system_prompt: string; description: string | null; version: number; is_active: boolean; created_at: string; updated_at: string; ... }
        Insert: { prompt_name: string; system_prompt: string; ... }
        Update: { system_prompt?: string; version?: number; is_active?: boolean; ... }
      }
    }
  }
}
```

Generate lib/validations/mentee.ts:
```typescript
import { z } from 'zod'

export const createMenteeSchema = z.object({
  full_name: z.string().min(1, 'Name required'),
  company: z.string().optional(),
  stated_goal: z.string().min(10, 'Goal must be at least 10 chars'),
  plan_duration_months: z.number().min(1).max(24),
  plan_start_date: z.date(),
})

export type CreateMenteeInput = z.infer<typeof createMenteeSchema>
```

Similarly for session.ts, deliverable.ts.

SUPABASE CLIENT SETUP:

lib/supabase/client.ts (Browser):
```typescript
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './database.types'

export const createClient = () => createBrowserClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

lib/supabase/server.ts (Server Components):
```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from './database.types'

export const createClient = () => {
  const cookieStore = cookies()
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )
}
```

DELIVERABLE:
Complete Next.js 14 project ready to:
1. npm install
2. cp .env.example .env.local
3. Fill: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, OPENAI_API_KEY, ANTHROPIC_API_KEY
4. npm run dev
5. http://localhost:3000
6. Login → Create mentee → Add session → Open Chat AI sidebar → See intelligent context

CRITICAL DIFFERENTIATORS INCLUDED (v2.2):
- ✅ Chat IA Sidebar (Atlas-style) - POST request (NOT streaming), contextual AI with auto-context from DB
- ✅ Editable AI Prompts (ai_prompts table) - Zero-downtime updates, no deploy needed
- ✅ i18n Ready (next-intl) - EN default, PT-BR structure prepared
- ✅ CS/Support Notes (mentee_notes) - Internal notes feeding AI context automatically
- ✅ Dark mode default + Light theme toggle
- ✅ 9 tables with RLS security (mentor only sees own data)

Include:
- package.json (all dependencies with correct versions: next-intl, next-themes, etc)
- tsconfig.json (strict mode)
- next.config.js (optimizePackageImports)
- tailwind.config.ts (CSS variables)
- .env.example (all required env vars documented)
- .gitignore (node_modules, .env.local, .next)
- lib/i18n/locales/en.json (all translations)
- lib/i18n/locales/pt-br.json (structure only, empty strings)

Generate production-ready code now.
```

---

## 🔧 REFINEMENT PROMPTS (If v0 generates incorrect code)

### Fix: Wrong Router
```
ERROR: You used Pages Router (/pages/).
CORRECT: Use App Router (/app/). Regenerate using Next.js 14 App Router.
```

### Fix: RLS Not Respected
```
ERROR: Queries have redundant mentor_id filters.
CORRECT: RLS auto-filters by auth.uid() = mentor_id. Just ensure auth.

Example CORRECT:
const { data } = await supabase.from('mentees').select('*')
// RLS handles filtering automatically
```

### Fix: AI Calls Client-Side
```
ERROR: OpenAI/Anthropic called from client.
CORRECT: ALL AI calls MUST be in /app/api/ routes.

Flow: Client → /api/ai/session-summary → OpenAI → Response
NEVER: Client → OpenAI directly
```

### Fix: Missing Types
```
ERROR: Using 'any' types or no types.
CORRECT: Add TypeScript types for:
- All Supabase queries (use Database generic)
- All component props
- All API responses
- Generate database.types.ts from schema
```

### Fix: Not Responsive
```
ERROR: UI breaks on mobile.
CORRECT: Use Tailwind breakpoints:

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
```

### Fix: No CSS Variables
```
ERROR: Using Tailwind utility classes directly for colors.
CORRECT: Use CSS variables in globals.css:

--primary: 262 83% 68%;

Then: className="bg-primary text-primary-foreground"
```

---

**Version:** 2.2 (MVP + Chat IA POST + Prompts Editáveis + i18n)
**Last Updated:** 2025-10-23
**Status:** ✅ Production Ready - v0.dev (POST simples, zero-downtime prompts)
