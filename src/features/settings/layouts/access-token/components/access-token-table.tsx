/**
 * Access Token table component using flat table structure
 */

import { useState, useEffect } from 'react'
import { Plus, Pen } from 'lucide-react'
import { AISystemIcon } from '@/components/patterns/ui-patterns/ai-system-icon'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { AccessTokenStorage } from '../lib/access-token-storage'

interface AccessTokenData {
  id: string
  provider: string
  availableKeys: number
  aiSystemUsage: number
  lastUpdated: string
  hasKeys: boolean
}

interface AccessTokenTableProps {
  className?: string
  refreshTrigger?: number
  onCellAction?: (action: string, row: AccessTokenData) => void
}

// Map provider names to AISystemIcon types
const providerIconMap: Record<string, 'OpenAI' | 'Azure' | 'Mistral' | 'Databricks' | 'HuggingFace' | 'Anthropic' | 'Remote' | 'Local' | 'AWS' | 'DynamoAI'> = {
  'OpenAI': 'OpenAI',
  'Azure OpenAI': 'Azure',
  'Databricks': 'Databricks',
  'Mistral': 'Mistral',
  'AWS Bedrock': 'AWS',
  'Anthropic': 'Anthropic'
}

export function AccessTokenTable({
  className = '',
  refreshTrigger = 0,
  onCellAction
}: AccessTokenTableProps) {
  const [data, setData] = useState<AccessTokenData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      const storage = new AccessTokenStorage()
      const providers = await storage.load()
      setData(providers as AccessTokenData[])
      setIsLoading(false)
    }
    loadData()
  }, [refreshTrigger])

  const renderProviderIcon = (provider: string) => {
    const iconType = providerIconMap[provider] || 'Remote'
    return (
      <AISystemIcon
        type={iconType}
        className="w-7 h-7 rounded-lg border border-gray-200 p-1 flex-shrink-0"
      />
    )
  }

  const handleAction = (action: string, row: AccessTokenData) => {
    onCellAction?.(action, row)
  }

  if (isLoading) {
    return (
      <div className={`text-center py-8 text-gray-500 ${className}`}>
        Loading...
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-450">Supported API Providers</TableHead>
              <TableHead className="font-450">Available API Keys</TableHead>
              <TableHead className="font-450">AI System Usage</TableHead>
              <TableHead className="font-450">Last Updated On</TableHead>
              <TableHead className="w-[180px] font-450"></TableHead>
            </TableRow>
          </TableHeader>
        <TableBody>
          {data.map((provider) => (
            <TableRow
              key={provider.id}
              className="group transition-colors hover:bg-gray-50"
            >
              <TableCell>
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {renderProviderIcon(provider.provider)}
                  <span className="text-[13px] font-450 text-gray-900 truncate">
                    {provider.provider}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <span className="text-[13px] text-gray-900">
                  {provider.availableKeys === 0 ? '-' : provider.availableKeys}
                </span>
              </TableCell>
              <TableCell>
                <span className="text-[13px] text-gray-900">
                  {provider.aiSystemUsage === 0 ? '-' : provider.aiSystemUsage}
                </span>
              </TableCell>
              <TableCell>
                <span className="text-[13px] text-gray-900">
                  {provider.lastUpdated || '-'}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end">
                  {provider.hasKeys ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAction('manage', provider)}
                      className="border border-gray-300 text-gray-600 hover:bg-gray-50"
                    >
                      <Pen className="h-3 w-3 mr-2" />
                      Manage Keys
                    </Button>
                  ) : (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleAction('add', provider)}
                      className="bg-blue-50 text-blue-600 hover:bg-blue-100 border-0"
                    >
                      <Plus className="h-3 w-3 mr-2" />
                      Add New Key
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        </Table>

        {data.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No API providers configured.
          </div>
        )}
      </div>
    </div>
  )
}