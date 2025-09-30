import { useState, useEffect } from 'react'
import { Edit, Trash2, Squircle } from 'lucide-react'
import { PolicyIcon } from '@/assets/icons/policy-icon'
import { Checkbox } from '@/components/ui/checkbox'
import { GuardrailsFilters } from './guardrails-filters'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Guardrail, GuardrailsFilterState } from '../types'

interface GuardrailsTableDirectProps {
  data: Guardrail[]
  selectedRows?: string[]
  onRowSelect?: (id: string, selected: boolean) => void
  onSelectAll?: (selected: boolean) => void
  onEdit: (guardrail: Guardrail) => void
  onDelete: (guardrail: Guardrail) => void
}

const categoryColors: Record<string, string> = {
  'Safety': 'bg-red-100 text-red-800 border-red-200',
  'Privacy': 'bg-blue-100 text-blue-800 border-blue-200', 
  'Compliance': 'bg-purple-100 text-purple-800 border-purple-200',
  'Quality': 'bg-green-100 text-green-800 border-green-200',
  'Security': 'bg-orange-100 text-orange-800 border-orange-200',
  'Ethics': 'bg-gray-100 text-gray-800 border-gray-200'
}

export function GuardrailsTableDirect({
  data,
  selectedRows = [],
  onRowSelect,
  onSelectAll,
  onEdit,
  onDelete
}: GuardrailsTableDirectProps) {
  // Filter state
  const [filters, setFilters] = useState<GuardrailsFilterState>({
    status: [],
    category: [],
    searchTerm: ''
  })
  
  // Filtered data
  const [filteredData, setFilteredData] = useState<Guardrail[]>(data)
  
  // Filter function for Guardrails
  const filterGuardrails = (guardrails: Guardrail[], filters: GuardrailsFilterState) => {
    return guardrails.filter(guardrail => {
      // Status filter
      if (filters.status.length > 0) {
        if (!filters.status.includes(guardrail.status)) {
          return false
        }
      }

      // Category filter
      if (filters.category.length > 0) {
        if (!filters.category.includes(guardrail.category)) {
          return false
        }
      }

      // Search term filter
      if (filters.searchTerm && filters.searchTerm.trim() !== '') {
        const searchTerm = filters.searchTerm.toLowerCase()
        const searchableText = [
          guardrail.name,
          guardrail.description,
          guardrail.category
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
    const filtered = filterGuardrails(data, filters)
    setFilteredData(filtered)
  }, [data, filters])
  
  // Handle filters change
  const handleFiltersChange = (newFilters: GuardrailsFilterState) => {
    setFilters(newFilters)
  }
  
  const allSelected = filteredData.length > 0 && selectedRows.length === filteredData.length
  const someSelected = selectedRows.length > 0 && selectedRows.length < filteredData.length
  
  const getOwnerEmail = (guardrail: Guardrail) => {
    // Generate consistent email addresses based on guardrail ID
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
    const hash = guardrail.id.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0)
      return a & a
    }, 0)
    const emailIndex = Math.abs(hash) % randomEmails.length
    return randomEmails[emailIndex]
  }

  const renderGuardrailName = (guardrail: Guardrail) => {
    return (
      <span className="font-450 text-gray-900 truncate">
        {guardrail.name}
      </span>
    )
  }

  const renderGuardrailIcon = () => {
    return (
      <PolicyIcon className="w-4 h-4 text-gray-500" />
    )
  }

  const renderCategory = (category: string) => {
    const colorClass = categoryColors[category] || 'bg-gray-100 text-gray-800 border-gray-200'
    return (
      <Badge 
        variant="outline" 
        className={`${colorClass} font-normal`}
      >
        {category}
      </Badge>
    )
  }

  const renderStatus = (guardrail: Guardrail) => {
    const isActive = guardrail.status === 'active'
    return (
      <div className="flex items-center gap-2">
        <Squircle className={`w-2.5 h-2.5 ${
          isActive ? 'fill-green-600 text-green-600' : 'fill-gray-400 text-gray-400'
        }`} />
        <span className="">{isActive ? 'Active' : 'Inactive'}</span>
      </div>
    )
  }

  return (
    <div>
      {/* Filters */}
      <GuardrailsFilters 
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
              <PolicyIcon className="h-4 w-4 text-gray-500" />
            </TableHead>
            <TableHead className="font-450">Name</TableHead>
            <TableHead className="font-450">Category</TableHead>
            <TableHead className="font-450">Owner</TableHead>
            <TableHead className="font-450">Created At</TableHead>
            <TableHead className="font-450">Status</TableHead>
            <TableHead className="w-[100px] font-450">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredData.map((guardrail, index) => (
            <TableRow 
              key={guardrail.id} 
              className={`group transition-colors cursor-pointer ${
                selectedRows.includes(guardrail.id) 
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
                        selectedRows.includes(guardrail.id) 
                          ? 'opacity-0' 
                          : 'group-hover:opacity-0 opacity-100'
                      }`}
                    >
                      {index + 1}
                    </span>
                    
                    {/* Checkbox - shown on hover or when selected */}
                    <div 
                      className={`absolute flex items-center justify-center transition-opacity ${
                        selectedRows.includes(guardrail.id) 
                          ? 'opacity-100' 
                          : 'group-hover:opacity-100 opacity-0'
                      }`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Checkbox
                        checked={selectedRows.includes(guardrail.id)}
                        onCheckedChange={(checked) => onRowSelect(guardrail.id, !!checked)}
                        className='border-gray-400'
                      />
                    </div>
                  </div>
                ) : null}
              </TableCell>
              <TableCell className='pr-[0px]'>
                {renderGuardrailIcon()}
              </TableCell>
              <TableCell className="font-450 text-gray-900">
                {renderGuardrailName(guardrail)}
              </TableCell>
              <TableCell>
                {renderCategory(guardrail.category)}
              </TableCell>
              <TableCell>
                <span className="">
                  {getOwnerEmail(guardrail)}
                </span>
              </TableCell>
              <TableCell>
                <span className="">
                  {new Date(guardrail.createdAt).toLocaleDateString()}
                </span>
              </TableCell>
              <TableCell>
                {renderStatus(guardrail)}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      onEdit(guardrail)
                    }}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete(guardrail)
                    }}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
        {filteredData.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No guardrails found matching the current filters.
          </div>
        )}
      </div>
    </div>
  )
}