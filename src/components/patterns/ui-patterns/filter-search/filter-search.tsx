import { useState, ReactNode } from 'react'
import { Search, ChevronDown, Plus, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export interface FilterOption {
  value: string | number | boolean
  label: string
}

export interface FilterConfig {
  key: string
  label: string
  options: FilterOption[]
  type?: 'array' | 'single' | 'boolean'
  isAdditional?: boolean
}

export interface FilterChip {
  type: string
  value: string | number | boolean
  label: string
}

interface FilterSearchProps {
  searchPlaceholder?: string
  searchValue: string
  onSearchChange: (value: string) => void
  primaryFilters: FilterConfig[]
  additionalFilters?: FilterConfig[]
  filterValues: Record<string, any>
  onFilterChange: (filterKey: string, value: any) => void
  filterChips: FilterChip[]
  onRemoveFilter: (filterType: string, value: string | number | boolean) => void
  onClearAll: () => void
  hasActiveFilters: boolean
  rightContent?: ReactNode
}

export function FilterSearch({
  searchPlaceholder = "Search...",
  searchValue,
  onSearchChange,
  primaryFilters,
  additionalFilters = [],
  filterValues,
  onFilterChange,
  filterChips,
  onRemoveFilter,
  onClearAll,
  hasActiveFilters,
  rightContent
}: FilterSearchProps) {
  // State to track which additional filters are visible
  const [visibleAdditionalFilters, setVisibleAdditionalFilters] = useState<Set<string>>(new Set())

  const addAdditionalFilter = (filterKey: string) => {
    setVisibleAdditionalFilters(prev => new Set([...prev, filterKey]))
  }

  const removeAdditionalFilter = (filterKey: string) => {
    setVisibleAdditionalFilters(prev => {
      const newSet = new Set(prev)
      newSet.delete(filterKey)
      return newSet
    })
    // Also clear the filter value
    onFilterChange(filterKey, filterKey.includes('has') || filterKey.includes('is') ? null : [])
  }

  const getAvailableAdditionalFilters = () => {
    return additionalFilters.filter(filter => !visibleAdditionalFilters.has(filter.key))
  }

  const handleArrayFilterChange = (filterKey: string, value: string, checked: boolean) => {
    const currentValues = filterValues[filterKey] || []
    const newValues = checked 
      ? [...currentValues, value]
      : currentValues.filter((item: string) => item !== value)
    
    onFilterChange(filterKey, newValues)
  }

  const handleBooleanFilterChange = (filterKey: string, value: boolean, checked: boolean) => {
    onFilterChange(filterKey, checked ? value : null)
  }

  const renderFilterDropdown = (filter: FilterConfig, isAdditional = false) => {
    const currentValue = filterValues[filter.key] || (filter.type === 'array' ? [] : null)
    const hasActiveValue = filter.type === 'array' ? currentValue.length > 0 : currentValue !== null
    
    return (
      <DropdownMenu key={filter.key}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className={`text-gray-700 gap-1 h-7  ${
              hasActiveValue
                ? 'pl-1' 
                : 'border-gray-300'
            }`}
          >
            {filter.type === 'array' && currentValue.length > 0 && (
              <span className="bg-blue-100 text-blue-600 rounded-full text-xs px-1.5 py-0.5 min-w-5">
                {currentValue.length}
              </span>
            )}
            {filter.label}

            {isAdditional && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  removeAdditionalFilter(filter.key)
                }}
                className="ml-2 hover:bg-gray-200 rounded-full p-0.5"
              >
                <ChevronDown className="h-3 w-3" strokeWidth={2} />
              </button>
            )}
            {!isAdditional && <ChevronDown className="h-3 w-3" strokeWidth={2} />}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className={filter.options.length > 6 ? "w-56" : ""}>
          {filter.options.map((option) => (
            <DropdownMenuItem
              key={option.value.toString()}
              className="flex items-center space-x-2 cursor-pointer"
              onClick={() => {
                if (filter.type === 'boolean') {
                  handleBooleanFilterChange(filter.key, option.value as boolean, currentValue !== option.value)
                } else {
                  handleArrayFilterChange(filter.key, option.value as string, !currentValue.includes(option.value))
                }
              }}
            >
              <Checkbox
                checked={
                  filter.type === 'boolean' 
                    ? currentValue === option.value
                    : currentValue.includes(option.value)
                }
                onCheckedChange={(checked) => {
                  if (filter.type === 'boolean') {
                    handleBooleanFilterChange(filter.key, option.value as boolean, !!checked)
                  } else {
                    handleArrayFilterChange(filter.key, option.value as string, !!checked)
                  }
                }}
              />
              <span className="flex-1">{option.label}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <div className="space-y-2 pb-3 mx-4 border-b">
      {/* Primary Filter Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Primary Filters */}
          {primaryFilters.map(filter => renderFilterDropdown(filter))}

          {/* Dynamic Additional Filter Buttons */}
          {additionalFilters
            .filter(filter => visibleAdditionalFilters.has(filter.key))
            .map(filter => renderFilterDropdown(filter, true))
          }

          {/* More Filters Dropdown */}
          {getAvailableAdditionalFilters().length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="text-gray-700 gap-2 h-7 border-gray-300">
                  <Plus className="h-3 w-3" strokeWidth={2} />
                  More Filters
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                {getAvailableAdditionalFilters().map((filter) => (
                  <DropdownMenuItem
                    key={filter.key}
                    onClick={() => addAdditionalFilter(filter.key)}
                    className="cursor-pointer"
                  >
                    {filter.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Right Side - Search and additional content */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" strokeWidth={2} />
            <Input
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 w-64 rounded-full"
            />
          </div>
          {rightContent}
        </div>
      </div>

      {/* Filter Chips Row */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          {filterChips.map((chip, index) => (
            <Badge
              key={`${chip.type}-${chip.value}-${index}`}
              variant="secondary"
              className="h-6 px-2 py-1 text-xs bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-50"
            >
              {chip.label}
              <button
                onClick={() => onRemoveFilter(chip.type, chip.value)}
                className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
              >
                <X className="h-3 w-3" strokeWidth={2} />
              </button>
            </Badge>
          ))}

          {/* Clear All Filters Button */}
          <Button
            variant="ghost"
            onClick={onClearAll}
            className="h-6 px-3 text-gray-600 hover:text-gray-700 text-xs"
          >
            Clear All Filters
          </Button>
        </div>
      )}
    </div>
  )
}