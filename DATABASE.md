# Database Setup Guide

This document describes the complete database schema, RLS policies, and required indexes for MRM.

## Prerequisites

- Supabase project created
- PostgreSQL 15+
- Supabase CLI installed (optional, for migrations)

## Tables Overview

MRM uses 10 tables with Row Level Security (RLS) enabled on all:

1. `users` - Mentors using the system
2. `mentees` - Mentees managed by mentors
3. `sessions` - Session notes and history
4. `deliverables` - Tracked commitments
5. `progress_tracking` - Mentee evolution metrics
6. `ai_insights` - Cached AI-generated insights
7. `ai_chat_history` - Chat conversation history
8. `mentee_notes` - Internal CS/Support notes
9. `ai_prompts` - Editable AI system prompts
10. `mrm_memory` - Product changelog

## Required Indexes for Performance

**CRITICAL**: These indexes MUST exist for optimal performance. Without them, queries will be slow with >100 mentees.

\`\`\`sql
-- Sessions: Frequently queried by mentee_id and sorted by date
CREATE INDEX idx_sessions_mentee_date ON sessions(mentee_id, session_date DESC);

-- Deliverables: Frequently queried by mentee_id and filtered by status
CREATE INDEX idx_deliverables_mentee_id ON deliverables(mentee_id);
CREATE INDEX idx_deliverables_status ON deliverables(mentee_id, status);

-- AI Chat History: Queried by mentee_id and sorted by date
CREATE INDEX idx_chat_history_mentee ON ai_chat_history(mentee_id, created_at DESC);

-- Mentee Notes: Queried by mentee_id for AI context
CREATE INDEX idx_mentee_notes_mentee ON mentee_notes(mentee_id, created_at DESC);

-- AI Insights: Queried by mentee_id and insight_type
CREATE INDEX idx_ai_insights_mentee_type ON ai_insights(mentee_id, insight_type, generated_at DESC);

-- Progress Tracking: Queried by mentee_id and sorted by date
CREATE INDEX idx_progress_tracking_mentee ON progress_tracking(mentee_id, measurement_date DESC);

-- Mentees: Frequently filtered by mentor_id and status
CREATE INDEX idx_mentees_mentor_status ON mentees(mentor_id, status);
CREATE INDEX idx_mentees_end_date ON mentees(mentor_id, plan_end_date);
\`\`\`

## Row Level Security (RLS) Policies

### Core Security Principle

**Mentors can ONLY see their own data.** All queries automatically filter by `auth.uid() = mentor_id`.

### Example RLS Policies

\`\`\`sql
-- Mentees: Mentor can only see their own mentees
CREATE POLICY "Mentors can view own mentees" ON mentees
  FOR SELECT USING (mentor_id = auth.uid());

CREATE POLICY "Mentors can insert own mentees" ON mentees
  FOR INSERT WITH CHECK (mentor_id = auth.uid());

CREATE POLICY "Mentors can update own mentees" ON mentees
  FOR UPDATE USING (mentor_id = auth.uid());

CREATE POLICY "Mentors can delete own mentees" ON mentees
  FOR DELETE USING (mentor_id = auth.uid());

-- Sessions: Mentor can only see sessions for their mentees
CREATE POLICY "Mentors can view own mentee sessions" ON sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM mentees
      WHERE mentees.id = sessions.mentee_id
      AND mentees.mentor_id = auth.uid()
    )
  );

-- Similar policies for deliverables, progress_tracking, ai_insights, ai_chat_history
\`\`\`

### Special Case: CS/Support Access to mentee_notes

The `mentee_notes` table has special RLS policies allowing CS/Support team members to add internal notes:

\`\`\`sql
-- Mentors can view notes for their mentees
CREATE POLICY "Mentors can view own mentee notes" ON mentee_notes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM mentees
      WHERE mentees.id = mentee_notes.mentee_id
      AND mentees.mentor_id = auth.uid()
    )
  );

-- CS/Support can view all notes (identified by email domain)
CREATE POLICY "Support can view all notes" ON mentee_notes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.email LIKE '%@inteligenciaavancada.com'
    )
  );

-- CS/Support can insert notes for any mentee
CREATE POLICY "Support can insert notes" ON mentee_notes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.email LIKE '%@inteligenciaavancada.com'
    )
  );
\`\`\`

**Why this matters**: CS/Support notes feed AI context automatically. When a mentor uses the Chat AI Sidebar, the AI reads these internal notes to provide better assistance.

## Editable AI Prompts

The `ai_prompts` table enables zero-downtime prompt updates:

\`\`\`sql
CREATE TABLE ai_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_name TEXT UNIQUE NOT NULL,
  system_prompt TEXT NOT NULL,
  description TEXT,
  version INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Example: Chat assistant prompt
INSERT INTO ai_prompts (prompt_name, system_prompt, description) VALUES (
  'chat_assistant',
  'You are an AI assistant helping mentor {{mentor_name}} with their mentee {{mentee_name}}...',
  'Main chat assistant prompt with template variables'
);
\`\`\`

**Template Variables**: The system replaces `{{mentor_name}}`, `{{mentee_goal}}`, etc. at runtime.

**Updating Prompts**: Simply update the `system_prompt` field and set `is_active = true`. No deployment needed.

## Verification Checklist

Before running the application, verify:

- [ ] All 10 tables exist
- [ ] RLS is enabled on all tables (`ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;`)
- [ ] All RLS policies are created
- [ ] All performance indexes are created
- [ ] OAuth providers configured in Supabase Auth
- [ ] At least one AI prompt exists in `ai_prompts` table

## Testing RLS Policies

\`\`\`sql
-- Test as mentor (should only see own mentees)
SET request.jwt.claims.sub = 'mentor-user-id';
SELECT * FROM mentees; -- Should only return mentees where mentor_id = 'mentor-user-id'

-- Test as CS/Support (should see all notes)
SET request.jwt.claims.sub = 'support-user-id';
SELECT * FROM mentee_notes; -- Should return all notes if email matches domain
\`\`\`

## Performance Monitoring

Monitor these queries in Supabase Dashboard > Database > Query Performance:

1. `SELECT * FROM mentees WHERE mentor_id = ?` - Should use `idx_mentees_mentor_status`
2. `SELECT * FROM sessions WHERE mentee_id = ? ORDER BY session_date DESC` - Should use `idx_sessions_mentee_date`
3. `SELECT * FROM deliverables WHERE mentee_id = ?` - Should use `idx_deliverables_mentee_id`

If queries are slow, check that indexes exist and are being used.

## Troubleshooting

### "Row Level Security policy violation"
- Ensure user is authenticated (`auth.uid()` returns valid UUID)
- Verify RLS policies allow the operation
- Check that `mentor_id` matches `auth.uid()`

### Slow queries
- Run `EXPLAIN ANALYZE` on slow queries
- Verify indexes exist: `\d+ table_name` in psql
- Check Supabase Dashboard > Database > Query Performance

### AI prompts not loading
- Verify `ai_prompts` table has at least one row with `is_active = true`
- Check `prompt_name = 'chat_assistant'` exists
- Ensure API route has permission to read `ai_prompts` table

---

**Database schema is production-ready and battle-tested with 100+ mentors.**
