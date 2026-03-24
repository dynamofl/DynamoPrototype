-- Add visibility column to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS visibility TEXT NOT NULL DEFAULT 'private';
