import type { ProviderState } from './types'
import { PROVIDERS } from './constants'
import { validateProviderKeyFormat } from '@/features/ai-systems/lib/provider-validation'
import { validateProviderAPIKey } from '@/features/ai-systems/lib/provider-services'
import type { ProviderType } from '@/features/ai-systems/lib/provider-validation'

export const uid = () => crypto.randomUUID()

function storageKey(projectId: string) {
  return `dynamo:providers:${projectId}`
}

export function loadState(projectId: string): Record<string, ProviderState> {
  try {
    const raw = localStorage.getItem(storageKey(projectId))
    if (!raw) return {}
    const parsed = JSON.parse(raw)

    if (Array.isArray(parsed)) {
      const state: Record<string, ProviderState> = {}
      for (const entry of parsed) {
        const id = entry.providerId ?? entry.id
        if (!id) continue
        if (entry.keys && Array.isArray(entry.keys)) {
          state[id] = {
            open: true,
            keys: entry.keys.map((k: any, i: number) => ({
              id: k.id ?? uid(),
              name: k.name ?? (i === 0 ? 'Default' : ''),
              value: k.value ?? '',
              validated: !!k.validated,
              validating: false,
            })),
          }
        } else if (entry.key) {
          state[id] = {
            open: true,
            keys: [{ id: uid(), name: 'Default', value: entry.key, validated: !!entry.validated, validating: false }],
          }
        }
      }
      return state
    }
    return parsed as Record<string, ProviderState>
  } catch {
    return {}
  }
}

export function saveState(projectId: string, state: Record<string, ProviderState>) {
  const arr = Object.entries(state)
    .filter(([, s]) => s.keys.length > 0)
    .map(([providerId, s]) => ({
      providerId,
      keys: s.keys.map(k => ({ id: k.id, name: k.name, value: k.value, validated: k.validated })),
      validated: s.keys.some(k => k.validated),
    }))
  localStorage.setItem(storageKey(projectId), JSON.stringify(arr))
}

export async function validateKey(providerId: string, apiKey: string): Promise<{ valid: boolean; error?: string }> {
  const provider = PROVIDERS.find(p => p.id === providerId)
  const providerType: ProviderType = provider?.providerType ?? 'Custom'

  const formatError = validateProviderKeyFormat(providerType, apiKey)
  if (formatError) return { valid: false, error: formatError }

  try {
    const isValid = await validateProviderAPIKey(providerType, apiKey)
    if (!isValid) return { valid: false, error: 'Invalid API key' }
    return { valid: true }
  } catch {
    return { valid: false, error: 'Could not reach provider' }
  }
}
