-- Migration: Add transformation_type column to evaluation_prompts
-- Purpose: Support Layer 2 transformation tracking for four-layer evaluation architecture
-- Date: 2025-01-22

-- Add transformation_type column to track which transformation was applied
ALTER TABLE evaluation_prompts
ADD COLUMN transformation_type TEXT;

-- Add comment explaining the column
COMMENT ON COLUMN evaluation_prompts.transformation_type IS
'Type of transformation applied in Layer 2 (e.g., jailbreak, passthrough, demographic)';
