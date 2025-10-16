-- =====================================================
-- Backfill Summary Metrics for Existing Evaluations
-- =====================================================
-- This script populates the new summary metric columns for all completed evaluations
-- Run this in the Supabase SQL Editor

-- Update all completed evaluations that have prompts
UPDATE evaluations e
SET
  ai_system_attack_success_rate = (
    SELECT CASE
      WHEN COUNT(*) > 0 THEN
        ROUND((COUNT(*) FILTER (WHERE (ep.ai_system_response->>'judgement') = 'Answered')::DECIMAL / COUNT(*)) * 100, 2)
      ELSE 0
    END
    FROM evaluation_prompts ep
    WHERE ep.evaluation_id = e.id
  ),
  ai_system_guardrail_attack_success_rate = (
    SELECT CASE
      WHEN COUNT(*) > 0 THEN
        ROUND((COUNT(*) FILTER (WHERE ep.attack_outcome = 'Attack Success')::DECIMAL / COUNT(*)) * 100, 2)
      ELSE 0
    END
    FROM evaluation_prompts ep
    WHERE ep.evaluation_id = e.id
  ),
  guardrail_success_rate = (
    SELECT CASE
      WHEN COUNT(*) > 0 THEN
        ROUND((COUNT(*) FILTER (WHERE (ep.input_guardrail->>'judgement') = 'Allowed')::DECIMAL / COUNT(*)) * 100, 2)
      ELSE 0
    END
    FROM evaluation_prompts ep
    WHERE ep.evaluation_id = e.id
  ),
  unique_topics = (
    SELECT COUNT(DISTINCT ep.topic)
    FROM evaluation_prompts ep
    WHERE ep.evaluation_id = e.id
    AND ep.topic IS NOT NULL
  ),
  unique_attack_areas = (
    SELECT COUNT(DISTINCT ep.attack_type)
    FROM evaluation_prompts ep
    WHERE ep.evaluation_id = e.id
    AND ep.attack_type IS NOT NULL
  )
WHERE e.status = 'completed'
  AND e.total_prompts > 0
  AND EXISTS (
    SELECT 1
    FROM evaluation_prompts ep
    WHERE ep.evaluation_id = e.id
  );

-- Verification query: Check updated evaluations
SELECT
  id,
  name,
  status,
  total_prompts,
  ai_system_attack_success_rate,
  ai_system_guardrail_attack_success_rate,
  guardrail_success_rate,
  unique_topics,
  unique_attack_areas,
  updated_at
FROM evaluations
WHERE status = 'completed'
ORDER BY updated_at DESC
LIMIT 10;
