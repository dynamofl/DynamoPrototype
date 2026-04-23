import { FilterSearch } from '@/components/patterns/ui-patterns'
import type { FilterConfig, FilterChip } from '@/components/patterns/ui-patterns'
import type { PolicyFilterState } from '../types'
import {
  POLICY_STATUS_OPTIONS,
  POLICY_CATEGORY_OPTIONS,
  POLICY_TYPE_OPTIONS
} from '../constants'

interface PolicyManagerFiltersProps {
  filters: PolicyFilterState
  onFiltersChange: (filters: PolicyFilterState) => void
}

export function PolicyManagerFilters({ filters, onFiltersChange }: PolicyManagerFiltersProps) {
  const primaryFilters: FilterConfig[] = [
    {
      key: 'status',
      label: 'Status',
      options: POLICY_STATUS_OPTIONS,
      type: 'array'
    },
    {
      key: 'category',
      label: 'Category',
      options: POLICY_CATEGORY_OPTIONS,
      type: 'array'
    },
    {
      key: 'type',
      label: 'Type',
      options: POLICY_TYPE_OPTIONS,
      type: 'array'
    }
  ]

  const handleFilterChange = (filterKey: string, value: any) => {
    onFiltersChange({
      ...filters,
      [filterKey]: value
    })
  }

  const handleSearchChange = (value: string) => {
    onFiltersChange({
      ...filters,
      searchTerm: value
    })
  }

  const removeFilter = (filterType: string, value: string | number | boolean) => {
    const newFilters = { ...filters }

    if (filterType !== 'searchTerm') {
      const currentValues = filters[filterType as keyof PolicyFilterState]
      if (Array.isArray(currentValues)) {
        (newFilters as any)[filterType] = currentValues.filter(item => item !== value)
      }
    }

    onFiltersChange(newFilters)
  }

  const clearAllFilters = () => {
    onFiltersChange({
      status: [],
      category: [],
      type: [],
      searchTerm: ''
    })
  }

  const hasActiveFilters = () => {
    return filters.status.length > 0 ||
           filters.category.length > 0 ||
           filters.type.length > 0
  }

  const getAllFilterChips = (): FilterChip[] => {
    const chips: FilterChip[] = []

    filters.status.forEach(value => {
      const option = POLICY_STATUS_OPTIONS.find(opt => opt.value === value)
      chips.push({ type: 'status', value, label: `Status: ${option?.label || value}` })
    })

    filters.category.forEach(value => {
      const option = POLICY_CATEGORY_OPTIONS.find(opt => opt.value === value)
      chips.push({ type: 'category', value, label: `Category: ${option?.label || value}` })
    })

    filters.type.forEach(value => {
      const option = POLICY_TYPE_OPTIONS.find(opt => opt.value === value)
      chips.push({ type: 'type', value, label: `Type: ${option?.label || value}` })
    })

    return chips
  }

  return (
    <FilterSearch
      searchPlaceholder="Search policies..."
      searchValue={filters.searchTerm}
      onSearchChange={handleSearchChange}
      primaryFilters={primaryFilters}
      filterValues={filters}
      onFilterChange={handleFilterChange}
      filterChips={getAllFilterChips()}
      onRemoveFilter={removeFilter}
      onClearAll={clearAllFilters}
      hasActiveFilters={hasActiveFilters()}
    />
  )
}
