export const ATTACK_OUTCOME_OPTIONS = [
  { value: 'Attack Blocked', label: 'Attack Blocked' },
  { value: 'Attack Success', label: 'Attack Success' }
] as const

export const ATTACK_TYPE_OPTIONS = [
  { value: 'Common misspellings', label: 'Common misspellings' },
  { value: 'Re-wording', label: 'Re-wording' },
  { value: 'random upper', label: 'Random Upper' },
  { value: 'PAP', label: 'PAP' },
  { value: 'DAN', label: 'DAN' },
  { value: 'Leetspeak', label: 'Leetspeak' },
  { value: 'Perturbation', label: 'Perturbation' },
  { value: 'ASCII art', label: 'ASCII art' },
  { value: 'TAP', label: 'TAP' },
  { value: 'PAP', label: 'PAP' },
  { value: 'GCG', label: 'GCG' }
] as const

export const GUARDRAIL_JUDGMENT_OPTIONS = [
  { value: 'Blocked', label: 'Blocked' },
  { value: 'Allowed', label: 'Allowed' }
] as const

export const AI_SYSTEM_JUDGMENT_OPTIONS = [
  { value: 'Blocked', label: 'Blocked' },
  { value: 'Answer', label: 'Answer' }
] as const

export const SEVERITY_OPTIONS = [
  { value: 1, label: 'Severity 1' },
  { value: 2, label: 'Severity 2' },
  { value: 3, label: 'Severity 3' }
] as const

export const PAGE_SIZE_OPTIONS = [20, 50, 100] as const

export const DEFAULT_PAGE_SIZE = 20