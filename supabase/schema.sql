-- ============================================================
-- GreenCrop Database Schema
-- Run this in the Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Core Tables ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS employees (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name  TEXT NOT NULL,
  last_name   TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS spray_types (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name        TEXT NOT NULL UNIQUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS greenhouses (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name            TEXT NOT NULL UNIQUE,
  total_openings  INTEGER NOT NULL CHECK (total_openings > 0),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS season_setup (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  greenhouse_id   UUID NOT NULL REFERENCES greenhouses(id) ON DELETE CASCADE,
  crop_name       TEXT NOT NULL,
  start_opening   INTEGER NOT NULL CHECK (start_opening >= 1),
  end_opening     INTEGER NOT NULL,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT opening_range_valid CHECK (end_opening >= start_opening)
);

-- ─── Activity Log Tables ─────────────────────────────────────

CREATE TABLE IF NOT EXISTS irrigation_logs (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  greenhouse_id    UUID REFERENCES greenhouses(id) ON DELETE SET NULL,
  season_setup_id  UUID REFERENCES season_setup(id) ON DELETE SET NULL,
  m3_per_dunam     NUMERIC(10,2) NOT NULL,
  cycles           INTEGER NOT NULL,
  start_date       DATE NOT NULL,
  end_date         DATE NOT NULL,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS spraying_logs (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  greenhouse_id    UUID REFERENCES greenhouses(id) ON DELETE SET NULL,
  season_setup_id  UUID REFERENCES season_setup(id) ON DELETE SET NULL,
  type_id          UUID REFERENCES spray_types(id) ON DELETE SET NULL,
  date             DATE NOT NULL,
  employee_id      UUID REFERENCES employees(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fertilization_logs (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  greenhouse_id    UUID REFERENCES greenhouses(id) ON DELETE SET NULL,
  season_setup_id  UUID REFERENCES season_setup(id) ON DELETE SET NULL,
  opening_num      INTEGER NOT NULL,
  date             DATE NOT NULL,
  pollen_type      TEXT,
  employee_id      UUID REFERENCES employees(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS yield_logs (
  id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  greenhouse_id       UUID REFERENCES greenhouses(id) ON DELETE SET NULL,
  season_setup_id     UUID REFERENCES season_setup(id) ON DELETE SET NULL,
  harvest_date        DATE NOT NULL,
  production_date     DATE,
  disinfection_boolean BOOLEAN DEFAULT FALSE,
  disinfection_type   TEXT,
  weight_kg           NUMERIC(10,2) NOT NULL,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Indexes ─────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_season_setup_greenhouse ON season_setup(greenhouse_id);
CREATE INDEX IF NOT EXISTS idx_season_setup_active ON season_setup(is_active);
CREATE INDEX IF NOT EXISTS idx_irrigation_season ON irrigation_logs(season_setup_id);
CREATE INDEX IF NOT EXISTS idx_spraying_season ON spraying_logs(season_setup_id);
CREATE INDEX IF NOT EXISTS idx_fertilization_season ON fertilization_logs(season_setup_id);
CREATE INDEX IF NOT EXISTS idx_yield_season ON yield_logs(season_setup_id);

-- ─── Row Level Security ───────────────────────────────────────
-- All authenticated users can read/write. Adjust as needed.

ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE spray_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE greenhouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE season_setup ENABLE ROW LEVEL SECURITY;
ALTER TABLE irrigation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE spraying_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE fertilization_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE yield_logs ENABLE ROW LEVEL SECURITY;

-- Policies: full access for authenticated users
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'employees','spray_types','greenhouses','season_setup',
    'irrigation_logs','spraying_logs','fertilization_logs','yield_logs'
  ] LOOP
    EXECUTE format(
      'CREATE POLICY "auth_all_%s" ON %I FOR ALL TO authenticated USING (true) WITH CHECK (true)',
      tbl, tbl
    );
  END LOOP;
END $$;
