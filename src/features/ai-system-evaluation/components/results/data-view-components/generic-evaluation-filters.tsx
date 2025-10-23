// Generic Evaluation Filters Component
// Uses strategy pattern to provide filters for different test types

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FilterSearch } from '@/components/patterns/ui-patterns'
import type { FilterConfig as UIFilterConfig, FilterChip } from '@/components/patterns/ui-patterns'
import type { EvaluationStrategy, FilterConfig as StrategyFilterConfig } from '../../../strategies/base-strategy'
import type { BaseEvaluationResult } from '../../../types/base-evaluation'

interface GenericEvaluationFiltersProps {
  strategy: EvaluationStrategy
  filters: Record<string, any>
  onFiltersChange: (filters: Record<string, any>) => void
  currentView: 'table' | 'conversation'
  onViewChange: (view: 'table' | 'conversation') => void
  hasGuardrails?: boolean
  data?: BaseEvaluationResult[]  // For dynamic filter options
}

export function GenericEvaluationFilters({
  strategy,
  filters,
  onFiltersChange,
  currentView,
  onViewChange,
  hasGuardrails = true,
  data = []
}: GenericEvaluationFiltersProps) {
  // Get filter configurations from strategy
  const strategyFilters = strategy.getFilters(hasGuardrails)

  // Convert strategy filters to UI filter configs
  const convertToUIFilters = (strategyFilters: StrategyFilterConfig[]): UIFilterConfig[] => {
    return strategyFilters.map(filter => {
      // If options not provided in strategy, derive from data
      let options = filter.options || []

      if (options.length === 0 && data.length > 0) {
        // Auto-generate options from data based on filter key
        const uniqueValues = new Set<string>()
        data.forEach(record => {
          const value = (record as any)[filter.key]
          if (value !== null && value !== undefined) {
            uniqueValues.add(String(value))
          }
        })
        options = [
          { value: 'all', label: 'All' },
          ...Array.from(uniqueValues).map(v => ({ value: v, label: v }))
        ]
      }

      return {
        key: filter.key,
        label: filter.label,
        options,
        type: 'array'
      }
    })
  }

  const uiFilters = convertToUIFilters(strategyFilters)

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
      const currentValues = filters[filterType]
      if (Array.isArray(currentValues)) {
        (newFilters as any)[filterType] = currentValues.filter(item => item !== value)
      }
    }

    onFiltersChange(newFilters)
  }

  const clearAllFilters = () => {
    const clearedFilters: Record<string, any> = { searchTerm: '' }
    uiFilters.forEach(filter => {
      clearedFilters[filter.key] = []
    })
    onFiltersChange(clearedFilters)
  }

  const hasActiveFilters = () => {
    return Object.entries(filters).some(([key, value]) => {
      if (key === 'searchTerm') {
        return typeof value === 'string' && value.length > 0
      }
      return Array.isArray(value) && value.length > 0
    })
  }

  const getActiveFilterChips = (): FilterChip[] => {
    const chips: FilterChip[] = []

    Object.entries(filters).forEach(([filterType, filterValues]) => {
      if (filterType === 'searchTerm') return

      if (Array.isArray(filterValues)) {
        filterValues.forEach((value) => {
          const filterConfig = uiFilters.find(f => f.key === filterType)
          const option = filterConfig?.options?.find(o => o.value === value)

          chips.push({
            type: filterType,
            value: value as string,
            label: option?.label || String(value)
          })
        })
      }
    })

    return chips
  }

  return (
    <div className="space-y-4 px-4">
      {/* View Toggle */}
      <div className="flex justify-between items-center">
        <Tabs value={currentView} onValueChange={(value) => onViewChange(value as 'table' | 'conversation')}>
          <TabsList>
            <TabsTrigger value="table">Table View</TabsTrigger>
            <TabsTrigger value="conversation">Conversation View</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Filters */}
      <FilterSearch
        primaryFilters={uiFilters.slice(0, 3)}
        additionalFilters={uiFilters.slice(3)}
        activeFilterChips={getActiveFilterChips()}
        searchValue={filters.searchTerm || ''}
        onFilterChange={handleFilterChange}
        onSearchChange={handleSearchChange}
        onRemoveFilter={removeFilter}
        onClearAll={clearAllFilters}
        hasActiveFilters={hasActiveFilters()}
        filterState={filters}
      />
    </div>
  )
}
