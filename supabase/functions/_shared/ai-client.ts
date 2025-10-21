// AI System Client - handles calls to different AI providers

import type { AISystem, AISystemResponse, ConversationTurn } from './types.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { aiApiLimiter } from './rate-limiter.ts';

/**
 * Call AI system with multi-turn conversation history
 * Used for advanced jailbreak attacks like TAP and IRIS
 */
export async function callAISystemWithConversation(
  aiSystem: AISystem,
  conversationTurns: ConversationTurn[],
  evaluationApiKey?: string
): Promise<AISystemResponse> {
  const { provider, model, config } = aiSystem;

  console.log('[AI Client - Conversation] callAISystemWithConversation invoked:', {
    provider,
    model,
    hasConfig: !!config,
    hasApiKey: !!config?.apiKey,
    hasApiKeyId: !!config?.apiKeyId,
    apiKeyId: config?.apiKeyId,
    conversationTurns: conversationTurns.length
  });

  // IMPORTANT: For AI system calls, always use the system's own API key
  // Priority: 1) config.apiKey (direct storage), 2) vault lookup
  // The evaluationApiKey is for internal models (judge, guardrail evaluation, etc.)
  // NOT for the target AI system being tested
  let apiKey: string | undefined;

  // First priority: Check if API key is directly in config
  if (config?.apiKey) {
    apiKey = config.apiKey;
    console.log('[AI Client - Conversation] Using API key from config (direct storage)');
  }

  // Second priority: Fetch from vault if apiKeyId is present and we don't have a key yet
  if (!apiKey && config?.apiKeyId) {
    // Fetch API key from vault
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: apiKeyData } = await supabase
      .from('api_keys')
      .select('vault_secret_id')
      .eq('id', config.apiKeyId)
      .single();

    if (apiKeyData?.vault_secret_id) {
      const { data: secretData } = await supabase
        .from('vault_secrets')
        .select('secret')
        .eq('id', apiKeyData.vault_secret_id)
        .single();

      if (secretData?.secret) {
        apiKey = secretData.secret;
      }
    }
  }

  const startTime = Date.now();

  try {
    // Use rate limiter to prevent concurrent API calls
    const response = await aiApiLimiter.execute(async () => {
      let apiResponse: AISystemResponse;

      // Normalize provider name - handle all variations
      let normalizedProvider = provider.toLowerCase().trim();

      // Remove common suffixes and spaces
      normalizedProvider = normalizedProvider
        .replace(/\s+ai$/i, '')  // Remove trailing "AI"
        .replace(/\s+/g, '');     // Remove all spaces

      // Handle specific provider variations and common misspellings
      const providerMap: Record<string, string> = {
        'openai': 'openai',
        'open-ai': 'openai',
        'gpt': 'openai',
        'anthropic': 'anthropic',
        'claude': 'anthropic',
        'mistral': 'mistral',
        'mistralai': 'mistral',
        'azure': 'openai',      // Azure OpenAI uses same API format
        'azureopenai': 'openai',
        'azure-openai': 'openai'
      };

      normalizedProvider = providerMap[normalizedProvider] || normalizedProvider;

      console.log(`[AI Client] Provider normalization: "${provider}" -> "${normalizedProvider}"`);

      switch (normalizedProvider) {
        case 'openai':
          apiResponse = await callOpenAIWithConversation(model, conversationTurns, { ...config, apiKey });
          break;

        case 'mistral':
          apiResponse = await callMistralWithConversation(model, conversationTurns, { ...config, apiKey });
          break;

        case 'anthropic':
          apiResponse = await callAnthropicWithConversation(model, conversationTurns, { ...config, apiKey });
          break;

        case 'custom':
          // For custom endpoints, fall back to single prompt (last user message)
          const lastUserMessage = conversationTurns.filter(t => t.role === 'user').pop();
          if (!lastUserMessage) {
            throw new Error('No user message found in conversation');
          }
          apiResponse = await callCustomEndpoint(model, lastUserMessage.content, config);
          break;

        default:
          throw new Error(`Unsupported AI provider: ${provider} (normalized: ${normalizedProvider})`);
      }

      return apiResponse;
    });

    // Add runtime if not already set
    if (!response.runtimeMs) {
      response.runtimeMs = Date.now() - startTime;
    }

    return response;
  } catch (error) {
    console.error(`Error calling AI system ${aiSystem.name} with conversation:`, error);
    throw error;
  }
}

export async function callAISystem(
  aiSystem: AISystem,
  prompt: string,
  evaluationApiKey?: string
): Promise<AISystemResponse> {
  const { provider, model, config } = aiSystem;

  console.log('[AI Client] callAISystem invoked:', {
    provider,
    model,
    hasConfig: !!config,
    hasApiKey: !!config?.apiKey,
    hasApiKeyId: !!config?.apiKeyId,
    apiKeyId: config?.apiKeyId
  });

  // IMPORTANT: For AI system calls, always use the system's own API key
  // Priority: 1) config.apiKey (direct storage), 2) vault lookup
  // The evaluationApiKey is for internal models (judge, guardrail evaluation, etc.)
  // NOT for the target AI system being tested
  let apiKey: string | undefined;

  // First priority: Check if API key is directly in config
  if (config?.apiKey) {
    apiKey = config.apiKey;
    console.log('[AI Client] Using API key from config (direct storage)');
  }

  // Second priority: Fetch from vault if apiKeyId is present and we don't have a key yet
  if (!apiKey && config?.apiKeyId) {
    // Fetch API key from vault
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    console.log(`[AI Client] Fetching API key for ID: ${config.apiKeyId}`);
    console.log(`[AI Client] Provider: ${provider}`);

    const { data: apiKeyData, error: apiKeyError } = await supabase
      .from('api_keys')
      .select('vault_secret_id, provider, name')
      .eq('id', config.apiKeyId)
      .single();

    if (apiKeyError) {
      console.error('[AI Client] Error fetching API key metadata:', apiKeyError);
      throw new Error(`API key not found in database. Please ensure the API key is properly configured in AI Providers.`);
    }

    console.log(`[AI Client] Found API key entry:`, {
      provider: apiKeyData.provider,
      name: apiKeyData.name,
      vault_secret_id: apiKeyData.vault_secret_id
    });

    if (apiKeyData?.vault_secret_id) {
      console.log(`[AI Client] Fetching secret from vault: ${apiKeyData.vault_secret_id}`);

      const { data: secretData, error: secretError } = await supabase
        .from('vault_secrets')
        .select('secret')
        .eq('id', apiKeyData.vault_secret_id)
        .single();

      if (secretError) {
        console.error('[AI Client] Error fetching secret from vault:', secretError);
        throw new Error(`API key secret not found in vault. Please re-add your API key in AI Providers.`);
      }

      if (secretData?.secret) {
        apiKey = secretData.secret;
        console.log('[AI Client] Successfully retrieved API key from vault');
        console.log('[AI Client] API key length:', apiKey.length);
        console.log('[AI Client] API key starts with:', apiKey.substring(0, 10));
        console.log('[AI Client] API key ends with:', apiKey.substring(apiKey.length - 10));
      } else {
        console.error('[AI Client] Vault secret is empty');
        throw new Error(`API key secret is empty. Please re-add your API key in AI Providers.`);
      }
    } else {
      console.error('[AI Client] No vault_secret_id found for API key');
      throw new Error(`API key has no vault secret reference. Please re-add your API key in AI Providers.`);
    }
  }

  if (!apiKey) {
    throw new Error(`No API key available for ${provider} provider. Please configure an API key in AI Providers.`);
  }

  const startTime = Date.now();

  try {
    // Use rate limiter to prevent concurrent API calls and handle 400 errors
    const response = await aiApiLimiter.execute(async () => {
      let apiResponse: AISystemResponse;

      // Normalize provider name - handle all variations
      let normalizedProvider = provider.toLowerCase().trim();

      // Remove common suffixes and spaces
      normalizedProvider = normalizedProvider
        .replace(/\s+ai$/i, '')  // Remove trailing "AI"
        .replace(/\s+/g, '');     // Remove all spaces

      // Handle specific provider variations and common misspellings
      const providerMap: Record<string, string> = {
        'openai': 'openai',
        'open-ai': 'openai',
        'gpt': 'openai',
        'anthropic': 'anthropic',
        'claude': 'anthropic',
        'mistral': 'mistral',
        'mistralai': 'mistral',
        'azure': 'openai',      // Azure OpenAI uses same API format
        'azureopenai': 'openai',
        'azure-openai': 'openai'
      };

      normalizedProvider = providerMap[normalizedProvider] || normalizedProvider;

      console.log(`[AI Client] Provider normalization: "${provider}" -> "${normalizedProvider}"`);

      switch (normalizedProvider) {
        case 'openai':
          apiResponse = await callOpenAI(model, prompt, { ...config, apiKey });
          break;

        case 'mistral':
          apiResponse = await callMistral(model, prompt, { ...config, apiKey });
          break;

        case 'anthropic':
          apiResponse = await callAnthropic(model, prompt, { ...config, apiKey });
          break;

        case 'custom':
          apiResponse = await callCustomEndpoint(model, prompt, config);
          break;

        default:
          throw new Error(`Unsupported AI provider: ${provider} (normalized: ${normalizedProvider})`);
      }

      return apiResponse;
    });

    // Add runtime if not already set
    if (!response.runtimeMs) {
      response.runtimeMs = Date.now() - startTime;
    }

    return response;
  } catch (error) {
    console.error(`Error calling AI system ${aiSystem.name}:`, error);
    throw error;
  }
}

async function callOpenAI(
  model: string,
  prompt: string,
  config: Record<string, any>
): Promise<AISystemResponse> {
  const apiKey = config.apiKey || Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const startTime = Date.now();

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model || 'gpt-4',
      messages: [
        { role: 'user', content: prompt }
      ],
      temperature: config.temperature || 0.7,
      max_tokens: config.maxTokens || 1000,
      logprobs: true, // Enable logprobs to calculate confidence scores
      top_logprobs: 1 // Get the top 1 alternative token (minimal overhead)
    })
  });

  const runtimeMs = Date.now() - startTime;

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${error}`);
  }

  const data = await response.json();

  // Calculate confidence score from logprobs if available
  let confidenceScore: number | undefined;
  const logprobs = data.choices[0]?.logprobs?.content;
  if (logprobs && Array.isArray(logprobs) && logprobs.length > 0) {
    // Calculate average log probability across all tokens
    const avgLogprob = logprobs.reduce((sum: number, item: any) => sum + item.logprob, 0) / logprobs.length;
    // Convert log probability to probability (0-1 scale)
    confidenceScore = Math.exp(avgLogprob);
  }

  return {
    content: data.choices[0].message.content,
    runtimeMs,
    inputTokens: data.usage?.prompt_tokens,
    outputTokens: data.usage?.completion_tokens,
    totalTokens: data.usage?.total_tokens,
    confidenceScore,
    latencyMs: runtimeMs
  };
}

async function callAnthropic(
  model: string,
  prompt: string,
  config: Record<string, any>
): Promise<AISystemResponse> {
  const apiKey = config.apiKey || Deno.env.get('ANTHROPIC_API_KEY');
  if (!apiKey) {
    throw new Error('Anthropic API key not configured');
  }

  // Trim any whitespace from the API key
  const trimmedApiKey = apiKey.trim();

  console.log('[Anthropic] API key length:', trimmedApiKey.length);
  console.log('[Anthropic] API key prefix:', trimmedApiKey.substring(0, 10));
  console.log('[Anthropic] API key suffix:', trimmedApiKey.substring(trimmedApiKey.length - 10));

  const startTime = Date.now();

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': trimmedApiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: model || 'claude-3-sonnet-20240229',
      messages: [
        { role: 'user', content: prompt }
      ],
      max_tokens: config.maxTokens || 1000
    })
  });

  const runtimeMs = Date.now() - startTime;

  if (!response.ok) {
    const error = await response.text();
    console.error('[Anthropic] API error:', error);
    throw new Error(`Anthropic API error: ${error}`);
  }

  const data = await response.json();

  return {
    content: data.content[0].text,
    runtimeMs,
    inputTokens: data.usage?.input_tokens,
    outputTokens: data.usage?.output_tokens,
    totalTokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0),
    confidenceScore: undefined, // Anthropic doesn't provide confidence scores
    latencyMs: runtimeMs
  };
}

async function callMistral(
  model: string,
  prompt: string,
  config: Record<string, any>
): Promise<AISystemResponse> {
  const apiKey = config.apiKey || Deno.env.get('MISTRAL_API_KEY');
  if (!apiKey) {
    throw new Error('Mistral API key not configured');
  }

  const startTime = Date.now();

  const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model || 'mistral-large-latest',
      messages: [
        { role: 'user', content: prompt }
      ],
      temperature: config.temperature || 0.7,
      max_tokens: config.maxTokens || 1000
    })
  });

  const runtimeMs = Date.now() - startTime;

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Mistral API error: ${error}`);
  }

  const data = await response.json();

  return {
    content: data.choices[0].message.content,
    runtimeMs,
    inputTokens: data.usage?.prompt_tokens,
    outputTokens: data.usage?.completion_tokens,
    totalTokens: data.usage?.total_tokens,
    confidenceScore: undefined, // Mistral doesn't provide confidence scores
    latencyMs: runtimeMs
  };
}

async function callCustomEndpoint(
  model: string,
  prompt: string,
  config: Record<string, any>
): Promise<AISystemResponse> {
  const endpoint = config.endpoint;
  if (!endpoint) {
    throw new Error('Custom endpoint URL not configured');
  }

  const startTime = Date.now();

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(config.headers || {})
    },
    body: JSON.stringify({
      model,
      prompt,
      ...config.requestParams
    })
  });

  const runtimeMs = Date.now() - startTime;

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Custom endpoint error: ${error}`);
  }

  const data = await response.json();
  // Assume response has a 'response' or 'text' field
  const content = data.response || data.text || data.content || JSON.stringify(data);

  return {
    content,
    runtimeMs,
    inputTokens: data.usage?.input_tokens || data.usage?.prompt_tokens,
    outputTokens: data.usage?.output_tokens || data.usage?.completion_tokens,
    totalTokens: data.usage?.total_tokens,
    confidenceScore: undefined, // Custom endpoints don't typically provide confidence scores
    latencyMs: runtimeMs
  };
}

// ============================================================================
// MULTI-TURN CONVERSATION FUNCTIONS
// ============================================================================

async function callOpenAIWithConversation(
  model: string,
  conversationTurns: ConversationTurn[],
  config: Record<string, any>
): Promise<AISystemResponse> {
  const apiKey = config.apiKey || Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const startTime = Date.now();

  // Convert ConversationTurn[] to OpenAI message format
  const messages = conversationTurns.map(turn => ({
    role: turn.role,
    content: turn.content
  }));

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model || 'gpt-4',
      messages: messages,
      temperature: config.temperature || 0.7,
      max_tokens: config.maxTokens || 1000,
      logprobs: true,
      top_logprobs: 1
    })
  });

  const runtimeMs = Date.now() - startTime;

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${error}`);
  }

  const data = await response.json();

  // Calculate confidence score from logprobs if available
  let confidenceScore: number | undefined;
  const logprobs = data.choices[0]?.logprobs?.content;
  if (logprobs && Array.isArray(logprobs) && logprobs.length > 0) {
    const avgLogprob = logprobs.reduce((sum: number, item: any) => sum + item.logprob, 0) / logprobs.length;
    confidenceScore = Math.exp(avgLogprob);
  }

  return {
    content: data.choices[0].message.content,
    runtimeMs,
    inputTokens: data.usage?.prompt_tokens,
    outputTokens: data.usage?.completion_tokens,
    totalTokens: data.usage?.total_tokens,
    confidenceScore,
    latencyMs: runtimeMs
  };
}

async function callAnthropicWithConversation(
  model: string,
  conversationTurns: ConversationTurn[],
  config: Record<string, any>
): Promise<AISystemResponse> {
  const apiKey = config.apiKey || Deno.env.get('ANTHROPIC_API_KEY');
  if (!apiKey) {
    throw new Error('Anthropic API key not configured');
  }

  // Trim any whitespace from the API key
  const trimmedApiKey = apiKey.trim();

  console.log('[Anthropic Conversation] API key length:', trimmedApiKey.length);
  console.log('[Anthropic Conversation] API key prefix:', trimmedApiKey.substring(0, 10));

  const startTime = Date.now();

  // Anthropic requires alternating user/assistant messages and no system messages in the messages array
  // Filter out system messages and convert to Anthropic format
  const messages = conversationTurns
    .filter(turn => turn.role !== 'system')
    .map(turn => ({
      role: turn.role,
      content: turn.content
    }));

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': trimmedApiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: model || 'claude-3-sonnet-20240229',
      messages: messages,
      max_tokens: config.maxTokens || 1000
    })
  });

  const runtimeMs = Date.now() - startTime;

  if (!response.ok) {
    const error = await response.text();
    console.error('[Anthropic Conversation] API error:', error);
    throw new Error(`Anthropic API error: ${error}`);
  }

  const data = await response.json();

  return {
    content: data.content[0].text,
    runtimeMs,
    inputTokens: data.usage?.input_tokens,
    outputTokens: data.usage?.output_tokens,
    totalTokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0),
    confidenceScore: undefined,
    latencyMs: runtimeMs
  };
}

async function callMistralWithConversation(
  model: string,
  conversationTurns: ConversationTurn[],
  config: Record<string, any>
): Promise<AISystemResponse> {
  const apiKey = config.apiKey || Deno.env.get('MISTRAL_API_KEY');
  if (!apiKey) {
    throw new Error('Mistral API key not configured');
  }

  const startTime = Date.now();

  // Convert ConversationTurn[] to Mistral message format (same as OpenAI)
  const messages = conversationTurns.map(turn => ({
    role: turn.role,
    content: turn.content
  }));

  const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model || 'mistral-large-latest',
      messages: messages,
      temperature: config.temperature || 0.7,
      max_tokens: config.maxTokens || 1000
    })
  });

  const runtimeMs = Date.now() - startTime;

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Mistral API error: ${error}`);
  }

  const data = await response.json();

  return {
    content: data.choices[0].message.content,
    runtimeMs,
    inputTokens: data.usage?.prompt_tokens,
    outputTokens: data.usage?.completion_tokens,
    totalTokens: data.usage?.total_tokens,
    confidenceScore: undefined,
    latencyMs: runtimeMs
  };
}
