-- Create projects table for V2
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  use_case TEXT,
  visibility TEXT NOT NULL DEFAULT 'private',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (prototype)
CREATE POLICY "Allow all operations on projects" ON projects FOR ALL USING (true) WITH CHECK (true);
