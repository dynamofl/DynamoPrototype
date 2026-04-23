import { useState, useEffect } from 'react'
import { Edit, Trash2, Squircle } from 'lucide-react'
import { PolicyIcon } from '@/assets/icons/policy-icon'
import { Checkbox } from '@/components/ui/checkbox'
import { PolicyManagerFilters } from './policy-manager-filters'
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
import type { Policy, PolicyFilterState } from '../types'

interface PolicyManagerTableProps {
  data: Policy[]
  selectedRows?: string[]
  onRowSelect?: (id: string, selected: boolean) => void
  onSelectAll?: (selected: boolean) => void
  onEdit: (policy: Policy) => void
  onDelete: (policy: Policy) => void
}

export function PolicyManagerTable({
  data,
  selectedRows = [],
  onRowSelect,
  onSelectAll,
  onEdit,
  onDelete
}: PolicyManagerTableProps) {
  const [filters, setFilters] = useState<PolicyFilterState>({
    status: [],
    category: [],
    type: [],
    searchTerm: ''
  })

  const [filteredData, setFilteredData] = useState<Policy[]>(data)

  const filterPolicies = (policies: Policy[], filters: PolicyFilterState) => {
    return policies.filter(policy => {
      if (filters.status.length > 0) {
        if (!filters.status.includes(policy.status)) {
          return false
        }
      }

      if (filters.category.length > 0) {
        if (!filters.category.includes(policy.category)) {
          return false
        }
      }

      if (filters.type.length > 0) {
        if (!filters.type.includes(policy.type)) {
          return false
        }
      }

      if (filters.searchTerm && filters.searchTerm.trim() !== '') {
        const searchTerm = filters.searchTerm.toLowerCase()
        const searchableText = [
          policy.name,
          policy.description,
          policy.category,
          policy.type,
          policy.owner
        ].filter(Boolean).join(' ').toLowerCase()

        if (!searchableText.includes(searchTerm)) {
          return false
        }
      }

      return true
    })
  }

  useEffect(() => {
    const filtered = filterPolicies(data, filters)
    setFilteredData(filtered)
  }, [data, filters])

  const handleFiltersChange = (newFilters: PolicyFilterState) => {
    setFilters(newFilters)
  }

  const allSelected = filteredData.length > 0 && selectedRows.length === filteredData.length
  const someSelected = selectedRows.length > 0 && selectedRows.length < filteredData.length

  const renderPolicyName = (policy: Policy) => {
    return (
      <span className="font-450 text-gray-900 truncate">
        {policy.name}
      </span>
    )
  }

  const renderPolicyIcon = () => {
    return (
      <PolicyIcon className="w-4 h-4 text-gray-500" />
    )
  }

  const renderCategory = (category: string) => {
    return (
      <Badge variant="secondary">
        {category}
      </Badge>
    )
  }

  const renderType = (type: string) => {
    return (
      <Badge variant="outline">
        {type}
      </Badge>
    )
  }

  const renderStatus = (policy: Policy) => {
    const statusConfig = {
      active: { color: 'fill-green-600 text-green-600', label: 'Active' },
      inactive: { color: 'fill-gray-400 text-gray-400', label: 'Inactive' },
      draft: { color: 'fill-amber-500 text-amber-500', label: 'Draft' }
    }
    const config = statusConfig[policy.status] || statusConfig.inactive
    return (
      <div className="flex items-center gap-2">
        <Squircle className={`w-2.5 h-2.5 ${config.color}`} />
        <span>{config.label}</span>
      </div>
    )
  }

  return (
    <div>
      <PolicyManagerFilters
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
              <TableHead className="font-450">Type</TableHead>
              <TableHead className="font-450">Owner</TableHead>
              <TableHead className="font-450">Effective Date</TableHead>
              <TableHead className="font-450">Status</TableHead>
              <TableHead className="w-[100px] font-450">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((policy, index) => (
              <TableRow
                key={policy.id}
                className={`group transition-colors cursor-pointer ${
                  selectedRows.includes(policy.id)
                    ? 'bg-blue-50 hover:bg-blue-100'
                    : 'hover:bg-gray-50'
                }`}
              >
                <TableCell>
                  {onRowSelect ? (
                    <div className="flex items-center justify-center relative">
                      <span
                        className={`text-gray-500 transition-opacity ${
                          selectedRows.includes(policy.id)
                            ? 'opacity-0'
                            : 'group-hover:opacity-0 opacity-100'
                        }`}
                      >
                        {index + 1}
                      </span>

                      <div
                        className={`absolute flex items-center justify-center transition-opacity ${
                          selectedRows.includes(policy.id)
                            ? 'opacity-100'
                            : 'group-hover:opacity-100 opacity-0'
                        }`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Checkbox
                          checked={selectedRows.includes(policy.id)}
                          onCheckedChange={(checked) => onRowSelect(policy.id, !!checked)}
                          className='border-gray-400'
                        />
                      </div>
                    </div>
                  ) : null}
                </TableCell>
                <TableCell className='pr-[0px]'>
                  {renderPolicyIcon()}
                </TableCell>
                <TableCell className="font-450 text-gray-900">
                  {renderPolicyName(policy)}
                </TableCell>
                <TableCell>
                  {renderCategory(policy.category)}
                </TableCell>
                <TableCell>
                  {renderType(policy.type)}
                </TableCell>
                <TableCell>
                  <span>{policy.owner}</span>
                </TableCell>
                <TableCell>
                  <span>
                    {policy.effectiveDate ? new Date(policy.effectiveDate).toLocaleDateString() : '-'}
                  </span>
                </TableCell>
                <TableCell>
                  {renderStatus(policy)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        onEdit(policy)
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
                        onDelete(policy)
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
            No policies found matching the current filters.
          </div>
        )}
      </div>
    </div>
  )
}
