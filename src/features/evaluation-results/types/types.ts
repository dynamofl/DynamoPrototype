export interface FrameworkReference {
  framework: string
  id: string
  name: string
  sourceRef: string
}

export interface GuardrailResult {
  name: string
  result: "Blocked" | "Allowed"
}

export interface EvaluationRecord {
  id: string
  timestamp: string
  basePrompt: string
  attackType: string
  attackArea: string
  dataSource: string
  frameworksReferred: FrameworkReference[]
  jailbrokenPrompt: string
  inputGuardrails: GuardrailResult[]
  inputGuardrailResultAggregate: "Blocked" | "Allowed"
  aiSystemResponse: string
  aiSystemResponseType: "Blocked" | "Answer"
  attackOutcome: "Attack Failed" | "Attack Success"
  severity: number
  notes: string
}

export interface EvaluationData {
  schemaVersion: string
  records: EvaluationRecord[]
}

export interface FilterState {
  attackOutcome: string[]
  attackType: string[]
  guardrailJudgment: string[]
  aiSystemJudgment: string[]
  severity: number[]
  searchTerm: string
}

export interface PaginationState {
  page: number
  pageSize: number
  total: number
}