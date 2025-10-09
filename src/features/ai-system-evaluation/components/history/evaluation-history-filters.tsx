import { FilterSearch } from '@/components/patterns/ui-patterns'
import type { FilterConfig, FilterChip } from '@/components/patterns/ui-patterns'

export interface EvaluationHistoryFilterState {
  status: string[]
  category: string[]
  searchTerm: string
}

interface EvaluationHistoryFiltersProps {
  filters: EvaluationHistoryFilterState
  onFiltersChange: (filters: EvaluationHistoryFilterState) => void
}

const STATUS_OPTIONS = [
  { value: 'completed', label: 'Completed' },
  { value: 'running', label: 'Running' },
  { value: 'failed', label: 'Failed' },
  { value: 'pending', label: 'Pending' }
]

const CATEGORY_OPTIONS = [
  { value: 'compliance', label: 'Compliance' },
  { value: 'jailbreak', label: 'Jailbreak' }
]

export function EvaluationHistoryFilters({ filters, onFiltersChange }: EvaluationHistoryFiltersProps) {
  const primaryFilters: FilterConfig[] = [
    {
      key: 'status',
      label: 'Status',
      options: STATUS_OPTIONS,
      type: 'array'
    },
    {
      key: 'category',
      label: 'Category',
      options: CATEGORY_OPTIONS,
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
      newFilters[filterType as keyof EvaluationHistoryFilterState] = (filters[filterType as keyof EvaluationHistoryFilterState] as string[]).filter(item => item !== value)
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
      const option = STATUS_OPTIONS.find(opt => opt.value === value)
      chips.push({ type: 'status', value, label: `Status: ${option?.label || value}` })
    })

    filters.category.forEach(value => {
      const option = CATEGORY_OPTIONS.find(opt => opt.value === value)
      chips.push({ type: 'category', value, label: `Category: ${option?.label || value}` })
    })

    return chips
  }

  return (
    <FilterSearch
      searchPlaceholder="Search evaluations..."
      searchValue={filters.searchTerm}
      onSearchChange={handleSearchChange}
      primaryFilters={primaryFilters}
      additionalFilters={[]}
      filterValues={filters}
      onFilterChange={handleFilterChange}
      filterChips={getAllFilterChips()}
      onRemoveFilter={removeFilter}
      onClearAll={clearAllFilters}
      hasActiveFilters={hasActiveFilters()}
    />
  )
}
