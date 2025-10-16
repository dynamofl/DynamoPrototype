# Summary Metrics Migration Guide

This guide explains how to migrate existing evaluations to the new summary_metrics structure that includes per-guardrail breakdown.

## Overview

The new `summary_metrics` structure provides detailed per-guardrail analysis, allowing you to understand:
- Which guardrails are most effective at blocking attacks
- How each guardrail performs across different policies, attack types, and behaviors
- The "guardrail-only" effectiveness (attacks blocked by guardrail that AI system would have allowed)

## New Structure

### Before (Legacy Flat Structure)
```json
{
  "totalTests": 50,
  "attackSuccesses": 1,
  "attackFailures": 49,
  "successRate": 2,
  "aiSystemOnlySuccesses": 45,
  "aiSystemOnlyFailures": 5,
  "aiSystemOnlySuccessRate": 90,
  "byPolicy": {...},
  "byAttackType": {...},
  "byBehaviorType": {...}
}
```

### After (New Nested Structure with Guardrail Breakdown)
```json
{
  "aiSystem": {
    "totalTests": 50,
    "attackSuccesses": 1,
    "attackFailures": 49,
    "successRate": 2,
    "aiSystemOnlySuccesses": 45,
    "aiSystemOnlyFailures": 5,
    "aiSystemOnlySuccessRate": 90,
    "byPolicy": {...},
    "byAttackType": {...},
    "byBehaviorType": {...}
  },
  "guardrails": [
    {
      "id": "gr-123",
      "name": "Profanity Filter",
      "type": "output",
      "totalTests": 50,
      "successRate": 30,
      "guardrailOnlySuccessRate": 80,
      "attackSuccesses": 15,
      "attackFailures": 35,
      "guardrailOnlySuccesses": 40,
      "guardrailOnlyFailures": 10,
      "byPolicy": {...},
      "byAttackType": {...},
      "byBehaviorType": {...}
    }
  ],
  // Legacy fields preserved for backward compatibility
  "totalTests": 50,
  "successRate": 2,
  ...
}
```

## Migration Steps

### Step 1: Apply SQL Migration

First, apply the database migration that adds the helper function:

```bash
# Navigate to project root
cd /path/to/DynamoPrototype

# Apply migration via Supabase CLI
npx supabase db push

# Or manually apply the migration file
# supabase/migrations/20250104000025_update_summary_metrics_structure.sql
```

### Step 2: Set Environment Variables

Export your Supabase credentials:

```bash
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

**Finding your credentials:**
1. Go to your Supabase project dashboard
2. Navigate to Settings → API
3. Copy the Project URL (SUPABASE_URL)
4. Copy the service_role key (SUPABASE_SERVICE_ROLE_KEY) - **Keep this secret!**

### Step 3: Run Migration Script

#### Option A: Using the shell script (Recommended)

```bash
./scripts/migrate-summary-metrics.sh
```

This script will:
- Verify environment variables are set
- Prompt for confirmation
- Run the TypeScript migration
- Show detailed progress

#### Option B: Direct TypeScript execution

```bash
npx tsx scripts/migrate-guardrail-summary-metrics.ts
```

### Step 4: Verify Migration

Check the migration results:

```sql
-- Check which evaluations have been migrated
SELECT
  id,
  name,
  summary_metrics ? 'aiSystem' as has_new_structure,
  jsonb_array_length(summary_metrics->'guardrails') as guardrail_count
FROM evaluations
WHERE status = 'completed'
ORDER BY created_at DESC;

-- View a specific evaluation's new structure
SELECT
  id,
  name,
  summary_metrics->'aiSystem'->>'aiSystemOnlySuccessRate' as ai_system_asr,
  summary_metrics->'aiSystem'->>'successRate' as with_guardrails_asr,
  jsonb_pretty(summary_metrics->'guardrails') as guardrails
FROM evaluations
WHERE id = 'your-evaluation-id';
```

## Migration Script Details

### What it does:

1. **Fetches all completed evaluations** from Supabase
2. **Checks if already migrated** (skips if `aiSystem` structure exists)
3. **Re-reads all prompt results** for each evaluation
4. **Recalculates summary metrics** with:
   - AI system metrics nested under `aiSystem`
   - Per-guardrail breakdown in `guardrails` array
   - Legacy fields preserved at root level
5. **Updates the database** with new structure
6. **Provides detailed logging** of progress and results

### What it preserves:

- ✅ All original metric values
- ✅ Legacy flat structure fields (backward compatibility)
- ✅ Existing evaluation data and prompts
- ✅ All other evaluation fields unchanged

### What it adds:

- ✨ Per-guardrail success rates
- ✨ Guardrail-only effectiveness metrics
- ✨ Per-guardrail breakdown by policy, attack type, and behavior
- ✨ Guardrail type (input/output)

## Rollback

If you need to rollback the migration:

```sql
-- Revert to flat structure (loses per-guardrail data)
UPDATE evaluations
SET summary_metrics = (
  SELECT jsonb_build_object(
    'totalTests', summary_metrics->>'totalTests',
    'attackSuccesses', summary_metrics->>'attackSuccesses',
    'attackFailures', summary_metrics->>'attackFailures',
    'successRate', summary_metrics->>'successRate',
    'aiSystemOnlySuccesses', summary_metrics->>'aiSystemOnlySuccesses',
    'aiSystemOnlyFailures', summary_metrics->>'aiSystemOnlyFailures',
    'aiSystemOnlySuccessRate', summary_metrics->>'aiSystemOnlySuccessRate',
    'byPolicy', summary_metrics->'byPolicy',
    'byAttackType', summary_metrics->'byAttackType',
    'byBehaviorType', summary_metrics->'byBehaviorType'
  )
)
WHERE summary_metrics ? 'aiSystem';
```

## Backward Compatibility

The migration maintains **full backward compatibility**:

- ✅ Frontend components check for new structure first, then fallback to legacy
- ✅ Legacy flat fields are preserved at root level
- ✅ Existing evaluations work without migration (just missing per-guardrail metrics)
- ✅ No breaking changes to API responses

## New Evaluations

After migration, **new evaluations automatically use the new structure**:

- The Edge Function (`supabase/functions/run-evaluation/index.ts`) has been updated
- New evaluations will have both `aiSystem` and `guardrails` from the start
- No manual migration needed for new data

## Key Metrics Explained

### AI System Metrics (`aiSystem`)

- **`successRate`**: Overall attack success rate (with guardrails applied)
- **`aiSystemOnlySuccessRate`**: Attack success rate based on AI system response alone (ignoring guardrails)
- **Difference**: Shows the effectiveness of guardrails in blocking attacks

### Per-Guardrail Metrics (`guardrails[]`)

- **`successRate`**: Overall attack success rate when this guardrail is applied
- **`guardrailOnlySuccessRate`**: Attacks blocked by this guardrail independent of AI system
- **`guardrailOnlySuccesses`**: Attacks blocked by guardrail that AI system would have allowed
- **`guardrailOnlyFailures`**: Attacks that passed guardrail but AI system refused anyway

## Troubleshooting

### Migration script fails with "connection refused"

**Solution**: Check your `SUPABASE_URL` is correct and accessible

```bash
curl $SUPABASE_URL/rest/v1/
```

### Migration script fails with "permission denied"

**Solution**: Verify you're using the `service_role` key, not the `anon` key

### Some evaluations show 0% guardrail effectiveness

**Possible causes**:
- Evaluation has no guardrails attached
- Guardrail details not recorded (older evaluations)
- All attacks were blocked by AI system (not guardrails)

### Migration script shows "No completed evaluations"

**Solution**: Check that evaluations exist and have status='completed'

```sql
SELECT id, name, status FROM evaluations ORDER BY created_at DESC LIMIT 10;
```

## Support

For issues or questions:
1. Check the [Migration Script](../scripts/migrate-guardrail-summary-metrics.ts) source code
2. Review the [SQL Migration](../supabase/migrations/20250104000025_update_summary_metrics_structure.sql)
3. Examine evaluation data structure in Supabase dashboard
4. Check application logs for errors

## Performance Notes

- Migration processes evaluations sequentially to avoid database overload
- Typical performance: ~1-2 seconds per evaluation
- For large datasets (100+ evaluations), expect 2-5 minutes total
- Safe to re-run (skips already-migrated evaluations)
