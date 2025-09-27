import type { EvaluationRecord, FilterState } from '../types'

export function filterRecords(records: EvaluationRecord[], filters: FilterState): EvaluationRecord[] {
  return records.filter(record => {
    // Search term filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase()
      const searchableFields = [
        record.basePrompt,
        record.jailbrokenPrompt,
        record.aiSystemResponse,
        record.attackArea,
        record.attackType
      ].join(' ').toLowerCase()
      
      if (!searchableFields.includes(searchLower)) {
        return false
      }
    }

    // Attack outcome filter
    if (filters.attackOutcome.length > 0) {
      if (!filters.attackOutcome.includes(record.attackOutcome)) {
        return false
      }
    }

    // Attack type filter
    if (filters.attackType.length > 0) {
      if (!filters.attackType.includes(record.attackType)) {
        return false
      }
    }

    // Guardrail judgment filter
    if (filters.guardrailJudgment.length > 0) {
      if (!filters.guardrailJudgment.includes(record.inputGuardrailResultAggregate)) {
        return false
      }
    }

    // AI system judgment filter
    if (filters.aiSystemJudgment.length > 0) {
      if (!filters.aiSystemJudgment.includes(record.aiSystemResponseType)) {
        return false
      }
    }

    // Severity filter
    if (filters.severity.length > 0) {
      if (!filters.severity.includes(record.severity)) {
        return false
      }
    }

    return true
  })
}

export function paginateRecords(
  records: EvaluationRecord[], 
  page: number, 
  pageSize: number
): { data: EvaluationRecord[], total: number } {
  const startIndex = (page - 1) * pageSize
  const endIndex = startIndex + pageSize
  
  return {
    data: records.slice(startIndex, endIndex),
    total: records.length
  }
}