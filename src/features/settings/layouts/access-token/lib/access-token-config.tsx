import { AISystemIcon } from '@/components/patterns/ui-patterns/ai-system-icon'
import { Pen, Plus } from 'lucide-react'
import type { TableColumn } from '@/types/table'

// Sample data for API providers
export const accessTokenData = [
  {
    id: '1',
    provider: 'OpenAI',
    availableKeys: 2,
    aiSystemUsage: 8,
    lastUpdated: 'Jan 24, 2024',
    hasKeys: true
  },
  {
    id: '2',
    provider: 'Azure OpenAI',
    availableKeys: 0,
    aiSystemUsage: 0,
    lastUpdated: '-',
    hasKeys: false
  },
  {
    id: '3',
    provider: 'Databricks',
    availableKeys: 0,
    aiSystemUsage: 0,
    lastUpdated: '-',
    hasKeys: false
  },
  {
    id: '4',
    provider: 'Mistral',
    availableKeys: 1,
    aiSystemUsage: 4,
    lastUpdated: 'Jan 24, 2024',
    hasKeys: true
  },
  {
    id: '5',
    provider: 'AWS Bedrock',
    availableKeys: 0,
    aiSystemUsage: 0,
    lastUpdated: '-',
    hasKeys: false
  },
  {
    id: '6',
    provider: 'Anthropic',
    availableKeys: 0,
    aiSystemUsage: 0,
    lastUpdated: '-',
    hasKeys: false
  }
]

// Map provider names to AISystemIcon types
const providerIconMap: Record<string, 'OpenAI' | 'Azure' | 'Mistral' | 'Databricks' | 'HuggingFace' | 'Anthropic' | 'Remote' | 'Local' | 'AWS' | 'DynamoAI'> = {
  'OpenAI': 'OpenAI',
  'Azure OpenAI': 'Azure',
  'Databricks': 'Databricks',
  'Mistral': 'Mistral',
  'AWS Bedrock': 'AWS',
  'Anthropic': 'Anthropic'
}

// Table columns configuration
export const accessTokenColumns: TableColumn[] = [
  {
    key: 'provider',
    title: 'Supported API Providers',
    type: 'icon',
    width: 'auto',
    minWidth: '320px',
    iconFormat: (_value: string, row: any) => {
      const iconType = providerIconMap[row.provider] || 'Remote'
      return (
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <AISystemIcon 
            type={iconType} 
            className="w-7 h-7 rounded-lg border border-gray-200 p-1 flex-shrink-0" 
          />
          <span className="text-[0.8125rem]  font-450 text-gray-900 truncate">
            {row.provider}
          </span>
        </div>
      )
    },
    showText: false,
    iconPosition: 'left'
  },
  {
    key: 'availableKeys',
    title: 'Available API Keys',
    type: 'freeText',
    width: 'auto',
    minWidth: '160px',
    format: (value: number) => value === 0 ? '-' : value.toString()
  },
  {
    key: 'aiSystemUsage',
    title: 'AI System Usage',
    type: 'freeText',
    width: 'auto',
    minWidth: '160px',
    format: (value: number) => value === 0 ? '-' : value.toString()
  },
  {
    key: 'lastUpdated',
    title: 'Last Updated On',
    type: 'freeText',
    width: 'auto',
    minWidth: '160px',
    format: (value: string) => value || '-'
  },
  {
    key: 'actions',
    title: '',
    type: 'multiButton',
    width: '180px',
    multiButtonConfig: {
      getActions: (row: any) => {
        const hasKeys = row.availableKeys && row.availableKeys > 0
        
        if (hasKeys) {
          return [
            {
              key: 'manage',
              label: 'Manage Keys',
              icon: <Pen className="h-3 w-3" />,
              variant: 'outline' as const,
              className: 'border border-gray-300 text-gray-600 hover:bg-gray-50'
            }
          ]
        } else {
          return [
            {
              key: 'add',
              label: 'Add New Key',
              icon: <Plus className="h-3 w-3" />,
              variant: 'default' as const,
              className: 'bg-blue-50 text-blue-600 hover:bg-blue-100 border-0'
            }
          ]
        }
      },
      maxButtons: 1,
      showMoreButton: false
    }
  }
]

// Storage configuration
export const accessTokenStorageConfig = {
  type: 'secure' as const,
  storageKey: 'dynamo-access-tokens',
  autoSave: true,
  idGenerator: 'timestamp' as const
}
