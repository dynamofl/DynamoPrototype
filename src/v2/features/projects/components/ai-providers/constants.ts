import type { ProviderDef } from './types'

export const PROVIDERS: ProviderDef[] = [
  { id: 'anthropic', name: 'Anthropic', description: 'Claude models for safe, helpful AI assistants', docsUrl: 'https://docs.anthropic.com', iconType: 'Anthropic', providerType: 'Anthropic' },
  { id: 'aws-bedrock', name: 'AWS Bedrock', description: 'Managed foundation models on AWS infrastructure', docsUrl: 'https://docs.aws.amazon.com/bedrock', iconType: 'AWS', providerType: 'AWS' },
  { id: 'azure-openai', name: 'Azure OpenAI', description: 'OpenAI models hosted on Microsoft Azure', docsUrl: 'https://learn.microsoft.com/azure/ai-services/openai', iconType: 'Azure', providerType: 'Azure' },
  { id: 'databricks', name: 'Databricks', description: 'Open source models on the Databricks platform', docsUrl: 'https://docs.databricks.com', iconType: 'Databricks', providerType: 'Databricks' },
  { id: 'gemini', name: 'Google Gemini', description: 'Multimodal AI models from Google DeepMind', docsUrl: 'https://ai.google.dev/docs', iconType: 'Gemini', providerType: 'Gemini' },
  { id: 'mistral', name: 'Mistral AI', description: 'Efficient open-weight and commercial language models', docsUrl: 'https://docs.mistral.ai', iconType: 'Mistral', providerType: 'Mistral' },
  { id: 'openai', name: 'OpenAI', description: 'GPT models for text, code, and multimodal tasks', docsUrl: 'https://platform.openai.com/docs', iconType: 'OpenAI', providerType: 'OpenAI' },
]

export const CUSTOM_PROVIDER: ProviderDef = {
  id: 'custom',
  name: 'Custom API Endpoint',
  description: 'Connect your own model API with a custom endpoint URL and key.',
  docsUrl: '',
  iconType: 'Custom',
  providerType: 'Custom',
}

export const contentVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}
