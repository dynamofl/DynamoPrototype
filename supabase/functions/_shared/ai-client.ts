// AI System Client - handles calls to different AI providers

import type { AISystem, AISystemResponse } from './types.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { aiApiLimiter } from './rate-limiter.ts';

export async function callAISystem(
  aiSystem: AISystem,
  prompt: string,
  evaluationApiKey?: string
): Promise<AISystemResponse> {
  const { provider, model, config } = aiSystem;

  // Use evaluation API key if provided, otherwise try to get from vault
  let apiKey = evaluationApiKey;

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
    // Use rate limiter to prevent concurrent API calls and handle 400 errors
    const response = await aiApiLimiter.execute(async () => {
      let apiResponse: AISystemResponse;

      switch (provider.toLowerCase()) {
        case 'openai':
          apiResponse = await callOpenAI(model, prompt, { ...config, apiKey });
          break;

        case 'anthropic':
          apiResponse = await callAnthropic(model, prompt, { ...config, apiKey });
          break;

        case 'custom':
          apiResponse = await callCustomEndpoint(model, prompt, config);
          break;

        default:
          throw new Error(`Unsupported AI provider: ${provider}`);
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
      max_tokens: config.maxTokens || 1000
    })
  });

  const runtimeMs = Date.now() - startTime;

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${error}`);
  }

  const data = await response.json();

  return {
    content: data.choices[0].message.content,
    runtimeMs,
    inputTokens: data.usage?.prompt_tokens,
    outputTokens: data.usage?.completion_tokens,
    totalTokens: data.usage?.total_tokens
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

  const startTime = Date.now();

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
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
    throw new Error(`Anthropic API error: ${error}`);
  }

  const data = await response.json();

  return {
    content: data.content[0].text,
    runtimeMs,
    inputTokens: data.usage?.input_tokens,
    outputTokens: data.usage?.output_tokens,
    totalTokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0)
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
    totalTokens: data.usage?.total_tokens
  };
}
