export interface PolicyTemplate {
  id: string
  name: string
  category: string
  description: string
  /** Detailed preview text shown on the right panel */
  detail: string
  /** Example allowed behaviors */
  allowed: string[]
  /** Example disallowed behaviors */
  disallowed: string[]
}

export interface SavedPolicy {
  id: string
  name: string
  description: string
  allowed: string[]
  disallowed: string[]
  templateId?: string
  createdAt: string
}
