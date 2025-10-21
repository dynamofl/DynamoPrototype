-- Recovery SQL for stuck evaluations
-- This script marks evaluations stuck in 'pending' status for >10 minutes as 'failed'
--
-- Usage:
--   Run this in the Supabase SQL Editor or via psql:
--   psql $DATABASE_URL -f scripts/fix-stuck-evaluations.sql

-- First, show what will be updated
SELECT
  id,
  name,
  created_at,
  total_prompts,
  completed_prompts,
  current_stage,
  EXTRACT(EPOCH FROM (NOW() - created_at)) / 60 AS minutes_stuck
FROM evaluations
WHERE status = 'pending'
  AND created_at < NOW() - INTERVAL '10 minutes'
ORDER BY created_at DESC;

-- Update stuck evaluations to 'failed' status
UPDATE evaluations
SET
  status = 'failed',
  current_stage = 'Failed: Stuck in preparation (auto-fixed by recovery script)',
  updated_at = NOW()
WHERE status = 'pending'
  AND created_at < NOW() - INTERVAL '10 minutes'
RETURNING
  id,
  name,
  created_at,
  current_stage;

-- Log the recovery action for each fixed evaluation
INSERT INTO evaluation_logs (evaluation_id, level, message, metadata, created_at)
SELECT
  id AS evaluation_id,
  'error' AS level,
  'Evaluation stuck in pending status for >10 minutes. Auto-marked as failed by recovery script.' AS message,
  jsonb_build_object(
    'original_created_at', created_at,
    'total_prompts', total_prompts,
    'recovery_timestamp', NOW()
  ) AS metadata,
  NOW() AS created_at
FROM evaluations
WHERE status = 'failed'
  AND current_stage = 'Failed: Stuck in preparation (auto-fixed by recovery script)'
  AND updated_at > NOW() - INTERVAL '1 minute';
