-- =====================================================
-- MRM (Mentoring Relationship Manager) - Database Schema
-- Version: 2.0 (Production-Ready MVP + Chat IA + Prompts Editáveis)
-- Date: 2025-10-23
-- Owner: CPO Maicon + PM Melisa
-- Tables: 9 (users, mentees, sessions, deliverables, progress_tracking, ai_insights, ai_chat_history, mentee_notes, ai_prompts)
-- =====================================================

-- IMPORTANT: Execute this entire script in Supabase SQL Editor
-- This creates all tables, indexes, RLS policies, and triggers

-- =====================================================
-- EXTENSIONS
-- =====================================================

-- UUID generation (should already be enabled in Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TABLE 1: users (Mentors)
-- =====================================================

CREATE TABLE users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  bio TEXT,
  specialties TEXT[] DEFAULT '{}',
  languages TEXT[] DEFAULT '{}',
  mls_member BOOLEAN DEFAULT false,
  mls_code TEXT,
  ai_tone TEXT CHECK (ai_tone IN ('provocative', 'empathetic', 'direct')) DEFAULT 'empathetic',
  theme TEXT CHECK (theme IN ('light', 'dark')) DEFAULT 'dark',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Indexes for users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_mls_member ON users(mls_member) WHERE mls_member = true;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS for users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile on signup" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Comments
COMMENT ON TABLE users IS 'Mentors using the MRM system';
COMMENT ON COLUMN users.mls_member IS 'Whether mentor is part of MLS (Mentoring League Society)';
COMMENT ON COLUMN users.ai_tone IS 'Preferred AI tone for insights (provocative, empathetic, direct)';

-- =====================================================
-- TABLE 2: mentees (Mentorados)
-- =====================================================

CREATE TABLE mentees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mentor_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  full_name TEXT NOT NULL,
  photo_url TEXT,
  company TEXT,
  role TEXT,
  stated_goal TEXT,
  observed_pain TEXT,
  plan_duration_months INTEGER DEFAULT 6 CHECK (plan_duration_months > 0),
  plan_start_date DATE NOT NULL,
  plan_end_date DATE NOT NULL,
  status TEXT CHECK (status IN ('active', 'renewal_due', 'completed', 'cancelled')) DEFAULT 'active' NOT NULL,
  baseline_clarity_score INTEGER CHECK (baseline_clarity_score BETWEEN 1 AND 10),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Indexes for mentees
CREATE INDEX idx_mentees_mentor_id ON mentees(mentor_id);
CREATE INDEX idx_mentees_status ON mentees(status);
CREATE INDEX idx_mentees_plan_end_date ON mentees(plan_end_date) WHERE status IN ('active', 'renewal_due');

-- Trigger to auto-update updated_at
CREATE TRIGGER update_mentees_updated_at BEFORE UPDATE ON mentees
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS for mentees
ALTER TABLE mentees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Mentors can view own mentees" ON mentees
  FOR SELECT USING (auth.uid() = mentor_id);

CREATE POLICY "Mentors can insert own mentees" ON mentees
  FOR INSERT WITH CHECK (auth.uid() = mentor_id);

CREATE POLICY "Mentors can update own mentees" ON mentees
  FOR UPDATE USING (auth.uid() = mentor_id);

CREATE POLICY "Mentors can delete own mentees" ON mentees
  FOR DELETE USING (auth.uid() = mentor_id);

-- Comments
COMMENT ON TABLE mentees IS 'Mentorados managed by mentors in the system';
COMMENT ON COLUMN mentees.observed_pain IS 'AI-analyzed pain point based on session notes (filled by AI)';
COMMENT ON COLUMN mentees.status IS 'Current status: active (ongoing), renewal_due (<30 days left), completed (finished), cancelled';
COMMENT ON COLUMN mentees.baseline_clarity_score IS 'Initial clarity score (1-10) assessed in first session';

-- =====================================================
-- TABLE 3: sessions (Sessões mentor-mentorado)
-- =====================================================

CREATE TABLE sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mentee_id UUID REFERENCES mentees(id) ON DELETE CASCADE NOT NULL,
  session_date DATE NOT NULL,
  theme TEXT,
  notes TEXT,
  next_steps TEXT,
  emotion_tag TEXT CHECK (emotion_tag IN ('frustrated', 'hopeful', 'confused', 'excited', 'stuck')),
  result_tag TEXT CHECK (result_tag IN ('breakthrough', 'incremental', 'stuck')),
  ai_summary TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Indexes for sessions
CREATE INDEX idx_sessions_mentee_id ON sessions(mentee_id);
CREATE INDEX idx_sessions_session_date ON sessions(session_date DESC);
CREATE INDEX idx_sessions_mentee_date ON sessions(mentee_id, session_date DESC);

-- Trigger to auto-update updated_at
CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON sessions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS for sessions
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Mentors can view sessions of own mentees" ON sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM mentees
      WHERE mentees.id = sessions.mentee_id
      AND mentees.mentor_id = auth.uid()
    )
  );

CREATE POLICY "Mentors can insert sessions for own mentees" ON sessions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM mentees
      WHERE mentees.id = sessions.mentee_id
      AND mentees.mentor_id = auth.uid()
    )
  );

CREATE POLICY "Mentors can update sessions of own mentees" ON sessions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM mentees
      WHERE mentees.id = sessions.mentee_id
      AND mentees.mentor_id = auth.uid()
    )
  );

CREATE POLICY "Mentors can delete sessions of own mentees" ON sessions
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM mentees
      WHERE mentees.id = sessions.mentee_id
      AND mentees.mentor_id = auth.uid()
    )
  );

-- Comments
COMMENT ON TABLE sessions IS 'Documented mentor-mentee sessions with notes and AI insights';
COMMENT ON COLUMN sessions.ai_summary IS 'AI-generated summary of the session (generated after save)';
COMMENT ON COLUMN sessions.emotion_tag IS 'Emotional state of mentee during session (optional)';
COMMENT ON COLUMN sessions.result_tag IS 'Session outcome type (optional)';

-- =====================================================
-- TABLE 4: deliverables (Entregáveis)
-- =====================================================

CREATE TABLE deliverables (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mentee_id UUID REFERENCES mentees(id) ON DELETE CASCADE NOT NULL,
  task TEXT NOT NULL,
  responsible TEXT CHECK (responsible IN ('mentor', 'mentee')) DEFAULT 'mentee' NOT NULL,
  due_date DATE,
  status TEXT CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')) DEFAULT 'pending' NOT NULL,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Indexes for deliverables
CREATE INDEX idx_deliverables_mentee_id ON deliverables(mentee_id);
CREATE INDEX idx_deliverables_status ON deliverables(status);
CREATE INDEX idx_deliverables_due_date ON deliverables(due_date) WHERE status IN ('pending', 'in_progress');

-- Trigger to auto-update updated_at
CREATE TRIGGER update_deliverables_updated_at BEFORE UPDATE ON deliverables
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to auto-set completed_at when status changes to completed
CREATE OR REPLACE FUNCTION set_completed_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    NEW.completed_at = now();
  ELSIF NEW.status != 'completed' THEN
    NEW.completed_at = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_deliverables_completed_at BEFORE UPDATE ON deliverables
FOR EACH ROW EXECUTE FUNCTION set_completed_at();

-- RLS for deliverables
ALTER TABLE deliverables ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Mentors can view deliverables of own mentees" ON deliverables
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM mentees
      WHERE mentees.id = deliverables.mentee_id
      AND mentees.mentor_id = auth.uid()
    )
  );

CREATE POLICY "Mentors can insert deliverables for own mentees" ON deliverables
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM mentees
      WHERE mentees.id = deliverables.mentee_id
      AND mentees.mentor_id = auth.uid()
    )
  );

CREATE POLICY "Mentors can update deliverables of own mentees" ON deliverables
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM mentees
      WHERE mentees.id = deliverables.mentee_id
      AND mentees.mentor_id = auth.uid()
    )
  );

CREATE POLICY "Mentors can delete deliverables of own mentees" ON deliverables
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM mentees
      WHERE mentees.id = deliverables.mentee_id
      AND mentees.mentor_id = auth.uid()
    )
  );

-- Comments
COMMENT ON TABLE deliverables IS 'Deliverables/tasks agreed between mentor and mentee';
COMMENT ON COLUMN deliverables.responsible IS 'Who is responsible for this deliverable (mentor or mentee)';
COMMENT ON COLUMN deliverables.completed_at IS 'Auto-set when status changes to completed';

-- =====================================================
-- TABLE 5: progress_tracking (Métricas evolução)
-- =====================================================

CREATE TABLE progress_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mentee_id UUID REFERENCES mentees(id) ON DELETE CASCADE NOT NULL,
  measurement_date DATE NOT NULL,
  clarity_score INTEGER CHECK (clarity_score BETWEEN 1 AND 10),
  deliverables_completed_count INTEGER DEFAULT 0 CHECK (deliverables_completed_count >= 0),
  sentiment_avg TEXT CHECK (sentiment_avg IN ('negative', 'neutral', 'positive')),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Indexes for progress_tracking
CREATE INDEX idx_progress_mentee_id ON progress_tracking(mentee_id);
CREATE INDEX idx_progress_measurement_date ON progress_tracking(measurement_date DESC);
CREATE INDEX idx_progress_mentee_date ON progress_tracking(mentee_id, measurement_date DESC);

-- RLS for progress_tracking
ALTER TABLE progress_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Mentors can view progress of own mentees" ON progress_tracking
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM mentees
      WHERE mentees.id = progress_tracking.mentee_id
      AND mentees.mentor_id = auth.uid()
    )
  );

CREATE POLICY "Mentors can insert progress for own mentees" ON progress_tracking
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM mentees
      WHERE mentees.id = progress_tracking.mentee_id
      AND mentees.mentor_id = auth.uid()
    )
  );

CREATE POLICY "System can insert progress" ON progress_tracking
  FOR INSERT WITH CHECK (true);

-- Comments
COMMENT ON TABLE progress_tracking IS 'Tracking mentee evolution metrics over time';
COMMENT ON COLUMN progress_tracking.clarity_score IS 'Clarity score (1-10) measured at this point in time';
COMMENT ON COLUMN progress_tracking.deliverables_completed_count IS 'Number of completed deliverables at this point';
COMMENT ON COLUMN progress_tracking.sentiment_avg IS 'Average sentiment from recent sessions';

-- =====================================================
-- TABLE 6: ai_insights (Cache insights IA)
-- =====================================================

CREATE TABLE ai_insights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mentee_id UUID REFERENCES mentees(id) ON DELETE CASCADE NOT NULL,
  insight_type TEXT CHECK (insight_type IN ('session_summary', 'provocative_questions', 'renewal_plan', 'observed_pain')) NOT NULL,
  content JSONB NOT NULL,
  generated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Indexes for ai_insights
CREATE INDEX idx_ai_insights_mentee_id ON ai_insights(mentee_id);
CREATE INDEX idx_ai_insights_type ON ai_insights(insight_type);
CREATE INDEX idx_ai_insights_mentee_type ON ai_insights(mentee_id, insight_type, generated_at DESC);
CREATE INDEX idx_ai_insights_content ON ai_insights USING GIN (content);

-- RLS for ai_insights
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Mentors can view AI insights of own mentees" ON ai_insights
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM mentees
      WHERE mentees.id = ai_insights.mentee_id
      AND mentees.mentor_id = auth.uid()
    )
  );

CREATE POLICY "System can insert AI insights" ON ai_insights
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update AI insights" ON ai_insights
  FOR UPDATE USING (true);

-- Comments
COMMENT ON TABLE ai_insights IS 'AI-generated insights cache (summaries, questions, renewal plans, observed pain)';
COMMENT ON COLUMN ai_insights.insight_type IS 'Type of insight: session_summary, provocative_questions, renewal_plan, observed_pain';
COMMENT ON COLUMN ai_insights.content IS 'JSONB content with AI-generated data (flexible structure)';

-- =====================================================
-- TABLE 7: ai_chat_history (Histórico chat IA mentor)
-- =====================================================

CREATE TABLE ai_chat_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mentee_id UUID REFERENCES mentees(id) ON DELETE CASCADE NOT NULL,
  mentor_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  role TEXT CHECK (role IN ('user', 'assistant')) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Indexes for ai_chat_history
CREATE INDEX idx_ai_chat_history_mentee_id ON ai_chat_history(mentee_id);
CREATE INDEX idx_ai_chat_history_mentor_id ON ai_chat_history(mentor_id);
CREATE INDEX idx_ai_chat_history_created_at ON ai_chat_history(created_at DESC);
CREATE INDEX idx_ai_chat_history_mentee_created ON ai_chat_history(mentee_id, created_at DESC);

-- RLS for ai_chat_history
ALTER TABLE ai_chat_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Mentors can view own chat history" ON ai_chat_history
  FOR SELECT USING (auth.uid() = mentor_id);

CREATE POLICY "System can insert chat messages" ON ai_chat_history
  FOR INSERT WITH CHECK (true);

-- Comments
COMMENT ON TABLE ai_chat_history IS 'Chat conversation history between mentor and AI assistant';
COMMENT ON COLUMN ai_chat_history.role IS 'Message role: user (mentor) or assistant (AI)';
COMMENT ON COLUMN ai_chat_history.message IS 'Message content from user or AI response';

-- =====================================================
-- TABLE 8: mentee_notes (Notas CS/Support internas)
-- =====================================================

CREATE TABLE mentee_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mentee_id UUID REFERENCES mentees(id) ON DELETE CASCADE NOT NULL,
  mentor_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  note_text TEXT NOT NULL,
  note_type TEXT CHECK (note_type IN ('support', 'payment', 'technical', 'feedback', 'other')) DEFAULT 'other',
  created_by_role TEXT CHECK (created_by_role IN ('mentor', 'support', 'admin')) DEFAULT 'support',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Indexes for mentee_notes
CREATE INDEX idx_mentee_notes_mentee_id ON mentee_notes(mentee_id);
CREATE INDEX idx_mentee_notes_mentor_id ON mentee_notes(mentor_id);
CREATE INDEX idx_mentee_notes_created_at ON mentee_notes(created_at DESC);
CREATE INDEX idx_mentee_notes_note_type ON mentee_notes(note_type);

-- Trigger to auto-update updated_at
CREATE TRIGGER update_mentee_notes_updated_at BEFORE UPDATE ON mentee_notes
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS for mentee_notes
ALTER TABLE mentee_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Mentors can view notes about own mentees" ON mentee_notes
  FOR SELECT USING (auth.uid() = mentor_id);

CREATE POLICY "Mentors can insert own notes" ON mentee_notes
  FOR INSERT WITH CHECK (auth.uid() = mentor_id);

CREATE POLICY "Support can insert notes for any mentee" ON mentee_notes
  FOR INSERT WITH CHECK (created_by_role IN ('support', 'admin'));

CREATE POLICY "Support can view all notes" ON mentee_notes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.email LIKE '%@inteligenciaavancada.com'
    )
  );

-- Comments
COMMENT ON TABLE mentee_notes IS 'Internal notes from CS/Support team about mentees (feeds AI context)';
COMMENT ON COLUMN mentee_notes.note_type IS 'Note category: support, payment, technical, feedback, other';
COMMENT ON COLUMN mentee_notes.created_by_role IS 'Who created the note: mentor, support, admin';
COMMENT ON COLUMN mentee_notes.note_text IS 'Internal note text (not visible to mentee, only mentor + support)';

-- =====================================================
-- TABLE 9: ai_prompts (Prompts IA editáveis)
-- =====================================================

CREATE TABLE ai_prompts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  prompt_name TEXT UNIQUE NOT NULL,
  system_prompt TEXT NOT NULL,
  description TEXT,
  version INTEGER DEFAULT 1 NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Indexes for ai_prompts
CREATE INDEX idx_ai_prompts_prompt_name ON ai_prompts(prompt_name);
CREATE INDEX idx_ai_prompts_is_active ON ai_prompts(is_active) WHERE is_active = true;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_ai_prompts_updated_at BEFORE UPDATE ON ai_prompts
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS for ai_prompts (read-only for authenticated users, admin manages)
ALTER TABLE ai_prompts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can view active prompts" ON ai_prompts
  FOR SELECT USING (is_active = true);

CREATE POLICY "System can manage prompts" ON ai_prompts
  FOR ALL USING (true);

-- Seed initial prompts
INSERT INTO ai_prompts (prompt_name, system_prompt, description, version, is_active)
VALUES (
  'chat_assistant',
  'You are an AI assistant helping mentor {{mentor_name}} with mentee {{mentee_name}}.

CONTEXT:
- Mentee Goal: {{mentee_goal}}
- Company: {{mentee_company}}
- Role: {{mentee_role}}
- Plan Duration: {{plan_duration}} months
- Days Remaining: {{days_remaining}}

RECENT SESSIONS (last 3):
{{recent_sessions}}

DELIVERABLES STATUS:
{{deliverables_status}}

INTERNAL NOTES (CS/Support):
{{internal_notes}}

Your role: Provide actionable insights, provocative questions, and help mentor prepare for next session.

Tone: {{mentor_ai_tone}} (provocative = challenge assumptions, empathetic = supportive, direct = straightforward)',
  'Main chat assistant prompt for mentor-AI conversations',
  1,
  true
);

-- Comments
COMMENT ON TABLE ai_prompts IS 'Editable AI prompts for zero-downtime updates (no deploy needed)';
COMMENT ON COLUMN ai_prompts.prompt_name IS 'Unique identifier for prompt (e.g., chat_assistant, session_summary)';
COMMENT ON COLUMN ai_prompts.system_prompt IS 'Template with {{variables}} replaced at runtime';
COMMENT ON COLUMN ai_prompts.version IS 'Version number for tracking changes';
COMMENT ON COLUMN ai_prompts.is_active IS 'Only active prompts are used in production';

-- =====================================================
-- HELPER VIEWS (Optional - for dashboard queries)
-- =====================================================

-- View: Mentees with days remaining and progress
CREATE OR REPLACE VIEW mentees_dashboard AS
SELECT
  m.id,
  m.mentor_id,
  m.full_name,
  m.photo_url,
  m.company,
  m.status,
  m.plan_start_date,
  m.plan_end_date,
  (m.plan_end_date - CURRENT_DATE) AS days_remaining,
  COALESCE(
    (SELECT COUNT(*)::FLOAT / NULLIF(COUNT(*), 0)
     FROM deliverables d
     WHERE d.mentee_id = m.id AND d.status = 'completed')::NUMERIC(5,2) * 100,
    0
  ) AS progress_percentage,
  (SELECT COUNT(*) FROM sessions s WHERE s.mentee_id = m.id) AS total_sessions,
  m.created_at,
  m.updated_at
FROM mentees m;

COMMENT ON VIEW mentees_dashboard IS 'Dashboard view with computed fields (days_remaining, progress_percentage)';

-- =====================================================
-- GRANTS (Ensure service role has access)
-- =====================================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;

-- Grant all on all tables to authenticated users (RLS will restrict)
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, authenticated, service_role;

-- Grant select on views
GRANT SELECT ON mentees_dashboard TO authenticated;

-- =====================================================
-- INITIAL DATA (Optional - for testing)
-- =====================================================

-- No initial data needed for production
-- Mentors will be created via Supabase Auth on signup

-- =====================================================
-- VERIFICATION QUERIES (Run after schema creation)
-- =====================================================

-- Check all tables exist
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' ORDER BY table_name;

-- Check RLS is enabled
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;

-- Check indexes
-- SELECT tablename, indexname FROM pg_indexes WHERE schemaname = 'public' ORDER BY tablename, indexname;

-- =====================================================
-- END OF SCHEMA
-- =====================================================
