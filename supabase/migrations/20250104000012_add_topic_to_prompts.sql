-- Add topic column to evaluation_prompts table
-- Migration: 20250104000012_add_topic_to_prompts

-- Add topic column for storing the topic category (max 2 words)
ALTER TABLE evaluation_prompts
ADD COLUMN topic TEXT;

-- Add index for topic-based filtering and grouping
CREATE INDEX idx_eval_prompts_topic ON evaluation_prompts(evaluation_id, topic);

-- Add comment for documentation
COMMENT ON COLUMN evaluation_prompts.topic IS 'The topic category this prompt belongs to (max 2 words, e.g., "Medical Advice", "Legal Guidance")';
