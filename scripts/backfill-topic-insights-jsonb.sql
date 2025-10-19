-- Backfill topic_insight inside topic_analysis JSONB for existing completed evaluations
-- This script generates AI-powered insights from existing topic_analysis data
--
-- IMPORTANT: This script provides a TEMPLATE for backfilling.
-- For automated backfilling, use: npx tsx scripts/backfill-topic-insights.ts
-- Usage: npx tsx scripts/backfill-topic-insights.ts <provider> <model> <apiKey>
-- Example: npx tsx scripts/backfill-topic-insights.ts OpenAI gpt-4o sk-proj-...

-- ============================================================================
-- STEP 1: Identify evaluations that need topic insights
-- ============================================================================

-- Find all completed evaluations with topic_analysis but no topic_insight
SELECT
  id,
  name,
  created_at,
  completed_at,
  topic_analysis
FROM evaluations
WHERE status = 'completed'
  AND topic_analysis IS NOT NULL
  AND (topic_analysis->>'topic_insight') IS NULL
ORDER BY completed_at DESC;

-- Count how many need backfilling
SELECT COUNT(*) as evaluations_needing_insights
FROM evaluations
WHERE status = 'completed'
  AND topic_analysis IS NOT NULL
  AND (topic_analysis->>'topic_insight') IS NULL;

-- ============================================================================
-- STEP 2: Extract topic statistics for manual analysis
-- ============================================================================

-- This query extracts topic statistics in a readable format
WITH topic_stats AS (
  SELECT
    e.id as evaluation_id,
    e.name as evaluation_name,
    p.value->>'id' as policy_id,
    p.value->>'policy_name' as policy_name,
    t.value->>'topic_name' as topic_name,
    (t.value->'attack_success_rate'->>'mean')::numeric as attack_success_rate_mean,
    (t.value->'attack_success_rate'->>'std_dev')::numeric as attack_success_rate_std_dev,
    (t.value->'confidence'->>'mean')::numeric as confidence_mean,
    (t.value->'confidence'->'range'->>'min')::numeric as confidence_min,
    (t.value->'confidence'->'range'->>'max')::numeric as confidence_max,
    (t.value->'runtime_seconds'->>'mean')::numeric as runtime_seconds_mean,
    (t.value->'output_tokens'->>'mean')::numeric as output_tokens_mean,
    (t.value->>'occurrence')::integer as occurrence,
    (t.value->'logistic_regression'->>'significance')::boolean as is_significant,
    (t.value->'logistic_regression'->>'p_value')::numeric as p_value,
    (t.value->'logistic_regression'->>'odds_ratio')::numeric as odds_ratio
  FROM evaluations e,
    jsonb_array_elements(e.topic_analysis->'source'->'policies') p,
    jsonb_array_elements(p.value->'topics') t
  WHERE e.status = 'completed'
    AND e.topic_analysis IS NOT NULL
    AND (e.topic_analysis->>'topic_insight') IS NULL
)
SELECT
  evaluation_id,
  evaluation_name,
  policy_name,
  topic_name,
  ROUND(attack_success_rate_mean, 2) as attack_success_rate,
  ROUND(attack_success_rate_std_dev, 2) as std_dev,
  ROUND(confidence_mean, 4) as confidence,
  ROUND(runtime_seconds_mean, 2) as runtime_seconds,
  output_tokens_mean as output_tokens,
  occurrence,
  is_significant,
  ROUND(p_value, 4) as p_value,
  ROUND(odds_ratio, 4) as odds_ratio
FROM topic_stats
ORDER BY evaluation_id, policy_name, topic_name;

-- ============================================================================
-- STEP 3: Manual update template (JSONB version)
-- ============================================================================

-- After getting insights from an AI model, use this template to update
-- Replace <evaluation_id> and <generated_insight_text> with actual values

-- Example:
-- UPDATE evaluations
-- SET topic_analysis = jsonb_set(
--   topic_analysis,
--   '{topic_insight}',
--   '"Higher attack success rates (80% for Legal Requirements) correlate with longer response outputs (mean: 287 tokens) and maintained confidence levels (0.88), suggesting the model confidently produces detailed answers even when jailbroken. Three of five topics show statistically significant vulnerabilities (p<0.05) with Legal Action and Legal Compliance at 60% success rates."'::jsonb
-- )
-- WHERE id = '<evaluation_id>';

-- ============================================================================
-- STEP 4: Verify backfill results
-- ============================================================================

-- Check how many evaluations now have topic_insight
SELECT
  COUNT(*) FILTER (WHERE (topic_analysis->>'topic_insight') IS NOT NULL) as with_insights,
  COUNT(*) FILTER (WHERE (topic_analysis->>'topic_insight') IS NULL) as without_insights,
  COUNT(*) as total
FROM evaluations
WHERE status = 'completed'
  AND topic_analysis IS NOT NULL;

-- View recent backfilled insights
SELECT
  id,
  name,
  LEFT(topic_analysis->>'topic_insight', 150) || '...' as insight_preview,
  completed_at
FROM evaluations
WHERE (topic_analysis->>'topic_insight') IS NOT NULL
ORDER BY completed_at DESC
LIMIT 10;

-- View full structure of an evaluation with insights
SELECT
  id,
  name,
  jsonb_pretty(topic_analysis) as topic_analysis_with_insight
FROM evaluations
WHERE (topic_analysis->>'topic_insight') IS NOT NULL
LIMIT 1;

-- ============================================================================
-- RECOMMENDED: Use TypeScript script for automated backfill
-- ============================================================================

-- For automated backfilling with AI model integration, run:
--
-- npx tsx scripts/backfill-topic-insights.ts OpenAI gpt-4o sk-proj-YOUR_API_KEY
-- or
-- npx tsx scripts/backfill-topic-insights.ts Anthropic claude-3-5-sonnet-20241022 sk-ant-YOUR_API_KEY
--
-- This will:
-- 1. Find all evaluations needing insights
-- 2. Generate prompts automatically
-- 3. Call the AI model
-- 4. Update topic_analysis JSONB with the insights
-- 5. Provide progress tracking and error handling
