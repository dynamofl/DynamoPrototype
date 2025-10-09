import { useState, useEffect } from 'react'
import { PenLine, Trash2, Squircle, MoreHorizontal, Info } from 'lucide-react'
import { AISystemIcon } from '@/components/patterns/ui-patterns/ai-system-icon'
import { AISystemsIcon } from '@/assets/icons/ai-systems-icon'
import { Checkbox } from '@/components/ui/checkbox'
import { AISystemsFilters } from './ai-systems-filters'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { AISystem, AISystemsFilterState } from '../types/types'

interface AISystemsTableDirectProps {
  data: AISystem[]
  selectedRows?: string[]
  onRowSelect?: (id: string, selected: boolean) => void
  onSelectAll?: (selected: boolean) => void
  onEdit: (system: AISystem) => void
  onDelete: (system: AISystem) => void
  onManageEvaluation?: (system: AISystem) => void
  onViewInfo?: (system: AISystem) => void
}

// Map provider names to AISystemIcon types
const providerIconMap: Record<string, 'OpenAI' | 'Azure' | 'Mistral' | 'Databricks' | 'HuggingFace' | 'Anthropic' | 'Remote' | 'Local' | 'AWS' | 'DynamoAI'> = {
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
  'DynamoAI': 'DynamoAI'
}

export function AISystemsTableDirect({
  data,
  selectedRows = [],
  onRowSelect,
  onSelectAll,
  onEdit,
  onDelete,
  onManageEvaluation,
  onViewInfo
}: AISystemsTableDirectProps) {
  // Filter state
  const [filters, setFilters] = useState<AISystemsFilterState>({
    status: [],
    provider: [],
    hasGuardrails: null,
    isEvaluated: null,
    searchTerm: ''
  })
  
  // Filtered data
  const [filteredData, setFilteredData] = useState<AISystem[]>(data)
  
  // Filter function for AI Systems
  const filterAISystems = (systems: AISystem[], filters: AISystemsFilterState) => {
    return systems.filter(system => {
      // Status filter
      if (filters.status.length > 0) {
        const systemStatus = system.hasValidAPIKey ? 'connected' : 'disconnected'
        if (!filters.status.includes(systemStatus)) {
          return false
        }
      }

      // Provider filter
      if (filters.provider.length > 0) {
        if (!filters.provider.includes(system.providerName)) {
          return false
        }
      }

      // Has Guardrails filter
      if (filters.hasGuardrails !== null) {
        if (system.hasGuardrails !== filters.hasGuardrails) {
          return false
        }
      }

      // Is Evaluated filter
      if (filters.isEvaluated !== null) {
        if (system.isEvaluated !== filters.isEvaluated) {
          return false
        }
      }

      // Search term filter
      if (filters.searchTerm && filters.searchTerm.trim() !== '') {
        const searchTerm = filters.searchTerm.toLowerCase()
        const searchableText = [
          system.name,
          system.providerName,
          system.selectedModel,
          system.modelDetails?.name
        ].filter(Boolean).join(' ').toLowerCase()
        
        if (!searchableText.includes(searchTerm)) {
          return false
        }
      }

      return true
    })
  }
  
  // Apply filters when data or filters change
  useEffect(() => {
    const filtered = filterAISystems(data, filters)
    setFilteredData(filtered)
  }, [data, filters])
  
  // Handle filters change
  const handleFiltersChange = (newFilters: AISystemsFilterState) => {
    setFilters(newFilters)
  }
  
  const allSelected = filteredData.length > 0 && selectedRows.length === filteredData.length
  const someSelected = selectedRows.length > 0 && selectedRows.length < filteredData.length
  
  const getOwnerEmail = (system: AISystem) => {
    // Generate consistent email addresses based on system ID
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
    const hash = system.id.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0)
      return a & a
    }, 0)
    const emailIndex = Math.abs(hash) % randomEmails.length
    return randomEmails[emailIndex]
  }

  const renderSystemName = (system: AISystem) => {
    return (
      <span className="font-450 text-gray-900 truncate">
        {system.name}
      </span>
    )
  }

  const renderSystemIcon = (system: AISystem) => {
    const iconType = providerIconMap[system.providerId] || providerIconMap[system.providerName] || 'Remote'
    return (
      <AISystemIcon
        type={iconType}
        className="w-5 h-5"
      />
    )
  }

  const renderStatus = (system: AISystem) => {
    const isConnected = system.hasValidAPIKey
    return (
      <div className="flex items-center gap-2">
        <Squircle className={`w-2.5 h-2.5 ${
          isConnected ? 'fill-green-600 text-green-600' : 'fill-gray-400 text-gray-400'
        }`} />
        <span className="">{isConnected ? 'Connected' : 'Disconnected'}</span>
      </div>
    )
  }

  return (
    <div>
      {/* Filters */}
      <AISystemsFilters 
        filters={filters}
        onFiltersChange={handleFiltersChange}
      />
      
      <div className="px-4">
        <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="w-12">
              {onSelectAll && (
                <div className="flex items-center justify-center">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={(checked) => onSelectAll(!!checked)}
                    className={someSelected ? 'data-[state=indeterminate]:bg-primary' : 'border-gray-400'}
                  />
                </div>
              )}
            </TableHead>
            <TableHead className="w-8 pr-[0px]">
              <AISystemsIcon className="h-4 w-4 text-gray-500" />
            </TableHead>
            <TableHead className="font-450">Name</TableHead>
            <TableHead className="font-450">Model</TableHead>
            <TableHead className="font-450">Owner</TableHead>
            <TableHead className="font-450">Created At</TableHead>
            <TableHead className="font-450">Status</TableHead>
            <TableHead className="w-[200px] font-450"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredData.map((system, index) => (
            <TableRow 
              key={system.id} 
              className={`group transition-colors cursor-pointer ${
                selectedRows.includes(system.id) 
                  ? 'bg-blue-50 hover:bg-blue-100' 
                  : 'hover:bg-gray-50'
              }`}
            >
              <TableCell>
                {onRowSelect ? (
                  <div className="flex items-center justify-center relative">
                    {/* Row number - shown by default, hidden on hover unless selected */}
                    <span 
                      className={`text-gray-500 transition-opacity ${
                        selectedRows.includes(system.id) 
                          ? 'opacity-0' 
                          : 'group-hover:opacity-0 opacity-100'
                      }`}
                    >
                      {index + 1}
                    </span>
                    
                    {/* Checkbox - shown on hover or when selected */}
                    <div 
                      className={`absolute flex items-center justify-center transition-opacity ${
                        selectedRows.includes(system.id) 
                          ? 'opacity-100' 
                          : 'group-hover:opacity-100 opacity-0'
                      }`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Checkbox
                        checked={selectedRows.includes(system.id)}
                        onCheckedChange={(checked) => onRowSelect(system.id, !!checked)}
                        className='border-gray-400'
                      />
                    </div>
                  </div>
                ) : null}
              </TableCell>
              <TableCell className='pr-[0px]'>
                {renderSystemIcon(system)}
              </TableCell>
              <TableCell className="font-450 text-gray-900">
                {renderSystemName(system)}
              </TableCell>
              <TableCell>
                <span className="">
                  {system.modelDetails?.name || system.selectedModel || 'No model selected'}
                </span>
              </TableCell>
              <TableCell>
                <span className="">
                  {getOwnerEmail(system)}
                </span>
              </TableCell>
              <TableCell>
                <span className="">
                  {system.createdAt}
                </span>
              </TableCell>
              <TableCell>
                {renderStatus(system)}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  {onManageEvaluation && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        onManageEvaluation(system)
                      }}
                      className=""
                    >
                      Manage Evaluation
                    </Button>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className=""
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[160px]">
                      {onViewInfo && (
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            onViewInfo(system)
                          }}
                        >
                          <Info className="mr-3 h-4 w-4" />
                          View Info
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          onEdit(system)
                        }}
                      >
                        <PenLine className="mr-3 h-4 w-4" />
                        Edit Info
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          onDelete(system)
                        }}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="mr-3 h-4 w-4" />
                        Delete AI System
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        </Table>
        
        {filteredData.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No AI systems found matching the current filters.
          </div>
        )}
      </div>
    </div>
  )
}