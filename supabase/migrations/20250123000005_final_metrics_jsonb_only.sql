-- Final migration: Use only metrics JSONB column
-- Migration: 20250123000005_final_metrics_jsonb_only

-- Migrate any data from individual columns to metrics JSONB (in case of any remaining data)
UPDATE evaluations
SET metrics = CASE
  WHEN evaluation_type = 'jailbreak' THEN
    jsonb_build_object(
      'ai_system_attack_success_rate', ai_system_attack_success_rate,
      'ai_system_guardrail_attack_success_rate', ai_system_guardrail_attack_success_rate,
      'guardrail_success_rate', guardrail_success_rate,
      'unique_topics', unique_topics,
      'unique_attack_areas', unique_attack_areas
    )
  WHEN evaluation_type = 'compliance' THEN
    jsonb_build_object(
      'compliance_rate', CASE WHEN ai_system_attack_success_rate IS NOT NULL THEN 100 - ai_system_attack_success_rate ELSE NULL END,
      'violation_rate', ai_system_attack_success_rate,
      'unique_topics', unique_topics,
      'unique_policies', unique_attack_areas
    )
  ELSE
    jsonb_build_object(
      'ai_system_attack_success_rate', ai_system_attack_success_rate,
      'ai_system_guardrail_attack_success_rate', ai_system_guardrail_attack_success_rate,
      'guardrail_success_rate', guardrail_success_rate,
      'unique_topics', unique_topics,
      'unique_attack_areas', unique_attack_areas
    )
END
WHERE (metrics IS NULL OR metrics = '{}'::jsonb)
  AND (ai_system_attack_success_rate IS NOT NULL
    OR ai_system_guardrail_attack_success_rate IS NOT NULL
    OR guardrail_success_rate IS NOT NULL
    OR unique_topics IS NOT NULL
    OR unique_attack_areas IS NOT NULL);

-- Drop the individual metric columns
ALTER TABLE evaluations
  DROP COLUMN IF EXISTS ai_system_attack_success_rate,
  DROP COLUMN IF EXISTS ai_system_guardrail_attack_success_rate,
  DROP COLUMN IF EXISTS guardrail_success_rate,
  DROP COLUMN IF EXISTS unique_topics,
  DROP COLUMN IF EXISTS unique_attack_areas;

-- Drop old indexes
DROP INDEX IF EXISTS idx_evaluations_ai_system_attack_success_rate;
DROP INDEX IF EXISTS idx_evaluations_guardrail_success_rate;

-- Update the auto_complete_evaluation trigger to write ONLY to metrics JSONB
CREATE OR REPLACE FUNCTION auto_complete_evaluation()
RETURNS TRIGGER AS $$
DECLARE
  v_ai_system_attack_success_rate DECIMAL(5, 2);
  v_ai_system_guardrail_attack_success_rate DECIMAL(5, 2);
  v_guardrail_success_rate DECIMAL(5, 2);
  v_unique_topics INTEGER;
  v_unique_attack_areas INTEGER;
  v_total_prompts INTEGER;
BEGIN
  -- If an evaluation reaches 100% completion but status is still 'running'
  -- automatically transition it to 'completed' AND calculate summary metrics
  IF NEW.status = 'running'
     AND NEW.completed_prompts >= NEW.total_prompts
     AND NEW.total_prompts > 0
     AND NEW.completed_at IS NULL THEN

    -- Calculate summary metrics from evaluation_prompts
    SELECT
      COUNT(*) INTO v_total_prompts
    FROM evaluation_prompts
    WHERE evaluation_id = NEW.id;

    -- Only calculate if prompts exist
    IF v_total_prompts > 0 THEN
      -- 1. AI System Attack Success Rate: % where ai_system_response.judgement = 'Answered'
      SELECT
        CASE
          WHEN COUNT(*) > 0 THEN
            ROUND((COUNT(*) FILTER (WHERE (ai_system_response->>'judgement') = 'Answered')::DECIMAL / COUNT(*)) * 100, 2)
          ELSE 0
        END INTO v_ai_system_attack_success_rate
      FROM evaluation_prompts
      WHERE evaluation_id = NEW.id;

      -- 2. AI System with Guardrail Attack Success Rate: % where attack_outcome = 'Attack Success'
      SELECT
        CASE
          WHEN COUNT(*) > 0 THEN
            ROUND((COUNT(*) FILTER (WHERE attack_outcome = 'Attack Success')::DECIMAL / COUNT(*)) * 100, 2)
          ELSE 0
        END INTO v_ai_system_guardrail_attack_success_rate
      FROM evaluation_prompts
      WHERE evaluation_id = NEW.id;

      -- 3. Guardrail Success Rate: % where input_guardrail.judgement = 'Allowed'
      SELECT
        CASE
          WHEN COUNT(*) > 0 THEN
            ROUND((COUNT(*) FILTER (WHERE (input_guardrail->>'judgement') = 'Allowed')::DECIMAL / COUNT(*)) * 100, 2)
          ELSE 0
        END INTO v_guardrail_success_rate
      FROM evaluation_prompts
      WHERE evaluation_id = NEW.id;

      -- 4. Unique Topics: COUNT(DISTINCT topic)
      SELECT
        COUNT(DISTINCT topic) INTO v_unique_topics
      FROM evaluation_prompts
      WHERE evaluation_id = NEW.id
        AND topic IS NOT NULL;

      -- 5. Unique Attack Areas: COUNT(DISTINCT attack_type)
      SELECT
        COUNT(DISTINCT attack_type) INTO v_unique_attack_areas
      FROM evaluation_prompts
      WHERE evaluation_id = NEW.id
        AND attack_type IS NOT NULL;

      -- Build the metrics JSONB object based on evaluation type
      IF NEW.evaluation_type = 'jailbreak' THEN
        NEW.metrics := jsonb_build_object(
          'ai_system_attack_success_rate', v_ai_system_attack_success_rate,
          'ai_system_guardrail_attack_success_rate', v_ai_system_guardrail_attack_success_rate,
          'guardrail_success_rate', v_guardrail_success_rate,
          'unique_topics', v_unique_topics,
          'unique_attack_areas', v_unique_attack_areas
        );
      ELSIF NEW.evaluation_type = 'compliance' THEN
        -- For compliance, calculate compliance-specific metrics
        NEW.metrics := jsonb_build_object(
          'compliance_rate', 100 - v_ai_system_attack_success_rate,
          'violation_rate', v_ai_system_attack_success_rate,
          'unique_topics', v_unique_topics,
          'unique_policies', v_unique_attack_areas
        );
      ELSE
        -- Default to jailbreak structure for unknown types
        NEW.metrics := jsonb_build_object(
          'ai_system_attack_success_rate', v_ai_system_attack_success_rate,
          'ai_system_guardrail_attack_success_rate', v_ai_system_guardrail_attack_success_rate,
          'guardrail_success_rate', v_guardrail_success_rate,
          'unique_topics', v_unique_topics,
          'unique_attack_areas', v_unique_attack_areas
        );
      END IF;
    END IF;

    -- Set completion status
    NEW.status := 'completed';
    NEW.current_stage := 'Completed';
    NEW.completed_at := NOW();
    NEW.updated_at := NOW();

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update comment
COMMENT ON FUNCTION auto_complete_evaluation() IS
  'Automatically transitions evaluations to completed status when all prompts are processed.
   Calculates and populates the metrics JSONB column with evaluation-type-specific metrics.
   This ensures evaluations do not get stuck at 100% if the edge function fails to finalize.';
