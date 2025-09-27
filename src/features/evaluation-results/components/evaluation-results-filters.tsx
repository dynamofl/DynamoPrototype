import React, { useState } from 'react'
import { Search, ChevronDown, Plus, X, Filter } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import type { FilterState } from '../types'
import { 
  ATTACK_OUTCOME_OPTIONS, 
  ATTACK_TYPE_OPTIONS,
  GUARDRAIL_JUDGMENT_OPTIONS,
  AI_SYSTEM_JUDGMENT_OPTIONS,
  SEVERITY_OPTIONS
} from '../constants'

interface EvaluationResultsFiltersProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  currentView: 'table' | 'conversation'
  onViewChange: (view: 'table' | 'conversation') => void
}

export function EvaluationResultsFilters({ filters, onFiltersChange, currentView, onViewChange }: EvaluationResultsFiltersProps) {
  // State to track which additional filters are visible
  const [visibleAdditionalFilters, setVisibleAdditionalFilters] = useState<Set<string>>(new Set())

  // Available additional filters
  const additionalFilters = [
    { key: 'aiSystemJudgment', label: 'AI System Judgment' },
    { key: 'severity', label: 'Severity' }
  ]

  const addAdditionalFilter = (filterKey: string) => {
    setVisibleAdditionalFilters(prev => new Set([...prev, filterKey]))
  }

  const removeAdditionalFilter = (filterKey: string) => {
    setVisibleAdditionalFilters(prev => {
      const newSet = new Set(prev)
      newSet.delete(filterKey)
      return newSet
    })
  }

  const getAvailableAdditionalFilters = () => {
    return additionalFilters.filter(filter => !visibleAdditionalFilters.has(filter.key))
  }
  const handleSearchChange = (value: string) => {
    onFiltersChange({
      ...filters,
      searchTerm: value
    })
  }

  const handleAttackOutcomeChange = (value: string, checked: boolean) => {
    const newOutcomes = checked 
      ? [...filters.attackOutcome, value]
      : filters.attackOutcome.filter(item => item !== value)
    
    onFiltersChange({
      ...filters,
      attackOutcome: newOutcomes
    })
  }

  const handleAttackTypeChange = (value: string, checked: boolean) => {
    const newTypes = checked 
      ? [...filters.attackType, value]
      : filters.attackType.filter(item => item !== value)
    
    onFiltersChange({
      ...filters,
      attackType: newTypes
    })
  }

  const handleGuardrailJudgmentChange = (value: string, checked: boolean) => {
    const newJudgments = checked 
      ? [...filters.guardrailJudgment, value]
      : filters.guardrailJudgment.filter(item => item !== value)
    
    onFiltersChange({
      ...filters,
      guardrailJudgment: newJudgments
    })
  }

  const handleAiSystemJudgmentChange = (value: string, checked: boolean) => {
    const newJudgments = checked 
      ? [...filters.aiSystemJudgment, value]
      : filters.aiSystemJudgment.filter(item => item !== value)
    
    onFiltersChange({
      ...filters,
      aiSystemJudgment: newJudgments
    })
  }

  const handleSeverityChange = (value: number, checked: boolean) => {
    const newSeverities = checked 
      ? [...filters.severity, value]
      : filters.severity.filter(item => item !== value)
    
    onFiltersChange({
      ...filters,
      severity: newSeverities
    })
  }

  const removeFilter = (filterType: keyof FilterState, value: string | number) => {
    const newFilters = { ...filters }
    
    if (filterType === 'severity') {
      newFilters[filterType] = filters[filterType].filter(item => item !== value)
    } else if (filterType !== 'searchTerm') {
      newFilters[filterType] = (filters[filterType] as string[]).filter(item => item !== value)
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

  const getAllFilterChips = () => {
    const chips: Array<{type: keyof FilterState, value: string | number, label: string}> = []
    
    filters.attackOutcome.forEach(value => {
      chips.push({ type: 'attackOutcome', value, label: value })
    })
    
    filters.attackType.forEach(value => {
      chips.push({ type: 'attackType', value, label: value })
    })
    
    filters.guardrailJudgment.forEach(value => {
      chips.push({ type: 'guardrailJudgment', value, label: `Guardrail: ${value}` })
    })
    
    // Include AI System Judgment and Severity chips for individual values
    filters.aiSystemJudgment.forEach(value => {
      chips.push({ type: 'aiSystemJudgment', value, label: `AI System: ${value}` })
    })
    
    filters.severity.forEach(value => {
      chips.push({ type: 'severity', value, label: `Severity ${value}` })
    })
    
    return chips
  }

  return (
    <div className="space-y-4 py-3 mx-4 border-b">
      {/* Primary Filter Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Primary Filters - Attack Outcome, Attack Type, Guardrail Judgment */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                className={`text-gray-700 gap-2 h-7 ${
                  filters.attackOutcome.length > 0 
                    ? 'bg-blue-50 text-blue-700 border-blue-300' 
                    : 'border-gray-300'
                }`}
              >
                Attack Outcome
                {filters.attackOutcome.length > 0 && (
                  <span className="bg-blue-100 text-blue-600 rounded-full text-xs px-1.5 py-0.5 ml-1">
                    {filters.attackOutcome.length}
                  </span>
                )}
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {ATTACK_OUTCOME_OPTIONS.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  className="flex items-center space-x-2 cursor-pointer"
                  onClick={() => handleAttackOutcomeChange(option.value, !filters.attackOutcome.includes(option.value))}
                >
                  <Checkbox
                    checked={filters.attackOutcome.includes(option.value)}
                    onCheckedChange={(checked) => handleAttackOutcomeChange(option.value, !!checked)}
                  />
                  <span className="flex-1">{option.label}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                className={`text-gray-700 gap-2 h-7 ${
                  filters.attackType.length > 0 
                    ? 'bg-blue-50 text-blue-700 border-blue-300' 
                    : 'border-gray-300'
                }`}
              >
                Attack Type
                {filters.attackType.length > 0 && (
                  <span className="bg-blue-100 text-blue-600 rounded-full text-xs px-1.5 py-0.5 ml-1">
                    {filters.attackType.length}
                  </span>
                )}
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              {ATTACK_TYPE_OPTIONS.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  className="flex items-center space-x-2 cursor-pointer"
                  onClick={() => handleAttackTypeChange(option.value, !filters.attackType.includes(option.value))}
                >
                  <Checkbox
                    checked={filters.attackType.includes(option.value)}
                    onCheckedChange={(checked) => handleAttackTypeChange(option.value, !!checked)}
                  />
                  <span className="flex-1">{option.label}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                className={`text-gray-700 gap-2 h-7 ${
                  filters.guardrailJudgment.length > 0 
                    ? 'bg-blue-50 text-blue-700 border-blue-300' 
                    : 'border-gray-300'
                }`}
              >
                Guardrail Judgment
                {filters.guardrailJudgment.length > 0 && (
                  <span className="bg-blue-100 text-blue-600 rounded-full text-xs px-1.5 py-0.5 ml-1">
                    {filters.guardrailJudgment.length}
                  </span>
                )}
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {GUARDRAIL_JUDGMENT_OPTIONS.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  className="flex items-center space-x-2 cursor-pointer"
                  onClick={() => handleGuardrailJudgmentChange(option.value, !filters.guardrailJudgment.includes(option.value))}
                >
                  <Checkbox
                    checked={filters.guardrailJudgment.includes(option.value)}
                    onCheckedChange={(checked) => handleGuardrailJudgmentChange(option.value, !!checked)}
                  />
                  <span className="flex-1">{option.label}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Dynamic Additional Filter Buttons - Before More Filters */}
          {visibleAdditionalFilters.has('aiSystemJudgment') && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  className={`text-gray-700 gap-2 h-7 ${
                    filters.aiSystemJudgment.length > 0 
                      ? 'bg-blue-50 text-blue-700 border-blue-300' 
                      : 'border-gray-300'
                  }`}
                >
                  AI System Judgment
                  {filters.aiSystemJudgment.length > 0 && (
                    <span className="bg-blue-100 text-blue-600 rounded-full text-xs px-1.5 py-0.5 ml-1">
                      {filters.aiSystemJudgment.length}
                    </span>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      removeAdditionalFilter('aiSystemJudgment')
                      // Clear the filter values when removing the filter
                      onFiltersChange({
                        ...filters,
                        aiSystemJudgment: []
                      })
                    }}
                    className="ml-2 hover:bg-gray-200 rounded-full p-0.5"
                  >
                    <ChevronDown className="h-3 w-3" />
                  </button>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {AI_SYSTEM_JUDGMENT_OPTIONS.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    className="flex items-center space-x-2 cursor-pointer"
                    onClick={() => handleAiSystemJudgmentChange(option.value, !filters.aiSystemJudgment.includes(option.value))}
                  >
                    <Checkbox
                      checked={filters.aiSystemJudgment.includes(option.value)}
                      onCheckedChange={(checked) => handleAiSystemJudgmentChange(option.value, !!checked)}
                    />
                    <span className="flex-1">{option.label}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {visibleAdditionalFilters.has('severity') && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  className={`text-gray-700 gap-2 h-7 ${
                    filters.severity.length > 0 
                      ? 'bg-blue-50 text-blue-700 border-blue-300' 
                      : 'border-gray-300'
                  }`}
                >
                  Severity
                  {filters.severity.length > 0 && (
                    <span className="bg-blue-100 text-blue-600 rounded-full text-xs px-1.5 py-0.5 ml-1">
                      {filters.severity.length}
                    </span>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      removeAdditionalFilter('severity')
                      // Clear the filter values when removing the filter
                      onFiltersChange({
                        ...filters,
                        severity: []
                      })
                    }}
                    className="ml-2 hover:bg-gray-200 rounded-full p-0.5"
                  >
                    <ChevronDown className="h-3 w-3" />
                  </button>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {SEVERITY_OPTIONS.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    className="flex items-center space-x-2 cursor-pointer"
                    onClick={() => handleSeverityChange(option.value, !filters.severity.includes(option.value))}
                  >
                    <Checkbox
                      checked={filters.severity.includes(option.value)}
                      onCheckedChange={(checked) => handleSeverityChange(option.value, !!checked)}
                    />
                    <span className="flex-1">{option.label}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* More Filters Dropdown - Always last */}
          {getAvailableAdditionalFilters().length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="text-gray-700 gap-2 h-7 border-gray-300">
                  <Plus className="h-3 w-3" />
                  More filters
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

        {/* Right Side - Search and View Toggle */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search conversations"
              value={filters.searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9 w-64 h-8"
            />
          </div>

          <Tabs value={currentView} onValueChange={(value) => onViewChange(value as 'table' | 'conversation')}>
            <TabsList className="h-9 px-1 rounded-lg">
              <TabsTrigger value="table" className="text-[13px] py-1 px-3 rounded-md">
                Table View
              </TabsTrigger>
              <TabsTrigger value="conversation" className="text-[13px] py-1 px-3 rounded-md">
                Conversation View
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Filter Chips Row - Only individual filter value chips */}
      {hasActiveFilters() && (
        <div className="flex items-center gap-2 flex-wrap">
          {/* Individual filter chips for selected values from all filters */}
          {getAllFilterChips().map((chip, index) => (
            <Badge
              key={`${chip.type}-${chip.value}-${index}`}
              variant="secondary"
              className="h-6 px-2 py-1 text-xs bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-50"
            >
              {chip.label}
              <button
                onClick={() => removeFilter(chip.type, chip.value)}
                className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}

          {/* Clear All Filters Button */}
          <Button
            variant="ghost"
            onClick={clearAllFilters}
            className="h-6 px-3 text-gray-600 hover:text-gray-700 text-xs"
          >
            Clear all filters
          </Button>
        </div>
      )}
    </div>
  )
}