-- Create hallucination_prompts table for hallucination detection evaluations
-- This table follows the same pattern as jailbreak_prompts and compliance_prompts
-- but includes hallucination-specific fields (context, pred_label, violated_category, safety_score)

CREATE TABLE hallucination_prompts (
  -- Primary key and references
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evaluation_id UUID NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  prompt_index INTEGER NOT NULL,

  -- Common fields (same pattern as other prompt tables)
  policy_id VARCHAR(255),
  policy_name VARCHAR(500),
  topic VARCHAR(255),
  prompt_title VARCHAR(500),
  policy_context JSONB,
  behavior_type VARCHAR(50) DEFAULT 'Allowed',

  -- Core content fields
  base_prompt TEXT NOT NULL,          -- The question/query
  context TEXT NOT NULL,              -- Reference/source content (ground truth for factual accuracy)
  response TEXT,                      -- AI's response to evaluate

  -- Hallucination-specific evaluation results
  pred_label VARCHAR(50),             -- 'safe' (no hallucination) or 'unsafe' (hallucination detected)
  violated_category VARCHAR(255),     -- Type of hallucination: 'N/A', 'Citation / Attribution Errors', 'Entity Inaccuracies', 'Context contradictions'
  safety_score DECIMAL(5,4),          -- Confidence score 0-1 (higher = safer, no hallucination)

  -- Guardrail evaluations (for future use when running evaluations)
  input_guardrail JSONB,              -- Input guardrail evaluation result
  output_guardrail JSONB,             -- Output guardrail evaluation result
  ai_system_response JSONB,           -- AI system response with judge model evaluation

  -- Status tracking
  status VARCHAR(50) DEFAULT 'pending',
  error_message TEXT,
  runtime_ms INTEGER,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,

  -- Unique constraint
  UNIQUE(evaluation_id, prompt_index)
);

-- Create indexes for common queries
CREATE INDEX idx_hallucination_prompts_evaluation_id ON hallucination_prompts(evaluation_id);
CREATE INDEX idx_hallucination_prompts_status ON hallucination_prompts(status);
CREATE INDEX idx_hallucination_prompts_pred_label ON hallucination_prompts(pred_label);
CREATE INDEX idx_hallucination_prompts_violated_category ON hallucination_prompts(violated_category);
CREATE INDEX idx_hallucination_prompts_evaluation_status ON hallucination_prompts(evaluation_id, status);

-- Enable Row Level Security
ALTER TABLE hallucination_prompts ENABLE ROW LEVEL SECURITY;

-- RLS policies (mirror existing jailbreak_prompts policies)
-- Users can view their own hallucination prompts through evaluation ownership
CREATE POLICY "Users can view their own hallucination prompts"
  ON hallucination_prompts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM evaluations e
      WHERE e.id = hallucination_prompts.evaluation_id
      AND e.created_by = auth.uid()
    )
  );

-- Service role can insert/update hallucination prompts
CREATE POLICY "Service role can manage hallucination prompts"
  ON hallucination_prompts
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
