-- Add checkpoint_state column for tracking evaluation phases
-- This enables checkpoint-based progress tracking with resume capability

ALTER TABLE evaluations
ADD COLUMN IF NOT EXISTS checkpoint_state JSONB DEFAULT '{
  "current_checkpoint": null,
  "checkpoints": {
    "topics": { "status": "pending" },
    "prompts": { "status": "pending" },
    "evaluation": { "status": "pending" },
    "summary": { "status": "pending" }
  },
  "policies": []
}'::jsonb;

-- Index for efficient querying of checkpoint state
CREATE INDEX IF NOT EXISTS idx_evaluations_checkpoint_state
ON evaluations USING GIN (checkpoint_state);

-- Update existing evaluations to have the default checkpoint state
UPDATE evaluations
SET checkpoint_state = '{
  "current_checkpoint": null,
  "checkpoints": {
    "topics": { "status": "pending" },
    "prompts": { "status": "pending" },
    "evaluation": { "status": "pending" },
    "summary": { "status": "pending" }
  },
  "policies": []
}'::jsonb
WHERE checkpoint_state IS NULL;
