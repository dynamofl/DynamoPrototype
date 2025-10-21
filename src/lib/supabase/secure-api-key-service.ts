/**
 * Secure API Key Service
 *
 * This service interacts with backend Edge Functions to securely manage API keys.
 * API keys are NEVER stored in the frontend - they go directly to Supabase Vault.
 */

import { supabase, ensureAuthenticated, getAuthToken } from './client';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

export interface APIKeyMetadata {
  id: string;
  name: string;
  provider: string;
  masked: string; // e.g., "sk-proj...Ab12"
  status: 'active' | 'inactive' | 'revoked' | 'expired';
  isValidated: boolean;
  lastUsedAt?: string;
  usageCount: number;
  createdAt: string;
  expiresAt?: string;
}

export interface StoreAPIKeyRequest {
  name: string;
  provider: 'openai' | 'anthropic' | 'mistral' | 'cohere' | 'google';
  apiKey: string;
  expiresAt?: string;
}

export interface AICallRequest {
  apiKeyId: string;
  provider: string;
  model: string;
  messages: Array<{ role: string; content: string }>;
  temperature?: number;
  maxTokens?: number;
  evaluationId?: string;
}

export class SecureAPIKeyService {
  /**
   * Store a new API key securely in Supabase Vault
   * The key is sent directly to the backend and never stored in browser
   */
  static async storeAPIKey(request: StoreAPIKeyRequest): Promise<APIKeyMetadata> {
    await ensureAuthenticated();
    const token = await getAuthToken();

    const response = await fetch(`${SUPABASE_URL}/functions/v1/store-api-key`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to store API key');
    }

    const result = await response.json();
    return result.apiKey;
  }

  /**
   * Get all API key metadata (not the actual keys)
   */
  static async listAPIKeys(): Promise<APIKeyMetadata[]> {
    await ensureAuthenticated();

    const { data, error } = await supabase
      .from('api_keys')
      .select(`
        id,
        name,
        provider,
        key_prefix,
        key_suffix,
        status,
        is_validated,
        last_used_at,
        usage_count,
        created_at,
        expires_at
      `)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch API keys: ${error.message}`);
    }

    return (data || []).map(key => ({
      id: key.id,
      name: key.name,
      provider: key.provider,
      masked: `${key.key_prefix}...${key.key_suffix}`,
      status: key.status,
      isValidated: key.is_validated,
      lastUsedAt: key.last_used_at,
      usageCount: key.usage_count,
      createdAt: key.created_at,
      expiresAt: key.expires_at
    }));
  }

  /**
   * Get a specific API key metadata
   */
  static async getAPIKey(id: string): Promise<APIKeyMetadata | null> {
    await ensureAuthenticated();

    const { data, error } = await supabase
      .from('api_keys')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      id: data.id,
      name: data.name,
      provider: data.provider,
      masked: `${data.key_prefix}...${data.key_suffix}`,
      status: data.status,
      isValidated: data.is_validated,
      lastUsedAt: data.last_used_at,
      usageCount: data.usage_count,
      createdAt: data.created_at,
      expiresAt: data.expires_at
    };
  }

  /**
   * Delete an API key (removes from both metadata and vault)
   */
  static async deleteAPIKey(id: string): Promise<void> {
    await ensureAuthenticated();

    // Get vault secret ID first
    const { data: keyData } = await supabase
      .from('api_keys')
      .select('vault_secret_id')
      .eq('id', id)
      .single();

    if (keyData) {
      // Delete from vault
      await supabase.rpc('vault_delete_secret', {
        secret_id: keyData.vault_secret_id
      });
    }

    // Delete metadata
    const { error } = await supabase
      .from('api_keys')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete API key: ${error.message}`);
    }
  }

  /**
   * Revoke an API key (marks as revoked, doesn't delete)
   */
  static async revokeAPIKey(id: string): Promise<void> {
    await ensureAuthenticated();

    const { error } = await supabase
      .from('api_keys')
      .update({ status: 'revoked', updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to revoke API key: ${error.message}`);
    }

    // Log the revocation
    await supabase.from('api_key_usage_logs').insert({
      api_key_id: id,
      action: 'revoked',
      success: true,
      function_name: 'frontend'
    });
  }

  /**
   * Make an AI API call using a stored key
   * The actual API key is retrieved from Vault server-side
   */
  static async callAIAPI(request: AICallRequest): Promise<any> {
    await ensureAuthenticated();
    const token = await getAuthToken();

    const response = await fetch(`${SUPABASE_URL}/functions/v1/call-ai-api`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'AI API call failed');
    }

    return await response.json();
  }

  /**
   * Get usage logs for an API key
   */
  static async getAPIKeyLogs(apiKeyId: string, limit: number = 100): Promise<any[]> {
    await ensureAuthenticated();

    const { data, error } = await supabase
      .from('api_key_usage_logs')
      .select('*')
      .eq('api_key_id', apiKeyId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to fetch logs: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get available models for a provider (using a specific API key)
   */
  static async getAvailableModels(apiKeyId: string, provider: string): Promise<string[]> {
    // Make a test call to list models
    try {
      const result = await this.callAIAPI({
        apiKeyId,
        provider,
        model: 'gpt-3.5-turbo', // Dummy model for the call
        messages: [{ role: 'user', content: 'test' }],
        maxTokens: 1
      });

      // Extract available models from the response
      // This is provider-specific logic
      if (provider === 'openai') {
        // Would need to implement model listing endpoint
        return ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'];
      } else if (provider === 'anthropic') {
        return ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'];
      }

      return [];
    } catch (error) {
      console.error('Failed to get available models:', error);
      return [];
    }
  }

  /**
   * Subscribe to API key changes (real-time)
   */
  static subscribeToAPIKeys(callback: (keys: APIKeyMetadata[]) => void): () => void {
    const channel = supabase
      .channel('api_keys_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'api_keys'
      }, async () => {
        // Reload all keys when any change occurs
        const keys = await this.listAPIKeys();
        callback(keys);
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }
}
