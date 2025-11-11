/**
 * Constants for AI Provider components
 */

import type { ProviderType } from '../types/types'

// Available provider types
export const availableProviderTypes: ProviderType[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    type: 'OpenAI',
    description: 'GPT models, DALL-E, Whisper, and more',
    icon: 'OpenAI',
    isAvailable: true
  },
  {
    id: 'azure',
    name: 'Azure OpenAI',
    type: 'Azure',
    description: 'Enterprise-grade OpenAI models on Azure',
    icon: 'Azure',
    isAvailable: true
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    type: 'Anthropic',
    description: 'Claude models for advanced reasoning',
    icon: 'Anthropic',
    isAvailable: false
  },
  {
    id: 'mistral',
    name: 'Mistral AI',
    type: 'Mistral',
    description: 'High-performance open models',
    icon: 'Mistral',
    isAvailable: false
  },
  {
    id: 'huggingface',
    name: 'Hugging Face',
    type: 'HuggingFace',
    description: 'Open source models and datasets',
    icon: 'HuggingFace',
    isAvailable: false
  },
  {
    id: 'aws',
    name: 'AWS Bedrock',
    type: 'AWS',
    description: 'Amazon\'s managed AI service',
    icon: 'AWS',
    isAvailable: false
  },
  {
    id: 'databricks',
    name: 'Databricks',
    type: 'Databricks',
    description: 'ML platform with AI capabilities',
    icon: 'Databricks',
    isAvailable: false
  },
  {
    id: 'gemini',
    name: 'Gemini',
    type: 'Gemini',
    description: 'Google\'s multimodal AI models',
    icon: 'Gemini',
    isAvailable: false
  },
  {
    id: 'local',
    name: 'Local Model',
    type: 'Custom',
    description: 'Self-hosted or local AI models',
    icon: 'Custom',
    isAvailable: false
  }
]

// Text model identifiers for filtering
export const textModelIds = [
  'gpt-4', 'gpt-4-turbo', 'gpt-4o', 'gpt-4o-mini',
  'gpt-3.5-turbo', 'gpt-3.5-turbo-instruct',
  'text-davinci-003', 'text-davinci-002', 'text-davinci-001',
  'text-curie-001', 'text-babbage-001', 'text-ada-001',
  'davinci', 'curie', 'babbage', 'ada',
  'claude-3', 'claude-3-sonnet', 'claude-3-haiku',
  'claude-2', 'claude-instant',
  'gemini-pro', 'gemini-pro-vision',
  'llama-2', 'llama-3', 'mistral', 'qwen'
]
