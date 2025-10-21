# Adding New Calculation Functions

This guide explains how to add new calculation functions to the evaluation finalization process.

## Overview

The evaluation finalization process is structured to make it easy to add new calculations. All calculations run **before** the evaluation is marked as complete, ensuring data consistency.

## Architecture

The finalization process has three main components:

1. **`runAllCalculations()`** - Orchestrates all calculation functions
2. **`buildUpdateData()`** - Builds the database update object
3. **`finalizeEvaluation()`** - Main entry point that coordinates everything

## Step-by-Step Guide

### 1. Create Your Calculation Function

Add your calculation function in `supabase/functions/run-evaluation/index.ts` in the **TOPIC ANALYSIS CALCULATION** section (or create a new section).

**Example:**
```typescript
/**
 * Calculate policy trend analysis from evaluation prompts
 * Groups by policy and analyzes trends over time
 */
function calculatePolicyTrendAnalysis(prompts: EvaluationPrompt[]): any {
  // Your calculation logic here
  const policyMap = new Map();

  for (const prompt of prompts) {
    // Group and analyze
  }

  return {
    trends: [...policyMap.values()],
    summary: {
      totalPolicies: policyMap.size,
      // ... other metrics
    }
  };
}
```

### 2. Update the CalculationResults Interface

Add your new calculation field to the `CalculationResults` interface:

```typescript
interface CalculationResults {
  summary: any;
  topicAnalysis: any | null;
  // ADD YOUR NEW FIELD HERE
  policyTrendAnalysis: any | null;  // <-- Add this
}
```

### 3. Add Calculation to runAllCalculations()

Add your calculation logic in the `runAllCalculations()` function:

```typescript
async function runAllCalculations(...): Promise<CalculationResults> {
  const results: CalculationResults = {
    summary: null,
    topicAnalysis: null,
    policyTrendAnalysis: null,  // <-- Initialize
  };

  // ... existing calculations ...

  // ========================================
  // CALCULATION 3: Policy Trend Analysis
  // ========================================
  await logInfo(supabase, evaluationId, 'Calculating policy trend analysis...');
  try {
    results.policyTrendAnalysis = calculatePolicyTrendAnalysis(prompts);
    await logInfo(supabase, evaluationId, 'Policy trend analysis calculated');
  } catch (error) {
    await logError(
      supabase,
      evaluationId,
      '',
      `Error calculating policy trend: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    results.policyTrendAnalysis = null; // Graceful degradation
  }

  return results;
}
```

### 4. Add Field to buildUpdateData()

Add your calculation result to the update data object:

```typescript
function buildUpdateData(calculations: CalculationResults, guardrailsCount: number): any {
  return {
    status: 'completed',
    summary_metrics: calculations.summary,
    // ... existing fields ...
    topic_analysis: calculations.topicAnalysis,
    policy_trend_analysis: calculations.policyTrendAnalysis,  // <-- Add this
    // ... metadata fields ...
  };
}
```

### 5. Add Database Column (if needed)

If you're storing the result in a new column, create a migration:

```sql
-- supabase/migrations/YYYYMMDDHHMMSS_add_policy_trend_analysis.sql

ALTER TABLE evaluations
  ADD COLUMN IF NOT EXISTS policy_trend_analysis JSONB;

CREATE INDEX IF NOT EXISTS idx_evaluations_policy_trend_analysis
  ON evaluations USING GIN (policy_trend_analysis);

COMMENT ON COLUMN evaluations.policy_trend_analysis IS
  'Policy trend analysis with temporal patterns and progression metrics';
```

### 6. Update TypeScript Types

Add the field to your types:

**Backend** (`supabase/functions/_shared/types.ts`):
```typescript
export interface Evaluation {
  // ... existing fields ...
  topic_analysis?: TopicAnalysis;
  policy_trend_analysis?: PolicyTrendAnalysis;  // <-- Add this
}
```

**Frontend** (`src/features/ai-system-evaluation/types/jailbreak-evaluation.ts`):
```typescript
export interface JailbreakEvaluationOutput {
  // ... existing fields ...
  topicAnalysis?: TopicAnalysis;
  policyTrendAnalysis?: PolicyTrendAnalysis;  // <-- Add this
}
```

### 7. Deploy

Deploy the changes:

```bash
# Apply database migration
npx supabase db push

# Deploy edge function
npx supabase functions deploy run-evaluation
```

## Best Practices

### Error Handling

- **Critical calculations** (like `summary`): `throw error` to fail the entire finalization
- **Optional calculations** (like `topicAnalysis`): Return `null` and log error, allow finalization to continue

### Logging

Always add logging for:
- When calculation starts
- When calculation succeeds (with summary info)
- When calculation fails (with error details)

### Performance

- Keep calculations efficient - they run synchronously
- For heavy calculations, consider pre-aggregating data
- Add database indexes for JSONB columns you'll query

### Testing

After adding a new calculation:

1. Run a test evaluation
2. Check `evaluation_logs` table for calculation logs
3. Verify the new column is populated
4. Check for any errors in edge function logs

## Example: Complete Implementation

See `calculateTopicAnalysis()` in `supabase/functions/run-evaluation/index.ts` for a complete example that includes:
- Statistical calculations (mean, median, mode)
- Grouping by multiple dimensions
- Nested data structures
- Error handling
- Comprehensive logging

## Troubleshooting

**Calculation not running?**
- Check edge function logs for errors
- Verify `runAllCalculations()` includes your calculation
- Check `evaluation_logs` table for log messages

**Data not saving?**
- Verify database column exists
- Check `buildUpdateData()` includes your field
- Verify TypeScript types are updated

**Finalization failing?**
- Check if your calculation is throwing errors
- Review error handling - should it be critical or optional?
- Check edge function deployment status
