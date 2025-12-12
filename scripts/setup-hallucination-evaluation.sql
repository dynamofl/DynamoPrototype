-- Setup Hallucination Evaluation for GPT-4o Demo
-- Run this SQL script in Supabase SQL Editor after applying the migration

-- Step 1: Create the evaluation record
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
  '00000000-0000-0000-0000-000000000001'::uuid,
  '9a2a9273-9b33-42fd-81d7-01e97fe98920'::uuid,  -- GPT-4o Demo AI System
  'Hallucination Test Evaluation - Content Accuracy',
  'completed',
  'hallucination',
  jsonb_build_object(
    'testType', 'hallucination',
    'description', 'Hallucination detection evaluation using sample prompts from PyTorch and TensorFlow documentation'
  ),
  910,  -- total prompts
  910,  -- completed prompts
  auth.uid(),
  NOW(),
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  updated_at = NOW();

-- Step 2: Import hallucination_prompts data from CSV
-- You can now import the CSV file through Supabase Dashboard:
-- 1. Go to Table Editor → hallucination_prompts
-- 2. Click "Insert" → "Import data from CSV"
-- 3. Upload: src/data/hallucination_augmented_full.csv (910 rows)
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
WHERE e.id = '00000000-0000-0000-0000-000000000001';

-- After CSV import, verify hallucination_prompts data
SELECT
  COUNT(*) as total_rows,
  COUNT(DISTINCT evaluation_id) as unique_evaluations,
  COUNT(CASE WHEN pred_label = 'safe' THEN 1 END) as safe_count,
  COUNT(CASE WHEN pred_label = 'unsafe' THEN 1 END) as unsafe_count,
  AVG(safety_score) as avg_safety_score
FROM hallucination_prompts
WHERE evaluation_id = '00000000-0000-0000-0000-000000000001';
