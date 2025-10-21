# API Key Storage and Authentication Fix

## Problem Summary

You were experiencing authentication errors when running evaluations with non-OpenAI providers (Anthropic, Mistral, etc.):

```
Anthropic API error: {"type":"error","error":{"type":"authentication_error","message":"invalid x-api-key"}}
```

And for OpenAI:
```
Error: No API key available for OpenAI provider. Please configure an API key in AI Providers.
```

## Root Causes Identified

1. **Dual Storage System Conflict**: The application had two different API key storage mechanisms:
   - **Frontend UI**: Storing keys in localStorage via `AccessTokenStorage`
   - **Edge Functions**: Looking for keys in Supabase Vault via `SecureAPIKeyService`

2. **Wrong API Key Usage**: The Test Execution API key was being incorrectly used for ALL provider calls, regardless of the actual provider being tested.

3. **Missing Provider Support**: The store-api-key Edge Function only supported OpenAI and Anthropic, not Mistral or other providers.

## Fixes Applied

### 1. Fixed API Key Selection in Edge Functions
**File**: `supabase/functions/_shared/ai-client.ts`

- Modified `callAISystem()` and `callAISystemWithConversation()` functions
- Ensured AI systems always use their own configured API keys from the vault
- The evaluationApiKey parameter is now only for internal evaluation models (judge, guardrail evaluation)

### 2. Updated Frontend to Use Supabase Vault
**File**: `src/features/settings/layouts/access-token/access-token-content.tsx`

- Modified `handleAPIKeyCreated()` to store API keys in Supabase Vault
- Added provider name mapping (OpenAI → openai, Anthropic → anthropic, etc.)
- Keys are now securely stored server-side, never in browser localStorage

### 3. Extended Provider Support
**File**: `supabase/functions/store-api-key/index.ts`

- Added support for Mistral provider validation
- Added API key format validation for Anthropic (sk-ant- prefix)
- Extended validateAPIKey() function to validate Mistral keys

## How to Use

### Adding New API Keys

1. Go to **Settings → Access Token & API Keys**
2. Click the **"+"** button next to any provider
3. Enter a name for your API key and the actual key
4. Click **"Validate & Save"**

The key will now be:
- Validated against the provider's API
- Stored securely in Supabase Vault (server-side)
- Available for use in AI System evaluations

### For Existing API Keys

If you have API keys that were added before this fix, you'll need to re-add them:

1. Delete the old API key entries
2. Re-add them using the steps above
3. The new keys will be properly stored in Supabase Vault

### Verification

To verify API keys are working:

1. Create an AI System with the desired provider
2. Run an evaluation
3. Check the console for confirmation: `✅ API key successfully stored in Supabase Vault`

## Technical Details

### Storage Flow

1. User enters API key in UI
2. Frontend calls `SecureAPIKeyService.storeAPIKey()`
3. Key is sent to `store-api-key` Edge Function
4. Edge Function:
   - Validates key format
   - Tests key with provider API
   - Stores in Supabase Vault
   - Returns metadata (never the actual key)
5. Frontend stores only metadata reference

### Retrieval Flow

1. Evaluation starts
2. Edge Function reads AI System configuration
3. Gets API key ID from system config
4. Fetches actual key from Vault (server-side only)
5. Uses key to call provider API

## Security Benefits

- **No Client-Side Storage**: API keys never stored in browser
- **Vault Encryption**: Keys encrypted at rest in Supabase Vault
- **Server-Side Only**: Actual keys only accessible in Edge Functions
- **Audit Trail**: All API key usage logged in database

## Supported Providers

- ✅ OpenAI
- ✅ Anthropic
- ✅ Mistral
- ✅ Cohere (validation skipped)
- ✅ Google (validation skipped)
- ✅ Custom endpoints

## Troubleshooting

If you still see API key errors:

1. **Check the Supabase Dashboard**: Go to your project's API Keys table to verify keys are stored
2. **Re-add the API key**: Delete and re-add through the UI
3. **Check provider name**: Ensure the AI System provider matches the API key provider
4. **Verify key format**:
   - OpenAI: starts with `sk-`
   - Anthropic: starts with `sk-ant-`
   - Mistral: no specific format

## Migration Status

- ✅ Edge Functions updated and deployed
- ✅ Frontend updated to use Supabase Vault
- ✅ Provider validation extended
- ✅ API key retrieval fixed for all providers

Your evaluations should now work correctly with all supported providers!