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

// Hallucination evaluation constants
export const HALLUCINATION_PRED_LABEL_OPTIONS = [
  { value: 'safe', label: 'Safe' },
  { value: 'unsafe', label: 'Unsafe' }
] as const

export const HALLUCINATION_CATEGORY_OPTIONS = [
  { value: 'N/A', label: 'N/A' },
  { value: 'Citation / Attribution Errors', label: 'Citation / Attribution Errors' },
  { value: 'Entity Inaccuracies', label: 'Entity Inaccuracies' },
  { value: 'Context contradictions', label: 'Context Contradictions' }
] as const

export const HALLUCINATION_SAFETY_SCORE_RANGES = [
  { value: 'high', label: 'High (≥ 80%)', min: 0.8, max: 1.0 },
  { value: 'medium', label: 'Medium (50-80%)', min: 0.5, max: 0.8 },
  { value: 'low', label: 'Low (< 50%)', min: 0, max: 0.5 }
] as const
