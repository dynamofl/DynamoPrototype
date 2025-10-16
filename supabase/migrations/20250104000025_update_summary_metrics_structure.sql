-- Update summary_metrics structure to include per-guardrail breakdown
-- Migration: 20250104000025_update_summary_metrics_structure

-- This migration updates the summary_metrics JSONB column in the evaluations table
-- to support the new nested structure with per-guardrail metrics.

-- The new structure:
-- {
--   "aiSystem": {
--     "totalTests": 50,
--     "successRate": 2,
--     "aiSystemOnlySuccessRate": 90,
--     "attackSuccesses": 1,
--     "attackFailures": 49,
--     "aiSystemOnlySuccesses": 45,
--     "aiSystemOnlyFailures": 5,
--     "byPolicy": {...},
--     "byAttackType": {...},
--     "byBehaviorType": {...}
--   },
--   "guardrails": [
--     {
--       "id": "gr-123",
--       "name": "Profanity Filter",
--       "type": "output",
--       "totalTests": 50,
--       "successRate": 30,
--       "guardrailOnlySuccessRate": 80,
--       "attackSuccesses": 15,
--       "attackFailures": 35,
--       "guardrailOnlySuccesses": 40,
--       "guardrailOnlyFailures": 10,
--       "byPolicy": {...},
--       "byAttackType": {...},
--       "byBehaviorType": {...}
--     }
--   ],
--   // Legacy fields maintained for backward compatibility
--   "totalTests": 50,
--   "successRate": 2,
--   ...
-- }

-- No schema changes needed - summary_metrics is already JSONB
-- The structure change will be handled by:
-- 1. New evaluations automatically using the new structure (edge function updated)
-- 2. Migration script (migrate-guardrail-summary-metrics.ts) for existing evaluations

-- Add comment documenting the new structure
COMMENT ON COLUMN evaluations.summary_metrics IS
'Evaluation summary metrics in JSONB format.
New structure (with per-guardrail breakdown):
{
  "aiSystem": {
    "totalTests": number,
    "successRate": number,
    "aiSystemOnlySuccessRate": number,
    "attackSuccesses": number,
    "attackFailures": number,
    "aiSystemOnlySuccesses": number,
    "aiSystemOnlyFailures": number,
    "byPolicy": {[policyId]: {total, successes, failures, policyName, successRate}},
    "byAttackType": {[attackType]: {total, successes, failures, successRate}},
    "byBehaviorType": {[behaviorType]: {total, successes, failures, successRate}}
  },
  "guardrails": [
    {
      "id": string,
      "name": string,
      "type": "input" | "output",
      "totalTests": number,
      "successRate": number,
      "guardrailOnlySuccessRate": number,
      "attackSuccesses": number,
      "attackFailures": number,
      "guardrailOnlySuccesses": number,
      "guardrailOnlyFailures": number,
      "byPolicy": {...},
      "byAttackType": {...},
      "byBehaviorType": {...}
    }
  ],
  // Legacy flat fields maintained for backward compatibility
  "totalTests": number,
  "successRate": number,
  ...
}

Legacy structure (flat, pre-migration):
{
  "totalTests": number,
  "attackSuccesses": number,
  "attackFailures": number,
  "successRate": number,
  "aiSystemOnlySuccesses": number,
  "aiSystemOnlyFailures": number,
  "aiSystemOnlySuccessRate": number,
  "byPolicy": {...},
  "byAttackType": {...},
  "byBehaviorType": {...}
}';

-- Create helper function to recalculate summary metrics with guardrail breakdown
CREATE OR REPLACE FUNCTION recalculate_summary_metrics_with_guardrails(eval_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  result JSONB;
  total_tests INT;
  attack_successes INT;
  attack_failures INT;
  ai_system_only_successes INT;
  ai_system_only_failures INT;
  by_policy JSONB := '{}'::JSONB;
  by_attack_type JSONB := '{}'::JSONB;
  by_behavior_type JSONB := '{}'::JSONB;
  guardrails_array JSONB := '[]'::JSONB;
  guardrail_data JSONB;
  prompt_record RECORD;
  detail JSONB;
BEGIN
  -- Count totals
  SELECT COUNT(*)
  INTO total_tests
  FROM evaluation_prompts
  WHERE evaluation_id = eval_id AND status = 'completed';

  IF total_tests = 0 THEN
    RETURN NULL;
  END IF;

  -- Count attack outcomes
  SELECT
    COUNT(CASE WHEN attack_outcome = 'Attack Success' THEN 1 END),
    COUNT(CASE WHEN attack_outcome = 'Attack Failure' THEN 1 END),
    COUNT(CASE WHEN ai_system_attack_outcome = 'Attack Success' THEN 1 END),
    COUNT(CASE WHEN ai_system_attack_outcome = 'Attack Failure' THEN 1 END)
  INTO attack_successes, attack_failures, ai_system_only_successes, ai_system_only_failures
  FROM evaluation_prompts
  WHERE evaluation_id = eval_id AND status = 'completed';

  -- Aggregate by policy
  SELECT jsonb_object_agg(
    policy_id,
    jsonb_build_object(
      'total', policy_total,
      'successes', policy_successes,
      'failures', policy_failures,
      'policyName', policy_name,
      'successRate', CASE WHEN policy_total > 0 THEN (policy_successes::DECIMAL / policy_total * 100) ELSE 0 END
    )
  ) INTO by_policy
  FROM (
    SELECT
      policy_id,
      policy_name,
      COUNT(*) as policy_total,
      COUNT(CASE WHEN attack_outcome = 'Attack Success' THEN 1 END) as policy_successes,
      COUNT(CASE WHEN attack_outcome = 'Attack Failure' THEN 1 END) as policy_failures
    FROM evaluation_prompts
    WHERE evaluation_id = eval_id AND status = 'completed'
    GROUP BY policy_id, policy_name
  ) policy_stats;

  -- Aggregate by attack type
  SELECT jsonb_object_agg(
    attack_type,
    jsonb_build_object(
      'total', attack_total,
      'successes', attack_successes_count,
      'failures', attack_failures_count,
      'successRate', CASE WHEN attack_total > 0 THEN (attack_successes_count::DECIMAL / attack_total * 100) ELSE 0 END
    )
  ) INTO by_attack_type
  FROM (
    SELECT
      attack_type,
      COUNT(*) as attack_total,
      COUNT(CASE WHEN attack_outcome = 'Attack Success' THEN 1 END) as attack_successes_count,
      COUNT(CASE WHEN attack_outcome = 'Attack Failure' THEN 1 END) as attack_failures_count
    FROM evaluation_prompts
    WHERE evaluation_id = eval_id AND status = 'completed'
    GROUP BY attack_type
  ) attack_stats;

  -- Aggregate by behavior type
  SELECT jsonb_object_agg(
    behavior_type,
    jsonb_build_object(
      'total', behavior_total,
      'successes', behavior_successes_count,
      'failures', behavior_failures_count,
      'successRate', CASE WHEN behavior_total > 0 THEN (behavior_successes_count::DECIMAL / behavior_total * 100) ELSE 0 END
    )
  ) INTO by_behavior_type
  FROM (
    SELECT
      behavior_type,
      COUNT(*) as behavior_total,
      COUNT(CASE WHEN attack_outcome = 'Attack Success' THEN 1 END) as behavior_successes_count,
      COUNT(CASE WHEN attack_outcome = 'Attack Failure' THEN 1 END) as behavior_failures_count
    FROM evaluation_prompts
    WHERE evaluation_id = eval_id AND status = 'completed'
    GROUP BY behavior_type
  ) behavior_stats;

  -- Build result with new nested structure
  result := jsonb_build_object(
    'aiSystem', jsonb_build_object(
      'totalTests', total_tests,
      'attackSuccesses', attack_successes,
      'attackFailures', attack_failures,
      'successRate', CASE WHEN total_tests > 0 THEN (attack_successes::DECIMAL / total_tests * 100) ELSE 0 END,
      'aiSystemOnlySuccesses', ai_system_only_successes,
      'aiSystemOnlyFailures', ai_system_only_failures,
      'aiSystemOnlySuccessRate', CASE WHEN total_tests > 0 THEN (ai_system_only_successes::DECIMAL / total_tests * 100) ELSE 0 END,
      'byPolicy', COALESCE(by_policy, '{}'::JSONB),
      'byAttackType', COALESCE(by_attack_type, '{}'::JSONB),
      'byBehaviorType', COALESCE(by_behavior_type, '{}'::JSONB)
    ),
    -- Legacy fields for backward compatibility
    'totalTests', total_tests,
    'attackSuccesses', attack_successes,
    'attackFailures', attack_failures,
    'successRate', CASE WHEN total_tests > 0 THEN (attack_successes::DECIMAL / total_tests * 100) ELSE 0 END,
    'aiSystemOnlySuccesses', ai_system_only_successes,
    'aiSystemOnlyFailures', ai_system_only_failures,
    'aiSystemOnlySuccessRate', CASE WHEN total_tests > 0 THEN (ai_system_only_successes::DECIMAL / total_tests * 100) ELSE 0 END,
    'byPolicy', COALESCE(by_policy, '{}'::JSONB),
    'byAttackType', COALESCE(by_attack_type, '{}'::JSONB),
    'byBehaviorType', COALESCE(by_behavior_type, '{}'::JSONB)
  );

  -- Note: Per-guardrail metrics are complex and require iterating through JSONB arrays
  -- This is better handled by the TypeScript migration script for performance
  -- The SQL function provides the basic structure

  RETURN result;
END;
$$;

COMMENT ON FUNCTION recalculate_summary_metrics_with_guardrails IS
'Recalculates summary_metrics for an evaluation with the new nested structure.
Note: This function calculates aiSystem metrics but not per-guardrail breakdown.
For full migration including per-guardrail metrics, use the TypeScript migration script:
npx tsx scripts/migrate-guardrail-summary-metrics.ts';

-- Example usage:
--
-- 1. Recalculate summary metrics for a single evaluation:
--    UPDATE evaluations
--    SET summary_metrics = recalculate_summary_metrics_with_guardrails(id)
--    WHERE id = 'your-evaluation-id';
--
-- 2. Migrate all evaluations (WARNING: may be slow for large datasets):
--    UPDATE evaluations
--    SET summary_metrics = recalculate_summary_metrics_with_guardrails(id)
--    WHERE status = 'completed' AND summary_metrics IS NOT NULL;
--
-- 3. Check if evaluation has new structure:
--    SELECT
--      id,
--      name,
--      summary_metrics ? 'aiSystem' as has_new_structure
--    FROM evaluations
--    WHERE status = 'completed';
