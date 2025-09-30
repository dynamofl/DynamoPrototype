import { FilterSearch } from '@/components/patterns/ui-patterns'
import type { FilterConfig, FilterChip } from '@/components/patterns/ui-patterns'
import type { AISystemsFilterState } from '../types'
import { 
  STATUS_OPTIONS, 
  PROVIDER_OPTIONS,
  BOOLEAN_OPTIONS
} from '../constants'

interface AISystemsFiltersProps {
  filters: AISystemsFilterState
  onFiltersChange: (filters: AISystemsFilterState) => void
}

export function AISystemsFilters({ filters, onFiltersChange }: AISystemsFiltersProps) {
  const primaryFilters: FilterConfig[] = [
    {
      key: 'status',
      label: 'Status',
      options: STATUS_OPTIONS,
      type: 'array'
    },
    {
      key: 'provider',
      label: 'Provider', 
      options: PROVIDER_OPTIONS,
      type: 'array'
    }
  ]

  const additionalFilters: FilterConfig[] = [
    {
      key: 'hasGuardrails',
      label: 'Has Guardrails',
      options: BOOLEAN_OPTIONS,
      type: 'boolean'
    },
    {
      key: 'isEvaluated',
      label: 'Is Evaluated',
      options: BOOLEAN_OPTIONS,
      type: 'boolean'
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
    
    if (filterType === 'hasGuardrails' || filterType === 'isEvaluated') {
      newFilters[filterType as keyof AISystemsFilterState] = null
    } else if (filterType !== 'searchTerm') {
      newFilters[filterType as keyof AISystemsFilterState] = (filters[filterType as keyof AISystemsFilterState] as string[]).filter(item => item !== value)
    }
    
    onFiltersChange(newFilters)
  }

  const clearAllFilters = () => {
    onFiltersChange({
      status: [],
      provider: [],
      hasGuardrails: null,
      isEvaluated: null,
      searchTerm: ''
    })
  }

  const hasActiveFilters = () => {
    return filters.status.length > 0 ||
           filters.provider.length > 0 ||
           filters.hasGuardrails !== null ||
           filters.isEvaluated !== null
  }

  const getAllFilterChips = (): FilterChip[] => {
    const chips: FilterChip[] = []
    
    filters.status.forEach(value => {
      const option = STATUS_OPTIONS.find(opt => opt.value === value)
      chips.push({ type: 'status', value, label: `Status: ${option?.label || value}` })
    })
    
    filters.provider.forEach(value => {
      const option = PROVIDER_OPTIONS.find(opt => opt.value === value)
      chips.push({ type: 'provider', value, label: `Provider: ${option?.label || value}` })
    })
    
    if (filters.hasGuardrails !== null) {
      chips.push({ 
        type: 'hasGuardrails', 
        value: filters.hasGuardrails, 
        label: `Has Guardrails: ${filters.hasGuardrails ? 'Yes' : 'No'}` 
      })
    }
    
    if (filters.isEvaluated !== null) {
      chips.push({ 
        type: 'isEvaluated', 
        value: filters.isEvaluated, 
        label: `Is Evaluated: ${filters.isEvaluated ? 'Yes' : 'No'}` 
      })
    }
    
    return chips
  }

  return (
    <FilterSearch
      searchPlaceholder="Search AI systems..."
      searchValue={filters.searchTerm}
      onSearchChange={handleSearchChange}
      primaryFilters={primaryFilters}
      additionalFilters={additionalFilters}
      filterValues={filters}
      onFilterChange={handleFilterChange}
      filterChips={getAllFilterChips()}
      onRemoveFilter={removeFilter}
      onClearAll={clearAllFilters}
      hasActiveFilters={hasActiveFilters()}
    />
  )
}