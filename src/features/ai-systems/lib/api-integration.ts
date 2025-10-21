/**
 * API integration for AI Systems - handles API key management and model fetching
 */

import { SecureAPIKeyService } from '@/lib/supabase/secure-api-key-service'
import type { APIKeyOption, ProviderOption, AIModel } from '../types'
import { availableProviderTypes } from '../constants'
import { validateProviderAPIKey, fetchProviderModels, isProviderSupported } from './provider-services'
import { validateProviderKeyFormat, type ProviderType } from './provider-validation'

/**
 * Get available API keys for a specific provider
 */
export async function getAPIKeysForProvider(providerType: string): Promise<APIKeyOption[]> {
  try {
    // Map provider names to lowercase for Supabase Vault
    const providerTypeMap: Record<string, string> = {
      'OpenAI': 'openai',
      'Anthropic': 'anthropic',
      'Mistral': 'mistral',
      'Cohere': 'cohere',
      'Google': 'google'
    };
    const vaultProviderType = providerTypeMap[providerType] || providerType.toLowerCase();

    // Get keys from Supabase Vault only (no localStorage fallback)
    const vaultKeys = await SecureAPIKeyService.listAPIKeys();
    const providerKeys = vaultKeys.filter(key => key.provider === vaultProviderType);

    console.log(`Found ${providerKeys.length} ${providerType} keys in Supabase Vault`);

    return providerKeys.map(key => ({
      id: key.id,
      name: key.name,
      provider: providerType, // Use original provider name for UI
      key: key.id, // Use the ID as the key reference
      isAvailable: key.status === 'active'
    }));
  } catch (error) {
    console.error('Failed to get API keys for provider:', error)
    return []
  }
}

/**
 * Get all providers with their available API keys
 */
export async function getProvidersWithAPIKeys(): Promise<ProviderOption[]> {
  try {
    // Get keys from Supabase Vault only (no localStorage)
    let vaultKeysByProvider: Record<string, APIKeyOption[]> = {};

    const vaultKeys = await SecureAPIKeyService.listAPIKeys();

    // Map vault keys to provider types
    for (const key of vaultKeys) {
      // Map lowercase provider names back to proper case
      const providerMap: Record<string, string> = {
        'openai': 'OpenAI',
        'anthropic': 'Anthropic',
        'mistral': 'Mistral',
        'cohere': 'Cohere',
        'google': 'Google'
      };
      const providerType = providerMap[key.provider] || key.provider;

      if (!vaultKeysByProvider[providerType]) {
        vaultKeysByProvider[providerType] = [];
      }

      vaultKeysByProvider[providerType].push({
        id: key.id,
        name: key.name,
        provider: providerType,
        key: key.id, // Use ID as reference
        isAvailable: key.status === 'active'
      });
    }

    console.log('Loaded API keys from Supabase Vault:', Object.keys(vaultKeysByProvider));

    return availableProviderTypes.map(provider => {
      const providerAPIKeys = vaultKeysByProvider[provider.type] || [];

      return {
        ...provider,
        apiKeys: providerAPIKeys,
        hasApiKeys: providerAPIKeys.length > 0
      }
    })
  } catch (error) {
    console.error('Failed to get providers with API keys:', error)
    return availableProviderTypes.map(provider => ({
      ...provider,
      apiKeys: [],
      hasApiKeys: false
    }))
  }
}

/**
 * Fetch models from a provider API using the provided API key
 * @param provider - The provider type
 * @param apiKeyOrId - The API key or vault ID reference
 */
export async function fetchModelsFromProvider(provider: string, apiKeyOrId: string): Promise<AIModel[]> {
  try {
    // Check if this is a vault key ID (UUID format or starts with "vault:")
    const isVaultKey = apiKeyOrId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i) ||
                       apiKeyOrId.startsWith('vault:');

    if (isVaultKey) {
      const keyId = apiKeyOrId.startsWith('vault:') ? apiKeyOrId.substring(6) : apiKeyOrId;
      console.log(`Using vault key ${keyId} to fetch models via secure proxy...`);

      // Use the secure API service to make the call through the backend
      // This is a workaround - we'll make a simple test call to get models
      try {
        // Map provider type to lowercase for the API call
        const providerTypeMap: Record<string, string> = {
          'OpenAI': 'openai',
          'Anthropic': 'anthropic',
          'Mistral': 'mistral',
          'Cohere': 'cohere',
          'Google': 'google'
        };
        const apiProvider = providerTypeMap[provider] || provider.toLowerCase();

        if (apiProvider === 'openai') {
          // For OpenAI, we can use a models endpoint call
          const response = await SecureAPIKeyService.callAIAPI({
            apiKeyId: keyId,
            provider: apiProvider,
            model: 'gpt-3.5-turbo', // Dummy model for the models list call
            messages: [{ role: 'user', content: 'test' }],
            maxTokens: 1
          });

          // Return a default set of models for now
          // In production, you'd need a dedicated endpoint to list models
          return [
            { id: 'gpt-4', created: Date.now() / 1000, object: 'model', owned_by: 'openai' },
            { id: 'gpt-4-turbo', created: Date.now() / 1000, object: 'model', owned_by: 'openai' },
            { id: 'gpt-3.5-turbo', created: Date.now() / 1000, object: 'model', owned_by: 'openai' },
            { id: 'gpt-3.5-turbo-16k', created: Date.now() / 1000, object: 'model', owned_by: 'openai' }
          ];
        } else if (apiProvider === 'anthropic') {
          return [
            { id: 'claude-3-opus-20240229', created: Date.now() / 1000, object: 'model', owned_by: 'anthropic' },
            { id: 'claude-3-sonnet-20240229', created: Date.now() / 1000, object: 'model', owned_by: 'anthropic' },
            { id: 'claude-3-haiku-20240307', created: Date.now() / 1000, object: 'model', owned_by: 'anthropic' }
          ];
        } else if (apiProvider === 'mistral') {
          return [
            { id: 'mistral-large-latest', created: Date.now() / 1000, object: 'model', owned_by: 'mistral' },
            { id: 'mistral-medium', created: Date.now() / 1000, object: 'model', owned_by: 'mistral' },
            { id: 'mistral-small', created: Date.now() / 1000, object: 'model', owned_by: 'mistral' }
          ];
        } else {
          return [];
        }
      } catch (error) {
        console.warn('Could not fetch models via secure proxy, using defaults:', error);
        // Return default models based on provider
        if (provider === 'OpenAI') {
          return [
            { id: 'gpt-4', created: Date.now() / 1000, object: 'model', owned_by: 'openai' },
            { id: 'gpt-3.5-turbo', created: Date.now() / 1000, object: 'model', owned_by: 'openai' }
          ];
        }
        return [];
      }
    }

    // This shouldn't happen anymore since we're only using Vault keys
    console.error('Invalid API key format - expected Vault UUID:', apiKeyOrId);
    throw new Error('Invalid API key format. Please re-add your API key through the UI.')
  } catch (error) {
    console.error(`Failed to fetch models from ${provider}:`, error)
    throw error
  }
}

/**
 * @deprecated Use fetchModelsFromProvider instead
 * Fetch models from OpenAI API using the provided API key
 * Kept for backward compatibility
 */
export async function fetchModelsFromOpenAI(apiKey: string): Promise<AIModel[]> {
  return fetchModelsFromProvider('OpenAI', apiKey)
}

/**
 * Validate API key for a specific provider
 * @param provider - The provider type
 * @param apiKey - The API key to validate
 */
export async function validateAPIKey(provider: string, apiKey: string): Promise<boolean> {
  try {
    // First check format validation
    const formatError = validateProviderKeyFormat(provider as ProviderType, apiKey)
    if (formatError) {
      console.warn(`API key format validation failed for ${provider}:`, formatError)
      return false
    }

    // Then validate with the provider API if supported
    if (isProviderSupported(provider as ProviderType)) {
      return await validateProviderAPIKey(provider as ProviderType, apiKey)
    }

    // For unsupported providers, format validation is sufficient
    return true
  } catch (error) {
    console.error(`Failed to validate ${provider} API key:`, error)
    return false
  }
}

/**
 * @deprecated Use validateAPIKey instead
 * Validate OpenAI API key
 * Kept for backward compatibility
 */
export async function validateOpenAIKey(apiKey: string): Promise<boolean> {
  return validateAPIKey('OpenAI', apiKey)
}

/**
 * Create a new API key and store it in access token storage
 */
export async function createAndStoreAPIKey(
  provider: string,
  name: string,
  apiKey: string,
  skipDuplicateChecks: boolean = false
): Promise<{ success: boolean; apiKeyId?: string; error?: string }> {
  try {
    // Map provider names to lowercase for Supabase Vault
    const providerTypeMap: Record<string, string> = {
      'OpenAI': 'openai',
      'Anthropic': 'anthropic',
      'Mistral': 'mistral',
      'Cohere': 'cohere',
      'Google': 'google'
    };
    const vaultProviderType = providerTypeMap[provider] || provider.toLowerCase();

    // Step 1: Check for duplicates in Supabase (only if not skipping checks)
    if (!skipDuplicateChecks) {
      try {
        const existingKeys = await SecureAPIKeyService.listAPIKeys();

        // Check for duplicate name within the same provider
        const duplicateName = existingKeys.find(key =>
          key.provider === vaultProviderType &&
          key.name.toLowerCase() === name.toLowerCase()
        );

        if (duplicateName) {
          return {
            success: false,
            error: `A key with the name "${name}" already exists for ${provider}. Please choose a different name.`
          }
        }
      } catch (error) {
        console.warn('Could not check for duplicates in Supabase:', error);
        // Continue anyway - the backend will handle duplicates
      }
    }

    // Step 2: Validate the API key format first
    const formatError = validateProviderKeyFormat(provider as ProviderType, apiKey)
    if (formatError) {
      return {
        success: false,
        error: formatError
      }
    }

    // Step 3: Validate the API key with the provider API (optional, as store-api-key also validates)
    const isValid = await validateAPIKey(provider, apiKey)
    if (!isValid) {
      return {
        success: false,
        error: 'Invalid API key. Please check your key and try again.'
      }
    }

    // Step 4: Store the API key in Supabase Vault
    console.log(`Storing API key in Supabase Vault: provider=${vaultProviderType}, name=${name}`);

    const storedKey = await SecureAPIKeyService.storeAPIKey({
      name,
      provider: vaultProviderType as 'openai' | 'anthropic',
      apiKey
    });

    console.log('✅ API key successfully stored in Supabase Vault with ID:', storedKey.id);

    // No longer storing in localStorage - only using Supabase Vault

    return {
      success: true,
      apiKeyId: storedKey.id
    }
  } catch (error: any) {
    console.error('Failed to create and store API key:', error)

    // Provide more specific error messages
    if (error.message?.includes('duplicate')) {
      return {
        success: false,
        error: 'This API key already exists. Please use a different key or name.'
      }
    }

    if (error.message?.includes('validation')) {
      return {
        success: false,
        error: error.message || 'API key validation failed. Please check your key.'
      }
    }

    return {
      success: false,
      error: error.message || 'Failed to store API key. Please try again.'
    }
  }
}

/**
 * Format model date for display
 */
export function formatModelDate(timestamp: number): string {
  const date = new Date(timestamp * 1000)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
