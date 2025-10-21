# Evaluation System Multi-Provider Support

## Problem

The evaluation system was hardcoded to only use OpenAI API endpoints, even though it tried to use the correct model from the AI system. This meant that evaluations would fail when run on AI systems using Mistral AI, Anthropic, or other providers.

**Original Issue** ([jailbreak-execution.ts:56-96](src/features/ai-system-evaluation/lib/jailbreak-execution.ts#L56-L96)):
```typescript
// ❌ Hardcoded OpenAI client
const client = createOpenAIClient(apiKey);

// ❌ Only works with OpenAI endpoint
const response = await client.chat.completions.create({
  model: modelId,  // Even though this uses the AI system's model...
  messages: [{ role: 'user', content: prompt }],
  temperature: 0.7,
  max_tokens: 500
});
// ...it still only calls OpenAI's API
```

## Solution

Implemented provider-agnostic chat completion support across all provider services (OpenAI, Mistral AI, Anthropic) and updated the evaluation system to use the AI system's own provider and API key.

## Changes Made

### 1. **Provider Services Enhancement** ([provider-services.ts](src/features/ai-systems/lib/provider-services.ts))

#### Added Chat Completion Interfaces

```typescript
/**
 * Message format for chat completions
 */
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

/**
 * Chat completion response
 */
export interface ChatCompletionResponse {
  content: string
  model: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}
```

#### Updated ProviderService Interface

Added `createChatCompletion` method to the `ProviderService` interface:

```typescript
export interface ProviderService {
  readonly type: ProviderType
  readonly baseUrl: string
  validateKey(apiKey: string): Promise<boolean>
  fetchModels(apiKey: string): Promise<AIModel[]>
  getAuthHeader(apiKey: string): string

  /** Send chat completion request to the provider */
  createChatCompletion(
    apiKey: string,
    model: string,
    messages: ChatMessage[],
    options?: {
      temperature?: number
      maxTokens?: number
      topP?: number
    }
  ): Promise<ChatCompletionResponse>
}
```

#### Implemented for OpenAI ([provider-services.ts:129-174](src/features/ai-systems/lib/provider-services.ts#L129-L174))

```typescript
async createChatCompletion(
  apiKey: string,
  model: string,
  messages: ChatMessage[],
  options?: {
    temperature?: number
    maxTokens?: number
    topP?: number
  }
): Promise<ChatCompletionResponse> {
  const response = await fetch(`${this.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': this.getAuthHeader(apiKey),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 1000,
      top_p: options?.topP ?? 1
    })
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  const data = await response.json()

  return {
    content: data.choices[0].message.content,
    model: data.model,
    usage: {
      promptTokens: data.usage.prompt_tokens,
      completionTokens: data.usage.completion_tokens,
      totalTokens: data.usage.total_tokens
    }
  }
}
```

#### Implemented for Mistral AI ([provider-services.ts:244-289](src/features/ai-systems/lib/provider-services.ts#L244-L289))

```typescript
async createChatCompletion(
  apiKey: string,
  model: string,
  messages: ChatMessage[],
  options?: {
    temperature?: number
    maxTokens?: number
    topP?: number
  }
): Promise<ChatCompletionResponse> {
  const response = await fetch(`${this.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': this.getAuthHeader(apiKey),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 1000,
      top_p: options?.topP ?? 1
    })
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  const data = await response.json()

  return {
    content: data.choices[0].message.content,
    model: data.model,
    usage: {
      promptTokens: data.usage.prompt_tokens,
      completionTokens: data.usage.completion_tokens,
      totalTokens: data.usage.total_tokens
    }
  }
}
```

**Note**: Mistral AI uses the same API format as OpenAI for chat completions.

#### Implemented for Anthropic ([provider-services.ts:352-403](src/features/ai-systems/lib/provider-services.ts#L352-L403))

```typescript
async createChatCompletion(
  apiKey: string,
  model: string,
  messages: ChatMessage[],
  options?: {
    temperature?: number
    maxTokens?: number
    topP?: number
  }
): Promise<ChatCompletionResponse> {
  // Anthropic uses a different message format - needs to separate system messages
  const systemMessages = messages.filter(m => m.role === 'system')
  const conversationMessages = messages.filter(m => m.role !== 'system')

  const response = await fetch(`${this.baseUrl}/messages`, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      max_tokens: options?.maxTokens ?? 1000,
      temperature: options?.temperature ?? 0.7,
      top_p: options?.topP ?? 1,
      system: systemMessages.length > 0 ? systemMessages[0].content : undefined,
      messages: conversationMessages
    })
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  const data = await response.json()

  return {
    content: data.content[0].text,
    model: data.model,
    usage: {
      promptTokens: data.usage.input_tokens,
      completionTokens: data.usage.output_tokens,
      totalTokens: data.usage.input_tokens + data.usage.output_tokens
    }
  }
}
```

**Key Differences for Anthropic**:
- Uses `/messages` endpoint instead of `/chat/completions`
- Uses `x-api-key` header instead of `Authorization: Bearer`
- Requires `anthropic-version` header
- System messages are separate from conversation messages
- Response format is different (`data.content[0].text` vs `data.choices[0].message.content`)
- Token counts use different field names (`input_tokens`/`output_tokens`)

#### Added Helper Function ([provider-services.ts:502-523](src/features/ai-systems/lib/provider-services.ts#L502-L523))

```typescript
/**
 * Create a chat completion using the appropriate provider service
 */
export async function createProviderChatCompletion(
  providerType: ProviderType,
  apiKey: string,
  model: string,
  messages: ChatMessage[],
  options?: {
    temperature?: number
    maxTokens?: number
    topP?: number
  }
): Promise<ChatCompletionResponse> {
  const service = providerRegistry.getService(providerType)

  if (!service) {
    throw new Error(`No service registered for provider: ${providerType}`)
  }

  return service.createChatCompletion(apiKey, model, messages, options)
}
```

### 2. **Evaluation System Update** ([jailbreak-execution.ts](src/features/ai-system-evaluation/lib/jailbreak-execution.ts))

#### Added Imports

```typescript
import { createProviderChatCompletion } from '@/features/ai-systems/lib/provider-services';
import type { ProviderType } from '@/features/ai-systems/lib/provider-validation';
import { supabase } from '@/lib/supabase/client';
```

#### Updated `sendToSystem` Function ([jailbreak-execution.ts:61-129](src/features/ai-system-evaluation/lib/jailbreak-execution.ts#L61-L129))

**Before**:
```typescript
export async function sendToSystem(
  prompt: string,
  aiSystemId: string
): Promise<string> {
  // ❌ Loaded from localStorage (old data)
  const aiSystemsData = SecureStorage.getItem('dynamo-ai-systems');
  const aiSystems: AISystem[] = aiSystemsData ? JSON.parse(aiSystemsData) : [];
  const aiSystem = aiSystems.find(s => s.id === aiSystemId);

  // ❌ Hardcoded to use Test Execution API key (not AI system's key)
  const apiKey = getApiKeyForUsage('testExecution');
  const client = createOpenAIClient(apiKey);

  // ❌ Only calls OpenAI API
  const response = await client.chat.completions.create({
    model: modelId,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 500
  });

  return response.choices[0].message?.content || "";
}
```

**After**:
```typescript
export async function sendToSystem(
  prompt: string,
  aiSystemId: string
): Promise<string> {
  // ✅ Fetch AI system from Supabase (current data)
  const { data: aiSystemData, error: fetchError } = await supabase
    .from('ai_systems')
    .select('*')
    .eq('id', aiSystemId)
    .single();

  if (fetchError || !aiSystemData) {
    throw new Error(`AI System with ID ${aiSystemId} not found in database.`);
  }

  // ✅ Extract provider and model from Supabase data
  const providerType = aiSystemData.provider as ProviderType;
  const modelId = aiSystemData.model;
  const apiKeyId = aiSystemData.config?.apiKeyId;
  const systemName = aiSystemData.name;

  // ✅ Retrieve the AI system's own API key
  const apiKeysData = SecureStorage.getItem('dynamo-api-keys');
  const apiKeys = apiKeysData ? JSON.parse(apiKeysData) : [];
  const apiKeyEntry = apiKeys.find((k: any) => k.id === apiKeyId);

  if (!apiKeyEntry) {
    throw new Error(`API key not found for AI System "${systemName}".`);
  }

  try {
    // ✅ Use provider-agnostic chat completion
    const response = await createProviderChatCompletion(
      providerType,
      apiKeyEntry.key,
      modelId,
      [{ role: 'user', content: prompt }],
      {
        temperature: 0.7,
        maxTokens: 500
      }
    );

    return response.content;
  } catch (error) {
    // Provide helpful error messages
    if (error instanceof Error) {
      if (error.message.includes('model')) {
        throw new Error(`Model "${modelId}" not available with provider "${providerType}".`);
      }
      if (error.message.includes('HTTP error')) {
        throw new Error(`Failed to connect to ${providerType} API.`);
      }
    }
    throw error;
  }
}
```

## Key Improvements

### ✅ **Multi-Provider Support**
- OpenAI systems use OpenAI API
- Mistral AI systems use Mistral AI API
- Anthropic systems use Anthropic API
- Each system uses its own provider's endpoints

### ✅ **Correct API Key Usage**
- Each AI system uses its own configured API key
- No longer uses the "Test Execution" model assignment
- API keys are retrieved from secure storage

### ✅ **Supabase Integration**
- AI systems are loaded from Supabase (not localStorage)
- Ensures data is always current and synced
- Supports real-time updates

### ✅ **Provider-Specific Handling**
- OpenAI: Standard bearer token, `/chat/completions` endpoint
- Mistral AI: Standard bearer token, `/chat/completions` endpoint (same as OpenAI)
- Anthropic: Custom `x-api-key` header, `/messages` endpoint, separate system messages

### ✅ **Error Handling**
- Provider-specific error messages
- Clear indication of which provider failed
- Helpful suggestions for troubleshooting

## How It Works Now

### Evaluation Flow:

1. **User starts evaluation** for an AI system (e.g., "My Mistral Bot")
2. **Evaluation runner** calls `sendToSystem(prompt, aiSystemId)`
3. **Function fetches AI system** from Supabase:
   ```sql
   SELECT * FROM ai_systems WHERE id = aiSystemId
   ```
4. **Extracts configuration**:
   - Provider: `"mistral"`
   - Model: `"mistral-large-latest"`
   - API Key ID: `"api-key-xyz"`
5. **Retrieves API key** from secure storage using the API Key ID
6. **Calls provider-specific endpoint**:
   ```typescript
   createProviderChatCompletion(
     'mistral',
     'actual-mistral-api-key',
     'mistral-large-latest',
     messages,
     options
   )
   ```
7. **Provider service** routes to correct API:
   - Mistral: `https://api.mistral.ai/v1/chat/completions`
   - OpenAI: `https://api.openai.com/v1/chat/completions`
   - Anthropic: `https://api.anthropic.com/v1/messages`
8. **Returns response** from the correct provider

## Testing

### Test with OpenAI System:
1. Create AI system with OpenAI provider
2. Run evaluation
3. ✅ Should use OpenAI API endpoint
4. ✅ Should use OpenAI API key
5. ✅ Should use selected OpenAI model

### Test with Mistral System:
1. Create AI system with Mistral AI provider
2. Run evaluation
3. ✅ Should use Mistral AI API endpoint
4. ✅ Should use Mistral AI API key
5. ✅ Should use selected Mistral model (e.g., `mistral-large-latest`)

### Test with Anthropic System:
1. Create AI system with Anthropic provider
2. Run evaluation
3. ✅ Should use Anthropic API endpoint
4. ✅ Should use Anthropic API key
5. ✅ Should use selected Claude model (e.g., `claude-3-5-sonnet-20241022`)

## Files Modified

1. **[src/features/ai-systems/lib/provider-services.ts](src/features/ai-systems/lib/provider-services.ts)**
   - Added `ChatMessage` and `ChatCompletionResponse` interfaces
   - Added `createChatCompletion` to `ProviderService` interface
   - Implemented `createChatCompletion` in `OpenAIProviderService`
   - Implemented `createChatCompletion` in `MistralProviderService`
   - Implemented `createChatCompletion` in `AnthropicProviderService`
   - Added `createProviderChatCompletion` helper function

2. **[src/features/ai-system-evaluation/lib/jailbreak-execution.ts](src/features/ai-system-evaluation/lib/jailbreak-execution.ts)**
   - Added imports for provider services and Supabase
   - Updated `sendToSystem` to fetch AI systems from Supabase
   - Updated `sendToSystem` to use provider-agnostic chat completion
   - Updated `sendToSystem` to use AI system's own API key
   - Improved error messages with provider-specific details

## Benefits

1. **True Multi-Provider Support**: Evaluations now work with any supported provider
2. **Accurate Testing**: Each AI system is tested with its actual provider and configuration
3. **No Configuration Conflicts**: No longer relies on "Test Execution" model assignment
4. **Real-Time Data**: Always uses current AI system configuration from Supabase
5. **Extensible**: Easy to add new providers by implementing `createChatCompletion`

## Migration Notes

- **No breaking changes** for existing OpenAI systems
- Mistral and Anthropic systems now work correctly in evaluations
- API key management remains unchanged
- Supabase schema remains unchanged

## Future Enhancements

Consider adding support for:
- Azure OpenAI (different endpoint format)
- AWS Bedrock (different authentication)
- Databricks (different API)
- Hugging Face (different response format)
- Gemini (different message format)

Each would require implementing the `createChatCompletion` method in their respective provider service classes.
