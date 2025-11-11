import { FilterSearch } from '@/components/patterns/ui-patterns'
import type { FilterConfig, FilterChip } from '@/components/patterns/ui-patterns'
import type { GuardrailsFilterState } from '../types'
import { 
  GUARDRAIL_STATUS_OPTIONS, 
  GUARDRAIL_CATEGORY_OPTIONS
} from '../constants'

interface GuardrailsFiltersProps {
  filters: GuardrailsFilterState
  onFiltersChange: (filters: GuardrailsFilterState) => void
}

export function GuardrailsFilters({ filters, onFiltersChange }: GuardrailsFiltersProps) {
  const primaryFilters: FilterConfig[] = [
    {
      key: 'status',
      label: 'Status',
      options: GUARDRAIL_STATUS_OPTIONS,
      type: 'array'
    },
    {
      key: 'category',
      label: 'Category', 
      options: GUARDRAIL_CATEGORY_OPTIONS,
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
      const currentValues = filters[filterType as keyof GuardrailsFilterState]
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
      searchTerm: ''
    })
  }

  const hasActiveFilters = () => {
    return filters.status.length > 0 ||
           filters.category.length > 0
  }

  const getAllFilterChips = (): FilterChip[] => {
    const chips: FilterChip[] = []
    
    filters.status.forEach(value => {
      const option = GUARDRAIL_STATUS_OPTIONS.find(opt => opt.value === value)
      chips.push({ type: 'status', value, label: `Status: ${option?.label || value}` })
    })
    
    filters.category.forEach(value => {
      const option = GUARDRAIL_CATEGORY_OPTIONS.find(opt => opt.value === value)
      chips.push({ type: 'category', value, label: `Category: ${option?.label || value}` })
    })
    
    return chips
  }

  return (
    <FilterSearch
      searchPlaceholder="Search guardrails..."
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