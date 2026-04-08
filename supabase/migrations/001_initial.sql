-- ============================================================
-- MoveWithMe — Initial Schema Migration
-- Paste this into the Supabase SQL Editor and run it.
-- Before running: ensure your Supabase project is set up.
-- Google OAuth: enable in Supabase Dashboard → Authentication → Providers.
-- Add your app URL (e.g. http://localhost:5173) to:
--   Dashboard → Authentication → URL Configuration → Redirect URLs
-- ============================================================

-- ─── Extensions ───────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Trainers ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.trainers (
  id               UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email            TEXT NOT NULL,
  full_name        TEXT,
  avatar_url       TEXT,
  bio              TEXT,
  onboarding_done  BOOLEAN DEFAULT FALSE NOT NULL,
  created_at       TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ─── Trainer roles ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.trainer_roles (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trainer_id  UUID REFERENCES public.trainers(id) ON DELETE CASCADE NOT NULL,
  role_type   TEXT NOT NULL
);

-- ─── Clients ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.clients (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trainer_id     UUID REFERENCES public.trainers(id) ON DELETE CASCADE NOT NULL,
  first_name     TEXT NOT NULL,
  last_name      TEXT NOT NULL,
  email          TEXT,
  phone          TEXT,
  service_type   TEXT NOT NULL DEFAULT 'personal_trainer',
  status         TEXT NOT NULL DEFAULT 'active',
  health_context TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ─── Programs ─────────────────────────────────────────────────────────────────
-- content JSONB stores the full weeks → days → exercises nested structure
-- so the program builder works without normalising every exercise into a row.
CREATE TABLE IF NOT EXISTS public.programs (
  id                    UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trainer_id            UUID REFERENCES public.trainers(id) ON DELETE CASCADE NOT NULL,
  name                  TEXT NOT NULL,
  program_type          TEXT DEFAULT 'strength',
  weeks                 INTEGER DEFAULT 4,
  sessions_per_week     INTEGER DEFAULT 3,
  visibility            TEXT DEFAULT 'trainer_only',
  status                TEXT DEFAULT 'draft',
  version               INTEGER DEFAULT 1,
  is_template           BOOLEAN DEFAULT FALSE NOT NULL,
  template_name         TEXT,
  template_description  TEXT,
  content               JSONB,
  created_at            TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ─── Program ↔ Client assignments ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.program_clients (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  program_id  UUID REFERENCES public.programs(id) ON DELETE CASCADE NOT NULL,
  client_id   UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  version     INTEGER DEFAULT 1,
  start_date  DATE,
  status      TEXT DEFAULT 'active'
);

-- ─── Scheduled sessions (calendar) ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.sessions (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  program_id       UUID REFERENCES public.programs(id) ON DELETE SET NULL,
  client_id        UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  trainer_id       UUID REFERENCES public.trainers(id) ON DELETE CASCADE NOT NULL,
  week_number      INTEGER,
  day_label        TEXT,
  scheduled_date   DATE,
  session_type     TEXT,
  start_time       TEXT,
  duration_minutes INTEGER DEFAULT 60,
  is_group_class   BOOLEAN DEFAULT FALSE,
  group_class_name TEXT,
  notes            TEXT
);

-- ─── Exercises (within scheduled sessions) ───────────────────────────────────
CREATE TABLE IF NOT EXISTS public.exercises (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id  UUID REFERENCES public.sessions(id) ON DELETE CASCADE NOT NULL,
  name        TEXT NOT NULL,
  sets        INTEGER,
  reps        TEXT,
  weight      TEXT,
  notes       TEXT,
  order_index INTEGER DEFAULT 0
);

-- ─── Session logs (completed sessions) ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.session_logs (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id       UUID REFERENCES public.sessions(id) ON DELETE SET NULL,
  client_id        UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  trainer_id       UUID REFERENCES public.trainers(id) ON DELETE CASCADE NOT NULL,
  session_category TEXT DEFAULT 'trainer',
  session_type     TEXT,
  duration_minutes INTEGER DEFAULT 60,
  completed_at     TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  rating           INTEGER,
  notes            TEXT
);

-- ─── Exercise logs ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.exercise_logs (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_log_id  UUID REFERENCES public.session_logs(id) ON DELETE CASCADE NOT NULL,
  exercise_id     UUID REFERENCES public.exercises(id) ON DELETE SET NULL,
  actual_sets     INTEGER,
  actual_reps     TEXT,
  actual_weight   TEXT,
  notes           TEXT
);

-- ─── Habits ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.habits (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id        UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  trainer_id       UUID REFERENCES public.trainers(id) ON DELETE CASCADE NOT NULL,
  name             TEXT NOT NULL,
  target_frequency INTEGER DEFAULT 7,
  created_at       TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ─── Habit logs ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.habit_logs (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  habit_id       UUID REFERENCES public.habits(id) ON DELETE CASCADE NOT NULL,
  client_id      UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  completed_date DATE NOT NULL
);

-- ─── Messages ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.messages (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trainer_id   UUID REFERENCES public.trainers(id) ON DELETE CASCADE NOT NULL,
  client_id    UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  sender_type  TEXT NOT NULL,
  body         TEXT NOT NULL,
  read_at      TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ─── Goals ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.goals (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id     UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  trainer_id    UUID REFERENCES public.trainers(id) ON DELETE CASCADE NOT NULL,
  description   TEXT NOT NULL,
  target_value  NUMERIC,
  current_value NUMERIC,
  unit          TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ─── Row Level Security ────────────────────────────────────────────────────────

ALTER TABLE public.trainers        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trainer_roles   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programs        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_logs    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_logs   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habits          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_logs      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals           ENABLE ROW LEVEL SECURITY;

-- trainers: own row only
CREATE POLICY "trainers_own" ON public.trainers FOR ALL
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- trainer_roles
CREATE POLICY "trainer_roles_own" ON public.trainer_roles FOR ALL
  USING (trainer_id = auth.uid()) WITH CHECK (trainer_id = auth.uid());

-- clients
CREATE POLICY "clients_own" ON public.clients FOR ALL
  USING (trainer_id = auth.uid()) WITH CHECK (trainer_id = auth.uid());

-- programs
CREATE POLICY "programs_own" ON public.programs FOR ALL
  USING (trainer_id = auth.uid()) WITH CHECK (trainer_id = auth.uid());

-- program_clients: trainer must own the linked program
CREATE POLICY "program_clients_own" ON public.program_clients FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.programs p
      WHERE p.id = program_id AND p.trainer_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.programs p
      WHERE p.id = program_id AND p.trainer_id = auth.uid()
    )
  );

-- sessions
CREATE POLICY "sessions_own" ON public.sessions FOR ALL
  USING (trainer_id = auth.uid()) WITH CHECK (trainer_id = auth.uid());

-- exercises: trainer must own the session
CREATE POLICY "exercises_own" ON public.exercises FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.sessions s
      WHERE s.id = session_id AND s.trainer_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.sessions s
      WHERE s.id = session_id AND s.trainer_id = auth.uid()
    )
  );

-- session_logs
CREATE POLICY "session_logs_own" ON public.session_logs FOR ALL
  USING (trainer_id = auth.uid()) WITH CHECK (trainer_id = auth.uid());

-- exercise_logs: trainer must own the session log
CREATE POLICY "exercise_logs_own" ON public.exercise_logs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.session_logs sl
      WHERE sl.id = session_log_id AND sl.trainer_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.session_logs sl
      WHERE sl.id = session_log_id AND sl.trainer_id = auth.uid()
    )
  );

-- habits
CREATE POLICY "habits_own" ON public.habits FOR ALL
  USING (trainer_id = auth.uid()) WITH CHECK (trainer_id = auth.uid());

-- habit_logs
CREATE POLICY "habit_logs_own" ON public.habit_logs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.habits h
      WHERE h.id = habit_id AND h.trainer_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.habits h
      WHERE h.id = habit_id AND h.trainer_id = auth.uid()
    )
  );

-- messages
CREATE POLICY "messages_own" ON public.messages FOR ALL
  USING (trainer_id = auth.uid()) WITH CHECK (trainer_id = auth.uid());

-- goals
CREATE POLICY "goals_own" ON public.goals FOR ALL
  USING (trainer_id = auth.uid()) WITH CHECK (trainer_id = auth.uid());
