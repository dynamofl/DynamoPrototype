-- Move compliance_rate and violation_rate inside nested ai_system objects
-- Migration: 20250123000010_nest_compliance_violation_rates
-- Purpose: Include compliance_rate and violation_rate in both ai_system and ai_system_with_guardrails

CREATE OR REPLACE FUNCTION calculate_compliance_metrics(eval_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_tp INTEGER;
  v_tn INTEGER;
  v_fp INTEGER;
  v_fn INTEGER;
  v_total INTEGER;
  v_accuracy DECIMAL(5, 4);
  v_precision DECIMAL(5, 4);
  v_recall DECIMAL(5, 4);
  v_f1_score DECIMAL(5, 4);
  v_compliance_rate DECIMAL(5, 2);
  v_violation_rate DECIMAL(5, 2);
  v_unique_topics INTEGER;
  v_unique_policies INTEGER;
  v_ai_system_metrics JSONB;
  v_ai_system_with_guardrails_metrics JSONB;
BEGIN
  -- Count outcomes from compliance_prompts table
  SELECT
    COUNT(*) FILTER (WHERE final_outcome = 'TP') AS tp,
    COUNT(*) FILTER (WHERE final_outcome = 'TN') AS tn,
    COUNT(*) FILTER (WHERE final_outcome = 'FP') AS fp,
    COUNT(*) FILTER (WHERE final_outcome = 'FN') AS fn,
    COUNT(*) AS total
  INTO v_tp, v_tn, v_fp, v_fn, v_total
  FROM compliance_prompts
  WHERE evaluation_id = eval_id;

  -- If no prompts found, return minimal structure
  IF v_total = 0 THEN
    RETURN jsonb_build_object(
      'unique_topics', 0,
      'unique_policies', 0,
      'ai_system', jsonb_build_object(
        'compliance_rate', 0,
        'violation_rate', 0,
        'tp', 0, 'tn', 0, 'fp', 0, 'fn', 0,
        'accuracy', 0, 'precision', 0, 'recall', 0, 'f1_score', 0
      ),
      'ai_system_with_guardrails', jsonb_build_object(
        'compliance_rate', 0,
        'violation_rate', 0,
        'tp', 0, 'tn', 0, 'fp', 0, 'fn', 0,
        'accuracy', 0, 'precision', 0, 'recall', 0, 'f1_score', 0
      )
    );
  END IF;

  -- Calculate accuracy = (TP + TN) / Total
  v_accuracy := (v_tp + v_tn)::DECIMAL / v_total;

  -- Calculate precision = TP / (TP + FP)
  IF (v_tp + v_fp) > 0 THEN
    v_precision := v_tp::DECIMAL / (v_tp + v_fp);
  ELSE
    v_precision := 0;
  END IF;

  -- Calculate recall = TP / (TP + FN)
  IF (v_tp + v_fn) > 0 THEN
    v_recall := v_tp::DECIMAL / (v_tp + v_fn);
  ELSE
    v_recall := 0;
  END IF;

  -- Calculate F1 score = 2 * (Precision * Recall) / (Precision + Recall)
  IF (v_precision + v_recall) > 0 THEN
    v_f1_score := 2 * (v_precision * v_recall) / (v_precision + v_recall);
  ELSE
    v_f1_score := 0;
  END IF;

  -- Calculate compliance rate (same as accuracy, as percentage)
  v_compliance_rate := ROUND(v_accuracy * 100, 2);
  v_violation_rate := ROUND((1 - v_accuracy) * 100, 2);

  -- Get unique topics count
  SELECT COUNT(DISTINCT topic) INTO v_unique_topics
  FROM compliance_prompts
  WHERE evaluation_id = eval_id AND topic IS NOT NULL;

  -- Get unique policies count
  SELECT COUNT(DISTINCT policy_id) INTO v_unique_policies
  FROM compliance_prompts
  WHERE evaluation_id = eval_id AND policy_id IS NOT NULL;

  -- Build AI system metrics with compliance/violation rates included
  v_ai_system_metrics := jsonb_build_object(
    'compliance_rate', v_compliance_rate,
    'violation_rate', v_violation_rate,
    'tp', v_tp,
    'tn', v_tn,
    'fp', v_fp,
    'fn', v_fn,
    'accuracy', ROUND(v_accuracy, 4),
    'precision', ROUND(v_precision, 4),
    'recall', ROUND(v_recall, 4),
    'f1_score', ROUND(v_f1_score, 4)
  );

  -- Build AI system + guardrails metrics (currently same as AI-only)
  -- NOTE: When guardrails are added to compliance tests, this will calculate
  -- separate outcomes considering guardrail evaluations
  v_ai_system_with_guardrails_metrics := jsonb_build_object(
    'compliance_rate', v_compliance_rate,
    'violation_rate', v_violation_rate,
    'tp', v_tp,
    'tn', v_tn,
    'fp', v_fp,
    'fn', v_fn,
    'accuracy', ROUND(v_accuracy, 4),
    'precision', ROUND(v_precision, 4),
    'recall', ROUND(v_recall, 4),
    'f1_score', ROUND(v_f1_score, 4)
  );

  -- Return full metrics JSONB with nested structure
  -- No top-level compliance_rate/violation_rate - only in nested objects
  RETURN jsonb_build_object(
    'unique_topics', v_unique_topics,
    'unique_policies', v_unique_policies,
    'ai_system', v_ai_system_metrics,
    'ai_system_with_guardrails', v_ai_system_with_guardrails_metrics
  );
END;
$$ LANGUAGE plpgsql;

-- Re-run backfill to update existing evaluations with new nested structure
UPDATE evaluations
SET metrics = calculate_compliance_metrics(id),
    updated_at = NOW()
WHERE status = 'completed'
  AND (config->>'testType' = 'compliance' OR evaluation_type = 'compliance');

-- Log the number of evaluations updated
DO $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM evaluations
  WHERE status = 'completed'
    AND (config->>'testType' = 'compliance' OR evaluation_type = 'compliance')
    AND metrics->'ai_system' ? 'compliance_rate'; -- Check if new field exists

  RAISE NOTICE 'Updated % compliance evaluations with nested compliance/violation rates', v_count;
END $$;

-- Update comment
COMMENT ON FUNCTION calculate_compliance_metrics(UUID) IS
  'Calculates comprehensive compliance metrics from compliance_prompts table.
   Returns JSONB with nested structure:
   - unique_topics, unique_policies (top level)
   - ai_system: { compliance_rate, violation_rate, tp, tn, fp, fn, accuracy, precision, recall, f1_score }
   - ai_system_with_guardrails: { compliance_rate, violation_rate, tp, tn, fp, fn, accuracy, precision, recall, f1_score }
   Both nested objects now include their own compliance_rate and violation_rate.
   Currently both have same values until guardrails are implemented for compliance.';
