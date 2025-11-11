/**
 * AI Systems table configuration
 */

import React from 'react'
import { AISystemIcon } from '@/components/patterns/ui-patterns/ai-system-icon'
import { Edit, Trash2, Squircle, Square } from 'lucide-react'
import type { TableColumn, ExpandableConfig, TableStorageConfig } from '@/types/table'
import { AI_SYSTEMS_STORAGE_KEY, AI_SYSTEMS_ITEMS_PER_PAGE } from '../constants'

// Map provider names to AISystemIcon types
const providerIconMap: Record<string, 'OpenAI' | 'Azure' | 'Mistral' | 'Databricks' | 'HuggingFace' | 'Anthropic' | 'Custom' | 'AWS' | 'DynamoAI' | 'Gemini'> = {
  'openai': 'OpenAI',
  'OpenAI': 'OpenAI',
  'azure': 'Azure',
  'Azure': 'Azure',
  'Azure OpenAI': 'Azure',
  'databricks': 'Databricks',
  'Databricks': 'Databricks',
  'mistral': 'Mistral',
  'Mistral': 'Mistral',
  'aws': 'AWS',
  'AWS': 'AWS',
  'AWS Bedrock': 'AWS',
  'anthropic': 'Anthropic',
  'Anthropic': 'Anthropic',
  'huggingface': 'HuggingFace',
  'HuggingFace': 'HuggingFace',
  'dynamoai': 'DynamoAI',
  'DynamoAI': 'DynamoAI',
  'gemini': 'Gemini',
  'Gemini': 'Gemini',
  'custom': 'Custom',
  'Custom': 'Custom'
}

// Function to render AI system name with provider icon
const renderAISystemName = (_value: string, row: any) => {
  const iconType = providerIconMap[row.providerId] || providerIconMap[row.providerName] || 'Custom'
  return React.createElement('div', {
    className: 'flex items-center gap-3 min-w-0 flex-1'
  }, [
    React.createElement(AISystemIcon, {
      key: 'icon',
      type: iconType,
      className: 'w-7 h-7 rounded-lg border border-gray-200 p-1 flex-shrink-0'
    }),
    React.createElement('span', {
      key: 'text',
      className: 'text-[0.8125rem]  font-450 text-gray-900 truncate'
    }, row.name)
  ])
}

// Storage configuration for AI systems
export const aiSystemsStorageConfig: TableStorageConfig = {
  type: 'secure',
  storageKey: AI_SYSTEMS_STORAGE_KEY,
  autoSave: true,
  idGenerator: 'uuid',
  transform: {
    onSave: (data) => data.map(row => ({
      ...row,
      isExpanded: false
    })),
    onLoad: (data) => data.map(row => ({
      ...row,
      isExpanded: false
    }))
  }
}

// Column definitions for AI systems table (matching the static table style)
export const aiSystemsColumns: TableColumn[] = [
  {
    key: 'name',
    title: 'Name',
    width: 'w-64', // 256px equivalent
    type: 'icon',
    iconSize: 'md',
    iconPosition: 'left',
    showText: false,
    iconFormat: renderAISystemName
  },
  {
    key: 'selectedModel',
    title: 'Model',
    width: 'w-48', // 192px equivalent
    type: 'freeText',
    format: (value: string, row: any) => {
      // Use modelDetails.name if available, otherwise fall back to selectedModel
      return row.modelDetails?.name || value || 'No model selected'
    }
  },
  {
    key: 'owner',
    title: 'Owner',
    width: 'w-48', // 192px equivalent
    type: 'freeText',
    format: (value: string, row: any) => {
      // Return random email address for now
      const randomEmails = [
        'john.doe@company.com',
        'jane.smith@company.com',
        'mike.wilson@company.com',
        'sarah.johnson@company.com',
        'alex.brown@company.com',
        'emma.davis@company.com',
        'david.miller@company.com',
        'lisa.garcia@company.com'
      ]
      // Use a simple hash of the system ID to get consistent email for each system
      const hash = row.id.split('').reduce((a: number, b: string) => {
        a = ((a << 5) - a) + b.charCodeAt(0)
        return a & a
      }, 0)
      const emailIndex = Math.abs(hash) % randomEmails.length
      return randomEmails[emailIndex]
    }
  },
  {
    key: 'createdAt',
    title: 'Created At',
    width: 'w-32', // 128px equivalent
    type: 'date',
    format: (value) => value || 'Unknown'
  },
  {
    key: 'status',
    title: 'Status',
    width: 'w-24', // 96px equivalent
    type: 'badge',
    colorMap: {
      'Connected': {
        variant: 'default' as const,
        className: 'bg-green-100 text-green-800 border border-green-200',
        icon: React.createElement(Squircle, {
          className: 'w-2 h-2 fill-green-600 text-green-600'
        })
      },
      'Disconnected': {
        variant: 'secondary' as const,
        className: 'bg-gray-100 text-gray-600 border border-gray-200',
        icon: React.createElement(Squircle, {
          className: 'w-2 h-2 text-gray-600'
        })
      }
    },
    format: (value: string, row: any) => {
      // Use the stored validation state
      return row.hasValidAPIKey ? 'Connected' : 'Disconnected'
    },
    tooltip: (value: string, row: any) => {
      return row.hasValidAPIKey ? 'Ready to Use' : 'No valid API keys available'
    }
  },
  {
    key: 'actions',
    title: '',
    width: 'w-[48px]',
    type: 'button',
    buttonVariant: 'ghost',
    actions: [
      {
        key: 'edit',
        label: 'Edit',
        icon: React.createElement(Edit, { className: 'h-4 w-4' }),
        variant: 'ghost' as const
      },
      {
        key: 'delete',
        label: 'Delete',
        icon: React.createElement(Trash2, { className: 'h-4 w-4' }),
        variant: 'destructive' as const
      }
    ]
  }
]

// Expandable configuration for AI systems (for future use)
export const aiSystemsExpandableConfig: ExpandableConfig = {
  enabled: false, // Disabled for now, can be enabled later for additional details
  expandColumnKey: 'expand',
  contentKey: 'details',
  renderContent: () => {
    return null
  }
}

// Pagination configuration for AI systems
export const aiSystemsPaginationConfig = {
  enabled: true,
  itemsPerPage: AI_SYSTEMS_ITEMS_PER_PAGE,
  showPageInfo: true,
  showPageSizeSelector: false
}

// Default AI system data structure
export const createDefaultAISystem = (data: {
  name: string
  providerId: string
  providerName: string
  apiKeyId: string
  apiKeyName: string
  selectedModel: string
  modelDetails?: any
}): any => ({
  id: crypto.randomUUID(),
  name: data.name,
  createdAt: new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }),
  status: 'connected', // Will be validated and updated by state manager
  hasValidAPIKey: false, // Will be validated by state manager
  lastValidated: 0, // Will be set by state manager
  icon: data.providerName as any, // This will be mapped to the correct icon
  hasGuardrails: false,
  isEvaluated: false,
  providerId: data.providerId,
  providerName: data.providerName,
  apiKeyId: data.apiKeyId,
  apiKeyName: data.apiKeyName,
  selectedModel: data.selectedModel,
  modelDetails: data.modelDetails,
  isExpanded: false
})

// Validation function for AI systems
export const validateAISystem = (system: any): { valid: boolean; errors: string[] } => {
  const errors: string[] = []
  
  if (!system.name || system.name.trim() === '') {
    errors.push('System name is required')
  }
  
  if (!system.providerId || system.providerId.trim() === '') {
    errors.push('Provider is required')
  }
  
  if (!system.apiKeyId || system.apiKeyId.trim() === '') {
    errors.push('API key is required')
  }
  
  if (!system.selectedModel || system.selectedModel.trim() === '') {
    errors.push('Model selection is required')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}
