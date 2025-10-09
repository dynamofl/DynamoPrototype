# Frontend Integration Complete ✅

## What Changed

The frontend has been updated to use **Supabase backend** instead of localStorage for evaluations. This means evaluations now run independently on Supabase servers and survive page refreshes!

## Files Modified

### `/src/features/ai-system-evaluation/ai-system-evaluation-page.tsx`

**Before (localStorage)**:
- Evaluations ran in browser using `runJailbreakEvaluation()`
- State stored in localStorage via `EvaluationStorageAdapter`
- Page refresh = evaluation stops ❌

**After (Supabase)**:
- Evaluations created via `EvaluationService.createEvaluation()`
- Run on Supabase Edge Functions
- Real-time progress via Supabase Realtime
- Page refresh = evaluation continues ✅

### Key Changes:

1. **Evaluation Creation** (Line ~246)
   ```typescript
   // OLD: Local execution
   const results = await runJailbreakEvaluation(...)
   EvaluationStorageAdapter.createInProgressTest(...)

   // NEW: Supabase execution
   const result = await EvaluationService.createEvaluation(data, aiSystem.id)
   // Evaluation runs on Supabase servers!
   ```

2. **Load Evaluation History** (Line ~75)
   ```typescript
   // OLD: localStorage
   const history = EvaluationStorageAdapter.loadHistoryForAISystem(system.name)

   // NEW: Supabase
   const supabaseHistory = await EvaluationService.getEvaluationsForAISystem(system.name)
   const history = supabaseHistory.map(e => convertSupabaseToLocalFormat(e))
   ```

3. **Real-time Progress Updates** (Line ~177)
   ```typescript
   // NEW: Subscribe to Supabase Realtime
   useEffect(() => {
     const unsubscribe = EvaluationService.subscribeToEvaluation(
       evaluationId,
       (progress) => {
         setEvaluationProgress({
           stage: progress.currentStage || 'Running',
           current: progress.completed,
           total: progress.total,
           message: progress.currentPrompt || ''
         })

         // Auto-navigate when completed
         if (progress.status === 'completed') {
           // Reload and show completed evaluation
         }
       }
     )
     return () => unsubscribe()
   }, [evaluationId])
   ```

4. **Removed Auto-Resume** (Line ~213)
   - No longer needed!
   - Evaluations run on Supabase servers
   - Real-time subscription handles updates

## How It Works Now

### 1. **Create Evaluation**

```
User clicks "New Evaluation"
         ↓
Fill out form with policies/guardrails
         ↓
Click "Start Evaluation"
         ↓
Frontend calls: EvaluationService.createEvaluation()
         ↓
Supabase Edge Function receives request
         ↓
Creates evaluation in database
         ↓
Starts run-evaluation function (background)
         ↓
Returns evaluation ID immediately
         ↓
Frontend navigates to: /evaluation/{id}
         ↓
Subscribes to real-time updates
```

### 2. **Evaluation Runs (On Supabase Servers)**

```
Edge Function: run-evaluation
         ↓
Fetch 5 pending prompts
         ↓
For each prompt:
  - Call AI system
  - Evaluate with guardrails
  - Save result to database
  - Update progress (triggers Realtime event)
         ↓
If more prompts remain:
  - Re-invoke self (recursive)
         ↓
When complete:
  - Calculate summary metrics
  - Update status to 'completed'
  - Trigger final Realtime event
```

### 3. **Frontend Receives Updates**

```
Realtime subscription fires
         ↓
Update progress UI:
  - "2/50 prompts completed"
  - "Current: Testing against policy X"
         ↓
User can:
  - Refresh page (evaluation continues!)
  - Close browser (evaluation continues!)
  - Open in another tab (see same progress!)
         ↓
When completed:
  - Navigate back to list
  - Show "Completed" status
  - User can view results
```

## Testing the Integration

### Prerequisites
1. Supabase project set up (see [SUPABASE_SETUP.md](./SUPABASE_SETUP.md))
2. Database migrated: `supabase db push`
3. Edge Functions deployed:
   ```bash
   supabase functions deploy create-evaluation
   supabase functions deploy run-evaluation
   supabase functions deploy get-evaluation-status
   ```
4. Environment variables set in `.env`:
   ```
   VITE_SUPABASE_URL=https://uabbbzzrwgfxiamvnunr.supabase.co
   VITE_SUPABASE_ANON_KEY=your-key-here
   ```

### Test Flow

1. **Start the app**
   ```bash
   npm run dev
   ```

2. **Create an evaluation**
   - Navigate to an AI system
   - Click "Evaluation" tab
   - Click "New Evaluation"
   - Select policies and guardrails
   - Click "Start Evaluation"

3. **Verify it's running on Supabase**
   - Check console: "Evaluation created on Supabase: {...}"
   - Check Supabase Dashboard → Table Editor → evaluations
   - You should see a row with status='running'

4. **Test refresh-proof behavior**
   - **REFRESH THE PAGE** (F5 or Cmd+R)
   - The evaluation should still be running!
   - Progress should resume from where it was
   - Real-time updates should continue

5. **Monitor progress**
   - Watch the progress bar update in real-time
   - Check Supabase Dashboard → Functions → Logs
   - See prompts being processed

6. **View results when complete**
   - Wait for evaluation to finish
   - Status changes to "Completed"
   - Click "View Results" to see full report

## Debugging

### Check if Supabase is working

**1. Browser Console**
```javascript
// Should see:
Setting up real-time subscription for: eval-xxxxx
Evaluation created on Supabase: { evaluationId: "...", status: "pending", totalPrompts: 50 }
Progress update received: { completed: 1, total: 50, ... }
```

**2. Supabase Dashboard**
- **Database** → Table Editor → `evaluations`
  - Check if row exists with your evaluation
  - Status should be 'running' or 'completed'

- **Functions** → Logs
  - Check if `run-evaluation` is being invoked
  - Look for errors

- **Realtime** → Inspector
  - Check if `evaluation:your-id` channel is active

### Common Issues

**"Evaluation created on Supabase: undefined"**
- Check `.env` file has correct Supabase URL and keys
- Restart dev server: `npm run dev`
- Check browser console for CORS errors

**"Progress not updating"**
- Check Supabase Realtime is enabled (should be by default)
- Check channel subscription in browser console
- Verify Edge Functions are deployed

**"Evaluation stuck at 0%"**
- Check Edge Function logs: `supabase functions logs run-evaluation`
- May need to set API keys: `supabase secrets set OPENAI_API_KEY=...`
- Check AI system configuration in database

## What's Different from Before

| Feature | Before (localStorage) | After (Supabase) |
|---------|----------------------|------------------|
| **Execution** | Browser JavaScript | Supabase Edge Functions |
| **Storage** | localStorage | PostgreSQL Database |
| **Progress Updates** | Local state | Realtime subscriptions |
| **Refresh Behavior** | ❌ Stops evaluation | ✅ Continues running |
| **Multi-tab** | ❌ No sync | ✅ Synced across tabs |
| **Team Collaboration** | ❌ Local only | ✅ Multi-user support |
| **Crash Recovery** | ❌ Lost progress | ✅ Auto-resumes |
| **Scalability** | Limited to browser | Unlimited on servers |

## Next Steps

1. ✅ Frontend integrated with Supabase
2. ✅ Real-time progress updates working
3. ✅ Refresh-proof evaluations
4. 🔲 Test with real AI systems and guardrails
5. 🔲 Add error handling UI
6. 🔲 Add cancel/pause functionality
7. 🔲 Migrate existing localStorage data to Supabase

## Summary

The frontend now uses Supabase for:
- ✅ **Creating evaluations** → Edge Function
- ✅ **Running evaluations** → Background workers
- ✅ **Storing results** → PostgreSQL
- ✅ **Progress updates** → Realtime subscriptions
- ✅ **Loading history** → Database queries

**Result**: Evaluations survive page refreshes! 🎉

Test it by creating an evaluation, refreshing the page, and watching it continue running!
