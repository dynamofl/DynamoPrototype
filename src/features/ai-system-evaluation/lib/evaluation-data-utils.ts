import type { JailbreakEvaluationResult } from '../types/jailbreak-evaluation'
import type { JailbreakFilterState } from '../types/evaluation-data-types'

export function filterJailbreakRecords(
  records: JailbreakEvaluationResult[],
  filters: JailbreakFilterState
): JailbreakEvaluationResult[] {
  return records.filter(record => {
    // Attack outcome filter
    if (filters.attackOutcome.length > 0 && !filters.attackOutcome.includes(record.attackOutcome)) {
      return false
    }

    // Attack type filter
    if (filters.attackType.length > 0 && !filters.attackType.includes(record.attackType)) {
      return false
    }

    // Guardrail judgment filter
    if (filters.guardrailJudgment.length > 0 && !filters.guardrailJudgment.includes(record.guardrailJudgement)) {
      return false
    }

    // Model judgment filter
    if (filters.modelJudgment.length > 0 && !filters.modelJudgment.includes(record.modelJudgement)) {
      return false
    }

    // Behavior type filter
    if (filters.behaviorType.length > 0 && !filters.behaviorType.includes(record.behaviorType)) {
      return false
    }

    // Search term filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase()
      const searchableFields = [
        record.basePrompt,
        record.adversarialPrompt,
        record.systemResponse,
        record.policyName,
        record.attackType,
        record.behaviorType
      ].join(' ').toLowerCase()

      if (!searchableFields.includes(searchLower)) {
        return false
      }
    }

    return true
  })
}

export function paginateJailbreakRecords(
  records: JailbreakEvaluationResult[],
  page: number,
  pageSize: number
): { data: JailbreakEvaluationResult[]; totalPages: number } {
  const totalPages = Math.ceil(records.length / pageSize)
  const startIndex = (page - 1) * pageSize
  const endIndex = startIndex + pageSize
  const data = records.slice(startIndex, endIndex)

  return { data, totalPages }
}
