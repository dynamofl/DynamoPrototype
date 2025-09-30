import type { EvaluationRecord } from '../types'

export function getUniqueAttackTypes(records: EvaluationRecord[]): string[] {
  const types = new Set(records.map(record => record.attackType))
  return Array.from(types).sort()
}

export function formatTimestamp(timestamp: string): string {
  return new Date(timestamp).toLocaleString()
}

export function getJudgmentColor(judgment: string): string {
  switch (judgment.toLowerCase()) {
    case 'blocked':
    case 'Attack blocked':
      return 'text-red-600'
    case 'allowed':
    case 'compliant':
    case 'attack success':
      return 'text-green-600'
    case 'warning':
      return 'text-orange-600'
    default:
      return 'text-gray-600'
  }
}

export function getJudgmentIcon(judgment: string): string {
  switch (judgment.toLowerCase()) {
    case 'blocked':
    case 'Attack blocked':
      return '⚠️'
    case 'allowed':
    case 'compliant':
      return '✅'
    case 'attack success':
      return '🔴'
    default:
      return '❓'
  }
}