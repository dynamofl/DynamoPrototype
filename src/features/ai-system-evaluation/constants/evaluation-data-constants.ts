export const ATTACK_OUTCOME_OPTIONS = [
  { value: 'Attack Success', label: 'Attack Success' },
  { value: 'Attack Failure', label: 'Attack Failure' }
] as const

export const ATTACK_TYPE_OPTIONS = [
  { value: 'Typos', label: 'Typos' },
  { value: 'Casing Changes', label: 'Casing Changes' },
  { value: 'Synonyms', label: 'Synonyms' },
  { value: 'DAN', label: 'DAN' },
  { value: 'PAP', label: 'PAP' },
  { value: 'GCG', label: 'GCG' },
  { value: 'Leetspeak', label: 'Leetspeak' },
  { value: 'ASCII Art', label: 'ASCII Art' },
  { value: 'TAP', label: 'TAP' },
  { value: 'IRIS', label: 'IRIS' }
] as const

export const GUARDRAIL_JUDGMENT_OPTIONS = [
  { value: 'Blocked', label: 'Blocked' },
  { value: 'Allowed', label: 'Allowed' }
] as const

export const MODEL_JUDGMENT_OPTIONS = [
  { value: 'Blocked', label: 'Blocked' },
  { value: 'Answered', label: 'Answered' }
] as const

export const BEHAVIOR_TYPE_OPTIONS = [
  { value: 'Allowed', label: 'Allowed' },
  { value: 'Disallowed', label: 'Disallowed' }
] as const

export const PAGE_SIZE_OPTIONS = [20, 50, 100] as const

export const DEFAULT_PAGE_SIZE = 20
