-- ============================================================
-- GreenCrop Seed Data
-- Run AFTER schema.sql
-- ============================================================

-- Greenhouses
INSERT INTO greenhouses (name, total_openings) VALUES
  ('Greenhouse 1', 7),
  ('Greenhouse 2', 11),
  ('Greenhouse 3', 18)
ON CONFLICT (name) DO NOTHING;

-- Employees
INSERT INTO employees (first_name, last_name) VALUES
  ('John',   'Smith'),
  ('Maria',  'Garcia'),
  ('Ahmad',  'Hassan'),
  ('Leila',  'Cohen')
ON CONFLICT DO NOTHING;

-- Spray Types
INSERT INTO spray_types (name) VALUES
  ('Pesticide A'),
  ('Fungicide B'),
  ('Herbicide C'),
  ('Growth Regulator D')
ON CONFLICT (name) DO NOTHING;

-- Season Setup — Greenhouse 3 demo data
INSERT INTO season_setup (greenhouse_id, crop_name, start_opening, end_opening, is_active)
SELECT id, 'Cucumbers', 1, 4, TRUE FROM greenhouses WHERE name = 'Greenhouse 3'
ON CONFLICT DO NOTHING;

INSERT INTO season_setup (greenhouse_id, crop_name, start_opening, end_opening, is_active)
SELECT id, 'Peppers', 5, 7, TRUE FROM greenhouses WHERE name = 'Greenhouse 3'
ON CONFLICT DO NOTHING;
