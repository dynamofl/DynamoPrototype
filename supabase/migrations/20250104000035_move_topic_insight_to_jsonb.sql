-- Move topic_insight from separate column to inside topic_analysis JSONB
-- Migration: 20250104000035_move_topic_insight_to_jsonb

-- Drop the standalone topic_insight column
ALTER TABLE evaluations
  DROP COLUMN IF EXISTS topic_insight;

-- Drop the index we created for it
DROP INDEX IF EXISTS idx_evaluations_topic_insight;

-- The topic_insight will now be stored as a key inside topic_analysis JSONB
-- New structure:
-- {
--   "source": { ... },
--   "topic_insight": "AI-generated insight text here..."
-- }

COMMENT ON COLUMN evaluations.topic_analysis IS 'Topic-level analysis with statistical metrics and AI-generated insights. Structure: { source: { type, policies }, topic_insight: string }';
