# Compliance Prompts Schema Update

## Overview
Updated the `compliance_prompts` table to use a structured JSONB format for `system_response`, similar to how `jailbreak_prompts` uses `ai_system_response`. Also added an `improved` column for future use.

## Database Changes

### Migration: `20250123000011_update_compliance_prompts_schema.sql`

#### 1. Added `ai_system_response` Column
- **Type**: JSONB
- **Purpose**: Store AI system response with compliance evaluation and metrics, consistent with `jailbreak_prompts.ai_system_response`
- **Nullable**: Yes
- **Default**: NULL
- **Structure**: Same as jailbreak prompts - `{reason, content, judgement, latencyMs, outputTokens, answerPhrases, confidenceScore}`

#### 2. Added `input_guardrail` Column
- **Type**: JSONB
- **Purpose**: Store input guardrail evaluation results, consistent with `jailbreak_prompts.input_guardrail`
- **Nullable**: Yes
- **Default**: NULL
- **Structure**: `{judgement, reason, latencyMs, confidenceScore, details[{guardrailId, guardrailName, judgement, reason, violations, latencyMs, confidenceScore}]}`

#### 3. Added `output_guardrail` Column
- **Type**: JSONB
- **Purpose**: Store output guardrail evaluation results, consistent with `jailbreak_prompts.output_guardrail`
- **Nullable**: Yes
- **Default**: NULL
- **Structure**: `{judgement, reason, latencyMs, confidenceScore, details[{guardrailId, guardrailName, judgement, reason, violations, latencyMs, confidenceScore}]}`

#### 4. ~~Converted `system_response` from TEXT to JSONB~~ (REMOVED)

> **Note**: The `system_response` column has been **completely removed** from the `compliance_prompts` table. Only `ai_system_response` is used for consistency with jailbreak prompts.

**New Structure**:
```json
{
  "reason": "The AI provided a detailed step-by-step guide...",
  "content": "Certainly! Analyzing case law...",
  "judgement": "Answered" | "Refused",
  "latencyMs": 6442,
  "outputTokens": 480,
  "answerPhrases": [
    {
      "phrase": "Understand the Case Context",
      "reasoning": "This phrase introduces the initial step..."
    }
  ],
  "confidenceScore": 0.8622494851455836
}
```

**Migration Features**:
- Idempotent: Can be run multiple times safely
- Backward compatible: Existing TEXT data is wrapped in `{"content": "..."}` format
- Indexes added:
  - GIN index on the entire JSONB column for efficient querying
  - Functional index on `judgement` field
  - Functional index on `confidenceScore` field
- Constraint added to ensure valid JSONB object structure

## Backend Changes

### 1. Edge Function: `supabase/functions/run-evaluation/index.ts`

Updated the compliance prompt saving logic to store structured JSONB data in both `ai_system_response` (primary) and `system_response` (deprecated):

**Before**:
```typescript
system_response: response.content,
compliance_judgement: judgeModelJudgement,
```

**After**:
```typescript
const aiSystemResponseData = {
  reason: judgeModelReason,
  content: response.content,
  judgement: judgeModelJudgement,
  latencyMs: judgeResult.latencyMs || null,
  outputTokens: response.outputTokens || null,
  answerPhrases: judgeResult.answerPhrases || null,
  confidenceScore: judgeResult.confidenceScore || null
};

// Save guardrail results (same structure as jailbreak)
input_guardrail: inputGuardrailJudgement || inputGuardrailReason || inputGuardrailDetails?.length > 0 ? {
  judgement: inputGuardrailJudgement,
  reason: inputGuardrailReason,
  latencyMs: inputResult?.latencyMs || null,
  confidenceScore: inputResult?.confidenceScore || null,
  details: inputGuardrailDetails || []
} : null,
output_guardrail: outputGuardrailJudgement || outputGuardrailReason || outputGuardrailDetails?.length > 0 ? {
  judgement: outputGuardrailJudgement,
  reason: outputGuardrailReason,
  latencyMs: outputResult?.latencyMs || null,
  confidenceScore: outputResult?.confidenceScore || null,
  details: outputGuardrailDetails || []
} : null,

// Save AI system response
ai_system_response: aiSystemResponseData,
compliance_judgement: judgeModelJudgement,
```

### 2. Type Definitions: `supabase/functions/_shared/types.ts`

Updated `CompliancePrompt` interface:
```typescript
// Results - consistent with jailbreak_prompts
input_guardrail?: GuardrailEvaluation | null;   // Input guardrail evaluation
output_guardrail?: GuardrailEvaluation | null;  // Output guardrail evaluation
ai_system_response?: AISystemResponseData | null;  // AI system response with judge evaluation
// system_response field removed
```

## Frontend Changes

### 1. Base Evaluation Types: `src/features/ai-system-evaluation/types/base-evaluation.ts`

Added new `AISystemResponse` interface:
```typescript
export interface AISystemResponse {
  reason?: string
  content: string
  judgement?: 'Answered' | 'Refused' | string
  latencyMs?: number
  outputTokens?: number
  inputTokens?: number
  answerPhrases?: Array<{
    phrase: string
    reasoning: string
  }>
  confidenceScore?: number
}
```

Updated `BaseEvaluationResult`:
```typescript
system_response?: string | AISystemResponse  // Support both formats
```

### 2. Compliance Strategy: `src/features/ai-system-evaluation/strategies/compliance-strategy.tsx`

Updated `transformPrompts()` method to use only `ai_system_response`:

**System Response Extraction**:
```typescript
systemResponse: record.ai_system_response?.content || '',
```

**Judgement Extraction**:
```typescript
complianceJudgement: record.ai_system_response?.judgement || record.compliance_judgement || null,
```

**Metrics Extraction**:
```typescript
outputTokens: record.ai_system_response?.outputTokens || record.output_tokens,
```

## Breaking Changes & Migration

**IMPORTANT**: The `system_response` column has been completely removed from `compliance_prompts`:

1. **Database Migration**: The `system_response` column was dropped via migration `20250123000013_drop_compliance_system_response.sql`
2. **Single Column Storage**: New tests save only to `ai_system_response`
3. **Frontend Code**: Reads only from `ai_system_response` (with fallback to `compliance_judgement` for judgement field)
4. **No Backward Compatibility**: Old tests that used `system_response` are no longer supported. Only new tests with `ai_system_response` will work.

## Benefits

1. **Complete Consistency**: Compliance prompts now use the **exact same structure** as jailbreak prompts:
   - `ai_system_response` - AI response with judge evaluation
   - `input_guardrail` - Input guardrail evaluation results
   - `output_guardrail` - Output guardrail evaluation results
2. **Rich Metadata**: Can now store comprehensive evaluation data:
   - **Guardrail Results**: Detailed violations, confidence scores, and latency for both input and output guardrails
   - **Judge Model Results**: Reasoning, confidence, answer phrases, and latency
   - **Performance Metrics**: Token counts, runtime metrics
3. **Better Querying**: JSONB indexes enable efficient filtering and searching on all evaluation fields
4. **Type Safety**: Proper TypeScript types for all response structures
5. **Code Reusability**: Same data structure means shared components and utilities can work across both test types
6. **Complete Picture**: Now captures the full evaluation workflow (input guardrail → AI system → output guardrail → judge model)

## Clean Architecture

The compliance prompts table now has a clean, consistent structure:
1. **Single source of truth**: Only `ai_system_response` column stores response data
2. **Consistent with jailbreak**: Both test types use the same column name and structure
3. **No legacy baggage**: No deprecated columns or fallback logic needed
4. **Simpler code**: Frontend and backend code is cleaner and easier to maintain

## Testing

The migration was successfully applied to the database without errors. The system is now ready to:
- Save new compliance test results in the structured JSONB format
- Read both old (TEXT) and new (JSONB) data formats
- Display all metadata in the UI when available
