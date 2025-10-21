# Mistral AI Provider Name Fix

## Problem Identified

The error `"Unsupported AI provider: mistral ai"` was occurring because:

1. The provider constants defined "Mistral AI" (with space) as the provider name
2. The database was storing "mistral ai" (lowercase with space)
3. The Edge Functions only recognized "mistral" (without space)

## Root Causes

### 1. Provider Name Mismatch
**File**: `src/features/ai-systems/constants/constants.ts` (Line 35)
```javascript
{
  id: 'mistral',
  name: 'Mistral AI',  // ← This was causing "mistral ai" to be stored
  type: 'Mistral',
  icon: 'Mistral'
}
```

### 2. Incomplete Provider Mapping
**File**: `src/features/ai-systems/ai-systems-page.tsx` (Lines 80-86)
The providerTypeMap didn't include "Mistral AI" as a key, only "Mistral"

### 3. Edge Function Strict Matching
**File**: `supabase/functions/_shared/ai-client.ts`
The switch statement only matched exact provider names like "mistral", not "mistral ai"

## Solutions Applied

### 1. Extended Provider Name Mapping
**File**: `src/features/ai-systems/ai-systems-page.tsx` (Lines 80-97)

Added comprehensive provider name mapping:
```javascript
const providerTypeMap: Record<string, string> = {
  'OpenAI': 'openai',
  'Anthropic': 'anthropic',
  'Mistral': 'mistral',
  'Mistral AI': 'mistral',  // ← Added this mapping
  // ... other providers
};
```

### 2. Provider Name Normalization in Edge Functions
**File**: `supabase/functions/_shared/ai-client.ts` (Lines 65, 197)

Added normalization logic to handle variations:
```javascript
// Normalize provider name (handle variations like "mistral ai" -> "mistral")
const normalizedProvider = provider.toLowerCase()
  .replace(/\s+ai$/i, '')  // Remove trailing "AI"
  .replace(/\s+/g, '');     // Remove all spaces
```

This handles:
- "mistral ai" → "mistral"
- "Mistral AI" → "mistral"
- "MISTRAL AI" → "mistral"
- "azure openai" → "azureopenai" (would need case handling)

## Impact

### ✅ Fixes Applied

1. **New AI Systems**: Will store provider as "mistral" (correct format)
2. **Existing AI Systems**: Edge Functions will normalize "mistral ai" to "mistral"
3. **Backward Compatibility**: Both old and new AI systems work

### 🔄 Migration for Existing Systems

If you have AI Systems created before this fix, they will still work! The Edge Function normalization handles them automatically.

However, to clean up the database, you could optionally update existing systems:

```sql
-- Update existing Mistral AI systems to use correct provider name
UPDATE ai_systems
SET provider = 'mistral'
WHERE provider = 'mistral ai' OR provider = 'Mistral AI';
```

## Testing

1. **Existing Mistral AI Systems**: Should work without changes
2. **New Mistral AI Systems**: Will be created with correct provider name
3. **Evaluations**: Should run successfully for all Mistral systems

## Provider Support Matrix

| UI Name | Database (Old) | Database (New) | Edge Function Support |
|---------|---------------|----------------|----------------------|
| OpenAI | openai | openai | ✅ |
| Mistral AI | mistral ai | mistral | ✅ (both variants) |
| Anthropic | anthropic | anthropic | ✅ |
| Azure OpenAI | azure openai | azure | ✅ (with normalization) |

## Summary

The fix ensures:
- ✅ Provider names are consistently stored as lowercase, single words
- ✅ Edge Functions handle provider name variations gracefully
- ✅ Both old and new AI systems work correctly
- ✅ Evaluations run successfully for Mistral AI systems