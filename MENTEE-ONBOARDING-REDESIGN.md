# 🎯 MENTEE ONBOARDING SYSTEM - REDESIGN v0.5

## 📋 **OVERVIEW**

**Current Problem:** Mentee table is too simple (just name, company, goal). Real mentors need comprehensive data for personalization, surprise dynamics, business intelligence.

**Solution:** Complete mentee onboarding system with:
1. **Mentor Panel:** Add mentee + contract details (duration, value, payment tracking)
2. **Unique Link:** Generate secure public onboarding URL
3. **Public Wizard:** Multi-step form mentee fills (personal, family, business, preferences)
4. **Auto-Integration:** Completed onboarding appears in mentor dashboard

---

## 🗄️ **DATABASE SCHEMA REDESIGN**

### **STRATEGY: Normalized Tables (Best Practice)**

Instead of 1 giant mentees table with 50+ columns, we split into **logical domains**:

#### **1. `mentees` (CORE - Master Table)**
**Purpose:** Core identity + contract + onboarding status

```sql
CREATE TABLE mentees (
  -- Identity
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Basic Info
  full_name TEXT NOT NULL,
  preferred_name TEXT,
  email TEXT NOT NULL UNIQUE,
  whatsapp TEXT NOT NULL,
  birth_date DATE,
  cpf TEXT,
  rg TEXT,

  -- Address
  cep TEXT,
  address_street TEXT,
  address_number TEXT,
  address_complement TEXT,
  address_neighborhood TEXT,
  address_city TEXT,
  address_state TEXT,
  address_country TEXT DEFAULT 'Brasil',

  -- Photos
  photo_url TEXT,
  family_photo_url TEXT,

  -- Contract & Billing
  program_id UUID REFERENCES mentoring_programs(id),
  contract_start_date DATE NOT NULL,
  contract_end_date DATE NOT NULL,
  contract_duration_months INTEGER NOT NULL,
  contract_value_total NUMERIC(10,2) NOT NULL,
  payment_model TEXT CHECK (payment_model IN ('monthly', 'quarterly', 'upfront', 'custom')),
  payment_amount_monthly NUMERIC(10,2),
  payment_amount_entry NUMERIC(10,2),
  payment_entry_received BOOLEAN DEFAULT false,
  payment_entry_date DATE,

  -- Onboarding Control
  onboarding_token TEXT UNIQUE, -- Secure unique token for public link
  onboarding_completed BOOLEAN DEFAULT false,
  onboarding_completed_at TIMESTAMPTZ,
  onboarding_link_expires_at TIMESTAMPTZ, -- Optional: link expiration

  -- Metadata
  status TEXT CHECK (status IN ('pending_onboarding', 'active', 'renewal_due', 'completed', 'cancelled')) DEFAULT 'pending_onboarding',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- Indexes for performance
  CONSTRAINT mentees_email_key UNIQUE (email),
  CONSTRAINT mentees_onboarding_token_key UNIQUE (onboarding_token)
);

CREATE INDEX idx_mentees_mentor_id ON mentees(mentor_id);
CREATE INDEX idx_mentees_onboarding_token ON mentees(onboarding_token);
CREATE INDEX idx_mentees_status ON mentees(status);
```

**Key Design Decisions:**
- ✅ `onboarding_token`: UUID-based secure token for public link (e.g., `https://mrm.app/onboarding/a1b2c3d4...`)
- ✅ `status = 'pending_onboarding'`: Mentee created by mentor but hasn't filled form yet
- ✅ `status = 'active'`: Mentee completed onboarding, ready for mentoring sessions
- ✅ Payment tracking: entry payment + monthly installments (managed separately in `payments` table)

---

#### **2. `mentee_personal_info` (1:1 with mentees)**
**Purpose:** Biography, inspirational phrase, preferences (non-business)

```sql
CREATE TABLE mentee_personal_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentee_id UUID NOT NULL UNIQUE REFERENCES mentees(id) ON DELETE CASCADE,

  -- Personal
  biography TEXT,
  instagram_personal TEXT,
  inspirational_phrase TEXT,
  curiosity TEXT, -- Something not everyone knows

  -- Sizes (for gifts, surprises)
  shoe_size TEXT,
  pants_size TEXT,
  shirt_size TEXT CHECK (shirt_size IN ('PP', 'P', 'M', 'G', 'GG', 'XG', 'XXG')),

  -- Preferences
  hobbies JSONB DEFAULT '[]'::jsonb, -- ["Leitura", "Fotografia", "Outro: Yoga"]
  music_genres JSONB DEFAULT '[]'::jsonb,
  sports JSONB DEFAULT '[]'::jsonb,
  literary_genres JSONB DEFAULT '[]'::jsonb,
  clothing_brands TEXT,
  shoe_brands TEXT,
  favorite_color TEXT,
  childhood_favorite_food TEXT,
  dietary_restrictions TEXT,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_mentee_personal_mentee_id ON mentee_personal_info(mentee_id);
```

**Why Separate Table?**
- ✅ Keeps `mentees` table focused on contract/identity
- ✅ Easier to query business vs personal data
- ✅ 1:1 relationship clear (one personal info per mentee)

---

#### **3. `mentee_family` (1:1 with mentees)**
**Purpose:** Spouse, children, emergency contact

```sql
CREATE TABLE mentee_family (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentee_id UUID NOT NULL UNIQUE REFERENCES mentees(id) ON DELETE CASCADE,

  -- Spouse
  is_married BOOLEAN DEFAULT false,
  spouse_name TEXT,
  spouse_birth_date DATE,

  -- Children (JSONB array for flexibility)
  has_children BOOLEAN DEFAULT false,
  children JSONB DEFAULT '[]'::jsonb, -- [{"name": "Ana", "birth_date": "2015-03-10"}, ...]

  -- Emergency/Surprise Contact
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  emergency_contact_relationship TEXT, -- "Irmã", "Melhor amigo", etc.
  emergency_contact_note TEXT, -- "Contato para ajudar com surpresas (fotos infância, gostos pessoais)"

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_mentee_family_mentee_id ON mentee_family(mentee_id);
```

**Design Choice:**
- ✅ `children` as JSONB: Flexible for N children without creating separate table
- ✅ Emergency contact = surprise helper (genius for mentor personalization!)

---

#### **4. `mentee_companies` (1:N with mentees)**
**Purpose:** Business info (mentee can have multiple companies)

```sql
CREATE TABLE mentee_companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentee_id UUID NOT NULL REFERENCES mentees(id) ON DELETE CASCADE,

  -- Company Identity
  company_legal_name TEXT NOT NULL, -- Razão social
  company_trade_name TEXT, -- Nome fantasia
  company_segment TEXT NOT NULL,
  company_instagram TEXT,
  company_website TEXT,
  company_logo_url TEXT,

  -- Mentee Role
  mentee_role TEXT NOT NULL, -- CEO, CFO, Fundador, Sócio, etc.

  -- Company Metrics
  employees_count INTEGER,
  annual_revenue_2024 NUMERIC(12,2), -- Ex: 2000000.00 (2 milhões)
  company_city TEXT,
  company_state TEXT,

  -- Order (for display: first company, second company, etc.)
  display_order INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_mentee_companies_mentee_id ON mentee_companies(mentee_id);
```

**Why Separate Table?**
- ✅ Mentees can have **multiple companies** (common in Brazil entrepreneurs)
- ✅ Each company has own metrics (revenue, employees, segment)
- ✅ Easier to query: "Show all mentees in Tech segment"

---

#### **5. `mentee_business_goals` (1:1 with mentees)**
**Purpose:** Business challenges, what mentor should help solve

```sql
CREATE TABLE mentee_business_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentee_id UUID NOT NULL UNIQUE REFERENCES mentees(id) ON DELETE CASCADE,

  -- Core Business Pain
  main_challenge TEXT NOT NULL, -- "Qual é o seu maior desafio/dor no seu negócio no momento?"
  seeking_solution TEXT NOT NULL, -- "O que você está buscando solucionar com o {club name}?"

  -- Expertise & Networking
  wants_to_be_expert BOOLEAN DEFAULT false,
  expert_area TEXT, -- "Se tornar referência em: Vendas B2B"
  networking_segments JSONB DEFAULT '[]'::jsonb, -- ["Tecnologia", "E-commerce", "Outros: SaaS"]

  -- Skills
  business_superpower TEXT, -- "Qual é a sua maior habilidade em negócios?" (para indicações)

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_mentee_business_goals_mentee_id ON mentee_business_goals(mentee_id);
```

**Strategic Value:**
- ✅ `main_challenge`: Mentor focuses sessions on this pain
- ✅ `business_superpower`: Mentor can refer mentee to others (networking)
- ✅ `networking_segments`: Match mentees with similar interests

---

#### **6. `mentee_payments` (1:N with mentees)**
**Purpose:** Track payment installments (entry + monthly parcels)

```sql
CREATE TABLE mentee_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentee_id UUID NOT NULL REFERENCES mentees(id) ON DELETE CASCADE,

  -- Payment Details
  payment_type TEXT CHECK (payment_type IN ('entry', 'monthly', 'quarterly', 'extra')) NOT NULL,
  payment_amount NUMERIC(10,2) NOT NULL,
  payment_due_date DATE NOT NULL,
  payment_paid BOOLEAN DEFAULT false,
  payment_paid_date DATE,
  payment_method TEXT, -- "Pix", "Cartão", "Boleto"
  payment_receipt_url TEXT, -- Link para comprovante

  -- Notes
  payment_note TEXT,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_mentee_payments_mentee_id ON mentee_payments(mentee_id);
CREATE INDEX idx_mentee_payments_due_date ON mentee_payments(payment_due_date);
CREATE INDEX idx_mentee_payments_paid ON mentee_payments(payment_paid);
```

**Financial Control:**
- ✅ Mentor tracks: entry paid? Monthly installments up to date?
- ✅ Dashboard alerts: "João Silva: payment overdue 15 days"
- ✅ Future: integrate with Stripe/Iugu for automated billing

---

#### **7. `mentee_privacy_consent` (1:1 with mentees)**
**Purpose:** LGPD compliance - explicit consent for communications

```sql
CREATE TABLE mentee_privacy_consent (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentee_id UUID NOT NULL UNIQUE REFERENCES mentees(id) ON DELETE CASCADE,

  -- Consent
  consent_marketing BOOLEAN DEFAULT false, -- "Concordo em receber comunicações sobre produtos/serviços"
  consent_date TIMESTAMPTZ,
  consent_ip_address INET, -- IP when consented (LGPD requirement)

  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_mentee_privacy_mentee_id ON mentee_privacy_consent(mentee_id);
```

**LGPD Compliance:**
- ✅ Explicit opt-in for marketing communications
- ✅ Audit trail (date + IP when consented)
- ✅ Mentor can export all mentee data (LGPD right)

---

## 🔗 **RELATIONSHIPS DIAGRAM**

```
mentees (1) ----< (N) mentee_companies
   |
   +---- (1:1) mentee_personal_info
   |
   +---- (1:1) mentee_family
   |
   +---- (1:1) mentee_business_goals
   |
   +---- (1:1) mentee_privacy_consent
   |
   +---- (1:N) mentee_payments
   |
   +---- (1:N) sessions (existing)
   |
   +---- (1:N) deliverables (existing)
   |
   +---- (1:N) progress_tracking (existing)
```

**Key Points:**
- ✅ All tables reference `mentees.id` as FK
- ✅ Cascade DELETE: If mentee deleted, all related data deleted
- ✅ Normalized: No duplicate data, easy to maintain

---

## 🔄 **FLOW: MENTOR ADDS MENTEE → MENTEE ONBOARDS**

### **STEP 1: Mentor Creates Mentee (Dashboard)**

**UI: `/dashboard` → Button "Add Mentee" → Modal**

**Form Fields:**
```
1. Full Name * (required)
2. Email * (required, must be unique)
3. WhatsApp * (required, format: +5511999999999)
4. Program (dropdown: select from mentoring_programs)
5. Contract Duration (months) * (default: 6)
6. Contract Start Date * (default: today)
7. Contract Total Value * (BRL)
8. Payment Model * (radio: monthly, quarterly, upfront, custom)
9. Monthly Payment Amount (if monthly selected)
10. Entry Payment Amount (optional)
11. Entry Payment Received? (checkbox)
12. Entry Payment Date (if received)
```

**Backend Logic:**
```typescript
// When mentor submits form:
1. Create mentee in `mentees` table:
   - status = 'pending_onboarding'
   - onboarding_token = crypto.randomUUID() // Secure random token
   - onboarding_link_expires_at = now() + 30 days (optional)
   - contract_end_date = contract_start_date + contract_duration_months

2. If payment_amount_entry > 0:
   - Insert into `mentee_payments`:
     - payment_type = 'entry'
     - payment_paid = entry_payment_received

3. If payment_model = 'monthly':
   - Generate N monthly payments in `mentee_payments`:
     - FOR i = 1 TO contract_duration_months:
       - payment_type = 'monthly'
       - payment_due_date = contract_start_date + i months
       - payment_amount = payment_amount_monthly
       - payment_paid = false

4. Return onboarding link:
   - https://mrm.a25.com.br/onboarding/{onboarding_token}
```

**Mentor sees:**
```
✅ Mentee "João Silva" created successfully!

Onboarding Link (send to mentee):
https://mrm.a25.com.br/onboarding/a1b2c3d4-5678-90ab-cdef-1234567890ab

📋 Copy Link   📧 Send Email   📱 Send WhatsApp
```

---

### **STEP 2: Mentee Receives Link & Fills Onboarding**

**Public Page: `/onboarding/[token]`**

**Multi-Step Wizard (6 Steps):**

#### **Step 1: Personal Info**
- Preferred Name
- Birth Date
- CPF, RG
- CEP (auto-fill address via ViaCEP API)
- Address Number/Complement
- Upload Photo

#### **Step 2: About You**
- Biography (textarea, 500 chars)
- Instagram Personal (@username)
- Inspirational Phrase
- Curiosity (something not everyone knows)

#### **Step 3: Preferences**
- Shoe Size, Pants Size, Shirt Size
- Hobbies (checkboxes + "Other")
- Music Genres (checkboxes + "Other")
- Sports (checkboxes + "Other")
- Literary Genres (checkboxes + "Other")
- Clothing Brands (text)
- Shoe Brands (text)
- Favorite Color
- Childhood Favorite Food
- Dietary Restrictions

#### **Step 4: Family**
- Married? (yes/no)
  - If yes: Spouse Name, Spouse Birth Date
- Have Children? (yes/no)
  - If yes: Add children (name + birth date, dynamic list)
- Emergency Contact (for surprises):
  - Name, Phone, Relationship
- Upload Family Photo

#### **Step 5: Business**
- Main Challenge (textarea)
- What are you seeking to solve with {club name}?
- Number of Companies (1-5)
- For each company:
  - Legal Name (Razão Social)
  - Segment (dropdown)
  - Role (dropdown: CEO, CFO, Founder, etc.)
  - Instagram, Website
  - Employees Count
  - Annual Revenue 2024
  - City/State
  - Upload Logo
- Want to become expert? (yes/no)
  - If yes: Expert Area (text)
- Networking Segments (checkboxes)
- Business Superpower (text)

#### **Step 6: Privacy & Confirmation**
- Review all info
- Checkbox: "I agree to be contacted about products/services"
- Button: **Complete Onboarding**

**Backend Logic (Submit):**
```typescript
1. Validate token (not expired, not already used)
2. Update mentees:
   - onboarding_completed = true
   - onboarding_completed_at = now()
   - status = 'active'
3. Insert into mentee_personal_info (step 2+3)
4. Insert into mentee_family (step 4)
5. Insert into mentee_companies (step 5, loop for N companies)
6. Insert into mentee_business_goals (step 5)
7. Insert into mentee_privacy_consent (step 6)
8. Send email to mentor: "João Silva completed onboarding!"
9. Redirect mentee to success page: "Obrigado! Seu mentor já pode ver seus dados."
```

---

### **STEP 3: Mentor Sees Mentee in Dashboard**

**After onboarding completed:**

**Dashboard Card Updates:**
```
[Photo]  João Silva
         Tech Startup XYZ | CEO

         Active • 180 days remaining

         ✅ Onboarding completed 2h ago

         [View Profile] button
```

**Mentee Detail Page Shows:**
- **Summary Tab:** Full bio, preferences, main challenge
- **Sessions Tab:** Ready to log first session
- **Business Tab:** All companies, revenue, employees
- **Family Tab:** Spouse, children (for personalization)
- **Payments Tab:** Track entry + monthly payments

---

## 📊 **DASHBOARD ENHANCEMENTS**

### **New Filters:**
- Onboarding Status: `pending_onboarding` | `active` | `all`
- Payment Status: `up_to_date` | `overdue` | `all`

### **New Badges:**
- 🟡 "Pending Onboarding" (status = pending_onboarding)
- 🔴 "Payment Overdue" (has unpaid payment past due date)
- 🟢 "Active" (onboarding complete, payments up to date)

---

## 🗑️ **MIGRATION STRATEGY**

### **Option A: Clean Slate (RECOMMENDED)**
```sql
-- Drop existing simple mentees table
DROP TABLE IF EXISTS mentees CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS deliverables CASCADE;
DROP TABLE IF EXISTS progress_tracking CASCADE;
DROP TABLE IF EXISTS ai_insights CASCADE;

-- Create new schema (7 tables above)
-- Existing test data (João Silva) will be lost, but that's OK (test data)
```

**Why Recommended?**
- ✅ Clean, no legacy baggage
- ✅ We're in development (no production data yet)
- ✅ Faster than complex migration

### **Option B: Migrate Existing Data**
```sql
-- Only if we have real mentees we can't lose
-- Complex: map old simple columns → new normalized tables
```

---

## ✅ **NEXT STEPS (IMPLEMENTATION ORDER)**

### **Phase 1: Database (Today)**
1. ✅ Create SQL migration file with 7 new tables
2. ✅ Apply migration to Supabase
3. ✅ Update RLS policies (mentor sees only own mentees)
4. ✅ Test queries (insert mentee, fetch with joins)

### **Phase 2: Mentor Panel (Tomorrow)**
1. ✅ Build "Add Mentee" modal with contract fields
2. ✅ Generate onboarding token + link
3. ✅ Show link to mentor (copy, email, WhatsApp)
4. ✅ Create payments automatically based on model

### **Phase 3: Public Onboarding (Day 3-4)**
1. ✅ Build 6-step wizard UI (`/onboarding/[token]`)
2. ✅ Integrate ViaCEP API (auto-fill address)
3. ✅ File uploads (photo, family photo, logos)
4. ✅ Submit → populate 7 tables
5. ✅ Email notification to mentor

### **Phase 4: Integration (Day 5)**
1. ✅ Update dashboard to show onboarding status
2. ✅ New mentee detail tabs (Business, Family, Payments)
3. ✅ Payment tracking dashboard
4. ✅ Test complete flow end-to-end

---

## 🎯 **SUCCESS CRITERIA**

**v0.5 is complete when:**
- ✅ Mentor can add mentee with contract details
- ✅ Unique onboarding link generated
- ✅ Mentee fills comprehensive form (6 steps)
- ✅ All data saved across 7 normalized tables
- ✅ Mentor sees complete mentee profile in dashboard
- ✅ Payment tracking visible
- ✅ RLS policies working (mentor sees only own mentees)
- ✅ LGPD compliant (privacy consent recorded)

---

**Ready to start Phase 1 (Database Migration)?** 🚀
