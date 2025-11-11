import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FilterSearch } from '@/components/patterns/ui-patterns'
import type { FilterConfig, FilterChip } from '@/components/patterns/ui-patterns'
import type { JailbreakFilterState } from '../../../types/evaluation-data-types'
import {
  ATTACK_OUTCOME_OPTIONS,
  ATTACK_TYPE_OPTIONS,
  GUARDRAIL_JUDGMENT_OPTIONS,
  MODEL_JUDGMENT_OPTIONS,
  BEHAVIOR_TYPE_OPTIONS
} from '../../../constants/evaluation-data-constants'

interface EvaluationDataFiltersProps {
  filters: JailbreakFilterState
  onFiltersChange: (filters: JailbreakFilterState) => void
  currentView: 'table' | 'conversation'
  onViewChange: (view: 'table' | 'conversation') => void
  hasGuardrails?: boolean
}

export function EvaluationDataFilters({ filters, onFiltersChange, currentView, onViewChange, hasGuardrails = true }: EvaluationDataFiltersProps) {
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
    ...(hasGuardrails ? [{
      key: 'guardrailJudgment',
      label: 'Guardrail Judgment',
      options: GUARDRAIL_JUDGMENT_OPTIONS,
      type: 'array' as const
    }] : [])
  ]

  const additionalFilters: FilterConfig[] = [
    {
      key: 'modelJudgment',
      label: 'Model Judgment',
      options: MODEL_JUDGMENT_OPTIONS,
      type: 'array'
    },
    {
      key: 'behaviorType',
      label: 'Behavior Type',
      options: BEHAVIOR_TYPE_OPTIONS,
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
      const currentValues = filters[filterType as keyof JailbreakFilterState]
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
      modelJudgment: [],
      behaviorType: [],
      topic: [],
      searchTerm: ''
    })
  }

  const hasActiveFilters = () => {
    return filters.attackOutcome.length > 0 ||
           filters.attackType.length > 0 ||
           filters.guardrailJudgment.length > 0 ||
           filters.modelJudgment.length > 0 ||
           filters.behaviorType.length > 0
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

    filters.modelJudgment.forEach(value => {
      chips.push({ type: 'modelJudgment', value, label: `Model: ${value}` })
    })

    filters.behaviorType.forEach(value => {
      chips.push({ type: 'behaviorType', value, label: `Behavior: ${value}` })
    })

    return chips
  }

  // Right content for view switcher
  const rightContent = (
    <Tabs value={currentView} onValueChange={(value) => onViewChange(value as 'table' | 'conversation')}>
      <TabsList className=" px-0.5 rounded-full">
        <TabsTrigger value="table" className="text-[0.8125rem]  px-3 rounded-full">
          Table View
        </TabsTrigger>
        <TabsTrigger value="conversation" className="text-[0.8125rem]  px-3 rounded-full">
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
