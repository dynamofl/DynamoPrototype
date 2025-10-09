// AI System Client - handles calls to different AI providers

import type { AISystem } from './types.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export async function callAISystem(
  aiSystem: AISystem,
  prompt: string,
  evaluationApiKey?: string
): Promise<string> {
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

  try {
    switch (provider.toLowerCase()) {
      case 'openai':
        return await callOpenAI(model, prompt, { ...config, apiKey });

      case 'anthropic':
        return await callAnthropic(model, prompt, { ...config, apiKey });

      case 'custom':
        return await callCustomEndpoint(model, prompt, config);

      default:
        throw new Error(`Unsupported AI provider: ${provider}`);
    }
  } catch (error) {
    console.error(`Error calling AI system ${aiSystem.name}:`, error);
    throw error;
  }
}

async function callOpenAI(
  model: string,
  prompt: string,
  config: Record<string, any>
): Promise<string> {
  const apiKey = config.apiKey || Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) {
    throw new Error('OpenAI API key not configured');
  }

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

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${error}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function callAnthropic(
  model: string,
  prompt: string,
  config: Record<string, any>
): Promise<string> {
  const apiKey = config.apiKey || Deno.env.get('ANTHROPIC_API_KEY');
  if (!apiKey) {
    throw new Error('Anthropic API key not configured');
  }

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

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Anthropic API error: ${error}`);
  }

  const data = await response.json();
  return data.content[0].text;
}

async function callCustomEndpoint(
  model: string,
  prompt: string,
  config: Record<string, any>
): Promise<string> {
  const endpoint = config.endpoint;
  if (!endpoint) {
    throw new Error('Custom endpoint URL not configured');
  }

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

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Custom endpoint error: ${error}`);
  }

  const data = await response.json();
  // Assume response has a 'response' or 'text' field
  return data.response || data.text || data.content || JSON.stringify(data);
}
