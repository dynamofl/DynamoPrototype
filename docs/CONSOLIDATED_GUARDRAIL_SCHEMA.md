# Consolidated Guardrail Schema

## Overview

This document describes the consolidated guardrail schema that combines related guardrail evaluation columns into structured JSONB columns.

## Schema Changes

### Before (Old Schema)

The `evaluation_prompts` table had separate columns:

```sql
-- Input guardrail columns
input_guardrail_judgement TEXT
input_guardrail_reason TEXT
input_guardrail_violations JSONB
input_guardrail_details JSONB

-- Output guardrail columns
output_guardrail_judgement TEXT
output_guardrail_reason TEXT
output_guardrail_violations JSONB
output_guardrail_details JSONB
```

### After (New Schema)

The table now has consolidated JSONB columns:

```sql
-- Consolidated columns
input_guardrail JSONB
output_guardrail JSONB
```

## Data Structure

Each guardrail column follows this structure:

```typescript
{
  judgement: "Blocked" | "Allowed",
  reason: string,
  details: [
    {
      guardrailId: string,
      guardrailName: string,
      judgement: "Blocked" | "Allowed",
      reason: string,
      violations?: [
        {
          phrase: string,
          violatedBehaviors: string[]
        }
      ]
    }
  ]
}
```

### Example Data

```json
{
  "judgement": "Blocked",
  "reason": "Blocked by 2/3 guardrails: Medical Diagnosis Policy, Prescription Policy",
  "details": [
    {
      "guardrailId": "uuid-123",
      "guardrailName": "Medical Diagnosis Policy",
      "judgement": "Blocked",
      "reason": "Attempts to diagnose medical conditions",
      "violations": [
        {
          "phrase": "you might have diabetes",
          "violatedBehaviors": ["Diagnose medical conditions"]
        }
      ]
    },
    {
      "guardrailId": "uuid-456",
      "guardrailName": "Prescription Policy",
      "judgement": "Blocked",
      "reason": "Attempts to prescribe medication",
      "violations": [
        {
          "phrase": "take 500mg of metformin",
          "violatedBehaviors": ["Prescribe medication"]
        }
      ]
    },
    {
      "guardrailId": "uuid-789",
      "guardrailName": "General Health Policy",
      "judgement": "Allowed",
      "reason": "No violations detected"
    }
  ]
}
```

## Benefits

1. **Cleaner Schema**: Related data is grouped together in a single column
2. **Easier Maintenance**: One place to look for all guardrail evaluation data
3. **Violations Included**: Violations are now part of the detail structure (not separate)
4. **Consistent Structure**: Both input and output guardrails follow the same pattern
5. **Better Performance**: GIN indexes enable efficient JSONB querying

## Querying Examples

### 1. Get all prompts with blocked input guardrails

```sql
SELECT * FROM evaluation_prompts
WHERE input_guardrail->>'judgement' = 'Blocked';
```

### 2. Find evaluations where specific guardrail blocked

```sql
SELECT * FROM evaluation_prompts
WHERE input_guardrail->'details' @> '[{"guardrailId": "uuid-123", "judgement": "Blocked"}]';
```

### 3. Get guardrail reason

```sql
SELECT input_guardrail->>'reason'
FROM evaluation_prompts
WHERE id = '...';
```

### 4. Count blocks per guardrail

```sql
SELECT
  detail->>'guardrailName' as guardrail_name,
  COUNT(*) as blocked_count
FROM evaluation_prompts,
LATERAL jsonb_array_elements(input_guardrail->'details') AS detail
WHERE detail->>'judgement' = 'Blocked'
GROUP BY detail->>'guardrailName'
ORDER BY blocked_count DESC;
```

### 5. Get all violation details for a prompt

```sql
SELECT
  detail->>'guardrailName' as guardrail,
  detail->'violations' as violations
FROM evaluation_prompts,
LATERAL jsonb_array_elements(input_guardrail->'details') AS detail
WHERE id = '...' AND detail->'violations' IS NOT NULL;
```

## TypeScript Types

### Supabase Edge Functions

```typescript
// Guardrail evaluation detail structure
export interface GuardrailDetail {
  guardrailId: string;
  guardrailName: string;
  judgement: string;
  reason: string;
  violations?: Array<{phrase: string, violatedBehaviors: string[]}>;
}

// Consolidated guardrail evaluation structure
export interface GuardrailEvaluation {
  judgement: string;  // 'Blocked' | 'Allowed'
  reason: string;
  details: GuardrailDetail[];
}

export interface EvaluationPrompt {
  // ... other fields ...

  // Consolidated guardrail evaluations
  input_guardrail?: GuardrailEvaluation | null;
  output_guardrail?: GuardrailEvaluation | null;
}
```

### Frontend Types

The frontend types in `src/types/index.ts` and `src/features/ai-system-evaluation/types/jailbreak-evaluation.ts` have been updated to match this structure.

## Migration

Migration file: `supabase/migrations/20250104000019_consolidate_guardrail_columns.sql`

The migration:
1. Creates new `input_guardrail` and `output_guardrail` JSONB columns
2. Migrates existing data from old columns to new structure
3. Drops old columns (including unused `input_guardrail_violations` and `output_guardrail_violations`)
4. Creates GIN indexes for efficient JSONB querying
5. Creates additional indexes on judgement fields for filtering

## Code Updates

### Files Updated

1. **Database Migration**: `supabase/migrations/20250104000019_consolidate_guardrail_columns.sql`
2. **Supabase Types**: `supabase/functions/_shared/types.ts`
3. **Edge Function**: `supabase/functions/run-evaluation/index.ts`
4. **Frontend Types**: `src/types/index.ts`
5. **Frontend Data Access**: `src/features/ai-system-evaluation/ai-system-evaluation-unified-page.tsx`

### Writing Data (Edge Function)

```typescript
// Build consolidated structure
const inputGuardrailData = {
  judgement: inputGuardrailJudgement,
  reason: inputGuardrailReason,
  details: inputGuardrailDetails || []
};

// Save to database
await supabase
  .from('evaluation_prompts')
  .update({
    input_guardrail: inputGuardrailData,
    output_guardrail: outputGuardrailData,
    // ... other fields
  });
```

### Reading Data (Frontend)

```typescript
// Access consolidated structure
const judgement = prompt.input_guardrail?.judgement;
const reason = prompt.input_guardrail?.reason;
const details = prompt.input_guardrail?.details || [];

// Iterate through details
details.forEach(detail => {
  console.log(detail.guardrailName, detail.judgement);
  if (detail.violations) {
    detail.violations.forEach(violation => {
      console.log(violation.phrase, violation.violatedBehaviors);
    });
  }
});
```

## Backwards Compatibility

The migration includes data migration logic that preserves existing data by:
- Combining `input_guardrail_judgement`, `input_guardrail_reason`, and `input_guardrail_details` into the new `input_guardrail` column
- Combining `output_guardrail_judgement`, `output_guardrail_reason`, and `output_guardrail_details` into the new `output_guardrail` column

Note: `input_guardrail_violations` and `output_guardrail_violations` were not heavily used and are removed. Violations are now part of the `details` array within each guardrail evaluation.
