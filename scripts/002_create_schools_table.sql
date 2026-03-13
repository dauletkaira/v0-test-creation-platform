-- Schools table
CREATE TABLE IF NOT EXISTS schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default school
INSERT INTO schools (name)
VALUES ('№6 школа-лицей')
ON CONFLICT (name) DO NOTHING;
