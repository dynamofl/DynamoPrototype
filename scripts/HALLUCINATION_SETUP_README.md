# Hallucination Evaluation Setup Guide

This guide explains how to import hallucination evaluation data and set up the metrics for the GPT-4o Demo AI system.

## Overview

You have two hallucination evaluation datasets ready for import:
- **Part 1**: 400 prompts (evaluation ID: `00000000-0000-0000-0000-000000000001`)
- **Part 2**: 510 prompts (evaluation ID: `00000000-0000-0000-0000-000000000002`)

## Files Created

### CSV Data Files
- `src/data/hallucination_augmented_part1.csv` - 400 rows
- `src/data/hallucination_augmented_part2.csv` - 510 rows
- `src/data/hallucination_augmented_full.csv` - 910 rows (combined)

### SQL Scripts
1. `setup-hallucination-evaluation-part1.sql` - Setup for Part 1 (400 prompts)
2. `setup-hallucination-evaluation-part2.sql` - Setup for Part 2 (510 prompts)
3. `calculate-hallucination-metrics.sql` - Calculate and populate metrics JSON

### Transformation Script
- `transform-hallucination-csv.js` - Converts raw CSV to database-ready format

## Step-by-Step Setup

### Step 1: Apply Database Migration

First, create the `hallucination_prompts` table:

```bash
npx supabase db push
```

This applies the migration: `supabase/migrations/20251211000001_create_hallucination_prompts.sql`

### Step 2: Import Part 1 Evaluation (400 prompts)

#### 2a. Create Evaluation Record

Run `scripts/setup-hallucination-evaluation-part1.sql` in Supabase SQL Editor:
- Creates evaluation with ID: `00000000-0000-0000-0000-000000000001`
- AI System: GPT-4o Demo (`9a2a9273-9b33-42fd-81d7-01e97fe98920`)
- Created: 2 days ago
- Total prompts: 400

#### 2b. Import CSV Data

In Supabase Dashboard:
1. Go to **Table Editor** → **hallucination_prompts**
2. Click **Insert** → **Import data from CSV**
3. Upload: `src/data/hallucination_augmented_part1.csv`
4. Map columns (should auto-detect all 14 columns)
5. Click **Import**

#### 2c. Verify Import

Run the verification query from the setup script:
```sql
SELECT COUNT(*) as total_rows,
       COUNT(DISTINCT evaluation_id) as unique_evaluations,
       COUNT(CASE WHEN pred_label = 'safe' THEN 1 END) as safe_count,
       COUNT(CASE WHEN pred_label = 'unsafe' THEN 1 END) as unsafe_count,
       AVG(safety_score) as avg_safety_score
FROM hallucination_prompts
WHERE evaluation_id = '00000000-0000-0000-0000-000000000001';
```

Expected: 400 rows linked to evaluation ID `...001`

### Step 3: Import Part 2 Evaluation (510 prompts)

Repeat the same process with Part 2:

#### 3a. Create Evaluation Record
Run `scripts/setup-hallucination-evaluation-part2.sql`

#### 3b. Import CSV Data
Upload: `src/data/hallucination_augmented_part2.csv`

#### 3c. Verify Import
Check for 510 rows with evaluation ID `...002`

### Step 4: Calculate Metrics

After importing both datasets, calculate and populate the metrics JSON:

Run `scripts/calculate-hallucination-metrics.sql` in Supabase SQL Editor.

This script will:
1. Create a helper function `calculate_hallucination_metrics()`
2. Calculate metrics for all completed hallucination evaluations
3. Update the `evaluations.metrics` JSONB column
4. Show verification results

**Metrics calculated:**
- `safe_rate` - % without hallucinations
- `hallucination_rate` - % with hallucinations
- `avg_safety_score` - Average confidence (0-1)
- `total_tests`, `safe_count`, `unsafe_count`
- `unique_topics`, `unique_categories`, `unique_policies`
- `safety_score_distribution` - Binned as high/medium/low
- `by_category` - Breakdown by violation type

### Step 5: View in Application

Navigate to the GPT-4o Demo AI system in your application:
1. Go to **AI Systems** → **GPT-4o Demo**
2. Click **Evaluation History**
3. You should see two hallucination evaluations:
   - "Hallucination Evaluation - Part 1 (Content Accuracy)" - 400 prompts
   - "Hallucination Evaluation - Part 2 (Content Accuracy)" - 510 prompts
4. Click **View Result** to see summary and data views

## Metrics JSON Structure

The `evaluations.metrics` column stores:

```json
{
  "safe_rate": 47.0,
  "hallucination_rate": 53.0,
  "avg_safety_score": 0.6234,
  "total_tests": 910,
  "safe_count": 428,
  "unsafe_count": 482,
  "unique_topics": 45,
  "unique_categories": 4,
  "unique_policies": 1,
  "safety_score_distribution": {
    "high_confidence": 520,
    "medium_confidence": 280,
    "low_confidence": 110
  },
  "by_category": {
    "N/A": {
      "count": 428,
      "percentage": 47.0,
      "avg_safety_score": 0.8921
    },
    "Citation / Attribution Errors": {
      "count": 150,
      "percentage": 16.5,
      "avg_safety_score": 0.3523
    },
    "Entity Inaccuracies": {
      "count": 200,
      "percentage": 22.0,
      "avg_safety_score": 0.2845
    },
    "Context contradictions": {
      "count": 132,
      "percentage": 14.5,
      "avg_safety_score": 0.3102
    }
  }
}
```

## Data Distribution (910 prompts total)

Based on the full dataset:
- **Safe responses**: 428 (47.0%)
- **Unsafe responses**: 482 (53.0%)
- **Average safety score**: ~0.62

**By Category:**
- N/A (no hallucination): ~47%
- Citation/Attribution Errors: ~17%
- Entity Inaccuracies: ~22%
- Context Contradictions: ~14%

## Troubleshooting

### Import Fails with "value too long"
- Verify CSV has proper field escaping
- Check VARCHAR(50) columns: `pred_label`, `behavior_type`, `status`
- All verified to be under 50 characters

### Metrics Not Showing
- Ensure `calculate-hallucination-metrics.sql` was run
- Check that evaluations status is 'completed'
- Verify `evaluation_type` is 'hallucination'

### Evaluation Not Appearing in History
- Check `ai_system_id` matches GPT-4o Demo
- Verify `created_by` is set to `auth.uid()`
- Check Row Level Security policies allow access

## Future: Automatic Metrics Calculation

For future evaluations, you can implement automatic metrics calculation using a database trigger. See the plan file section "Database Trigger Integration" for implementation details.

The trigger would automatically populate the metrics JSON when an evaluation reaches 100% completion.

## Additional Resources

- Plan file: `.claude/plans/serialized-sauteeing-wadler.md`
- Hallucination types: `src/features/ai-system-evaluation/types/hallucination-evaluation.ts`
- Strategy implementation: `src/features/ai-system-evaluation/strategies/hallucination-strategy.tsx`
- Migration: `supabase/migrations/20251211000001_create_hallucination_prompts.sql`
