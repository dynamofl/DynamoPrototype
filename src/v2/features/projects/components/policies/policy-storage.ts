import type { SavedPolicy } from './types'

const STORAGE_KEY = (projectId: string) => `dynamo:policies:${projectId}`

let counter = 0
function uid() {
  return `pol_${Date.now()}_${++counter}`
}

export function loadPolicies(projectId: string): SavedPolicy[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY(projectId))
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function savePolicies(projectId: string, policies: SavedPolicy[]) {
  localStorage.setItem(STORAGE_KEY(projectId), JSON.stringify(policies))
}

export function addPolicy(projectId: string, policy: Omit<SavedPolicy, 'id' | 'createdAt'>): SavedPolicy {
  const policies = loadPolicies(projectId)
  const newPolicy: SavedPolicy = {
    ...policy,
    id: uid(),
    createdAt: new Date().toISOString(),
  }
  savePolicies(projectId, [...policies, newPolicy])
  return newPolicy
}

export function addPolicies(projectId: string, items: Omit<SavedPolicy, 'id' | 'createdAt'>[]): SavedPolicy[] {
  const existing = loadPolicies(projectId)
  const newPolicies = items.map(p => ({
    ...p,
    id: uid(),
    createdAt: new Date().toISOString(),
  }))
  savePolicies(projectId, [...existing, ...newPolicies])
  return newPolicies
}
