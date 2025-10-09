-- Create core tables for AI evaluation system
-- Migration: 20250104000001_create_core_tables

-- Enable pgcrypto extension for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- AI Systems Table
-- =====================================================
CREATE TABLE ai_systems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  provider TEXT NOT NULL,
  model TEXT NOT NULL,
  config JSONB DEFAULT '{}'::jsonb,

  -- Metadata
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_ai_systems_name ON ai_systems(name);
CREATE INDEX idx_ai_systems_provider ON ai_systems(provider);

-- =====================================================
-- Guardrails Table
-- =====================================================
CREATE TABLE guardrails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  policies JSONB DEFAULT '[]'::jsonb,

  -- Metadata
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_guardrails_name ON guardrails(name);
CREATE INDEX idx_guardrails_type ON guardrails(type);

-- =====================================================
-- Evaluations Table
-- =====================================================
CREATE TABLE evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),

  -- Configuration
  ai_system_id UUID REFERENCES ai_systems(id) ON DELETE SET NULL,
  evaluation_type TEXT NOT NULL DEFAULT 'jailbreak',
  config JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Progress tracking
  total_prompts INTEGER DEFAULT 0,
  completed_prompts INTEGER DEFAULT 0,
  current_stage TEXT,
  current_prompt_text TEXT,

  -- Results
  summary_metrics JSONB,
  error_message TEXT,

  -- Metadata
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- For resuming
  checkpoint_data JSONB
);

-- Indexes
CREATE INDEX idx_evaluations_status ON evaluations(status);
CREATE INDEX idx_evaluations_ai_system ON evaluations(ai_system_id);
CREATE INDEX idx_evaluations_created_by ON evaluations(created_by);
CREATE INDEX idx_evaluations_created_at ON evaluations(created_at DESC);
CREATE INDEX idx_evaluations_updated_at ON evaluations(updated_at DESC);

-- =====================================================
-- Evaluation Prompts Table
-- =====================================================
CREATE TABLE evaluation_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evaluation_id UUID REFERENCES evaluations(id) ON DELETE CASCADE NOT NULL,

  -- Prompt details
  prompt_index INTEGER NOT NULL,
  policy_id TEXT,
  policy_name TEXT,
  base_prompt TEXT NOT NULL,
  adversarial_prompt TEXT,
  attack_type TEXT,
  behavior_type TEXT,

  -- Execution
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'running', 'completed', 'failed')),

  -- Results
  system_response TEXT,
  guardrail_judgement TEXT,
  model_judgement TEXT,
  attack_outcome TEXT,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT
);

-- Indexes
CREATE INDEX idx_eval_prompts_evaluation ON evaluation_prompts(evaluation_id);
CREATE INDEX idx_eval_prompts_status ON evaluation_prompts(evaluation_id, status);
CREATE INDEX idx_eval_prompts_index ON evaluation_prompts(evaluation_id, prompt_index);

-- =====================================================
-- Evaluation Logs Table
-- =====================================================
CREATE TABLE evaluation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evaluation_id UUID REFERENCES evaluations(id) ON DELETE CASCADE,
  prompt_id UUID REFERENCES evaluation_prompts(id) ON DELETE CASCADE,

  level TEXT NOT NULL CHECK (level IN ('debug', 'info', 'warn', 'error')),
  message TEXT NOT NULL,
  metadata JSONB,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_eval_logs_evaluation ON evaluation_logs(evaluation_id, created_at DESC);
CREATE INDEX idx_eval_logs_level ON evaluation_logs(level);

-- =====================================================
-- Database Functions
-- =====================================================

-- Function to increment completed prompts atomically
CREATE OR REPLACE FUNCTION increment_completed_prompts(eval_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE evaluations
  SET completed_prompts = completed_prompts + 1,
      updated_at = NOW()
  WHERE id = eval_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update timestamps automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_ai_systems_updated_at BEFORE UPDATE ON ai_systems
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_guardrails_updated_at BEFORE UPDATE ON guardrails
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_evaluations_updated_at BEFORE UPDATE ON evaluations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Row Level Security (RLS)
-- =====================================================

-- Enable RLS
ALTER TABLE ai_systems ENABLE ROW LEVEL SECURITY;
ALTER TABLE guardrails ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluation_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluation_logs ENABLE ROW LEVEL SECURITY;

-- AI Systems Policies
CREATE POLICY "Users can view all AI systems"
  ON ai_systems FOR SELECT
  USING (true);

CREATE POLICY "Users can create AI systems"
  ON ai_systems FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own AI systems"
  ON ai_systems FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own AI systems"
  ON ai_systems FOR DELETE
  USING (auth.uid() = created_by);

-- Guardrails Policies
CREATE POLICY "Users can view all guardrails"
  ON guardrails FOR SELECT
  USING (true);

CREATE POLICY "Users can create guardrails"
  ON guardrails FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own guardrails"
  ON guardrails FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own guardrails"
  ON guardrails FOR DELETE
  USING (auth.uid() = created_by);

-- Evaluations Policies
CREATE POLICY "Users can view their own evaluations"
  ON evaluations FOR SELECT
  USING (auth.uid() = created_by);

CREATE POLICY "Users can create evaluations"
  ON evaluations FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own evaluations"
  ON evaluations FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own evaluations"
  ON evaluations FOR DELETE
  USING (auth.uid() = created_by);

-- Evaluation Prompts Policies (inherit from evaluation)
CREATE POLICY "Users can view prompts of their evaluations"
  ON evaluation_prompts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM evaluations
      WHERE evaluations.id = evaluation_prompts.evaluation_id
      AND evaluations.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can insert prompts for their evaluations"
  ON evaluation_prompts FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM evaluations
      WHERE evaluations.id = evaluation_prompts.evaluation_id
      AND evaluations.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can update prompts of their evaluations"
  ON evaluation_prompts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM evaluations
      WHERE evaluations.id = evaluation_prompts.evaluation_id
      AND evaluations.created_by = auth.uid()
    )
  );

-- Evaluation Logs Policies (inherit from evaluation)
CREATE POLICY "Users can view logs of their evaluations"
  ON evaluation_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM evaluations
      WHERE evaluations.id = evaluation_logs.evaluation_id
      AND evaluations.created_by = auth.uid()
    )
  );

CREATE POLICY "System can insert logs"
  ON evaluation_logs FOR INSERT
  WITH CHECK (true);

-- =====================================================
-- Service Role Policies (for Edge Functions)
-- =====================================================

-- Allow service role to update evaluations and prompts
CREATE POLICY "Service role can update all evaluations"
  ON evaluations FOR UPDATE
  USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can update all prompts"
  ON evaluation_prompts FOR UPDATE
  USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can insert logs"
  ON evaluation_logs FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');
