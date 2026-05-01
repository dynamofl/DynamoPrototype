import { useState } from 'react'

const STORAGE_KEY = 'unified-evals-policy-design-version'

export type DesignVersion = 'v1' | 'v2'

const isDesignVersion = (value: unknown): value is DesignVersion =>
  value === 'v1' || value === 'v2'

export function useDesignVersion() {
  const [version, setVersionState] = useState<DesignVersion>(() => {
    if (typeof window === 'undefined') return 'v1'
    const stored = window.localStorage.getItem(STORAGE_KEY)
    return isDesignVersion(stored) ? stored : 'v1'
  })

  const setVersion = (next: DesignVersion) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, next)
    }
    setVersionState(next)
  }

  return { version, setVersion }
}
