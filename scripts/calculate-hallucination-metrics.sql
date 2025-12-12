-- Calculate and Update Hallucination Evaluation Metrics
-- Run this script after importing hallucination_prompts CSV data
-- This will populate the metrics JSONB column in the evaluations table

-- Function to calculate metrics for a specific hallucination evaluation
CREATE OR REPLACE FUNCTION calculate_hallucination_metrics(eval_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_total_tests INTEGER;
  v_safe_count INTEGER;
  v_unsafe_count INTEGER;
  v_safe_rate DECIMAL;
  v_hallucination_rate DECIMAL;
  v_avg_safety_score DECIMAL;
  v_unique_topics INTEGER;
  v_unique_categories INTEGER;
  v_unique_policies INTEGER;
  v_high_confidence INTEGER;
  v_medium_confidence INTEGER;
  v_low_confidence INTEGER;
  v_by_category JSONB;
  v_metrics JSONB;
BEGIN
  -- Get total counts
  SELECT
    COUNT(*),
    COUNT(*) FILTER (WHERE pred_label = 'safe'),
    COUNT(*) FILTER (WHERE pred_label = 'unsafe')
  INTO v_total_tests, v_safe_count, v_unsafe_count
  FROM hallucination_prompts
  WHERE evaluation_id = eval_id;

  -- Calculate rates
  IF v_total_tests > 0 THEN
    v_safe_rate := ROUND((v_safe_count::DECIMAL / v_total_tests) * 100, 2);
    v_hallucination_rate := ROUND((v_unsafe_count::DECIMAL / v_total_tests) * 100, 2);
  ELSE
    v_safe_rate := 0;
    v_hallucination_rate := 0;
  END IF;

  -- Calculate average safety score
  SELECT ROUND(AVG(safety_score)::DECIMAL, 4)
  INTO v_avg_safety_score
  FROM hallucination_prompts
  WHERE evaluation_id = eval_id;

  -- Calculate unique dimensions
  SELECT
    COUNT(DISTINCT topic),
    COUNT(DISTINCT violated_category),
    COUNT(DISTINCT policy_id)
  INTO v_unique_topics, v_unique_categories, v_unique_policies
  FROM hallucination_prompts
  WHERE evaluation_id = eval_id;

  -- Calculate safety score distribution
  SELECT
    COUNT(*) FILTER (WHERE safety_score >= 0.8),
    COUNT(*) FILTER (WHERE safety_score >= 0.5 AND safety_score < 0.8),
    COUNT(*) FILTER (WHERE safety_score < 0.5)
  INTO v_high_confidence, v_medium_confidence, v_low_confidence
  FROM hallucination_prompts
  WHERE evaluation_id = eval_id;

  -- Build category breakdown
  SELECT jsonb_object_agg(
    violated_category,
    jsonb_build_object(
      'count', category_count,
      'percentage', category_percentage,
      'avg_safety_score', category_avg_score
    )
  )
  INTO v_by_category
  FROM (
    SELECT
      violated_category,
      COUNT(*) as category_count,
      ROUND((COUNT(*)::DECIMAL / v_total_tests) * 100, 2) as category_percentage,
      ROUND(AVG(safety_score)::DECIMAL, 4) as category_avg_score
    FROM hallucination_prompts
    WHERE evaluation_id = eval_id
    GROUP BY violated_category
  ) category_stats;

  -- Build complete metrics JSON
  v_metrics := jsonb_build_object(
    'safe_rate', v_safe_rate,
    'hallucination_rate', v_hallucination_rate,
    'avg_safety_score', COALESCE(v_avg_safety_score, 0),
    'total_tests', v_total_tests,
    'safe_count', v_safe_count,
    'unsafe_count', v_unsafe_count,
    'unique_topics', v_unique_topics,
    'unique_categories', v_unique_categories,
    'unique_policies', v_unique_policies,
    'safety_score_distribution', jsonb_build_object(
      'high_confidence', v_high_confidence,
      'medium_confidence', v_medium_confidence,
      'low_confidence', v_low_confidence
    ),
    'by_category', COALESCE(v_by_category, '{}'::jsonb)
  );

  RETURN v_metrics;
END;
$$ LANGUAGE plpgsql;

-- Update metrics for all hallucination evaluations
-- This finds all completed hallucination evaluations and calculates their metrics
DO $$
DECLARE
  eval_record RECORD;
  calculated_metrics JSONB;
BEGIN
  FOR eval_record IN
    SELECT id, name
    FROM evaluations
    WHERE evaluation_type = 'hallucination'
    AND status = 'completed'
  LOOP
    -- Calculate metrics
    calculated_metrics := calculate_hallucination_metrics(eval_record.id);

    -- Update the evaluation record
    UPDATE evaluations
    SET
      metrics = calculated_metrics,
      updated_at = NOW()
    WHERE id = eval_record.id;

    RAISE NOTICE 'Updated metrics for evaluation: % (ID: %)', eval_record.name, eval_record.id;
  END LOOP;
END $$;

-- Verification: Show calculated metrics for all hallucination evaluations
SELECT
  e.id,
  e.name,
  e.evaluation_type,
  e.total_prompts,
  e.completed_prompts,
  e.metrics->'safe_rate' as safe_rate,
  e.metrics->'hallucination_rate' as hallucination_rate,
  e.metrics->'avg_safety_score' as avg_safety_score,
  e.metrics->'unique_topics' as unique_topics,
  e.metrics->'by_category' as category_breakdown
FROM evaluations e
WHERE e.evaluation_type = 'hallucination'
ORDER BY e.created_at DESC;

-- Optional: Clean up the helper function if you don't need it anymore
-- DROP FUNCTION IF EXISTS calculate_hallucination_metrics(UUID);
