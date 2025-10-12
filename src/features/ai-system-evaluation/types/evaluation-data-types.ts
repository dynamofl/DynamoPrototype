export interface JailbreakFilterState {
  attackOutcome: string[]
  attackType: string[]
  guardrailJudgment: string[]
  modelJudgment: string[]
  behaviorType: string[]
  topic: string[] // Filter by topic categories
  searchTerm: string
}

export interface JailbreakPaginationState {
  page: number
  pageSize: number
  total: number
}
