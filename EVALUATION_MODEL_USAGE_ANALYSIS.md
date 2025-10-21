# Evaluation Model Usage Analysis

## Your Question

**"When I run evaluation, what model will be used to generate the AI system response? Will it be based on that AI system in which I am running evaluation or is there something assigned by default?"**

## Answer

### ✅ The Model Used

When you run an evaluation on an AI system, **the system DOES use the model configured in that specific AI system**.

**Source**: [jailbreak-execution.ts:75](src/features/ai-system-evaluation/lib/jailbreak-execution.ts#L75)

```typescript
// Use the model from the AI system
const modelId = aiSystem.selectedModel;
```

### How It Works

#### Step 1: AI System Configuration
When you create an AI system (e.g., Mistral AI):
```
- System Name: "Production Mistral Bot"
- Provider: Mistral AI
- Model: "mistral-large-latest"  ← This model is stored
- API Key: Selected Mistral key
```

#### Step 2: Running Evaluation
When you run an evaluation on "Production Mistral Bot":
```typescript
// Get the AI system
const aiSystem = aiSystems.find(s => s.id === aiSystemId);

// Use its configured model
const modelId = aiSystem.selectedModel;  // "mistral-large-latest"

// Send request with that model
await client.chat.completions.create({
  model: modelId,  // Uses "mistral-large-latest"
  messages: [{ role: 'user', content: prompt }],
  ...
});
```

## ⚠️ Critical Issue Discovered

### The Problem

While the system DOES use the correct model from the AI system, **it's hardcoded to only work with OpenAI API endpoints**!

**Evidence**: [jailbreak-execution.ts:26-50](src/features/ai-system-evaluation/lib/jailbreak-execution.ts#L26-L50)

```typescript
// ❌ Hardcoded to OpenAI only!
const createOpenAIClient = (apiKey: string) => {
  return {
    chat: {
      completions: {
        create: async (params: any) => {
          const response = await fetch('https://api.openai.com/v1/chat/completions', {
            //                             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
            //                             Hardcoded OpenAI endpoint!
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(params),
          });
          //...
        }
      }
    }
  };
};
```

### What This Means

#### ✅ Works For:
- **OpenAI systems** → Model is used correctly, API endpoint is correct
- Example: System with "gpt-4" model → Calls OpenAI API with "gpt-4" → ✅ Works!

#### ❌ Breaks For:
- **Mistral systems** → Model is used, but sent to OpenAI endpoint (fails)
- Example: System with "mistral-large-latest" → Calls OpenAI API with "mistral-large-latest" → ❌ Fails!

  Error: `Model "mistral-large-latest" does not exist`

- **Anthropic systems** → Model is used, but sent to OpenAI endpoint (fails)
- Example: System with "claude-3-5-sonnet" → Calls OpenAI API with "claude-3-5-sonnet" → ❌ Fails!

#### Current Workaround (Incomplete):
The code uses "Test Execution" API key from Settings → Internal Models:

```typescript
// Get API key from Settings assignment
const apiKey = getApiKeyForUsage('testExecution');
const client = createOpenAIClient(apiKey);  // Always creates OpenAI client!
```

This means:
- If you assign an OpenAI key to "Test Execution" → Works for OpenAI systems
- If you assign a Mistral key to "Test Execution" → Still sends to OpenAI endpoint (fails)

## API Key Assignment

### Current Implementation

**Source**: [jailbreak-execution.ts:70-72](src/features/ai-system-evaluation/lib/jailbreak-execution.ts#L70-L72)

```typescript
// Get API key and model from Test Execution assignment
const apiKey = getApiKeyForUsage('testExecution');
const client = createOpenAIClient(apiKey);
```

The API key comes from **Settings → Internal Models → Test Execution**.

### Settings → Internal Models

Users configure which API key to use for different operations:
- **Internal Judge**: For judging/scoring responses
- **Test Execution**: For running tests against AI systems ← Used here!
- **Prompt Generation**: For generating test prompts

## What Should Happen (Fix Needed)

### Correct Flow:

```typescript
// 1. Get AI system
const aiSystem = aiSystems.find(s => s.id === aiSystemId);

// 2. Get provider from AI system
const provider = aiSystem.providerId;  // "mistral", "openai", "anthropic"

// 3. Get API key for that provider
const apiKey = getApiKeyForAISystem(aiSystem);  // Gets Mistral key for Mistral system

// 4. Create provider-specific client
const client = createProviderClient(provider, apiKey);  // Creates Mistral client!

// 5. Use AI system's model
const modelId = aiSystem.selectedModel;  // "mistral-large-latest"

// 6. Send request to correct endpoint
await client.chat.completions.create({
  model: modelId,  // "mistral-large-latest"
  messages: [{ role: 'user', content: prompt }],
  ...
});
// → Sends to https://api.mistral.ai/v1/chat/completions ✅
```

## Summary

### Current Behavior:

| AI System | Model Used | API Endpoint | API Key From | Result |
|-----------|------------|--------------|--------------|--------|
| OpenAI system with "gpt-4" | ✅ gpt-4 | ❌ OpenAI only | Settings | ✅ Works |
| Mistral system with "mistral-large" | ✅ mistral-large | ❌ OpenAI only | Settings | ❌ Fails |
| Anthropic system with "claude-3" | ✅ claude-3 | ❌ OpenAI only | Settings | ❌ Fails |

### What Users See:

**For OpenAI Systems:**
```
✅ Evaluation runs successfully
✅ Uses configured model (e.g., gpt-4)
✅ Gets responses from OpenAI API
✅ Everything works!
```

**For Mistral Systems:**
```
❌ Evaluation fails
❌ Error: "Model 'mistral-large-latest' does not exist"
❌ Request sent to OpenAI API (wrong endpoint)
❌ User confused why their Mistral system doesn't work
```

## Required Fix

### Files to Update:

1. **[jailbreak-execution.ts](src/features/ai-system-evaluation/lib/jailbreak-execution.ts)**
   - Replace `createOpenAIClient` with provider-specific client factory
   - Use provider from AI system to determine correct endpoint
   - Get API key from AI system's assigned key (not Settings)

2. **[evalRunner.ts](src/features/evaluation/lib/evalRunner.ts)**
   - Same hardcoded OpenAI client issue
   - Needs provider-specific implementation

### Recommended Approach:

Reuse the provider services we created earlier!

```typescript
import { providerRegistry, fetchProviderModels } from '@/features/ai-systems/lib/provider-services';

// Get provider service for AI system
const providerService = providerRegistry.getService(aiSystem.providerId);

// Get API key from AI system
const apiKeyData = await accessTokenStorage.getAllAPIKeys();
const apiKey = apiKeyData.find(k => k.id === aiSystem.apiKeyId)?.key;

// Make provider-specific request
const response = await providerService.makeCompletionRequest(
  apiKey,
  aiSystem.selectedModel,
  messages
);
```

## Conclusion

### To Answer Your Question:

**Q: "What model will be used?"**
**A**: ✅ The model configured in the AI system (`selectedModel` field)

**Q: "Will it use the AI system's model or something assigned by default?"**
**A**: ✅ It uses the AI system's model, NOT a default

**BUT**: ⚠️ **Critical Issue** - Evaluations currently ONLY work for OpenAI systems because the API endpoint is hardcoded. Mistral and other provider evaluations will fail until we implement provider-specific API clients.

### Immediate Status:

```
✅ OpenAI AI Systems → Evaluations work
❌ Mistral AI Systems → Evaluations fail (wrong API endpoint)
❌ Anthropic AI Systems → Evaluations fail (wrong API endpoint)
❌ Other providers → Evaluations fail (wrong API endpoint)
```

### Next Steps:

1. Update evaluation execution to use provider-specific API endpoints
2. Integrate with existing `provider-services.ts`
3. Test evaluations with Mistral AI systems
4. Test evaluations with Anthropic systems
5. Ensure all providers work correctly

Would you like me to implement the fix to make evaluations work with Mistral and other providers?
