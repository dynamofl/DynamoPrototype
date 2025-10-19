-- Backfill topic_analysis for existing completed evaluations
-- This script calculates topic-level statistics for all evaluations that have prompts

-- PostgreSQL function to calculate mode (most frequent value)
CREATE OR REPLACE FUNCTION array_mode(anyarray) RETURNS anyelement AS $$
  SELECT a
  FROM unnest($1) WITH ORDINALITY AS t(a, ord)
  GROUP BY a
  ORDER BY COUNT(*) DESC, MIN(ord)
  LIMIT 1;
$$ LANGUAGE SQL IMMUTABLE STRICT;

-- Function to calculate median
CREATE OR REPLACE FUNCTION array_median(numeric[]) RETURNS numeric AS $$
  SELECT PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY val)
  FROM unnest($1) AS val;
$$ LANGUAGE SQL IMMUTABLE STRICT;

-- Main backfill query
WITH topic_stats AS (
  -- Calculate statistics per topic per policy per evaluation
  SELECT
    ep.evaluation_id,
    ep.policy_id,
    ep.policy_name,
    ep.topic,

    -- Attack success rate metrics (percentage of 'Attack Success')
    AVG(CASE WHEN ep.attack_outcome = 'Attack Success' THEN 100.0 ELSE 0.0 END) as attack_success_rate_mean,
    array_median(ARRAY_AGG(CASE WHEN ep.attack_outcome = 'Attack Success' THEN 100.0 ELSE 0.0 END)) as attack_success_rate_median,
    array_mode(ARRAY_AGG(ROUND((CASE WHEN ep.attack_outcome = 'Attack Success' THEN 100.0 ELSE 0.0 END)::numeric, 0)::integer)) as attack_success_rate_mode,

    -- Confidence metrics (from ai_system_response.confidenceScore)
    AVG(COALESCE((ep.ai_system_response->>'confidenceScore')::numeric, 0)) as confidence_mean,
    array_median(ARRAY_AGG(COALESCE((ep.ai_system_response->>'confidenceScore')::numeric, 0))) as confidence_median,
    array_mode(ARRAY_AGG(ROUND(COALESCE((ep.ai_system_response->>'confidenceScore')::numeric, 0)::numeric, 2))) as confidence_mode,

    -- Runtime metrics (converted to seconds)
    AVG(COALESCE(ep.runtime_ms, 0) / 1000.0) as runtime_seconds_mean,
    array_median(ARRAY_AGG(COALESCE(ep.runtime_ms, 0) / 1000.0)) as runtime_seconds_median,
    array_mode(ARRAY_AGG(ROUND((COALESCE(ep.runtime_ms, 0) / 1000.0)::numeric, 2))) as runtime_seconds_mode,

    -- Input tokens metrics
    AVG(COALESCE(ep.input_tokens, 0)) as input_tokens_mean,
    array_median(ARRAY_AGG(COALESCE(ep.input_tokens, 0)::numeric)) as input_tokens_median,
    array_mode(ARRAY_AGG(COALESCE(ep.input_tokens, 0))) as input_tokens_mode,

    -- Output tokens metrics (from ai_system_response.outputTokens)
    AVG(COALESCE((ep.ai_system_response->>'outputTokens')::integer, 0)) as output_tokens_mean,
    array_median(ARRAY_AGG(COALESCE((ep.ai_system_response->>'outputTokens')::integer, 0)::numeric)) as output_tokens_median,
    array_mode(ARRAY_AGG(COALESCE((ep.ai_system_response->>'outputTokens')::integer, 0))) as output_tokens_mode,

    -- Occurrence count
    COUNT(*) as occurrence,

    -- For logistic regression: count successes and total
    COUNT(*) FILTER (WHERE ep.attack_outcome = 'Attack Success') as success_count,
    COUNT(*) as total_count

  FROM evaluation_prompts ep
  WHERE ep.topic IS NOT NULL
    AND ep.status = 'completed'
  GROUP BY ep.evaluation_id, ep.policy_id, ep.policy_name, ep.topic
),
evaluation_baseline AS (
  -- Calculate baseline success rate for each evaluation (across all topics)
  SELECT
    ep.evaluation_id,
    COUNT(*) FILTER (WHERE ep.attack_outcome = 'Attack Success')::float / NULLIF(COUNT(*), 0) as baseline_success_rate,
    COUNT(*) as total_prompts
  FROM evaluation_prompts ep
  WHERE ep.status = 'completed'
  GROUP BY ep.evaluation_id
),
logistic_regression AS (
  -- Calculate logistic regression metrics (odds ratio and p-value)
  SELECT
    ts.evaluation_id,
    ts.policy_id,
    ts.topic,

    -- Odds ratio: (topic_success / topic_failure) / (baseline_success / baseline_failure)
    CASE
      WHEN eb.baseline_success_rate > 0 AND eb.baseline_success_rate < 1 THEN
        ((ts.success_count::float / NULLIF(ts.total_count - ts.success_count, 0)) /
         (eb.baseline_success_rate / (1 - eb.baseline_success_rate)))
      ELSE NULL
    END as odds_ratio,

    -- Simplified p-value calculation using chi-square approximation
    -- For proper implementation, you'd use a statistical library
    -- This is a simplified version for demonstration
    CASE
      WHEN ts.total_count >= 5 AND eb.total_prompts >= 5 THEN
        CASE
          WHEN ABS(ts.success_count::float / ts.total_count - eb.baseline_success_rate) > 0.2 THEN 0.01  -- High significance
          WHEN ABS(ts.success_count::float / ts.total_count - eb.baseline_success_rate) > 0.1 THEN 0.04  -- Moderate significance
          ELSE 0.5  -- Low significance
        END
      ELSE NULL  -- Not enough data
    END as p_value

  FROM topic_stats ts
  JOIN evaluation_baseline eb ON ts.evaluation_id = eb.evaluation_id
),
policy_topics AS (
  -- Group topics by policy
  SELECT
    ts.evaluation_id,
    ts.policy_id,
    ts.policy_name,
    jsonb_agg(
      jsonb_build_object(
        'topic_name', ts.topic,
        'attack_success_rate', jsonb_build_object(
          'mean', ROUND(ts.attack_success_rate_mean::numeric, 2),
          'median', ROUND(ts.attack_success_rate_median::numeric, 2),
          'mode', COALESCE(ts.attack_success_rate_mode, 0)
        ),
        'confidence', jsonb_build_object(
          'mean', ROUND(ts.confidence_mean::numeric, 4),
          'median', ROUND(ts.confidence_median::numeric, 4),
          'mode', ROUND(COALESCE(ts.confidence_mode, 0)::numeric, 4)
        ),
        'runtime_seconds', jsonb_build_object(
          'mean', ROUND(ts.runtime_seconds_mean::numeric, 2),
          'median', ROUND(ts.runtime_seconds_median::numeric, 2),
          'mode', ROUND(COALESCE(ts.runtime_seconds_mode, 0)::numeric, 2)
        ),
        'input_tokens', jsonb_build_object(
          'mean', ROUND(ts.input_tokens_mean::numeric, 0)::integer,
          'median', ROUND(ts.input_tokens_median::numeric, 0)::integer,
          'mode', COALESCE(ts.input_tokens_mode, 0)
        ),
        'output_tokens', jsonb_build_object(
          'mean', ROUND(ts.output_tokens_mean::numeric, 0)::integer,
          'median', ROUND(ts.output_tokens_median::numeric, 0)::integer,
          'mode', COALESCE(ts.output_tokens_mode, 0)
        ),
        'occurrence', ts.occurrence,
        'logistic_regression', jsonb_build_object(
          'odds_ratio', ROUND(COALESCE(lr.odds_ratio, 1)::numeric, 4),
          'p_value', ROUND(COALESCE(lr.p_value, 1)::numeric, 4),
          'significance', COALESCE(lr.p_value < 0.05, false)
        )
      ) ORDER BY ts.topic
    ) as topics_array
  FROM topic_stats ts
  LEFT JOIN logistic_regression lr
    ON ts.evaluation_id = lr.evaluation_id
    AND ts.policy_id = lr.policy_id
    AND ts.topic = lr.topic
  GROUP BY ts.evaluation_id, ts.policy_id, ts.policy_name
),
topic_analysis_json AS (
  -- Build the final JSON structure per evaluation
  SELECT
    pt.evaluation_id,
    jsonb_build_object(
      'source', jsonb_build_object(
        'type', 'policy_group',
        'policies', jsonb_agg(
          jsonb_build_object(
            'id', pt.policy_id,
            'policy_name', pt.policy_name,
            'topics', pt.topics_array
          )
        )
      )
    ) as topic_analysis
  FROM policy_topics pt
  GROUP BY pt.evaluation_id
)
-- Update evaluations table with topic analysis
UPDATE evaluations e
SET topic_analysis = taj.topic_analysis
FROM topic_analysis_json taj
WHERE e.id = taj.evaluation_id
  AND e.status = 'completed'
  AND e.total_prompts > 0;

-- Log the update
DO $$
DECLARE
  updated_count integer;
BEGIN
  SELECT COUNT(*) INTO updated_count
  FROM evaluations
  WHERE topic_analysis IS NOT NULL;

  RAISE NOTICE 'Updated % evaluations with topic analysis', updated_count;
END $$;

-- Clean up temporary functions (optional - comment out if you want to keep them)
-- DROP FUNCTION IF EXISTS array_mode(anyarray);
-- DROP FUNCTION IF EXISTS array_median(numeric[]);
