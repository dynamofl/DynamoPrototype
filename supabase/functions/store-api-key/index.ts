// Edge Function: store-api-key
// Securely stores API keys in Supabase Vault (server-side encryption)

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface StoreKeyRequest {
  name: string
  provider: string
  apiKey: string
  expiresAt?: string
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

    const { name, provider, apiKey, expiresAt }: StoreKeyRequest = await req.json()

    // Validate input
    if (!name || !provider || !apiKey) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: name, provider, apiKey' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate API key format based on provider
    if (provider === 'openai' && !apiKey.startsWith('sk-')) {
      return new Response(
        JSON.stringify({ error: 'Invalid OpenAI API key format (must start with sk-)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Anthropic keys should start with 'sk-ant-'
    if (provider === 'anthropic' && !apiKey.startsWith('sk-ant-')) {
      return new Response(
        JSON.stringify({ error: 'Invalid Anthropic API key format (must start with sk-ant-)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Mistral keys validation (if needed)
    // Mistral keys don't have a specific prefix pattern

    // Step 1: Validate the API key by testing it (skip for test keys)
    const isTestKey = apiKey.startsWith('sk-test-')
    let validationResult = { valid: true, error: '' }

    if (!isTestKey) {
      validationResult = await validateAPIKey(provider, apiKey)
      if (!validationResult.valid) {
        return new Response(
          JSON.stringify({
            error: 'API key validation failed',
            details: validationResult.error
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Step 2: Store the actual API key in Supabase Vault
    // Using pgsodium (Postgres extension for encryption)
    const vaultSecretId = crypto.randomUUID()

    const { error: vaultError } = await supabase.rpc('vault_store_secret', {
      secret_id: vaultSecretId,
      secret_value: apiKey,
      secret_description: `${provider} API key for ${name}`
    })

    if (vaultError) {
      console.error('Vault storage error:', vaultError)
      return new Response(
        JSON.stringify({ error: 'Failed to securely store API key', details: vaultError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Step 3: Store metadata in api_keys table
    const { data: apiKeyRecord, error: dbError } = await supabase
      .from('api_keys')
      .insert({
        name,
        provider,
        vault_secret_id: vaultSecretId,
        key_prefix: apiKey.substring(0, 7),
        key_suffix: apiKey.substring(apiKey.length - 4),
        status: isTestKey ? 'testing' : 'active',
        is_validated: !isTestKey, // Test keys are not validated
        last_validated_at: isTestKey ? null : new Date().toISOString(),
        expires_at: expiresAt || null
      })
      .select()
      .single()

    if (dbError) {
      // Rollback: delete from vault
      await supabase.rpc('vault_delete_secret', { secret_id: vaultSecretId })

      console.error('Database error:', dbError)
      return new Response(
        JSON.stringify({ error: 'Failed to store API key metadata', details: dbError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Step 4: Log the creation
    await supabase.from('api_key_usage_logs').insert({
      api_key_id: apiKeyRecord.id,
      action: 'created',
      success: true,
      function_name: 'store-api-key'
    })

    // Return success (never include actual key in response)
    return new Response(
      JSON.stringify({
        success: true,
        apiKey: {
          id: apiKeyRecord.id,
          name: apiKeyRecord.name,
          provider: apiKeyRecord.provider,
          masked: `${apiKeyRecord.key_prefix}...${apiKeyRecord.key_suffix}`,
          status: apiKeyRecord.status,
          createdAt: apiKeyRecord.created_at,
          expiresAt: apiKeyRecord.expires_at
        }
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

// Validate API key by making a test request
async function validateAPIKey(provider: string, apiKey: string): Promise<{ valid: boolean; error?: string }> {
  try {
    if (provider === 'openai') {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      })

      if (response.ok) {
        return { valid: true }
      } else {
        const error = await response.json()
        return { valid: false, error: error.error?.message || 'Invalid API key' }
      }
    } else if (provider === 'anthropic') {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 1,
          messages: [{ role: 'user', content: 'test' }]
        })
      })

      if (response.ok || response.status === 400) { // 400 is ok, means auth worked
        return { valid: true }
      } else {
        const error = await response.json()
        return { valid: false, error: error.error?.message || 'Invalid API key' }
      }
    } else if (provider === 'mistral') {
      const response = await fetch('https://api.mistral.ai/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      })

      if (response.ok) {
        return { valid: true }
      } else {
        const error = await response.json()
        return { valid: false, error: error.message || 'Invalid API key' }
      }
    }

    // For other providers, skip validation
    return { valid: true }
  } catch (error) {
    return { valid: false, error: error.message }
  }
}
