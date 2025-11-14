// Generic Evaluation Filters Component
// Uses strategy pattern to provide filters for different test types

import { useMemo, useCallback } from 'react'
import { ClipboardCheck } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
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
  isAnnotationModeEnabled?: boolean
  onAnnotationModeChange?: (enabled: boolean) => void
}

export function GenericEvaluationFilters({
  strategy,
  filters,
  onFiltersChange,
  currentView,
  onViewChange,
  hasGuardrails = true,
  data = [],
  isAnnotationModeEnabled = false,
  onAnnotationModeChange
}: GenericEvaluationFiltersProps) {
  // Check if any records have input/output guardrail judgements
  const hasInputGuardrails = useMemo(() =>
    data.some(record =>
      (record as any).inputGuardrailJudgement !== null && (record as any).inputGuardrailJudgement !== undefined
    ),
    [data]
  )
  const hasOutputGuardrails = useMemo(() =>
    data.some(record =>
      (record as any).outputGuardrailJudgement !== null && (record as any).outputGuardrailJudgement !== undefined
    ),
    [data]
  )

  // Memoize UI filters to prevent infinite loops
  // Only depend on data.length to avoid re-creating when array reference changes
  const uiFilters = useMemo(() => {
    const strategyFilters = strategy.getFilters({ hasInputGuardrails, hasOutputGuardrails })

    return strategyFilters.map(filter => {
      // If options not provided in strategy, derive from data
      let options = filter.options ?? []

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
          ...Array.from(uniqueValues).map(v => ({ value: v, label: v }))
        ]
      }

      return {
        key: filter.key,
        label: filter.label,
        options: options.length > 0 ? options : [{ value: '', label: 'No options' }],
        type: 'array' as const
      }
    })
  }, [strategy, hasGuardrails, data.length])

  const handleFilterChange = useCallback((filterKey: string, value: any) => {
    onFiltersChange({
      ...filters,
      [filterKey]: value
    })
  }, [filters, onFiltersChange])

  const handleSearchChange = useCallback((value: string) => {
    onFiltersChange({
      ...filters,
      searchTerm: value
    })
  }, [filters, onFiltersChange])

  const removeFilter = useCallback((filterType: string, value: string | number | boolean) => {
    const newFilters = { ...filters }

    if (filterType !== 'searchTerm') {
      const currentValues = filters[filterType]
      if (Array.isArray(currentValues)) {
        (newFilters as any)[filterType] = currentValues.filter(item => item !== value)
      }
    }

    onFiltersChange(newFilters)
  }, [filters, onFiltersChange])

  const clearAllFilters = useCallback(() => {
    const clearedFilters: Record<string, any> = { searchTerm: '' }
    uiFilters.forEach(filter => {
      clearedFilters[filter.key] = []
    })
    onFiltersChange(clearedFilters)
  }, [uiFilters, onFiltersChange])

  const hasActiveFiltersValue = useMemo(() => {
    return Object.entries(filters).some(([key, value]) => {
      if (key === 'searchTerm') {
        return typeof value === 'string' && value.length > 0
      }
      return Array.isArray(value) && value.length > 0
    })
  }, [filters])

  const primaryFilters = useMemo(() => uiFilters.slice(0, 3), [uiFilters])
  const additionalFilters = useMemo(() => uiFilters.slice(3), [uiFilters])

  const activeFilterChips = useMemo((): FilterChip[] => {
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
            label: option?.label ?? String(value)
          })
        })
      }
    })

    return chips
  }, [filters, uiFilters])

  // Right content for view switcher and annotation toggle
  const rightContent = (
    <div className="flex items-center gap-3">

 {onAnnotationModeChange && (
        <div className="flex items-center gap-2 pl-3">
          <label
            htmlFor="annotation-mode-toggle"
            className="text-xs font-400 text-gray-700 cursor-pointer select-none flex items-center gap-1.5"
          >
            Enable Human Judgement
          </label>
          <Switch
            id="annotation-mode-toggle"
            checked={isAnnotationModeEnabled}
            onCheckedChange={onAnnotationModeChange}
          />
        </div>
      )}


      <Tabs value={currentView} onValueChange={(value) => onViewChange(value as 'table' | 'conversation')}>
        <TabsList className="px-0.5 rounded-full">
          <TabsTrigger value="conversation" className="text-[0.8125rem] px-3 rounded-full">
            Conversation View
          </TabsTrigger>
          <TabsTrigger value="table" className="text-[0.8125rem] px-3 rounded-full">
            Table View
          </TabsTrigger>
        </TabsList>
      </Tabs>

     
    </div>
  )

  return (
   
      <FilterSearch
        primaryFilters={primaryFilters}
        additionalFilters={additionalFilters}
        filterChips={activeFilterChips}
        searchValue={filters.searchTerm || ''}
        onFilterChange={handleFilterChange}
        onSearchChange={handleSearchChange}
        onRemoveFilter={removeFilter}
        onClearAll={clearAllFilters}
        hasActiveFilters={hasActiveFiltersValue}
        filterValues={filters}
        rightContent={rightContent}
      />

  )
}
