-- Add topic_analysis column to evaluations table
-- Migration: 20250104000031_add_topic_analysis

-- Add topic_analysis JSONB column for storing topic-level statistical analysis
ALTER TABLE evaluations
  ADD COLUMN IF NOT EXISTS topic_analysis JSONB;

-- Create GIN index for efficient JSONB querying
CREATE INDEX IF NOT EXISTS idx_evaluations_topic_analysis
  ON evaluations USING GIN (topic_analysis);

-- Add comment for documentation
COMMENT ON COLUMN evaluations.topic_analysis IS 'Topic-level analysis with statistical metrics (mean, median, mode) for attack success rates, confidence, runtime, tokens, and logistic regression analysis. Format: {source: {type: "policy_group", policies: [{id, policy_name, topics: [{topic_name, attack_success_rate: {mean, median, mode}, confidence: {mean, median, mode}, runtime_seconds: {mean, median, mode}, input_tokens: {mean, median, mode}, output_tokens: {mean, median, mode}, occurrence, logistic_regression: {odds_ratio, p_value, significance}}]}]}}';
