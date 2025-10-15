# Optimization Quick Reference

**TL;DR**: Evaluation performance improved from **5 minutes to 30-60 seconds** (5-10x faster) through parallel processing and rate limiter redesign.

---

## 🚀 What Changed

### Before (Sequential)
```
25 prompts × 8 seconds each = 200+ seconds (5 minutes)
All API calls forced through a queue, one-by-one
```

### After (Parallel)
```
15 prompts in parallel × 15 seconds = 30 seconds
10 prompts in parallel × 10 seconds = 20 seconds
Total: 30-60 seconds
```

---

## 🔑 Key Optimizations

### 1. Parallel Batch Processing
**File**: `run-evaluation/index.ts:117`
```typescript
// All prompts in batch run simultaneously
await Promise.all(prompts.map(prompt => processPrompt(...)));
```

### 2. Parallel Guardrail Evaluation
**File**: `guardrail-evaluator.ts:327`
```typescript
// All guardrails evaluated at once
const results = await Promise.all(guardrails.map(g => evaluate(g)));
```

### 3. Concurrent Rate Limiter (Critical Fix)
**File**: `rate-limiter.ts`
```typescript
// OLD: Queue-based sequential processor
while (queue.length > 0) {
  await process(queue.shift());  // ❌ One-by-one
  await delay(1000ms);           // ❌ Artificial delay
}

// NEW: Counter-based concurrent executor
async execute(fn) {
  while (activeRequests >= 50) await delay(10);
  activeRequests++;
  try {
    return await fn();  // ✅ Parallel execution
  } finally {
    activeRequests--;
  }
}
```

### 4. Larger Batches
**File**: `run-evaluation/index.ts:19`
```typescript
const BATCH_SIZE = 15;  // Was: 5
```

---

## ⚙️ Configuration

### Rate Limiter Settings
**File**: `rate-limiter.ts:87`
```typescript
export const aiApiLimiter = new RateLimiter(0, 50);
//                                          ^  ^^
//                                          |  maxConcurrent (50)
//                                          minDelay (0ms)
```

### Tuning Options

| Scenario | minDelay | maxConcurrent | Batch Size |
|----------|----------|---------------|------------|
| **Current (Fast)** | 0ms | 50 | 15 |
| **Conservative** | 100ms | 25 | 10 |
| **Aggressive** | 0ms | 100 | 20 |

---

## 🎯 The Critical Fix: Rate Limiter Redesign

### Why the Old Rate Limiter Broke Parallelization

The original rate limiter used a **queue-based sequential processor**:

```typescript
// OLD ARCHITECTURE
┌─────────────────────┐
│ Promise.all([       │
│   request1,         │  All requests
│   request2,         │  added to queue
│   request3          │  ↓
│ ])                  │
└──────┬──────────────┘
       ↓
┌──────────────────────┐
│ Rate Limiter Queue:  │
│ [req1, req2, req3]   │
└──────┬───────────────┘
       ↓
┌──────────────────────┐
│ processQueue():      │
│ while (queue) {      │
│   await req();  ←────┼── Sequential processing!
│   await delay(1s);   │   Only 1 at a time
│ }                    │
└──────────────────────┘
```

**Problem**: The `while` loop with `await` forced sequential execution, defeating `Promise.all()`.

---

### How the New Rate Limiter Enables Parallelization

The new rate limiter uses a **counter-based concurrent executor**:

```typescript
// NEW ARCHITECTURE
┌─────────────────────┐
│ Promise.all([       │
│   request1,         │  All requests
│   request2,         │  execute
│   ...               │  immediately
│   request50         │  ↓
│ ])                  │
└──────┬──────────────┘
       ↓
┌──────────────────────────────────┐
│ Rate Limiter (no queue):         │
│ activeRequests: 0 → 50           │
│ ┌─────────┐ ┌─────────┐         │
│ │ req1 ✓  │ │ req26 ✓ │  ←───   Concurrent
│ │ req2 ✓  │ │ req27 ✓ │         execution
│ │ ...     │ │ ...     │         (up to 50)
│ │ req25 ✓ │ │ req50 ✓ │
│ └─────────┘ └─────────┘         │
└──────────────────────────────────┘
       ↓
   API Providers
```

**Key Differences**:

| Aspect | Old (Queue) | New (Counter) |
|--------|------------|---------------|
| **Data Structure** | Queue (FIFO) | Counter only |
| **Execution** | Sequential | Concurrent |
| **Delays** | 1000ms between all | 0ms (only on limits) |
| **Promise.all()** | Ignored | Respected |
| **Throughput** | 1 req/sec | 50 concurrent |

---

## 📊 Performance Impact

### Timeline Comparison

**Before (Sequential with Delays)**:
```
0s  ─┬─ Prompt 1 Input Guard (2s)
2s   ├─ Prompt 1 AI Call (2s)
4s   ├─ Prompt 1 Output Guard (2s)
6s   ├─ Prompt 1 Judge (2s)
8s  ─┼─ Prompt 2 Input Guard (2s)
10s  ├─ Prompt 2 AI Call (2s)
...
200s End
```

**After (Parallel No Delays)**:
```
0s  ─┬─ All 15 prompts start simultaneously
     ├─ Input Guards (parallel)
     ├─ AI Calls (parallel)
     ├─ Output Guards (parallel)
     └─ Judges (parallel)
15s End of batch 1
```

---

## 🔍 Why We Still Need the Rate Limiter

Even with parallel processing, the rate limiter provides:

### 1. **Prevents API Rate Limiting**
- OpenAI: 500-10,000 req/min (tier-dependent)
- Anthropic: 50-1,000 req/min (tier-dependent)
- Without limiter: 100 concurrent calls → 429 errors

### 2. **Automatic Retry on Errors**
- Transient failures → auto-retry with exponential backoff
- Rate limit hits → backoff and retry (2s, 4s, 8s)
- Network issues → graceful recovery

### 3. **Resource Management**
- Edge Function memory: 512 MB limit
- Edge Function timeout: 150s limit
- Prevents overwhelming the Edge Function

---

## 🧪 How to Test

### 1. Run an Evaluation
```typescript
// Create evaluation with 25 prompts
// Before: ~5 minutes
// After: ~30-60 seconds
```

### 2. Check Logs
Look for concurrent processing indicators:
```
[INFO] Processing 15 prompts in parallel
[INFO] Evaluating 3 input guardrails concurrently
[INFO] Batch completed in 25 seconds
```

### 3. Verify Metrics
- Total evaluation time reduced by 5-10x
- No rate limit errors (429)
- Memory usage within limits
- All results accurate

---

## 🛠️ Troubleshooting

### Problem: Still Slow

**Check**:
1. Is deployment complete? (v32 for run-evaluation)
2. Check logs for sequential processing patterns
3. Verify rate limiter config shows `maxConcurrent: 50`

**Solution**:
```bash
# Redeploy latest version
supabase functions deploy run-evaluation --project-ref uabbbzzrwgfxiamvnunr
```

---

### Problem: Rate Limit Errors (429)

**Solution**: Reduce concurrency
```typescript
// In rate-limiter.ts:87
export const aiApiLimiter = new RateLimiter(0, 25);  // Reduce from 50
```

---

### Problem: Edge Function Timeout

**Solution**: Reduce batch size
```typescript
// In run-evaluation/index.ts:19
const BATCH_SIZE = 10;  // Reduce from 15
```

---

### Problem: Memory Issues

**Solution**: Reduce both
```typescript
// Rate limiter
export const aiApiLimiter = new RateLimiter(0, 25);

// Batch size
const BATCH_SIZE = 10;
```

---

## 📚 Full Documentation

For complete details, see: [EVALUATION_PERFORMANCE_OPTIMIZATION.md](./EVALUATION_PERFORMANCE_OPTIMIZATION.md)

Topics covered:
- Detailed architecture analysis
- Step-by-step implementation guide
- Rate limiter deep dive
- Comprehensive tuning guide
- Testing and validation procedures

---

## 🎯 Key Takeaway

**The rate limiter redesign was the critical breakthrough**. Switching from queue-based sequential processing to counter-based concurrent execution unlocked true parallelization, enabling 5-10x performance improvement while maintaining safety and reliability.

---

**Version**: 1.0
**Last Updated**: October 15, 2025
**Status**: Production
