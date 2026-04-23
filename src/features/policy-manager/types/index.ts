/**
 * Policy Manager types exports
 */

export interface Policy {
  id: string
  name: string
  description: string
  category: string
  type: string
  status: 'active' | 'inactive' | 'draft'
  version: string
  effectiveDate: string
  owner: string
  content: string
  createdAt: string
  updatedAt?: string
}

export interface PolicyFilterState {
  status: string[]
  category: string[]
  type: string[]
  searchTerm: string
}
