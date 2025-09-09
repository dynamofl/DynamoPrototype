/**
 * Constants for AI Systems feature
 */

import type { ProviderOption } from '../types'

// Available AI provider types for systems
export const availableProviderTypes: ProviderOption[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    type: 'OpenAI',
    icon: 'OpenAI',
    apiKeys: [],
    hasApiKeys: false
  },
  {
    id: 'azure',
    name: 'Azure OpenAI',
    type: 'Azure',
    icon: 'Azure',
    apiKeys: [],
    hasApiKeys: false
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    type: 'Anthropic',
    icon: 'Anthropic',
    apiKeys: [],
    hasApiKeys: false
  },
  {
    id: 'mistral',
    name: 'Mistral AI',
    type: 'Mistral',
    icon: 'Mistral',
    apiKeys: [],
    hasApiKeys: false
  },
  {
    id: 'databricks',
    name: 'Databricks',
    type: 'Databricks',
    icon: 'Databricks',
    apiKeys: [],
    hasApiKeys: false
  },
  {
    id: 'huggingface',
    name: 'Hugging Face',
    type: 'HuggingFace',
    icon: 'HuggingFace',
    apiKeys: [],
    hasApiKeys: false
  },
  {
    id: 'aws',
    name: 'AWS Bedrock',
    type: 'AWS',
    icon: 'AWS',
    apiKeys: [],
    hasApiKeys: false
  },
  {
    id: 'remote',
    name: 'Remote',
    type: 'Remote',
    icon: 'Remote',
    apiKeys: [],
    hasApiKeys: false
  },
  {
    id: 'local',
    name: 'Local',
    type: 'Local',
    icon: 'Local',
    apiKeys: [],
    hasApiKeys: false
  }
]

// Default project options
export const defaultProjects = [
  'Production',
  'Development',
  'Testing',
  'Staging',
  'Research'
]

// Default owner options (could be fetched from team members)
export const defaultOwners = [
  'John Doe',
  'Jane Smith',
  'Mike Johnson',
  'Sarah Wilson',
  'Alex Brown'
]

// Status options
export const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' }
]

// Table configuration constants
export const AI_SYSTEMS_STORAGE_KEY = 'dynamo-ai-systems'
export const AI_SYSTEMS_ITEMS_PER_PAGE = 20
