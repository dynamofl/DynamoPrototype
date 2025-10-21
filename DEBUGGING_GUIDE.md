# Debugging Guide - Mistral AI Systems Not Storing to Supabase

## Current Issue

Mistral AI systems are being created in the UI but not appearing in the Supabase `ai_systems` table or the AI Systems table view.

## Debug Steps

### Step 1: Check Browser Console

1. **Open browser DevTools** (F12 or Right-click → Inspect)
2. **Go to Console tab**
3. **Clear the console** (trash icon)
4. **Create a new Mistral AI system**:
   - Click "Connect AI System"
   - Select "Mistral AI"
   - Add/select API key
   - Wait for models to load
   - Select a model
   - Enter system name
   - Click "Validate & Connect"
   - Wait 2 seconds
   - Click "Dismiss"

### Step 2: Look for These Console Logs

#### ✅ Expected Logs (if working correctly):

```
[AISystemsPage] handleSystemCreated called with system: {
  id: "1729450789123",
  name: "My Mistral System",
  providerId: "mistral",
  providerName: "Mistral AI",
  icon: "Mistral",
  selectedModel: "mistral-large-latest",
  ...
}

[AISystemsPage] Authentication successful

[AISystemsPage] Inserting to Supabase: {
  id: "1729450789123",
  name: "My Mistral System",
  provider: "mistral",
  model: "mistral-large-latest",
  config: {...}
}

[AISystemsPage] Supabase insert successful: [...]

[AISystemsPage] AI systems reloaded
```

#### ❌ Problem Scenarios:

**Scenario A: No logs at all**
```
(nothing in console)
```
→ **Issue**: `handleSystemCreated` is not being called
→ **Check**: Is the dialog passing `onAISystemCreated` prop correctly?

**Scenario B: Authentication error**
```
[AISystemsPage] handleSystemCreated called with system: {...}
Error: Not authenticated
[AISystemsPage] Failed to create system: Error: Not authenticated
```
→ **Issue**: User not logged in to Supabase
→ **Fix**: Ensure Supabase authentication is working

**Scenario C: Supabase insert error**
```
[AISystemsPage] handleSystemCreated called with system: {...}
[AISystemsPage] Authentication successful
[AISystemsPage] Inserting to Supabase: {...}
[AISystemsPage] Supabase insert error: {
  message: "...",
  code: "..."
}
```
→ **Issue**: Supabase database error
→ **Check**: Database schema, RLS policies, missing fields

**Scenario D: Missing fields**
```
[AISystemsPage] handleSystemCreated called with system: {
  id: "...",
  name: "...",
  // Missing: hasValidAPIKey, lastValidated
}
```
→ **Issue**: System object is missing required fields
→ **Check**: Was the fix applied correctly in ai-system-create-dialog.tsx?

### Step 3: Check Supabase Directly

1. **Open Supabase Dashboard**
2. **Go to Table Editor**
3. **Select** `ai_systems` table
4. **Check** if any rows were inserted
5. **Look at** the most recent rows by `created_at`

### Step 4: Check Network Tab

1. **Open DevTools → Network tab**
2. **Filter** by "api" or "supabase"
3. **Create a system**
4. **Look for** POST request to Supabase
5. **Check response**:
   - Status 200/201 = Success
   - Status 400 = Bad request (check payload)
   - Status 401 = Not authenticated
   - Status 403 = Forbidden (RLS policy issue)

### Step 5: Verify Code Changes

Check that the fix was applied correctly:

**File**: `src/features/ai-systems/components/ai-system-create-dialog.tsx`

**Line 315-337** should have:
```typescript
const newSystem: any = {
  id: Date.now().toString(),
  name: formData.name.trim(),
  createdAt: new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }),
  status: "connected" as const,
  icon: selectedProvider!.type as any,
  hasGuardrails: false,
  isEvaluated: false,
  providerId: selectedProvider!.id,
  providerName: selectedProvider!.name,
  apiKeyId: primaryKey?.id || "",
  apiKeyName: primaryKey?.name || "",
  selectedAPIKeys: selectedAPIKeys,
  selectedModel: selectedModel,
  modelDetails: selectedModelDetails,
  hasValidAPIKey: true,        // ← MUST HAVE THIS
  lastValidated: Date.now(),   // ← MUST HAVE THIS
  isExpanded: false,
};
```

## Common Issues & Solutions

### Issue 1: Hot Module Reload Not Working

**Symptom**: Changes not reflected in browser

**Solution**:
```bash
# Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)
# Or restart dev server:
npm run dev
```

### Issue 2: TypeScript Compilation Error

**Symptom**: Console shows TypeScript errors

**Solution**:
```bash
# Check compilation
npx tsc --noEmit

# Fix any errors shown
```

### Issue 3: Supabase RLS Policies

**Symptom**:
```
[AISystemsPage] Supabase insert error: {
  message: "new row violates row-level security policy"
}
```

**Solution**:
1. Go to Supabase Dashboard
2. Navigate to Authentication → Policies
3. Check `ai_systems` table policies
4. Ensure INSERT policy allows authenticated users

### Issue 4: Missing Supabase Environment Variables

**Symptom**:
```
Error: Supabase client not initialized
```

**Solution**:
1. Check `.env` file has:
   ```
   VITE_SUPABASE_URL=...
   VITE_SUPABASE_ANON_KEY=...
   ```
2. Restart dev server after adding env vars

### Issue 5: Schema Mismatch

**Symptom**:
```
[AISystemsPage] Supabase insert error: {
  message: "column 'X' does not exist"
}
```

**Solution**:
1. Verify Supabase schema matches code
2. Check `ai_systems` table has all columns:
   - `id` (uuid or text)
   - `name` (text)
   - `description` (text)
   - `provider` (text)
   - `model` (text)
   - `config` (jsonb)
   - `created_at` (timestamp)
   - `updated_at` (timestamp)

## Quick Test Script

Run this in browser console to test Supabase connection:

```javascript
// Test Supabase connection
const testInsert = async () => {
  const { supabase } = await import('/src/lib/supabase/client.js');

  const testData = {
    id: 'test-' + Date.now(),
    name: 'Test System',
    description: 'Test',
    provider: 'openai',
    model: 'gpt-4',
    config: {
      apiKeyId: 'test',
      apiKeyName: 'Test Key',
      icon: 'OpenAI',
      status: 'connected',
      hasValidAPIKey: true
    }
  };

  console.log('Testing insert:', testData);

  const { data, error } = await supabase
    .from('ai_systems')
    .insert(testData)
    .select();

  if (error) {
    console.error('Insert failed:', error);
  } else {
    console.log('Insert successful:', data);

    // Clean up test data
    await supabase.from('ai_systems').delete().eq('id', testData.id);
  }
};

testInsert();
```

## Next Steps

Based on console logs, determine:

1. **Is `handleSystemCreated` being called?**
   - No → Check dialog props and callback
   - Yes → Continue to step 2

2. **Is authentication working?**
   - No → Fix Supabase auth
   - Yes → Continue to step 3

3. **Is Supabase insert succeeding?**
   - No → Check error message and fix accordingly
   - Yes → Check if reload is working

4. **Is the table refreshing after insert?**
   - No → Check real-time subscription
   - Yes → System should appear!

## Report Findings

After checking console logs, report:
- Exact console output (copy/paste)
- Any error messages
- Network tab status codes
- Whether test script works

This will help identify the exact issue!
