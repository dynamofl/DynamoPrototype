-- Verification Script for Hallucination Evaluation Data
-- Run this in Supabase SQL Editor to verify data import and metrics calculation

-- 1. Check evaluations exist
SELECT
  id,
  name,
  evaluation_type,
  status,
  total_prompts,
  completed_prompts,
  created_at,
  CASE
    WHEN metrics IS NULL THEN 'NO METRICS'
    WHEN jsonb_typeof(metrics) = 'null' THEN 'NULL METRICS'
    WHEN metrics = '{}'::jsonb THEN 'EMPTY METRICS'
    ELSE 'HAS METRICS'
  END as metrics_status
FROM evaluations
WHERE id IN (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002'
)
ORDER BY created_at;

-- 2. Check hallucination_prompts data
SELECT
  evaluation_id,
  COUNT(*) as total_rows,
  COUNT(DISTINCT pred_label) as unique_labels,
  COUNT(CASE WHEN pred_label = 'safe' THEN 1 END) as safe_count,
  COUNT(CASE WHEN pred_label = 'unsafe' THEN 1 END) as unsafe_count,
  ROUND(AVG(safety_score)::numeric, 4) as avg_safety_score,
  COUNT(DISTINCT violated_category) as unique_categories
FROM hallucination_prompts
WHERE evaluation_id IN (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002'
)
GROUP BY evaluation_id
ORDER BY evaluation_id;

-- 3. Check metrics JSON structure for Part 1
SELECT
  id,
  name,
  metrics->'safe_rate' as safe_rate,
  metrics->'hallucination_rate' as hallucination_rate,
  metrics->'avg_safety_score' as avg_safety_score,
  metrics->'total_tests' as total_tests,
  metrics->'safe_count' as safe_count,
  metrics->'unsafe_count' as unsafe_count
FROM evaluations
WHERE id = '00000000-0000-0000-0000-000000000001';

-- 4. Check by_category breakdown for Part 1
SELECT
  id,
  name,
  jsonb_pretty(metrics->'by_category') as category_breakdown
FROM evaluations
WHERE id = '00000000-0000-0000-0000-000000000001';

-- 5. Sample hallucination_prompts data
SELECT
  evaluation_id,
  prompt_index,
  LEFT(base_prompt, 50) as prompt_preview,
  pred_label,
  violated_category,
  safety_score
FROM hallucination_prompts
WHERE evaluation_id = '00000000-0000-0000-0000-000000000001'
ORDER BY prompt_index
LIMIT 10;
