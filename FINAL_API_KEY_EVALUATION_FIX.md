# Final Fix: API Keys Now Working in Evaluations

## The Final Issue You Found

Even though API keys were being stored in the Supabase database, evaluations were still failing with:
```
No API key available for mistral provider. Please configure an API key in AI Providers.
```

## Root Cause

The AI System creation was trying to:
1. Retrieve the actual API key from localStorage (which no longer exists there)
2. Store the actual API key in the AI System's config
3. Use the wrong provider name format (e.g., "Mistral" instead of "mistral")

## The Complete Fix Applied

### 1. Fixed AI System Creation (`ai-systems-page.tsx`)
**Lines 71-122**: Updated `handleSystemCreated` function

**What was wrong:**
- Tried to get API key from localStorage (lines 80-88)
- Stored actual API key in config (line 104)
- Used incorrect provider name format

**What's fixed:**
- Removed localStorage API key retrieval
- Only stores `apiKeyId` reference (not the actual key)
- Maps provider names correctly (OpenAI → openai, Mistral → mistral, etc.)

### 2. API Key Storage Flow (Already Fixed)
**File**: `api-integration.ts`
- API keys are stored in Supabase Vault
- Only the ID reference is returned to the frontend

### 3. Edge Function Flow (Already Fixed)
**File**: `supabase/functions/_shared/ai-client.ts`
- Uses the `apiKeyId` from AI System config
- Fetches actual key from Vault (server-side only)
- Uses the correct key for each provider

## The Complete Data Flow

```
1. User adds API key in AI System UI
   ↓
2. createAndStoreAPIKey() stores in Supabase Vault
   ↓
3. Returns apiKeyId (e.g., "abc-123-def")
   ↓
4. AI System stores only apiKeyId in config
   ↓
5. During Evaluation:
   - Edge Function reads apiKeyId from AI System
   - Fetches actual key from Vault (server-side)
   - Uses key to call provider API
```

## What's Stored Where

### In Supabase `ai_systems` Table:
```json
{
  "id": "system-123",
  "name": "My Mistral System",
  "provider": "mistral",  // lowercase!
  "model": "mistral-large-latest",
  "config": {
    "apiKeyId": "key-abc-123",  // Only the ID, not the key!
    "apiKeyName": "Production Key",
    "modelDetails": {...},
    "hasValidAPIKey": true
  }
}
```

### In Supabase `api_keys` Table:
```sql
id: "key-abc-123"
name: "Production Key"
provider: "mistral"  // lowercase!
vault_secret_id: "vault-xyz-789"
status: "active"
```

### In Supabase Vault:
```
The actual API key (encrypted, server-side only)
```

## Provider Name Mapping

The system now correctly maps provider names:

| UI Display | Database Storage |
|------------|-----------------|
| OpenAI | openai |
| Anthropic | anthropic |
| Mistral | mistral |
| Cohere | cohere |
| Google | google |

## Verification Steps

### 1. Check Your AI System in Database:
```sql
SELECT
  name,
  provider,
  model,
  config->>'apiKeyId' as api_key_id
FROM ai_systems
WHERE name = 'Your System Name';
```

### 2. Check API Key Exists:
```sql
SELECT
  id,
  name,
  provider,
  vault_secret_id,
  status
FROM api_keys
WHERE provider = 'mistral';
```

### 3. Verify Both Match:
- The `apiKeyId` in ai_systems.config should match an `id` in api_keys table
- The provider names should be lowercase in both tables

## If Still Not Working

1. **Re-create the AI System:**
   - Delete the existing AI System
   - Create a new one and select the API key
   - Check console for: `[AISystemsPage] Provider mapping: {...}`

2. **Check Edge Function Logs:**
   - Go to Supabase Dashboard → Functions → Logs
   - Look for errors in `run-evaluation` function

3. **Verify API Key in Vault:**
   ```sql
   SELECT COUNT(*) FROM vault.secrets
   WHERE id IN (SELECT vault_secret_id FROM api_keys);
   ```

## Summary of All Changes

1. ✅ **API Key Storage**: Keys stored in Supabase Vault, not localStorage
2. ✅ **API Key Retrieval**: Functions check Vault first, localStorage as fallback
3. ✅ **AI System Creation**: Only stores apiKeyId reference, not actual key
4. ✅ **Provider Naming**: Consistent lowercase provider names throughout
5. ✅ **Edge Functions**: Updated to use vault-stored keys correctly
6. ✅ **Model Fetching**: Returns default models for vault-stored keys

## Testing Your Fix

1. Create a new AI System with Mistral (or recreate existing one)
2. Run an evaluation
3. You should see success!

The evaluation should now work correctly with all providers - OpenAI, Anthropic, Mistral, etc.!