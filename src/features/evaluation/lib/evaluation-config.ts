/**
 * Evaluation table configuration
 */

import type { TableColumn, TableStorageConfig } from '@/types/table'

// Storage configuration for evaluation data
export const evaluationStorageConfig: TableStorageConfig = {
  type: 'session',
  autoSave: false,
  idGenerator: 'uuid',
  minRows: 1,
  validation: (data) => data.length >= 1,
  transform: {
    onSave: (data) => data.map(row => ({
      ...row,
      prompt: row.prompt || '',
      topic: row.topic || '',
      userMarkedAdversarial: row.userMarkedAdversarial || ''
    }))
  }
}

// Column definitions for evaluation table
export const evaluationColumns: TableColumn[] = [
  {
    key: 'prompt',
    title: 'Prompt',
    width: '400px',
    type: 'freeText',
    multiline: true,
    placeholder: 'Enter your prompt here...',
    validation: (value) => value && value.trim().length > 0,
    editMode: 'both',
    rowEditTrigger: true,
    rowEditLabel: 'Edit Prompt',
    rowEditIcon: '✏️'
  },
  {
    key: 'topic',
    title: 'Topic (optional)',
    width: '200px',
    type: 'freeText',
    placeholder: 'Enter topic...',
    editMode: 'dialog'
  },
  {
    key: 'userMarkedAdversarial',
    title: 'Adversarial',
    width: '120px',
    type: 'dropdown',
    options: [
      { value: 'false', label: 'Passed' },
      { value: 'true', label: 'Blocked' }
    ],
    placeholder: 'Select status...',
    editMode: 'inline'
  },
  {
    key: 'actions',
    title: 'Actions',
    width: '80px',
    type: 'button',
    buttonVariant: 'ghost'
  }
]

// Pagination configuration for evaluation table
export const evaluationPaginationConfig = {
  enabled: true,
  itemsPerPage: 20,
  showPageInfo: true,
  showPageSizeSelector: false
}

// Default evaluation prompt data structure
export const createDefaultEvaluationPrompt = () => ({
  id: crypto.randomUUID(),
  prompt: '',
  topic: '',
  userMarkedAdversarial: ''
})

// Initial evaluation prompts
export const initialEvaluationPrompts = [
  createDefaultEvaluationPrompt(),
  createDefaultEvaluationPrompt(),
  createDefaultEvaluationPrompt()
]

// Validation function for evaluation prompts
export const validateEvaluationPrompt = (prompt: any): { valid: boolean; errors: string[] } => {
  const errors: string[] = []
  
  if (!prompt.prompt || prompt.prompt.trim() === '') {
    errors.push('Prompt is required')
  }
  
  if (!prompt.userMarkedAdversarial || prompt.userMarkedAdversarial === '') {
    errors.push('Adversarial status is required')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

// Validation function for evaluation data
export const validateEvaluationData = (data: any[]): { valid: boolean; errors: string[] } => {
  const errors: string[] = []
  
  if (data.length === 0) {
    errors.push('At least one prompt is required')
    return { valid: false, errors }
  }
  
  const completePrompts = data.filter(prompt => 
    prompt.prompt.trim() && 
    prompt.userMarkedAdversarial && 
    prompt.userMarkedAdversarial !== ''
  )
  
  if (completePrompts.length === 0) {
    errors.push('At least one complete prompt with adversarial status is required')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

// Adversarial status options
export const adversarialStatusOptions = [
  { value: 'false', label: 'Passed', description: 'Prompt passed all checks' },
  { value: 'true', label: 'Blocked', description: 'Prompt was blocked by guardrails' }
]

// Topic suggestions for evaluation prompts
export const topicSuggestions = [
  'General Knowledge',
  'Creative Writing',
  'Technical Support',
  'Code Generation',
  'Data Analysis',
  'Content Moderation',
  'Language Translation',
  'Summarization',
  'Question Answering',
  'Conversation'
]

// Export all configurations
export const evaluationTableConfig = {
  storage: evaluationStorageConfig,
  columns: evaluationColumns,
  pagination: evaluationPaginationConfig,
  validation: validateEvaluationData,
  createDefault: createDefaultEvaluationPrompt,
  initialData: initialEvaluationPrompts
}
