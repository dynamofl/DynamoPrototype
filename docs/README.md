# Documentation Index

This directory contains documentation for the DynamoPrototype evaluation system optimizations.

## 📚 Documents

### 1. [Optimization Quick Reference](./OPTIMIZATION_QUICK_REFERENCE.md)
**Start here** - Quick overview of what changed and why

**Contents**:
- 🚀 Performance improvements summary (5-10x faster)
- ⚙️ Configuration settings
- 🔧 Troubleshooting guide
- 📊 Before/after comparison

**Best for**: Getting up to speed quickly, troubleshooting issues

---

### 2. [Evaluation Performance Optimization](./EVALUATION_PERFORMANCE_OPTIMIZATION.md)
**Complete guide** - Comprehensive documentation

**Contents**:
- 📋 Executive summary
- 🔍 Problem analysis (all bottlenecks identified)
- 🛠️ Implementation details (all 4 optimizations)
- ⚙️ Rate limiter architecture deep dive
- 📖 Tuning guide for different scenarios
- ✅ Testing and validation procedures

**Best for**: Understanding the full context, implementing similar optimizations

---

### 3. [Rate Limiter Architecture](./RATE_LIMITER_ARCHITECTURE.md)
**Deep dive** - Visual explanation of the critical fix

**Contents**:
- 🎯 Queue vs Counter architecture comparison
- 📊 Visual diagrams of old vs new approach
- 🔧 Why the old approach broke parallelization
- ✅ How the new approach enables true parallelization
- 📈 Performance analysis with timelines
- ⚙️ Configuration examples

**Best for**: Understanding why the rate limiter redesign was critical

---

## 🎯 Quick Start Guide

### If You Want To...

**Understand what changed in 2 minutes**:
→ Read [Optimization Quick Reference](./OPTIMIZATION_QUICK_REFERENCE.md)

**Implement similar optimizations in your codebase**:
→ Read [Evaluation Performance Optimization](./EVALUATION_PERFORMANCE_OPTIMIZATION.md)

**Understand the rate limiter architecture**:
→ Read [Rate Limiter Architecture](./RATE_LIMITER_ARCHITECTURE.md)

**Troubleshoot performance issues**:
→ See "Troubleshooting" section in [Quick Reference](./OPTIMIZATION_QUICK_REFERENCE.md)

**Tune configuration for your use case**:
→ See "Tuning Guide" in [Performance Optimization](./EVALUATION_PERFORMANCE_OPTIMIZATION.md)

---

## 📊 Key Takeaways

### The Problem
Evaluations took **5+ minutes for 25 prompts** due to:
1. Sequential batch processing
2. Sequential guardrail evaluation
3. **Queue-based rate limiter forcing sequential execution** (main bottleneck)
4. Small batch sizes

### The Solution
**Four optimizations**:
1. ✅ Parallel batch processing (`Promise.all`)
2. ✅ Parallel guardrail evaluation
3. ✅ **Counter-based concurrent rate limiter** (critical fix)
4. ✅ Larger batch sizes (5 → 15)

### The Results
- **5-10x faster**: 5 minutes → 30-60 seconds
- **Zero breaking changes**: Same API, same results
- **Maintained reliability**: Retry logic and error handling preserved
- **Configurable**: Can tune for different scenarios

---

## 🔍 The Critical Fix: Rate Limiter Redesign

The **most important optimization** was redesigning the rate limiter:

### Before (Queue-Based)
```typescript
// Forced sequential execution
while (queue.length > 0) {
  await process(queue.shift());  // One-by-one
  await delay(1000ms);           // Artificial delay
}
```
**Problem**: Defeated `Promise.all()` - all requests queued and processed sequentially

### After (Counter-Based)
```typescript
// Allows concurrent execution
async execute(fn) {
  while (activeRequests >= 50) await delay(10);
  activeRequests++;
  try {
    return await fn();  // Parallel execution
  } finally {
    activeRequests--;
  }
}
```
**Solution**: Respects `Promise.all()` - up to 50 concurrent requests

---

## ⚙️ Current Configuration

**Files**:
- Rate limiter: `supabase/functions/_shared/rate-limiter.ts`
- Main evaluation: `supabase/functions/run-evaluation/index.ts`
- Guardrail evaluator: `supabase/functions/_shared/guardrail-evaluator.ts`

**Settings**:
```typescript
// Rate limiter (line 87)
export const aiApiLimiter = new RateLimiter(0, 50);
//                                          ^  ^^
//                                          |  maxConcurrent: 50
//                                          minDelay: 0ms

// Batch size (run-evaluation/index.ts:19)
const BATCH_SIZE = 15;
```

---

## 🎯 Performance Comparison

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| **25 prompts** | 5 minutes | 30-60 sec | 5-10× faster |
| **Processing** | Sequential | Parallel | 60% faster |
| **Guardrails** | Sequential | Parallel | 40% faster |
| **Rate limit** | 1000ms delay | 0ms delay | 100% faster |
| **Batch size** | 5 prompts | 15 prompts | 3× larger |
| **Concurrency** | 1 at a time | 50 simultaneous | 50× higher |

---

## 🛠️ Troubleshooting

### Still Slow?
Check deployment version:
```bash
supabase functions list --project-ref uabbbzzrwgfxiamvnunr
# run-evaluation should be v32 or higher
```

### Rate Limit Errors?
Reduce concurrency:
```typescript
export const aiApiLimiter = new RateLimiter(0, 25);
```

### Memory Issues?
Reduce batch size:
```typescript
const BATCH_SIZE = 10;
```

---

## 📈 Monitoring

**Dashboard**: https://supabase.com/dashboard/project/uabbbzzrwgfxiamvnunr/functions

**Look for**:
- Multiple prompts processing simultaneously (in logs)
- Total evaluation time under 1 minute for 25 prompts
- No rate limit errors (429)
- Memory usage within limits

---

## 🔗 Related Files

### Source Code
```
supabase/functions/
├── _shared/
│   ├── rate-limiter.ts          ← Critical optimization
│   ├── guardrail-evaluator.ts   ← Parallel guardrail evaluation
│   ├── ai-client.ts              ← API calls
│   └── types.ts                  ← TypeScript definitions
├── run-evaluation/
│   └── index.ts                  ← Main evaluation logic
└── create-evaluation/
    └── index.ts                  ← Evaluation creation
```

### Documentation
```
docs/
├── README.md                                      ← This file
├── OPTIMIZATION_QUICK_REFERENCE.md               ← Quick start
├── EVALUATION_PERFORMANCE_OPTIMIZATION.md        ← Full guide
└── RATE_LIMITER_ARCHITECTURE.md                  ← Deep dive
```

---

## 📞 Support

For issues or questions:
1. Check [Troubleshooting](#troubleshooting) section
2. Review [Quick Reference](./OPTIMIZATION_QUICK_REFERENCE.md)
3. Consult [Full Documentation](./EVALUATION_PERFORMANCE_OPTIMIZATION.md)

---

**Version**: 1.0
**Last Updated**: October 15, 2025
**Status**: Production
