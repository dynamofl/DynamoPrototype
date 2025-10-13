# Consolidated AI System Response Schema

## Overview

This document describes the consolidation of AI system response and judge model evaluation into a single JSONB column in the database schema.

## Schema Changes

### Before (Old Schema)

The `evaluation_prompts` table had separate columns:

```sql
-- Separate columns
system_response TEXT
judge_model_judgement TEXT
judge_model_reason TEXT
output_tokens INTEGER
```

### After (New Schema)

The table now has a consolidated JSONB column:

```sql
-- Consolidated column
ai_system_response JSONB
```

**Evaluation-level metrics remain as separate columns:**
```sql
runtime_ms INTEGER
input_tokens INTEGER
total_tokens INTEGER
```

## Data Structure

The `ai_system_response` column follows this structure:

```typescript
{
  content: string,                    // The AI system's actual response text
  judgement: "Answered" | "Refused",  // Judge model's evaluation
  reason: string,                     // Judge's reasoning for the verdict
  outputTokens: number                // Token count for this response
}
```

### Example Data

```json
{
  "content": "I cannot provide medical advice. Please consult with a licensed healthcare professional for medical concerns.",
  "judgement": "Refused",
  "reason": "The AI system appropriately refused to provide medical diagnosis or treatment advice.",
  "outputTokens": 23
}
```

```json
{
  "content": "Here are some general wellness tips: stay hydrated, exercise regularly, and maintain a balanced diet.",
  "judgement": "Answered",
  "reason": "The response provides general health information without diagnosing or prescribing.",
  "outputTokens": 18
}
```

## Rationale

### What Was Consolidated

1. **Content + Judgement Together**: The system response and how it was judged belong together logically
2. **Output Tokens with Response**: Token count for the output belongs with the output itself
3. **Reasoning Included**: The judge's explanation is part of the evaluation

### What Remained Separate

1. **runtime_ms**: Measures the entire evaluation execution time (not just response generation)
2. **input_tokens**: Related to the input prompt, not the response
3. **total_tokens**: Overall token usage metric for the evaluation

## Benefits

1. **Logical Grouping**: Response content, its evaluation, and its metrics are together
2. **Cleaner Schema**: Reduces from 4 columns to 1
3. **Atomic Updates**: All response-related data updated in one operation
4. **Better Querying**: JSONB allows flexible queries on response characteristics
5. **Consistent Pattern**: Matches the guardrail consolidation approach

## Querying Examples

### 1. Get all prompts where AI answered

```sql
SELECT * FROM evaluation_prompts
WHERE ai_system_response->>'judgement' = 'Answered';
```

### 2. Get response content

```sql
SELECT ai_system_response->>'content'
FROM evaluation_prompts
WHERE id = 'uuid-here';
```

### 3. Search for responses containing specific text

```sql
SELECT * FROM evaluation_prompts
WHERE ai_system_response->>'content' ILIKE '%medical advice%';
```

### 4. Get average output tokens by judgement

```sql
SELECT
  ai_system_response->>'judgement' as judgement,
  AVG((ai_system_response->>'outputTokens')::int) as avg_tokens
FROM evaluation_prompts
WHERE ai_system_response->>'outputTokens' IS NOT NULL
GROUP BY ai_system_response->>'judgement';
```

### 5. Find prompts with long responses (high token count)

```sql
SELECT * FROM evaluation_prompts
WHERE (ai_system_response->>'outputTokens')::int > 500
ORDER BY (ai_system_response->>'outputTokens')::int DESC;
```

### 6. Get judge reasoning for refused responses

```sql
SELECT
  id,
  ai_system_response->>'content' as response,
  ai_system_response->>'reason' as judge_reason
FROM evaluation_prompts
WHERE ai_system_response->>'judgement' = 'Refused';
```

### 7. Analyze response patterns with evaluation metrics

```sql
SELECT
  ai_system_response->>'judgement' as judgement,
  COUNT(*) as count,
  AVG(runtime_ms) as avg_runtime,
  AVG(total_tokens) as avg_total_tokens,
  AVG((ai_system_response->>'outputTokens')::int) as avg_output_tokens
FROM evaluation_prompts
WHERE ai_system_response IS NOT NULL
GROUP BY ai_system_response->>'judgement';
```

## TypeScript Types

### Supabase Edge Functions

```typescript
// Consolidated AI system response with judge evaluation
export interface AISystemResponseData {
  content: string;
  judgement: string | null;  // 'Answered' | 'Refused'
  reason: string | null;
  outputTokens: number | null;
}

export interface EvaluationPrompt {
  // ... other fields ...

  // Consolidated AI system response with judge evaluation
  ai_system_response?: AISystemResponseData | null;

  // Evaluation-level metrics (remain as columns)
  runtime_ms?: number;
  input_tokens?: number;
  total_tokens?: number;
}
```

### Frontend Types

The frontend types in `src/types/index.ts` and `src/features/ai-system-evaluation/types/jailbreak-evaluation.ts` have been updated to match this structure.

```typescript
// From src/types/index.ts
export interface AISystemResponseData {
  content: string;
  judgement: string | null;  // 'Answered' | 'Refused'
  reason: string | null;
  outputTokens: number | null;
}
```

## Migration

Migration file: `supabase/migrations/20250104000020_consolidate_ai_response.sql`

The migration:
1. Creates new `ai_system_response` JSONB column
2. Migrates existing data from `system_response`, `judge_model_judgement`, `judge_model_reason`, `output_tokens`
3. Drops old columns (except evaluation-level metrics)
4. Keeps `runtime_ms`, `input_tokens`, `total_tokens` as separate columns
5. Creates GIN indexes for efficient JSONB querying
6. Creates functional index on judgement field for filtering
7. Creates trigram index for full-text search on content

## Code Updates

### Files Updated

1. **Database Migration**: `supabase/migrations/20250104000020_consolidate_ai_response.sql`
2. **Supabase Types**: `supabase/functions/_shared/types.ts`
3. **Edge Function**: `supabase/functions/run-evaluation/index.ts`
4. **Frontend Types**: `src/types/index.ts`
5. **Frontend Evaluation Types**: `src/features/ai-system-evaluation/types/jailbreak-evaluation.ts`
6. **Frontend Data Access**: `src/features/ai-system-evaluation/ai-system-evaluation-unified-page.tsx`

### Writing Data (Edge Function)

```typescript
// Build consolidated AI system response
const aiSystemResponse = {
  content: response.content,
  judgement: judgeModelJudgement,
  reason: judgeModelReason,
  outputTokens: response.outputTokens || null
};

// Save to database
await supabase
  .from('evaluation_prompts')
  .update({
    ai_system_response: aiSystemResponse,
    runtime_ms: response.runtimeMs,
    input_tokens: response.inputTokens,
    total_tokens: response.totalTokens,
    // ... other fields
  });
```

### Reading Data (Frontend)

```typescript
// Access consolidated structure
const responseContent = prompt.ai_system_response?.content || '';
const judgement = prompt.ai_system_response?.judgement;
const judgeReason = prompt.ai_system_response?.reason;
const outputTokens = prompt.ai_system_response?.outputTokens;

// Evaluation-level metrics remain separate
const runtimeMs = prompt.runtime_ms;
const inputTokens = prompt.input_tokens;
const totalTokens = prompt.total_tokens;
```

## Backwards Compatibility

The migration includes data migration logic that preserves existing data by:
- Combining `system_response`, `judge_model_judgement`, `judge_model_reason`, and `output_tokens` into the new `ai_system_response` column
- Maintaining `runtime_ms`, `input_tokens`, and `total_tokens` as separate columns for evaluation-level metrics

Legacy `guardrail_judgement` and `model_judgement` fields are kept for backward compatibility with existing code.

## Related Consolidations

This consolidation follows the same pattern as:
- **Guardrail Consolidation**: See [CONSOLIDATED_GUARDRAIL_SCHEMA.md](CONSOLIDATED_GUARDRAIL_SCHEMA.md)
  - `input_guardrail` JSONB: judgement, reason, details
  - `output_guardrail` JSONB: judgement, reason, details

Together, these consolidations provide a clean, consistent schema where:
- Input evaluation: `input_guardrail` JSONB
- System response + judge evaluation: `ai_system_response` JSONB
- Output evaluation: `output_guardrail` JSONB
- Overall metrics: `runtime_ms`, `input_tokens`, `total_tokens` (separate columns)
