-- Migration: Add Compliance Test Type Support
-- Creates compliance_prompts table and renames evaluation_prompts to jailbreak_prompts

-- 1. Create compliance_prompts table
CREATE TABLE compliance_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evaluation_id UUID REFERENCES evaluations(id) ON DELETE CASCADE NOT NULL,

  -- Prompt details
  prompt_index INTEGER NOT NULL,
  policy_id TEXT,
  policy_name TEXT,
  topic TEXT,
  prompt_title TEXT,

  -- Base prompt and variations
  base_prompt TEXT NOT NULL,           -- Original prompt (grouping identifier)
  actual_prompt TEXT NOT NULL,         -- Prompt actually sent to AI (base or perturbed)
  perturbation_type TEXT,              -- NULL for base, or 'typos', 'casing', 'synonyms', etc.

  -- Ground truth (set during prompt generation)
  ground_truth TEXT NOT NULL           -- 'Compliant' or 'Non-Compliant'
    CHECK (ground_truth IN ('Compliant', 'Non-Compliant')),
  behavior_type TEXT NOT NULL          -- 'Allowed' or 'Disallowed'
    CHECK (behavior_type IN ('Allowed', 'Disallowed')),
  behavior_used TEXT,                  -- Specific behavior text that was used
  behavior_phrases JSONB,              -- {phrases: ["phrase1", "phrase2"], positions: [start, end]}

  -- Execution
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'running', 'completed', 'failed')),

  -- Results
  system_response TEXT,
  compliance_judgement TEXT,           -- Judge's determination (complied/blocked)
  final_outcome TEXT                   -- 'TP', 'TN', 'FP', 'FN'
    CHECK (final_outcome IN ('TP', 'TN', 'FP', 'FN', NULL)),

  -- Policy context
  policy_context JSONB,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT
);

-- Indexes for compliance_prompts
CREATE INDEX idx_compliance_prompts_evaluation ON compliance_prompts(evaluation_id);
CREATE INDEX idx_compliance_prompts_status ON compliance_prompts(evaluation_id, status);
CREATE INDEX idx_compliance_prompts_index ON compliance_prompts(evaluation_id, prompt_index);
CREATE INDEX idx_compliance_prompts_base ON compliance_prompts(evaluation_id, base_prompt);
CREATE INDEX idx_compliance_prompts_outcome ON compliance_prompts(evaluation_id, final_outcome);

-- 2. Rename evaluation_prompts to jailbreak_prompts
ALTER TABLE evaluation_prompts RENAME TO jailbreak_prompts;

-- 3. Rename indexes for jailbreak_prompts
ALTER INDEX idx_eval_prompts_evaluation RENAME TO idx_jailbreak_prompts_evaluation;
ALTER INDEX idx_eval_prompts_status RENAME TO idx_jailbreak_prompts_status;
ALTER INDEX idx_eval_prompts_index RENAME TO idx_jailbreak_prompts_index;

-- 4. Drop transformation_type column from jailbreak_prompts
-- This column is no longer needed since we now have separate tables for different test types
ALTER TABLE jailbreak_prompts DROP COLUMN IF EXISTS transformation_type;

-- 5. Enable RLS for compliance_prompts
ALTER TABLE compliance_prompts ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies for compliance_prompts (similar to jailbreak_prompts)
CREATE POLICY "Allow anonymous to insert compliance prompts"
  ON compliance_prompts FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anonymous to select compliance prompts"
  ON compliance_prompts FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anonymous to update compliance prompts"
  ON compliance_prompts FOR UPDATE
  TO anon
  USING (true);

-- 7. Update evaluation_logs to support polymorphic prompt references
-- Add prompt_type column to indicate which table prompt_id references
ALTER TABLE evaluation_logs ADD COLUMN IF NOT EXISTS prompt_type TEXT
  CHECK (prompt_type IN ('jailbreak', 'compliance', NULL));

-- Drop the old foreign key constraint if it exists
-- This allows prompt_id to reference either jailbreak_prompts or compliance_prompts
ALTER TABLE evaluation_logs DROP CONSTRAINT IF EXISTS evaluation_logs_prompt_id_fkey;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_evaluation_logs_prompt
  ON evaluation_logs(prompt_id, prompt_type);

-- Update existing logs to have prompt_type = 'jailbreak' (backward compatibility)
UPDATE evaluation_logs SET prompt_type = 'jailbreak' WHERE prompt_id IS NOT NULL AND prompt_type IS NULL;

-- 8. Add comments for documentation
COMMENT ON TABLE compliance_prompts IS 'Stores compliance test prompts with ground truth and perturbation variations';
COMMENT ON COLUMN compliance_prompts.base_prompt IS 'Original prompt before perturbations - used as grouping identifier';
COMMENT ON COLUMN compliance_prompts.actual_prompt IS 'The actual prompt sent to the AI (either base or perturbed version)';
COMMENT ON COLUMN compliance_prompts.perturbation_type IS 'Type of perturbation applied: NULL (base), typos, casing, synonyms, leetspeak';
COMMENT ON COLUMN compliance_prompts.ground_truth IS 'Expected outcome: Compliant (should respond) or Non-Compliant (should block)';
COMMENT ON COLUMN compliance_prompts.behavior_type IS 'Source behavior: Allowed (generates Compliant) or Disallowed (generates Non-Compliant)';
COMMENT ON COLUMN compliance_prompts.final_outcome IS 'TP (True Positive), TN (True Negative), FP (False Positive), FN (False Negative)';

COMMENT ON COLUMN evaluation_logs.prompt_type IS 'Indicates which table prompt_id references: jailbreak or compliance';
