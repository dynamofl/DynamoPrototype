/**
 * Guardrails types exports
 */

export interface Guardrail {
  id: string
  name: string
  description: string
  category: string
  status: 'active' | 'inactive'
  createdAt: string
  content?: string
}

export interface GuardrailsFilterState {
  status: string[]
  category: string[]
  searchTerm: string
}
