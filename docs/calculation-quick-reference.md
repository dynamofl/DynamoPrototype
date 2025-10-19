# Quick Reference: Adding a New Calculation

## TL;DR - 5 Steps to Add a New Calculation

```typescript
// 1. Write your calculation function
function calculateMyAnalysis(prompts: any[]): any {
  // Your logic here
  return { /* result */ };
}

// 2. Add to CalculationResults interface
interface CalculationResults {
  summary: any;
  topicAnalysis: any | null;
  myAnalysis: any | null;  // ← ADD THIS
}

// 3. Add to runAllCalculations()
async function runAllCalculations(...) {
  const results: CalculationResults = {
    summary: null,
    topicAnalysis: null,
    myAnalysis: null,  // ← INITIALIZE
  };

  // ... existing calculations ...

  // ← ADD YOUR CALCULATION HERE
  await logInfo(supabase, evaluationId, 'Calculating my analysis...');
  try {
    results.myAnalysis = calculateMyAnalysis(prompts);
    await logInfo(supabase, evaluationId, 'My analysis calculated');
  } catch (error) {
    await logError(supabase, evaluationId, '', `Error: ${error.message}`);
    results.myAnalysis = null;
  }

  return results;
}

// 4. Add to buildUpdateData()
function buildUpdateData(...) {
  return {
    // ... existing fields ...
    topic_analysis: calculations.topicAnalysis,
    my_analysis: calculations.myAnalysis,  // ← ADD THIS
  };
}

// 5. Add database column (migration)
ALTER TABLE evaluations
  ADD COLUMN IF NOT EXISTS my_analysis JSONB;
```

## File Locations

| What | Where |
|------|-------|
| Calculation functions | `supabase/functions/run-evaluation/index.ts` (lines 472-688) |
| Orchestration | `supabase/functions/run-evaluation/index.ts` (lines 690-900) |
| Database migrations | `supabase/migrations/` |
| Backend types | `supabase/functions/_shared/types.ts` |
| Frontend types | `src/features/ai-system-evaluation/types/jailbreak-evaluation.ts` |

## Deployment

```bash
# 1. Apply database migration
npx supabase db push

# 2. Deploy edge function
npx supabase functions deploy run-evaluation
```

## Complete Documentation

See [adding-new-calculations.md](./adding-new-calculations.md) for detailed guide.
