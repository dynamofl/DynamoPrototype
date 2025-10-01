import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FilterSearch } from '@/components/patterns/ui-patterns'
import type { FilterConfig, FilterChip } from '@/components/patterns/ui-patterns'
import type { FilterState } from '../types/types'
import { 
  ATTACK_OUTCOME_OPTIONS, 
  ATTACK_TYPE_OPTIONS,
  GUARDRAIL_JUDGMENT_OPTIONS,
  AI_SYSTEM_JUDGMENT_OPTIONS,
  SEVERITY_OPTIONS
} from '../constants/constants'

interface EvaluationResultsFiltersProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  currentView: 'table' | 'conversation'
  onViewChange: (view: 'table' | 'conversation') => void
}

export function EvaluationResultsFilters({ filters, onFiltersChange, currentView, onViewChange }: EvaluationResultsFiltersProps) {
  const primaryFilters: FilterConfig[] = [
    {
      key: 'attackOutcome',
      label: 'Attack Outcome',
      options: ATTACK_OUTCOME_OPTIONS,
      type: 'array'
    },
    {
      key: 'attackType',
      label: 'Attack Type',
      options: ATTACK_TYPE_OPTIONS,
      type: 'array'
    },
    {
      key: 'guardrailJudgment',
      label: 'Guardrail Judgment',
      options: GUARDRAIL_JUDGMENT_OPTIONS,
      type: 'array'
    }
  ]

  const additionalFilters: FilterConfig[] = [
    {
      key: 'aiSystemJudgment',
      label: 'AI System Judgment',
      options: AI_SYSTEM_JUDGMENT_OPTIONS,
      type: 'array'
    },
    {
      key: 'severity',
      label: 'Severity',
      options: SEVERITY_OPTIONS,
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
      const currentValues = filters[filterType as keyof FilterState]
      if (Array.isArray(currentValues)) {
        (newFilters as any)[filterType] = currentValues.filter(item => item !== value)
      }
    }
    
    onFiltersChange(newFilters)
  }

  const clearAllFilters = () => {
    onFiltersChange({
      attackOutcome: [],
      attackType: [],
      guardrailJudgment: [],
      aiSystemJudgment: [],
      severity: [],
      searchTerm: ''
    })
  }

  const hasActiveFilters = () => {
    return filters.attackOutcome.length > 0 ||
           filters.attackType.length > 0 ||
           filters.guardrailJudgment.length > 0 ||
           filters.aiSystemJudgment.length > 0 ||
           filters.severity.length > 0
  }

  const getAllFilterChips = (): FilterChip[] => {
    const chips: FilterChip[] = []
    
    filters.attackOutcome.forEach(value => {
      chips.push({ type: 'attackOutcome', value, label: value })
    })
    
    filters.attackType.forEach(value => {
      chips.push({ type: 'attackType', value, label: value })
    })
    
    filters.guardrailJudgment.forEach(value => {
      chips.push({ type: 'guardrailJudgment', value, label: `Guardrail: ${value}` })
    })
    
    filters.aiSystemJudgment.forEach(value => {
      chips.push({ type: 'aiSystemJudgment', value, label: `AI System: ${value}` })
    })
    
    filters.severity.forEach(value => {
      chips.push({ type: 'severity', value, label: `Severity ${value}` })
    })
    
    return chips
  }

  // Right content for view switcher
  const rightContent = (
    <Tabs value={currentView} onValueChange={(value) => onViewChange(value as 'table' | 'conversation')}>
      <TabsList className="h-8 px-0.5 rounded-full">
        <TabsTrigger value="table" className="text-[13px] py-1 px-3 rounded-full">
          Table View
        </TabsTrigger>
        <TabsTrigger value="conversation" className="text-[13px] py-1 px-3 rounded-full">
          Conversation View
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )

  return (
    <FilterSearch
      searchPlaceholder="Search conversations"
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
      rightContent={rightContent}
    />
  )
}