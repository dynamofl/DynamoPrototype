/**
 * AI Providers table configuration
 */

import type { TableColumn, ExpandableConfig, TableStorageConfig } from '@/types/table'

// Storage configuration for AI providers
export const aiProvidersStorageConfig: TableStorageConfig = {
  type: 'secure',
  storageKey: 'dynamo-ai-providers',
  autoSave: true,
  idGenerator: 'timestamp',
  transform: {
    onSave: (data) => data.map(row => ({
      ...row,
      isExpanded: false,
      modelsLastFetched: row.modelsLastFetched || null
    })),
    onLoad: (data) => data.map(row => ({
      ...row,
      isExpanded: false
    }))
  }
}

// Column definitions for AI providers table
export const aiProvidersColumns: TableColumn[] = [
  {
    key: 'expand',
    title: '',
    width: 'w-10', // 40px equivalent
    type: 'expand',
    expandIcon: undefined, // Will use default ChevronRight
    collapseIcon: undefined // Will use default ChevronDown
  },
  {
    key: 'name',
    title: 'Provider',
    width: 'w-48', // 192px equivalent
    type: 'icon',
    iconSize: 'md',
    iconPosition: 'left',
    showText: true,
    format: (value: string, row: any) => {
      // Return the provider name as text, icon will be handled by IconCell
      return value
    }
  },
  {
    key: 'type',
    title: 'Type',
    width: 'w-28', // 112px equivalent
    type: 'badge',
    format: (value) => value || 'Unknown'
  },
  {
    key: 'status',
    title: 'Status',
    width: 'w-28', // 112px equivalent
    type: 'badge',
    colorMap: {
      'active': { variant: 'default', className: 'bg-green-100 text-green-800' },
      'inactive': { variant: 'secondary' },
      'testing': { variant: 'outline' }
    }
  },
  {
    key: 'models',
    title: 'Models',
    width: 'w-24', // 96px equivalent
    type: 'badge',
    format: (value) => Array.isArray(value) ? `${value.length} models` : '0 models',
    colorMap: {
      '0 models': { variant: 'secondary' },
      '1 models': { variant: 'outline', className: 'bg-blue-50 text-blue-700' },
      '2 models': { variant: 'outline', className: 'bg-blue-50 text-blue-700' },
      '3 models': { variant: 'outline', className: 'bg-blue-50 text-blue-700' },
      '4 models': { variant: 'outline', className: 'bg-blue-50 text-blue-700' },
      '5 models': { variant: 'outline', className: 'bg-blue-50 text-blue-700' }
    }
  },
  {
    key: 'modelsLastFetched',
    title: 'Last Updated',
    width: 'w-32', // 128px equivalent
    type: 'date',
    format: (value) => value || 'Never'
  },
  {
    key: 'actions',
    title: 'Actions',
    width: 'w-28', // 112px equivalent
    type: 'button',
    buttonVariant: 'ghost',
    actions: [
      {
        key: 'view',
        label: 'View',
        icon: '👁️',
        variant: 'outline'
      },
      {
        key: 'edit',
        label: 'Edit',
        icon: '✏️',
        variant: 'outline'
      },
      {
        key: 'fetch',
        label: 'Fetch Models',
        icon: '🔄',
        variant: 'outline'
      },
      {
        key: 'delete',
        label: 'Delete',
        icon: '🗑️',
        variant: 'destructive'
      }
    ]
  }
]

// Expandable configuration for AI providers
export const aiProvidersExpandableConfig: ExpandableConfig = {
  enabled: true,
  expandColumnKey: 'expand',
  contentKey: 'models',
  renderContent: (row) => {
    // This will be implemented in the component that uses this config
    // The actual rendering will be handled by the TablePattern component
    return null
  }
}

// Pagination configuration for AI providers
export const aiProvidersPaginationConfig = {
  enabled: true,
  itemsPerPage: 10,
  showPageInfo: true,
  showPageSizeSelector: false
}

// Default AI provider data structure
export const createDefaultAIProvider = (type: string, name: string) => ({
  id: Date.now().toString(),
  name,
  type,
  apiKey: '',
  status: 'inactive' as const,
  createdAt: new Date().toISOString().split('T')[0],
  lastUsed: null,
  usageCount: 0,
  models: [],
  modelsLastFetched: null,
  isExpanded: false
})

// Validation function for AI providers
export const validateAIProvider = (provider: any): { valid: boolean; errors: string[] } => {
  const errors: string[] = []
  
  if (!provider.name || provider.name.trim() === '') {
    errors.push('Provider name is required')
  }
  
  if (!provider.type || provider.type.trim() === '') {
    errors.push('Provider type is required')
  }
  
  if (!provider.apiKey || provider.apiKey.trim() === '') {
    errors.push('API key is required')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}
