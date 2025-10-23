# Row Level Security (RLS) Documentation

## Overview
All Supabase tables in MRM have Row Level Security (RLS) enabled to ensure mentors can only access their own data.

## RLS Policies by Table

### 1. users
- **Policy**: Users can only read/update their own profile
- **Filter**: `auth.uid() = id`

### 2. mentees
- **Policy**: Mentors can only access their own mentees
- **Filter**: `auth.uid() = mentor_id`

### 3. sessions
- **Policy**: Mentors can only access sessions for their mentees
- **Filter**: Via JOIN to mentees table where `mentees.mentor_id = auth.uid()`

### 4. deliverables
- **Policy**: Mentors can only access deliverables for their mentees
- **Filter**: Via JOIN to mentees table where `mentees.mentor_id = auth.uid()`

### 5. progress_tracking
- **Policy**: Mentors can only access progress data for their mentees
- **Filter**: Via JOIN to mentees table where `mentees.mentor_id = auth.uid()`

### 6. ai_insights
- **Policy**: Mentors can only access AI insights for their mentees
- **Filter**: Via JOIN to mentees table where `mentees.mentor_id = auth.uid()`

### 7. ai_chat_history
- **Policy**: Mentors can only access chat history for their mentees
- **Filter**: `auth.uid() = mentor_id`

### 8. mentee_notes (CS/Support Internal Notes)
**CRITICAL**: This table has special RLS policies for CS/Support access

#### Policy 1: Mentor Access
\`\`\`sql
CREATE POLICY "Mentors can view their own mentee notes" ON mentee_notes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM mentees
      WHERE mentees.id = mentee_notes.mentee_id
      AND mentees.mentor_id = auth.uid()
    )
  );
\`\`\`

#### Policy 2: CS/Support Access
\`\`\`sql
CREATE POLICY "Support can view all notes" ON mentee_notes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.email LIKE '%@inteligenciaavancada.com'
    )
  );

CREATE POLICY "Support can insert notes" ON mentee_notes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.email LIKE '%@inteligenciaavancada.com'
    )
  );
\`\`\`

**Purpose**: CS/Support team can add internal notes about mentees (e.g., "Payment delay", "Contacted support about X") that automatically feed into AI context without mentor needing to see them unless they explicitly check the "Internal Notes" section.

### 9. ai_prompts (Editable AI Prompts)
- **Policy**: All authenticated users can read active prompts
- **Filter**: `is_active = true`
- **Admin Only**: Only admins can update/insert prompts (managed via Supabase dashboard)

**Purpose**: Zero-downtime AI prompt updates. Update `system_prompt` in database without redeploying code.

### 10. mrm_memory (PM Changelog)
- **Policy**: All authenticated users can read
- **Purpose**: Product changelog and feature updates visible to all mentors

## Security Best Practices

### 1. Never Bypass RLS
- ❌ NEVER use `service_role` key client-side
- ✅ ALWAYS use `anon` key with RLS policies

### 2. Explicit Filters (Defense in Depth)
Even though RLS auto-filters, we add explicit filters in queries for clarity:
\`\`\`typescript
// RLS already filters by mentor_id, but we add explicit filter for clarity
const { data } = await supabase
  .from('mentees')
  .select('*')
  .eq('mentor_id', user.id) // Explicit filter (redundant but clear)
\`\`\`

### 3. API Route Authentication
All API routes MUST check authentication:
\`\`\`typescript
const { data: { user } } = await supabase.auth.getUser()
if (!user) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
\`\`\`

### 4. CS/Support Notes Privacy
- Mentors can add their own notes (visible to them)
- CS/Support can add internal notes (visible to CS/Support + AI context)
- AI automatically reads ALL notes (mentor + CS/Support) for context
- Mentor must explicitly navigate to "Internal Notes" tab to see CS/Support notes

## Testing RLS Policies

### Test 1: Mentor Isolation
1. Create 2 mentor accounts
2. Each creates mentees
3. Verify Mentor A cannot see Mentor B's mentees

### Test 2: CS/Support Access
1. Login with @inteligenciaavancada.com email
2. Verify can see all mentee_notes across all mentors
3. Verify can add internal notes

### Test 3: AI Context
1. Add CS/Support note to mentee
2. Use Chat AI Sidebar
3. Verify AI has context from CS/Support note without mentor explicitly seeing it

## Compliance

### LGPD/GDPR
- **Right to Delete**: Mentors can delete mentees (hard delete via Settings page)
- **Right to Export**: Mentors can export all data as JSON (Settings page)
- **Data Isolation**: RLS ensures mentors only access their own data

### Audit Trail
- All tables have `created_at` timestamp
- `mentee_notes` has `created_by_role` field to track who added note (mentor vs support)
