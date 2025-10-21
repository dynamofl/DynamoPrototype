/**
 * Provider-specific validation rules and helpers
 * Centralized validation logic for different AI provider API keys
 */

export type ProviderType =
  | 'OpenAI'
  | 'Azure'
  | 'Mistral'
  | 'Anthropic'
  | 'Databricks'
  | 'HuggingFace'
  | 'AWS'
  | 'Gemini'
  | 'Remote'
  | 'Local'

/**
 * Provider-specific validation configuration
 */
interface ProviderValidationConfig {
  /** Minimum key length */
  minLength?: number
  /** Maximum key length */
  maxLength?: number
  /** Required prefix for the API key */
  prefix?: string
  /** Custom validation function */
  customValidator?: (key: string) => boolean
  /** Error message for format validation failure */
  errorMessage: string
  /** Placeholder text for input fields */
  placeholder: string
}

/**
 * Validation configurations for each provider
 */
const PROVIDER_VALIDATION_CONFIGS: Record<ProviderType, ProviderValidationConfig> = {
  OpenAI: {
    prefix: 'sk-',
    errorMessage: 'OpenAI API keys must start with "sk-"',
    placeholder: 'sk-...'
  },
  Anthropic: {
    prefix: 'sk-ant-',
    errorMessage: 'Anthropic API keys must start with "sk-ant-"',
    placeholder: 'sk-ant-...'
  },
  Azure: {
    minLength: 20,
    errorMessage: 'Azure OpenAI API keys must be at least 20 characters long',
    placeholder: 'Enter Azure OpenAI API key'
  },
  Mistral: {
    minLength: 30,
    errorMessage: 'Mistral AI API keys must be at least 30 characters long',
    placeholder: 'Enter Mistral AI API key'
  },
  AWS: {
    minLength: 20,
    errorMessage: 'AWS Bedrock API keys must be at least 20 characters long',
    placeholder: 'Enter AWS Bedrock API key'
  },
  Databricks: {
    minLength: 20,
    errorMessage: 'Databricks API keys must be at least 20 characters long',
    placeholder: 'Enter Databricks API key'
  },
  HuggingFace: {
    prefix: 'hf_',
    errorMessage: 'Hugging Face API keys must start with "hf_"',
    placeholder: 'hf_...'
  },
  Gemini: {
    minLength: 20,
    errorMessage: 'Gemini API keys must be at least 20 characters long',
    placeholder: 'Enter Gemini API key'
  },
  Remote: {
    minLength: 1,
    errorMessage: 'API key is required',
    placeholder: 'Enter API key'
  },
  Local: {
    minLength: 1,
    errorMessage: 'API key is required',
    placeholder: 'Enter API key (if required)'
  }
}

/**
 * Validate API key format for a specific provider
 * @param provider - The AI provider type
 * @param apiKey - The API key to validate
 * @returns Error message if validation fails, null if valid
 */
export function validateProviderKeyFormat(
  provider: ProviderType,
  apiKey: string
): string | null {
  const config = PROVIDER_VALIDATION_CONFIGS[provider]

  if (!config) {
    return 'Unknown provider type'
  }

  // Check prefix if required
  if (config.prefix && !apiKey.startsWith(config.prefix)) {
    return config.errorMessage
  }

  // Check minimum length if required
  if (config.minLength && apiKey.length < config.minLength) {
    return config.errorMessage
  }

  // Check maximum length if required
  if (config.maxLength && apiKey.length > config.maxLength) {
    return config.errorMessage
  }

  // Run custom validator if provided
  if (config.customValidator && !config.customValidator(apiKey)) {
    return config.errorMessage
  }

  return null
}

/**
 * Get placeholder text for API key input based on provider
 * @param provider - The AI provider type
 * @returns Placeholder text for the input field
 */
export function getProviderKeyPlaceholder(provider: ProviderType): string {
  return PROVIDER_VALIDATION_CONFIGS[provider]?.placeholder || 'Enter API key'
}

/**
 * Check if a provider requires API key validation
 * Some providers might not require API keys (e.g., Local)
 * @param provider - The AI provider type
 * @returns True if provider requires API key validation
 */
export function providerRequiresAPIKey(provider: ProviderType): boolean {
  // Local providers might not always require API keys
  return provider !== 'Local'
}

/**
 * Get all validation rules for a provider (useful for displaying requirements)
 * @param provider - The AI provider type
 * @returns Human-readable validation requirements
 */
export function getProviderKeyRequirements(provider: ProviderType): string[] {
  const config = PROVIDER_VALIDATION_CONFIGS[provider]
  const requirements: string[] = []

  if (config.prefix) {
    requirements.push(`Must start with "${config.prefix}"`)
  }

  if (config.minLength) {
    requirements.push(`Minimum ${config.minLength} characters`)
  }

  if (config.maxLength) {
    requirements.push(`Maximum ${config.maxLength} characters`)
  }

  return requirements
}
