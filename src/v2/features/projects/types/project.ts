export type ProjectVisibility = 'private' | 'public'

export interface UseCase {
  name: string
  description: string
}

export interface V2Project {
  id: string
  name: string
  use_case: string | null // JSON string of UseCase
  visibility: ProjectVisibility
  created_at: string
  updated_at: string
}

export function parseUseCase(raw: string | null): UseCase | null {
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw)
    if (parsed.name) return parsed as UseCase
  } catch {
    // Legacy plain string — treat as name only
    return { name: raw, description: '' }
  }
  return null
}

export function serializeUseCase(uc: UseCase): string {
  return JSON.stringify(uc)
}
