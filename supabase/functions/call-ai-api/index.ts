// Edge Function: call-ai-api
// Proxy for AI API calls - retrieves API keys from Vault securely

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AIRequest {
  apiKeyId: string // Reference to stored API key
  provider: string
  model: string
  messages: Array<{ role: string; content: string }>
  temperature?: number
  maxTokens?: number
  evaluationId?: string // For logging
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client with service role
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const { apiKeyId, provider, model, messages, temperature, maxTokens, evaluationId }: AIRequest = await req.json()

    // Validate input
    if (!apiKeyId || !provider || !model || !messages) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: apiKeyId, provider, model, messages' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Step 1: Get API key metadata
    const { data: apiKeyMeta, error: metaError } = await supabase
      .from('api_keys')
      .select('id, vault_secret_id, status, provider, expires_at')
      .eq('id', apiKeyId)
      .single()

    if (metaError || !apiKeyMeta) {
      await logUsage(supabase, apiKeyId, 'accessed', false, 'API key not found', evaluationId)
      return new Response(
        JSON.stringify({ error: 'API key not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if key is active
    if (apiKeyMeta.status !== 'active') {
      await logUsage(supabase, apiKeyId, 'accessed', false, `API key status: ${apiKeyMeta.status}`, evaluationId)
      return new Response(
        JSON.stringify({ error: `API key is ${apiKeyMeta.status}` }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if key is expired
    if (apiKeyMeta.expires_at && new Date(apiKeyMeta.expires_at) < new Date()) {
      await logUsage(supabase, apiKeyId, 'accessed', false, 'API key expired', evaluationId)
      await supabase.from('api_keys').update({ status: 'expired' }).eq('id', apiKeyId)
      return new Response(
        JSON.stringify({ error: 'API key has expired' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Step 2: Retrieve actual API key from Vault
    const { data: vaultData, error: vaultError } = await supabase.rpc('vault_get_secret', {
      secret_id: apiKeyMeta.vault_secret_id
    })

    if (vaultError || !vaultData) {
      console.error('Vault retrieval error:', vaultError)
      await logUsage(supabase, apiKeyId, 'accessed', false, 'Failed to retrieve from vault', evaluationId)
      return new Response(
        JSON.stringify({ error: 'Failed to retrieve API key from secure storage' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const actualApiKey = vaultData

    // Step 3: Update usage tracking
    await supabase.rpc('update_api_key_usage', { key_id: apiKeyId })

    // Step 4: Make the actual API call
    let response
    try {
      if (provider === 'openai') {
        response = await callOpenAI(actualApiKey, model, messages, temperature, maxTokens)
      } else if (provider === 'anthropic') {
        response = await callAnthropic(actualApiKey, model, messages, temperature, maxTokens)
      } else {
        throw new Error(`Unsupported provider: ${provider}`)
      }

      // Log successful usage
      await logUsage(supabase, apiKeyId, 'accessed', true, null, evaluationId)

      return new Response(
        JSON.stringify(response),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )

    } catch (error) {
      console.error('AI API call error:', error)
      await logUsage(supabase, apiKeyId, 'accessed', false, error.message, evaluationId)
      return new Response(
        JSON.stringify({ error: 'AI API call failed', details: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function callOpenAI(apiKey: string, model: string, messages: any[], temperature?: number, maxTokens?: number) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: temperature ?? 0.7,
      max_tokens: maxTokens ?? 1000
    })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`)
  }

  return await response.json()
}

async function callAnthropic(apiKey: string, model: string, messages: any[], temperature?: number, maxTokens?: number) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: temperature ?? 0.7,
      max_tokens: maxTokens ?? 1000
    })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Anthropic API error: ${error.error?.message || response.statusText}`)
  }

  return await response.json()
}

async function logUsage(supabase: any, apiKeyId: string, action: string, success: boolean, errorMessage: string | null, evaluationId?: string) {
  await supabase.from('api_key_usage_logs').insert({
    api_key_id: apiKeyId,
    action,
    success,
    error_message: errorMessage,
    evaluation_id: evaluationId,
    function_name: 'call-ai-api'
  })
}
