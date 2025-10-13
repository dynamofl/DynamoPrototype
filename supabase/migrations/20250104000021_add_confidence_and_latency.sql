-- Add confidence score and latency metrics to evaluation system
-- Migration: 20250104000021_add_confidence_and_latency

-- This migration extends the existing JSONB columns to include:
-- 1. confidenceScore: 0-1 value from logprobs (OpenAI) or null (other providers)
-- 2. latencyMs: Response time in milliseconds for each LLM operation

-- Note: No schema changes needed! We're using existing JSONB columns.
-- This migration serves as documentation of the new structure.

-- ============================================================================
-- STRUCTURE DOCUMENTATION
-- ============================================================================

-- input_guardrail JSONB structure (extended):
-- {
--   "judgement": "Allowed" | "Blocked",
--   "reason": "string",
--   "latencyMs": number | null,           -- NEW: Total time for all input guardrails
--   "confidenceScore": number | null,     -- NEW: Average confidence across guardrails
--   "details": [
--     {
--       "guardrailId": "uuid",
--       "guardrailName": "string",
--       "judgement": "Allowed" | "Blocked",
--       "reason": "string",
--       "violations": [...],
--       "latencyMs": number | null,        -- NEW: Individual guardrail latency
--       "confidenceScore": number | null   -- NEW: Individual guardrail confidence
--     }
--   ]
-- }

-- output_guardrail JSONB structure (extended):
-- {
--   "judgement": "Allowed" | "Blocked",
--   "reason": "string",
--   "latencyMs": number | null,           -- NEW: Total time for all output guardrails
--   "confidenceScore": number | null,     -- NEW: Average confidence across guardrails
--   "details": [
--     {
--       "guardrailId": "uuid",
--       "guardrailName": "string",
--       "judgement": "Allowed" | "Blocked",
--       "reason": "string",
--       "violations": [...],
--       "latencyMs": number | null,        -- NEW: Individual guardrail latency
--       "confidenceScore": number | null   -- NEW: Individual guardrail confidence
--     }
--   ]
-- }

-- ai_system_response JSONB structure (extended):
-- {
--   "content": "string",
--   "judgement": "Answered" | "Refused" | null,
--   "reason": "string" | null,
--   "outputTokens": number | null,
--   "confidenceScore": number | null,     -- NEW: Confidence in AI system response
--   "latencyMs": number | null            -- NEW: AI system response time (duplicate of runtime_ms for consistency)
-- }

-- ============================================================================
-- CONFIDENCE SCORE CALCULATION
-- ============================================================================

-- For OpenAI models with logprobs enabled:
--   1. Extract logprobs array from API response
--   2. Calculate: avgLogprob = sum(logprobs) / count(logprobs)
--   3. Convert: confidenceScore = exp(avgLogprob)
--   4. Result: Value between 0 and 1 (0 = no confidence, 1 = full confidence)
--
-- For Anthropic/Custom models:
--   confidenceScore = null (not supported)

-- ============================================================================
-- LATENCY TRACKING
-- ============================================================================

-- latencyMs measures:
--   - Input guardrails: Total time to evaluate all input guardrails
--   - Output guardrails: Total time to evaluate all output guardrails
--   - Judge model: Time for judge model to evaluate (stored in ai_system_response)
--   - AI system: Already tracked in runtime_ms column at row level

-- ============================================================================
-- EXAMPLE QUERIES
-- ============================================================================

-- Query 1: Get average confidence scores by guardrail judgement
-- SELECT
--   input_guardrail->>'judgement' as judgement,
--   AVG((input_guardrail->>'confidenceScore')::float) as avg_confidence
-- FROM evaluation_prompts
-- WHERE input_guardrail->>'confidenceScore' IS NOT NULL
-- GROUP BY input_guardrail->>'judgement';

-- Query 2: Find slow guardrail evaluations (> 1 second)
-- SELECT
--   id,
--   input_guardrail->>'latencyMs' as input_latency,
--   output_guardrail->>'latencyMs' as output_latency
-- FROM evaluation_prompts
-- WHERE (input_guardrail->>'latencyMs')::int > 1000
--    OR (output_guardrail->>'latencyMs')::int > 1000;

-- Query 3: Get per-guardrail performance metrics
-- SELECT
--   detail->>'guardrailName' as guardrail_name,
--   AVG((detail->>'latencyMs')::int) as avg_latency,
--   AVG((detail->>'confidenceScore')::float) as avg_confidence
-- FROM evaluation_prompts,
--      jsonb_array_elements(input_guardrail->'details') as detail
-- WHERE detail->>'latencyMs' IS NOT NULL
-- GROUP BY detail->>'guardrailName';

-- Query 4: Find low-confidence decisions (confidence < 0.5)
-- SELECT
--   id,
--   ai_system_response->>'confidenceScore' as confidence,
--   ai_system_response->>'judgement' as judgement,
--   ai_system_response->>'content' as response
-- FROM evaluation_prompts
-- WHERE (ai_system_response->>'confidenceScore')::float < 0.5;

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Add GIN indexes for efficient JSONB queries on new fields
CREATE INDEX IF NOT EXISTS idx_eval_prompts_input_confidence
  ON evaluation_prompts((input_guardrail->>'confidenceScore'));

CREATE INDEX IF NOT EXISTS idx_eval_prompts_output_confidence
  ON evaluation_prompts((output_guardrail->>'confidenceScore'));

CREATE INDEX IF NOT EXISTS idx_eval_prompts_ai_confidence
  ON evaluation_prompts((ai_system_response->>'confidenceScore'));

CREATE INDEX IF NOT EXISTS idx_eval_prompts_input_latency
  ON evaluation_prompts((input_guardrail->>'latencyMs'));

CREATE INDEX IF NOT EXISTS idx_eval_prompts_output_latency
  ON evaluation_prompts((output_guardrail->>'latencyMs'));

-- Add comment documenting the new fields
COMMENT ON COLUMN evaluation_prompts.input_guardrail IS
'Input guardrail evaluation with metrics: {judgement, reason, latencyMs, confidenceScore, details[{guardrailId, guardrailName, judgement, reason, violations, latencyMs, confidenceScore}]}';

COMMENT ON COLUMN evaluation_prompts.output_guardrail IS
'Output guardrail evaluation with metrics: {judgement, reason, latencyMs, confidenceScore, details[{guardrailId, guardrailName, judgement, reason, violations, latencyMs, confidenceScore}]}';

COMMENT ON COLUMN evaluation_prompts.ai_system_response IS
'AI system response with judge evaluation and metrics: {content, judgement, reason, outputTokens, confidenceScore, latencyMs}';
