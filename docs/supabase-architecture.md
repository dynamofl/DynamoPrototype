# Supabase Backend Architecture for AI Evaluation System

## Overview

This document outlines the architecture for migrating the AI evaluation system from a browser-based localStorage solution to a Supabase-powered backend with independent evaluation workers.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (React)                         │
│  - Create evaluations                                            │
│  - View progress (real-time)                                     │
│  - View results                                                  │
└─────────────────┬───────────────────────────────────────────────┘
                  │ REST API / Realtime
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Supabase Platform                             │
│                                                                   │
│  ┌──────────────────┐    ┌──────────────────┐                   │
│  │   PostgreSQL     │    │  Edge Functions  │                   │
│  │   Database       │◀──▶│  (Deno Runtime)  │                   │
│  │                  │    │                  │                   │
│  │  - evaluations   │    │  - create-eval   │                   │
│  │  - eval_prompts  │    │  - run-eval      │                   │
│  │  - eval_results  │    │  - check-status  │                   │
│  │  - ai_systems    │    └──────────────────┘                   │
│  │  - guardrails    │                                            │
│  └──────────────────┘    ┌──────────────────┐                   │
│           │              │  Realtime        │                   │
│           └─────────────▶│  Subscriptions   │                   │
│                          └──────────────────┘                   │
│                                                                   │
│  ┌──────────────────────────────────────────┐                   │
│  │         Storage (for exports)             │                   │
│  │  - evaluation-exports/                    │                   │
│  │    - {eval-id}.json                       │                   │
│  │    - {eval-id}.csv                        │                   │
│  └──────────────────────────────────────────┘                   │
└───────────────────────────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│              External AI Services                                │
│  - OpenAI API                                                    │
│  - Anthropic API                                                 │
│  - Internal Judge Models                                         │
└─────────────────────────────────────────────────────────────────┘
```

## Database Schema

### 1. Core Tables

#### `evaluations`
Stores evaluation metadata and status.

```sql
CREATE TABLE evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),

  -- Configuration
  ai_system_id UUID REFERENCES ai_systems(id),
  evaluation_type TEXT NOT NULL DEFAULT 'jailbreak',
  config JSONB NOT NULL, -- Store full evaluation config

  -- Progress tracking
  total_prompts INTEGER DEFAULT 0,
  completed_prompts INTEGER DEFAULT 0,
  current_stage TEXT,
  current_prompt_text TEXT,

  -- Results
  summary_metrics JSONB, -- Overall metrics when completed
  error_message TEXT,

  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- For resuming
  checkpoint_data JSONB -- Store state for resuming
);

-- Indexes
CREATE INDEX idx_evaluations_status ON evaluations(status);
CREATE INDEX idx_evaluations_ai_system ON evaluations(ai_system_id);
CREATE INDEX idx_evaluations_created_by ON evaluations(created_by);
CREATE INDEX idx_evaluations_created_at ON evaluations(created_at DESC);
```

#### `evaluation_prompts`
Stores individual prompts for each evaluation.

```sql
CREATE TABLE evaluation_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evaluation_id UUID REFERENCES evaluations(id) ON DELETE CASCADE,

  -- Prompt details
  prompt_index INTEGER NOT NULL,
  policy_id TEXT,
  policy_name TEXT,
  base_prompt TEXT NOT NULL,
  adversarial_prompt TEXT,
  attack_type TEXT,
  behavior_type TEXT,

  -- Execution
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),

  -- Results
  system_response TEXT,
  guardrail_judgement TEXT,
  model_judgement TEXT,
  attack_outcome TEXT,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT
);

-- Indexes
CREATE INDEX idx_eval_prompts_evaluation ON evaluation_prompts(evaluation_id);
CREATE INDEX idx_eval_prompts_status ON evaluation_prompts(evaluation_id, status);
CREATE INDEX idx_eval_prompts_index ON evaluation_prompts(evaluation_id, prompt_index);
```

#### `ai_systems`
Stores AI system configurations.

```sql
CREATE TABLE ai_systems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  provider TEXT NOT NULL,
  model TEXT NOT NULL,
  config JSONB, -- API keys, endpoints, etc. (encrypted)

  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `guardrails`
Stores guardrail configurations.

```sql
CREATE TABLE guardrails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  config JSONB NOT NULL,
  policies JSONB, -- Array of policy definitions

  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `evaluation_logs`
Stores detailed execution logs for debugging.

```sql
CREATE TABLE evaluation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evaluation_id UUID REFERENCES evaluations(id) ON DELETE CASCADE,
  prompt_id UUID REFERENCES evaluation_prompts(id) ON DELETE CASCADE,

  level TEXT NOT NULL CHECK (level IN ('debug', 'info', 'warn', 'error')),
  message TEXT NOT NULL,
  metadata JSONB,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_eval_logs_evaluation ON evaluation_logs(evaluation_id, created_at DESC);
```

### 2. Row Level Security (RLS)

```sql
-- Enable RLS
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluation_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_systems ENABLE ROW LEVEL SECURITY;
ALTER TABLE guardrails ENABLE ROW LEVEL SECURITY;

-- Policies for evaluations
CREATE POLICY "Users can view their own evaluations"
  ON evaluations FOR SELECT
  USING (auth.uid() = created_by);

CREATE POLICY "Users can create evaluations"
  ON evaluations FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own evaluations"
  ON evaluations FOR UPDATE
  USING (auth.uid() = created_by);

-- Similar policies for other tables...
```

## Edge Functions Architecture

### 1. Function: `create-evaluation`

**Purpose**: Initialize a new evaluation and queue it for execution.

**Endpoint**: `POST /functions/v1/create-evaluation`

**Request**:
```typescript
{
  name: string;
  aiSystemId: string;
  evaluationType: 'jailbreak' | 'custom';
  policyIds: string[];
  guardrailIds: string[];
  config: {
    temperature?: number;
    maxTokens?: number;
    // ... other config
  };
}
```

**Response**:
```typescript
{
  evaluationId: string;
  status: 'pending';
  totalPrompts: number;
}
```

**Implementation**:
```typescript
// supabase/functions/create-evaluation/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const { name, aiSystemId, evaluationType, policyIds, guardrailIds, config } = await req.json()

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // 1. Generate prompts based on policies
  const prompts = await generatePromptsFromPolicies(policyIds)

  // 2. Create evaluation record
  const { data: evaluation, error: evalError } = await supabase
    .from('evaluations')
    .insert({
      name,
      ai_system_id: aiSystemId,
      evaluation_type: evaluationType,
      status: 'pending',
      config: { ...config, policyIds, guardrailIds },
      total_prompts: prompts.length,
      created_by: req.headers.get('user-id')
    })
    .select()
    .single()

  if (evalError) throw evalError

  // 3. Create prompt records
  const { error: promptsError } = await supabase
    .from('evaluation_prompts')
    .insert(
      prompts.map((prompt, index) => ({
        evaluation_id: evaluation.id,
        prompt_index: index,
        ...prompt
      }))
    )

  if (promptsError) throw promptsError

  // 4. Trigger async execution (invoke run-evaluation function)
  await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/run-evaluation`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`
    },
    body: JSON.stringify({ evaluationId: evaluation.id })
  })

  return new Response(
    JSON.stringify({
      evaluationId: evaluation.id,
      status: 'pending',
      totalPrompts: prompts.length
    }),
    { headers: { "Content-Type": "application/json" } }
  )
})
```

### 2. Function: `run-evaluation`

**Purpose**: Execute the evaluation asynchronously (long-running process).

**Endpoint**: `POST /functions/v1/run-evaluation` (internal only)

**Implementation Strategy**:

Since Edge Functions have timeout limits (typically 60-150 seconds), we need to use a **chunked execution pattern**:

```typescript
// supabase/functions/run-evaluation/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const BATCH_SIZE = 5 // Process 5 prompts per invocation

serve(async (req) => {
  const { evaluationId } = await req.json()

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // 1. Get evaluation details
  const { data: evaluation } = await supabase
    .from('evaluations')
    .select('*, ai_systems(*), guardrails(*)')
    .eq('id', evaluationId)
    .single()

  // 2. Update status to running
  if (evaluation.status === 'pending') {
    await supabase
      .from('evaluations')
      .update({ status: 'running', started_at: new Date().toISOString() })
      .eq('id', evaluationId)
  }

  // 3. Get next batch of pending prompts
  const { data: prompts } = await supabase
    .from('evaluation_prompts')
    .select('*')
    .eq('evaluation_id', evaluationId)
    .eq('status', 'pending')
    .order('prompt_index')
    .limit(BATCH_SIZE)

  if (!prompts || prompts.length === 0) {
    // All prompts completed - finalize evaluation
    await finalizeEvaluation(supabase, evaluationId)
    return new Response(JSON.stringify({ status: 'completed' }))
  }

  // 4. Process each prompt
  for (const prompt of prompts) {
    await processPrompt(supabase, evaluation, prompt)
  }

  // 5. Check if more prompts remain
  const { count: remainingCount } = await supabase
    .from('evaluation_prompts')
    .select('*', { count: 'exact', head: true })
    .eq('evaluation_id', evaluationId)
    .eq('status', 'pending')

  if (remainingCount && remainingCount > 0) {
    // Re-invoke self for next batch (recursive)
    await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/run-evaluation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`
      },
      body: JSON.stringify({ evaluationId })
    })
  }

  return new Response(JSON.stringify({ status: 'processing', remaining: remainingCount }))
})

async function processPrompt(supabase, evaluation, prompt) {
  // 1. Mark prompt as running
  await supabase
    .from('evaluation_prompts')
    .update({
      status: 'running',
      started_at: new Date().toISOString()
    })
    .eq('id', prompt.id)

  // 2. Update evaluation progress
  await supabase
    .from('evaluations')
    .update({
      current_stage: 'Executing prompt',
      current_prompt_text: prompt.base_prompt.substring(0, 100),
      updated_at: new Date().toISOString()
    })
    .eq('id', evaluation.id)

  try {
    // 3. Call AI system with prompt
    const response = await callAISystem(evaluation.ai_systems, prompt.adversarial_prompt)

    // 4. Evaluate with guardrails
    const guardrailResult = await evaluateWithGuardrails(
      evaluation.guardrails,
      prompt.adversarial_prompt,
      response
    )

    // 5. Judge the outcome
    const outcome = determineOutcome(prompt, response, guardrailResult)

    // 6. Save results
    await supabase
      .from('evaluation_prompts')
      .update({
        status: 'completed',
        system_response: response,
        guardrail_judgement: guardrailResult.judgement,
        model_judgement: guardrailResult.modelJudgement,
        attack_outcome: outcome,
        completed_at: new Date().toISOString()
      })
      .eq('id', prompt.id)

    // 7. Update evaluation completed count
    await supabase.rpc('increment_completed_prompts', {
      eval_id: evaluation.id
    })

  } catch (error) {
    // Handle errors
    await supabase
      .from('evaluation_prompts')
      .update({
        status: 'failed',
        error_message: error.message,
        completed_at: new Date().toISOString()
      })
      .eq('id', prompt.id)

    await supabase
      .from('evaluation_logs')
      .insert({
        evaluation_id: evaluation.id,
        prompt_id: prompt.id,
        level: 'error',
        message: error.message,
        metadata: { stack: error.stack }
      })
  }
}

async function finalizeEvaluation(supabase, evaluationId) {
  // 1. Get all results
  const { data: prompts } = await supabase
    .from('evaluation_prompts')
    .select('*')
    .eq('evaluation_id', evaluationId)

  // 2. Calculate summary metrics
  const summary = calculateSummaryMetrics(prompts)

  // 3. Update evaluation
  await supabase
    .from('evaluations')
    .update({
      status: 'completed',
      summary_metrics: summary,
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', evaluationId)
}
```

### 3. Function: `get-evaluation-status`

**Purpose**: Get current status and progress of an evaluation.

**Endpoint**: `GET /functions/v1/get-evaluation-status?id={evaluationId}`

**Response**:
```typescript
{
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: {
    total: number;
    completed: number;
    percentage: number;
    currentStage: string;
    currentPrompt: string;
  };
  results?: {
    totalTests: number;
    attackSuccesses: number;
    attackFailures: number;
    successRate: number;
  };
}
```

### 4. Database Functions

```sql
-- Increment completed prompts atomically
CREATE OR REPLACE FUNCTION increment_completed_prompts(eval_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE evaluations
  SET completed_prompts = completed_prompts + 1,
      updated_at = NOW()
  WHERE id = eval_id;
END;
$$ LANGUAGE plpgsql;
```

## Real-time Updates

### Frontend Subscription

```typescript
// src/lib/supabase/evaluation-subscription.ts
import { createClient } from '@supabase/supabase-js'

export function subscribeToEvaluation(
  evaluationId: string,
  onProgress: (progress: EvaluationProgress) => void
) {
  const supabase = createClient(
    process.env.REACT_APP_SUPABASE_URL!,
    process.env.REACT_APP_SUPABASE_ANON_KEY!
  )

  // Subscribe to evaluation updates
  const subscription = supabase
    .channel(`evaluation:${evaluationId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'evaluations',
        filter: `id=eq.${evaluationId}`
      },
      (payload) => {
        const evaluation = payload.new
        onProgress({
          total: evaluation.total_prompts,
          completed: evaluation.completed_prompts,
          percentage: (evaluation.completed_prompts / evaluation.total_prompts) * 100,
          currentStage: evaluation.current_stage,
          currentPrompt: evaluation.current_prompt_text,
          status: evaluation.status
        })
      }
    )
    .subscribe()

  return () => {
    subscription.unsubscribe()
  }
}
```

### Usage in React Component

```typescript
// In ai-system-evaluation-page.tsx
useEffect(() => {
  if (!evaluationId) return

  const unsubscribe = subscribeToEvaluation(evaluationId, (progress) => {
    setEvaluationProgress(progress)

    // If completed, load full results
    if (progress.status === 'completed') {
      loadEvaluationResults(evaluationId)
    }
  })

  return unsubscribe
}, [evaluationId])
```

## Migration Path

### Phase 1: Database Setup (Week 1)
1. Set up Supabase project
2. Create database schema
3. Set up RLS policies
4. Create initial seed data migration from localStorage

### Phase 2: Edge Functions (Week 1-2)
1. Implement `create-evaluation` function
2. Implement `run-evaluation` function
3. Implement helper functions (AI system calls, guardrail evaluation)
4. Test with small evaluations

### Phase 3: Frontend Integration (Week 2)
1. Create Supabase client utilities
2. Update evaluation creation to use Edge Functions
3. Implement real-time progress updates
4. Update results display to fetch from database

### Phase 4: Migration & Cleanup (Week 2-3)
1. Migrate existing localStorage data to Supabase
2. Add data export/import tools
3. Remove localStorage dependencies
4. Add error handling and retry logic

## Cost Estimation

### Supabase Pricing (Pro Plan - $25/month)
- **Database**: 8GB storage included
- **Edge Functions**: 2M invocations/month
- **Realtime**: Unlimited connections
- **Storage**: 100GB bandwidth

### Estimated Usage
- **Evaluations**: ~1000/month = 1000 Edge Function calls
- **Prompt Processing**: ~50,000 prompts/month = 10,000 function calls
- **Database Storage**: ~1GB for results
- **Realtime**: ~100 concurrent connections

**Total**: Well within Pro plan limits

## Security Considerations

1. **API Keys**: Store in Supabase Vault (encrypted at rest)
2. **RLS Policies**: Ensure users can only access their own data
3. **Edge Function Auth**: Use JWT tokens for authentication
4. **Rate Limiting**: Implement per-user rate limits
5. **Input Validation**: Validate all inputs in Edge Functions

## Performance Optimizations

1. **Batch Processing**: Process prompts in batches of 5-10
2. **Parallel Execution**: Run multiple prompts concurrently
3. **Caching**: Cache AI system configurations
4. **Indexes**: Proper database indexes for fast queries
5. **Connection Pooling**: Use Supabase connection pooler

## Monitoring & Observability

1. **Edge Function Logs**: Monitor in Supabase dashboard
2. **Database Metrics**: Track query performance
3. **Error Tracking**: Log all errors to `evaluation_logs` table
4. **Alerts**: Set up alerts for failed evaluations
5. **Usage Metrics**: Track API usage and costs

## Next Steps

1. Create Supabase project
2. Set up development environment
3. Implement database schema
4. Build and test first Edge Function
5. Integrate with frontend progressively
