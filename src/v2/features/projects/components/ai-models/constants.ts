export const contentVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}

/** Known model descriptions for popular models */
export const MODEL_DESCRIPTIONS: Record<string, { description: string; capabilities: string[] }> = {
  'gpt-4o': { description: 'Most capable GPT-4 model with vision, optimized for speed and cost.', capabilities: ['Text', 'Vision', 'Function calling'] },
  'gpt-4o-mini': { description: 'Small, affordable, and fast model for lightweight tasks.', capabilities: ['Text', 'Function calling'] },
  'gpt-4-turbo': { description: 'High-intelligence GPT-4 model with broad general knowledge.', capabilities: ['Text', 'Vision', 'Function calling'] },
  'gpt-4': { description: 'High-intelligence model for complex reasoning tasks.', capabilities: ['Text', 'Function calling'] },
  'gpt-3.5-turbo': { description: 'Fast and cost-effective model for simpler tasks.', capabilities: ['Text', 'Function calling'] },
  'claude-3-5-sonnet-20241022': { description: 'Best combination of intelligence and speed from Anthropic.', capabilities: ['Text', 'Vision', 'Tool use'] },
  'claude-3-5-haiku-20241022': { description: 'Fast, lightweight Claude model for everyday tasks.', capabilities: ['Text', 'Tool use'] },
  'claude-3-opus-20240229': { description: 'Most powerful Claude model for complex analysis.', capabilities: ['Text', 'Vision', 'Tool use'] },
  'claude-3-sonnet-20240229': { description: 'Balanced Claude model for most tasks.', capabilities: ['Text', 'Vision', 'Tool use'] },
  'claude-3-haiku-20240307': { description: 'Fastest Claude model for simple tasks.', capabilities: ['Text', 'Tool use'] },
  'mistral-large-latest': { description: 'Mistral\'s most capable model for complex reasoning.', capabilities: ['Text', 'Function calling'] },
  'mistral-medium-latest': { description: 'Balanced Mistral model.', capabilities: ['Text'] },
  'mistral-small-latest': { description: 'Efficient Mistral model for simple tasks.', capabilities: ['Text'] },
}
