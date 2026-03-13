-- Schools table
CREATE TABLE IF NOT EXISTS schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Seed default school
INSERT INTO schools (name)
VALUES ('№6 школа-лицей')
ON CONFLICT DO NOTHING;
