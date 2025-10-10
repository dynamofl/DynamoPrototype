-- Add runtime and token tracking to evaluation_prompts table
-- Migration: 20250104000011_add_runtime_and_tokens

-- Add columns for runtime (in milliseconds) and token usage
ALTER TABLE evaluation_prompts
ADD COLUMN runtime_ms INTEGER,
ADD COLUMN input_tokens INTEGER,
ADD COLUMN output_tokens INTEGER,
ADD COLUMN total_tokens INTEGER;

-- Add indexes for performance analysis queries
CREATE INDEX idx_eval_prompts_runtime ON evaluation_prompts(runtime_ms);
CREATE INDEX idx_eval_prompts_tokens ON evaluation_prompts(total_tokens);

-- Add comments for documentation
COMMENT ON COLUMN evaluation_prompts.runtime_ms IS 'Execution time for the prompt in milliseconds';
COMMENT ON COLUMN evaluation_prompts.input_tokens IS 'Number of input tokens used';
COMMENT ON COLUMN evaluation_prompts.output_tokens IS 'Number of output tokens generated';
COMMENT ON COLUMN evaluation_prompts.total_tokens IS 'Total tokens (input + output)';
