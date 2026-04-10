-- ============================================================
-- MoveWithMe — Migration 002
-- Ensures onboarding_done column exists on trainers table.
-- Safe to run even if the column already exists.
-- Paste into Supabase SQL Editor and run.
-- ============================================================

ALTER TABLE public.trainers
  ADD COLUMN IF NOT EXISTS onboarding_done BOOLEAN DEFAULT FALSE NOT NULL;
