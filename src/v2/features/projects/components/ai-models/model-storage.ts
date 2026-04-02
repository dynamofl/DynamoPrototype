import type { SelectedModel } from './types'

function storageKey(projectId: string) {
  return `dynamo:models:${projectId}`
}

export function loadSelectedModels(projectId: string): SelectedModel[] {
  try {
    const raw = localStorage.getItem(storageKey(projectId))
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveSelectedModels(projectId: string, models: SelectedModel[]) {
  localStorage.setItem(storageKey(projectId), JSON.stringify(models))
}
