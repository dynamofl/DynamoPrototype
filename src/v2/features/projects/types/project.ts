export type ProjectVisibility = 'private' | 'public'

export interface V2Project {
  id: string
  name: string
  use_case: string | null
  visibility: ProjectVisibility
  created_at: string
  updated_at: string
}
