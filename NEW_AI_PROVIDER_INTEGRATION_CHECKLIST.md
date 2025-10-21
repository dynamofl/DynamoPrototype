# New AI Provider Integration Checklist

This document provides a comprehensive checklist for integrating a new AI provider (e.g., Cohere, Google AI, etc.) into the DynamoAI platform.

---

## Overview

When adding a new AI provider, you need to update multiple parts of the codebase:
1. **Frontend**: UI components, icons, validation, constants
2. **Backend**: Edge Functions for API calls, database schemas
3. **Type Definitions**: TypeScript interfaces and types
4. **Provider Mapping**: Normalization across different naming conventions

---

## Checklist

### 1. Provider Icon & Assets

**Location**: `src/assets/icons/AISystem/`

- [ ] **Add Provider SVG Icon**
  - Path: `src/assets/icons/AISystem/[ProviderName].svg`
  - Example: `src/assets/icons/AISystem/Cohere.svg`
  - Recommendation: Use SVG format for scalability
  - Icon dimensions: Should work well at 20x20 to 32x32 pixels

**Location**: `src/components/patterns/ui-patterns/ai-system-icon.tsx`

- [ ] **Update AISystemIconProps type** (Line 19)
  ```typescript
  interface AISystemIconProps {
    type: 'OpenAI' | 'Azure' | 'Mistral' | ... | '[NewProvider]'
    className?: string
  }
  ```

- [ ] **Import the SVG file** (Top of file)
  ```typescript
  import [ProviderName]Svg from "@/assets/icons/AISystem/[ProviderName].svg"
  ```

- [ ] **Add to getIconSrc() function** (Line 39)
  ```typescript
  case '[ProviderName]':
    return [ProviderName]Svg
  ```

- [ ] **Check if icon needs theme adaptation** (Line 25)
  - If the SVG uses `fill="currentColor"`, add to `hasCurrentColorFill()` array
  - If not, it will be rendered as a regular `<img>` tag

**Location**: `src/components/patterns/ui-patterns/inline-ai-icons.tsx`

- [ ] **Add inline icon component** (if theme-adaptive)
  - Only needed if the icon should adapt to light/dark themes
  - Example: `OpenAIInlineIcon`, `AnthropicInlineIcon`

---

### 2. Provider Constants & Configuration

**Location**: `src/features/ai-systems/constants/constants.ts`

- [ ] **Add to availableProviderTypes array** (Line 8)
  ```typescript
  {
    id: '[provider-lowercase]',      // e.g., 'cohere'
    name: '[Provider Display Name]', // e.g., 'Cohere'
    type: '[ProviderType]',          // e.g., 'Cohere'
    icon: '[ProviderType]',          // e.g., 'Cohere'
    apiKeys: [],
    hasApiKeys: false
  }
  ```

- [ ] **Add to PROVIDER_OPTIONS array** (Line 125)
  ```typescript
  { value: '[ProviderType]', label: '[Provider Display Name]' }
  ```

**Location**: `src/features/ai-systems/lib/provider-validation.ts`

- [ ] **Add to ProviderType union** (Line 6)
  ```typescript
  export type ProviderType =
    | 'OpenAI'
    | 'Azure'
    | ...
    | '[NewProvider]'
  ```

- [ ] **Add validation configuration** (Line 39)
  ```typescript
  [ProviderName]: {
    prefix: 'api-',              // Optional: Required prefix (e.g., 'sk-', 'hf_')
    minLength: 20,               // Optional: Minimum key length
    maxLength: 100,              // Optional: Maximum key length
    customValidator: (key) => {  // Optional: Custom validation function
      // Custom validation logic
      return true;
    },
    errorMessage: '[Provider] API keys must [validation requirement]',
    placeholder: 'Enter [Provider] API key'
  }
  ```

---

### 3. Settings Page - Access Token Table

**Location**: `src/features/settings/layouts/access-token/lib/access-token-config.tsx`

- [ ] **Add to accessTokenData array** (Line 6)
  ```typescript
  {
    id: '[auto-increment-number]',
    provider: '[Provider Display Name]',
    availableKeys: 0,
    aiSystemUsage: 0,
    lastUpdated: '-',
    hasKeys: false
  }
  ```

- [ ] **Add to providerIconMap** (Line 58)
  ```typescript
  '[Provider Display Name]': '[ProviderType]'
  ```

---

### 4. Provider Type Mappings (Display Name ↔ Database)

Multiple files need to map the provider display name to the lowercase database format.

**Location**: `src/features/ai-systems/ai-systems-page.tsx`

- [ ] **Update providerTypeMap in handleApiKeyAssignment** (~Line 336)
  ```typescript
  const providerTypeMap: Record<string, string> = {
    'OpenAI': 'openai',
    'Anthropic': 'anthropic',
    ...
    '[Provider Display Name]': '[provider-lowercase]'
  };
  ```

**Location**: `src/features/ai-systems/components/api-key-assignment-dialog.tsx`

- [ ] **Update providerTypeMap in loadApiKeys** (~Line 85)
  ```typescript
  const providerTypeMap: Record<string, string> = {
    'OpenAI': 'openai',
    ...
    '[Provider Display Name]': '[provider-lowercase]'
  };
  ```

- [ ] **Update providerTypeMap in handleCreateNewAPIKey** (~Line 230)
  ```typescript
  const providerTypeMap: Record<string, string> = {
    'OpenAI': 'openai',
    ...
    '[Provider Display Name]': '[provider-lowercase]'
  };
  ```

**Location**: `src/features/settings/layouts/access-token/components/api-key-edit-sheet.tsx`

- [ ] **Update providerTypeMap in loadKeys useEffect** (~Line 78)
  ```typescript
  const providerTypeMap: Record<string, string> = {
    'OpenAI': 'openai',
    ...
    '[Provider Display Name]': '[provider-lowercase]'
  };
  ```

**Location**: `src/features/settings/layouts/access-token/access-token-content.tsx`

- [ ] **Update providerTypeMap in handleAPIKeyCreated** (~Line 38)
  ```typescript
  const providerTypeMap: Record<string, string> = {
    'OpenAI': 'openai',
    ...
    '[Provider Display Name]': '[provider-lowercase]'
  };
  ```

**Location**: `src/features/ai-systems/lib/api-integration.ts`

- [ ] **Update providerTypeMap in multiple functions**
  - Check all functions that interact with API keys
  - Ensure consistent provider name mapping

---

### 5. Backend - Supabase Integration

**Location**: `src/lib/supabase/secure-api-key-service.ts`

- [ ] **Update StoreAPIKeyRequest interface** (Line 27)
  ```typescript
  export interface StoreAPIKeyRequest {
    name: string;
    provider: 'openai' | 'anthropic' | 'mistral' | ... | '[provider-lowercase]';
    apiKey: string;
    expiresAt?: string;
  }
  ```

**Location**: `supabase/functions/_shared/ai-client.ts`

This is the **most critical** file - it handles actual API calls to providers.

- [ ] **Add to providerMap normalization** (Line 83 and Line 247)
  ```typescript
  const providerMap: Record<string, string> = {
    'openai': 'openai',
    'anthropic': 'anthropic',
    ...
    '[provider-lowercase]': '[provider-lowercase]',
    '[provider-variation-1]': '[provider-lowercase]', // e.g., 'coherai' -> 'cohere'
    '[provider-variation-2]': '[provider-lowercase]'  // Handle common variations
  };
  ```

- [ ] **Add switch case for the provider** (Line 100 and Line 264)
  ```typescript
  switch (normalizedProvider) {
    case 'openai':
      apiResponse = await callOpenAI(model, prompt, { ...config, apiKey });
      break;

    // Add your new provider
    case '[provider-lowercase]':
      apiResponse = await call[ProviderName](model, prompt, { ...config, apiKey });
      break;

    // ... other cases
  }
  ```

- [ ] **Implement provider API call function**
  ```typescript
  async function call[ProviderName](
    model: string,
    prompt: string,
    config: Record<string, any>
  ): Promise<AISystemResponse> {
    const apiKey = config.apiKey || Deno.env.get('[PROVIDER]_API_KEY');
    if (!apiKey) {
      throw new Error('[Provider] API key not configured');
    }

    const startTime = Date.now();

    const response = await fetch('[PROVIDER_API_ENDPOINT]', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`, // Or provider-specific header
        // Add any provider-specific headers
      },
      body: JSON.stringify({
        model: model || '[default-model]',
        messages: [
          { role: 'user', content: prompt }
        ],
        // Add provider-specific parameters
      })
    });

    const runtimeMs = Date.now() - startTime;

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`[Provider] API error: ${error}`);
    }

    const data = await response.json();

    return {
      content: data.[response_field],           // Adjust based on provider's response format
      runtimeMs,
      inputTokens: data.usage?.prompt_tokens,   // Adjust field names
      outputTokens: data.usage?.completion_tokens,
      totalTokens: data.usage?.total_tokens,
      confidenceScore: undefined,                // If provider doesn't support it
      latencyMs: runtimeMs
    };
  }
  ```

- [ ] **Implement conversation variant** (if supporting multi-turn)
  ```typescript
  async function call[ProviderName]WithConversation(
    model: string,
    conversationTurns: ConversationTurn[],
    config: Record<string, any>
  ): Promise<AISystemResponse> {
    // Similar implementation but with conversation history
    const messages = conversationTurns.map(turn => ({
      role: turn.role,
      content: turn.content
    }));

    // ... rest of implementation
  }
  ```

- [ ] **Add to conversation switch case** (Line 100)
  ```typescript
  case '[provider-lowercase]':
    apiResponse = await call[ProviderName]WithConversation(model, conversationTurns, { ...config, apiKey });
    break;
  ```

---

### 6. Database Schema (if needed)

**Location**: `supabase/migrations/`

The current schema supports any provider string, so you typically **don't need** a migration.

However, if you need provider-specific columns:

- [ ] **Create new migration file**
  ```bash
  supabase migration new add_[provider]_specific_fields
  ```

- [ ] **Update api_keys table** (if needed)
  ```sql
  -- Only if you need provider-specific metadata
  ALTER TABLE api_keys
  ADD COLUMN [provider]_specific_field TEXT;
  ```

---

### 7. Testing Checklist

- [ ] **Frontend Testing**
  - [ ] Icon displays correctly in AI Systems table
  - [ ] Icon displays correctly in Settings > Access Tokens table
  - [ ] Provider appears in "Create AI System" dropdown
  - [ ] API key validation works correctly (prefix, length, format)
  - [ ] API key creation flow works end-to-end
  - [ ] API key management (edit/delete) works
  - [ ] Bulk action "Manage API Keys" works for multiple systems

- [ ] **Backend Testing**
  - [ ] API key stores correctly in Supabase Vault
  - [ ] Provider normalization works (test variations like "[Provider] AI" → "[provider]")
  - [ ] Edge Function can retrieve API key from vault
  - [ ] Edge Function makes successful API call to provider
  - [ ] Error handling works (invalid API key, rate limits, etc.)
  - [ ] Token usage is tracked correctly

- [ ] **Integration Testing**
  - [ ] Create AI system with new provider
  - [ ] Run evaluation using the new provider
  - [ ] Check evaluation results are properly stored
  - [ ] Verify cost/token tracking works

---

### 8. Documentation

- [ ] **Update Provider Documentation**
  - Document where to obtain API keys for the new provider
  - Document any provider-specific configuration
  - Document supported models
  - Document rate limits and pricing considerations

- [ ] **Update README** (if applicable)
  - Add provider to list of supported providers
  - Note any special requirements or limitations

---

## Provider-Specific Considerations

### API Key Format

Research and document:
- **Prefix**: Does the key have a specific prefix? (e.g., OpenAI: `sk-`, Anthropic: `sk-ant-`)
- **Length**: What's the typical length?
- **Format**: Are there specific character requirements?

### API Endpoint

- **Base URL**: What's the API base URL?
- **Authentication**: Bearer token? API key header? Other?
- **API Version**: Does the provider require version headers?

### Request/Response Format

- **Request Body**: What fields are required? (model, messages, max_tokens, etc.)
- **Response Format**: Where is the generated text in the response?
- **Token Usage**: How does the provider report token usage?
- **Confidence Scores**: Does the provider support confidence/probability scores?

### Model Support

- **Default Model**: What should be the default model?
- **Available Models**: What models are available?
- **Model Capabilities**: Any model-specific features or limitations?

### Rate Limits

- **Request Limits**: Requests per minute/hour?
- **Token Limits**: Tokens per minute?
- **Concurrent Requests**: Max concurrent requests?

---

## Quick Reference: Files to Update

### Frontend Files (10+ files)
1. `src/assets/icons/AISystem/[NewProvider].svg` - Add icon
2. `src/components/patterns/ui-patterns/ai-system-icon.tsx` - Icon component
3. `src/features/ai-systems/constants/constants.ts` - Constants
4. `src/features/ai-systems/lib/provider-validation.ts` - Validation
5. `src/features/settings/layouts/access-token/lib/access-token-config.tsx` - Settings table
6. `src/features/ai-systems/ai-systems-page.tsx` - Provider mapping
7. `src/features/ai-systems/components/api-key-assignment-dialog.tsx` - Provider mapping (2 places)
8. `src/features/settings/layouts/access-token/components/api-key-edit-sheet.tsx` - Provider mapping
9. `src/features/settings/layouts/access-token/access-token-content.tsx` - Provider mapping
10. `src/features/ai-systems/lib/api-integration.ts` - Provider mapping
11. `src/lib/supabase/secure-api-key-service.ts` - Type definition

### Backend Files (1 file, multiple locations)
1. `supabase/functions/_shared/ai-client.ts` - **Most critical**
   - Provider normalization map (2 locations)
   - Switch case for API calls (2 locations)
   - Provider API function implementation (2 functions: single + conversation)

---

## Example: Adding Cohere Provider

Here's a complete example of adding Cohere:

### 1. Add Icon
- Place `Cohere.svg` in `src/assets/icons/AISystem/`

### 2. Update Constants
```typescript
// constants.ts
{
  id: 'cohere',
  name: 'Cohere',
  type: 'Cohere',
  icon: 'Cohere',
  apiKeys: [],
  hasApiKeys: false
}
```

### 3. Add Validation
```typescript
// provider-validation.ts
Cohere: {
  minLength: 30,
  errorMessage: 'Cohere API keys must be at least 30 characters long',
  placeholder: 'Enter Cohere API key'
}
```

### 4. Update All Provider Type Maps
```typescript
'Cohere': 'cohere'
```

### 5. Implement API Client
```typescript
// ai-client.ts
case 'cohere':
  apiResponse = await callCohere(model, prompt, { ...config, apiKey });
  break;

async function callCohere(model: string, prompt: string, config: Record<string, any>): Promise<AISystemResponse> {
  const apiKey = config.apiKey || Deno.env.get('COHERE_API_KEY');
  if (!apiKey) {
    throw new Error('Cohere API key not configured');
  }

  const response = await fetch('https://api.cohere.ai/v1/generate', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: model || 'command',
      prompt: prompt,
      max_tokens: config.maxTokens || 1000,
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Cohere API error: ${error}`);
  }

  const data = await response.json();

  return {
    content: data.generations[0].text,
    runtimeMs: Date.now() - startTime,
    inputTokens: data.meta?.billed_units?.input_tokens,
    outputTokens: data.meta?.billed_units?.output_tokens,
    totalTokens: (data.meta?.billed_units?.input_tokens || 0) + (data.meta?.billed_units?.output_tokens || 0),
    confidenceScore: undefined,
    latencyMs: runtimeMs
  };
}
```

---

## Common Pitfalls to Avoid

1. **Inconsistent Naming**: Always use the EXACT same provider name across all files
   - Display Name: "Cohere" (title case)
   - Database: "cohere" (lowercase)
   - Type: "Cohere" (matching display name)

2. **Missing Provider Mapping**: Update ALL providerTypeMap occurrences (there are 6+ places)

3. **Incorrect API Response Parsing**: Each provider has different response formats - carefully read their API docs

4. **Missing Normalization**: Add common variations to providerMap (e.g., "cohere ai", "coherai")

5. **Forgetting Conversation Variant**: If supporting multi-turn conversations, implement both single and conversation variants

6. **Icon Format Issues**: Ensure SVG icons are properly formatted and sized

7. **Type Safety**: Update TypeScript types to include the new provider

---

## Notes

- **Consistency is Key**: Provider names must be consistent across frontend and backend
- **Test Thoroughly**: Test the complete flow from UI → API key storage → evaluation execution
- **Documentation**: Document any provider-specific quirks or requirements
- **Error Handling**: Implement proper error handling for provider-specific errors
- **Rate Limiting**: Consider implementing rate limiting if the provider has strict limits

---

## Support

If you encounter issues:
1. Check console logs for provider normalization
2. Verify API key is correctly stored in Supabase Vault
3. Test the provider's API endpoint directly (e.g., using Postman)
4. Check Edge Function logs in Supabase dashboard

---

**Last Updated**: January 2025
**Version**: 1.0
