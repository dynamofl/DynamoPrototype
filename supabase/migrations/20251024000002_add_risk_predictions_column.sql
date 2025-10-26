-- Add risk_predictions JSONB column to evaluations table
-- This stores individual risk predictions for topics, attack types, attack levels, and policies

ALTER TABLE evaluations
ADD COLUMN IF NOT EXISTS risk_predictions JSONB;

COMMENT ON COLUMN evaluations.risk_predictions IS 'Individual risk predictions using logistic regression for topics, attack types, attack levels, and policies. Structure: { by_topic: [], by_attack_type: [], by_attack_level: [], by_policy: [], total_topics: number, total_attack_types: number, total_attack_levels: number, total_policies: number }';
