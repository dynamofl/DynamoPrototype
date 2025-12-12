-- Setup Hallucination Evaluation Part 2 (510 prompts) for GPT-4o Demo
-- Run this SQL script in Supabase SQL Editor after applying the migration

-- Step 1: Create the evaluation record for Part 2
INSERT INTO evaluations (
  id,
  ai_system_id,
  name,
  status,
  evaluation_type,
  config,
  total_prompts,
  completed_prompts,
  created_by,
  created_at,
  started_at,
  completed_at
) VALUES (
  '00000000-0000-0000-0000-000000000002'::uuid,
  '9a2a9273-9b33-42fd-81d7-01e97fe98920'::uuid,  -- GPT-4o Demo AI System
  'Hallucination Evaluation - Part 2 (Content Accuracy)',
  'completed',
  'hallucination',
  jsonb_build_object(
    'testType', 'hallucination',
    'description', 'Hallucination detection evaluation using PyTorch and TensorFlow documentation - Part 2'
  ),
  510,  -- total prompts
  510,  -- completed prompts
  auth.uid(),
  NOW() - INTERVAL '1 day',  -- Created 1 day ago (more recent than Part 1)
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '1 day'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  updated_at = NOW();

-- Step 2: Import hallucination_prompts data from CSV
-- You can now import the CSV file through Supabase Dashboard:
-- 1. Go to Table Editor → hallucination_prompts
-- 2. Click "Insert" → "Import data from CSV"
-- 3. Upload: src/data/hallucination_augmented_part2.csv (510 rows)
-- 4. Map columns (should auto-detect)
-- 5. Click "Import"

-- Verification queries
SELECT
  e.id,
  e.name,
  e.evaluation_type,
  e.status,
  e.total_prompts,
  e.completed_prompts,
  a.name as ai_system_name
FROM evaluations e
JOIN ai_systems a ON e.ai_system_id = a.id
WHERE e.id = '00000000-0000-0000-0000-000000000002';

-- After CSV import, verify hallucination_prompts data
SELECT
  COUNT(*) as total_rows,
  COUNT(DISTINCT evaluation_id) as unique_evaluations,
  COUNT(CASE WHEN pred_label = 'safe' THEN 1 END) as safe_count,
  COUNT(CASE WHEN pred_label = 'unsafe' THEN 1 END) as unsafe_count,
  AVG(safety_score) as avg_safety_score
FROM hallucination_prompts
WHERE evaluation_id = '00000000-0000-0000-0000-000000000002';

-- Step 3: Calculate and update metrics
-- After importing the CSV, run the calculate-hallucination-metrics.sql script
-- Or manually calculate metrics for this specific evaluation:
/*
UPDATE evaluations
SET metrics = (
  SELECT jsonb_build_object(
    'safe_rate', ROUND((COUNT(*) FILTER (WHERE pred_label = 'safe')::DECIMAL / COUNT(*)) * 100, 2),
    'hallucination_rate', ROUND((COUNT(*) FILTER (WHERE pred_label = 'unsafe')::DECIMAL / COUNT(*)) * 100, 2),
    'avg_safety_score', ROUND(AVG(safety_score)::DECIMAL, 4),
    'total_tests', COUNT(*),
    'safe_count', COUNT(*) FILTER (WHERE pred_label = 'safe'),
    'unsafe_count', COUNT(*) FILTER (WHERE pred_label = 'unsafe')
  )
  FROM hallucination_prompts
  WHERE evaluation_id = '00000000-0000-0000-0000-000000000002'
)
WHERE id = '00000000-0000-0000-0000-000000000002';
*/
