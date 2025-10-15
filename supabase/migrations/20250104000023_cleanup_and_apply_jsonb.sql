-- Clean up any duplicate migration records and apply JSONB conversion
-- This is a consolidated migration that handles cleanup + schema change

-- Step 1: Remove any conflicting migration records
DELETE FROM supabase_migrations.schema_migrations
WHERE version IN ('20250104000018', '20250104000019');

-- Step 2: Check if column is already JSONB (idempotent)
DO $$
BEGIN
  -- Only proceed if adversarial_prompt is still TEXT
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'evaluation_prompts'
    AND column_name = 'adversarial_prompt'
    AND data_type = 'text'
  ) THEN

    -- Add a new JSONB column temporarily
    ALTER TABLE evaluation_prompts
    ADD COLUMN IF NOT EXISTS adversarial_prompt_jsonb JSONB;

    -- Migrate existing data
    UPDATE evaluation_prompts
    SET adversarial_prompt_jsonb = CASE
      -- Try to parse as JSON (for multi-turn attacks like TAP, IRIS)
      WHEN adversarial_prompt IS NOT NULL
        AND adversarial_prompt ~ '^\s*\[' -- Starts with array bracket
        AND adversarial_prompt ~ '\]\s*$' -- Ends with array bracket
      THEN
        -- Valid JSON array format (multi-turn conversation)
        adversarial_prompt::jsonb
      ELSE
        -- Plain text format (single-turn attack) - wrap in simple object
        jsonb_build_object('text', adversarial_prompt)
    END
    WHERE adversarial_prompt IS NOT NULL;

    -- Drop the old TEXT column
    ALTER TABLE evaluation_prompts
    DROP COLUMN adversarial_prompt;

    -- Rename the new JSONB column to the original name
    ALTER TABLE evaluation_prompts
    RENAME COLUMN adversarial_prompt_jsonb TO adversarial_prompt;

    -- Add a comment explaining the column format
    COMMENT ON COLUMN evaluation_prompts.adversarial_prompt IS
    'Adversarial prompt in JSONB format. For multi-turn attacks (TAP, IRIS), this is a JSON array of conversation turns: [{"role": "user", "content": "..."}, ...]. For single-turn attacks, this is a simple object: {"text": "..."}';

    -- Create an index for efficient JSON querying
    CREATE INDEX IF NOT EXISTS idx_evaluation_prompts_adversarial_prompt_gin
    ON evaluation_prompts
    USING GIN (adversarial_prompt);

    -- Add a check constraint to ensure valid structure
    ALTER TABLE evaluation_prompts
    DROP CONSTRAINT IF EXISTS check_adversarial_prompt_structure;

    ALTER TABLE evaluation_prompts
    ADD CONSTRAINT check_adversarial_prompt_structure CHECK (
      adversarial_prompt IS NULL
      OR jsonb_typeof(adversarial_prompt) = 'array'
      OR jsonb_typeof(adversarial_prompt) = 'object'
    );

    RAISE NOTICE 'Successfully converted adversarial_prompt from TEXT to JSONB';

  ELSE
    RAISE NOTICE 'Column adversarial_prompt is already JSONB, skipping migration';
  END IF;
END $$;
