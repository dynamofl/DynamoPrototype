/**
 * AI Systems table configuration
 */

import type { TableColumn, ExpandableConfig, TableStorageConfig } from '@/types/table'
import { AI_SYSTEMS_STORAGE_KEY, AI_SYSTEMS_ITEMS_PER_PAGE } from '../constants'

// Storage configuration for AI systems
export const aiSystemsStorageConfig: TableStorageConfig = {
  type: 'secure',
  storageKey: AI_SYSTEMS_STORAGE_KEY,
  autoSave: true,
  idGenerator: 'timestamp',
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
    showText: true,
    format: (value: string) => {
      return value
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
      'active': { variant: 'default', className: 'bg-green-100 text-green-800' },
      'inactive': { variant: 'secondary' }
    }
  },
  {
    key: 'actions',
    title: 'Actions',
    width: 'w-32', // 128px equivalent
    type: 'multiButton',
    actions: [
      {
        key: 'view',
        label: 'View',
        variant: 'outline'
      },
      {
        key: 'edit',
        label: 'Edit',
        variant: 'outline'
      },
      {
        key: 'delete',
        label: 'Delete',
        variant: 'destructive'
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
  id: Date.now().toString(),
  name: data.name,
  createdAt: new Date().toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  }),
  status: 'active' as const,
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
