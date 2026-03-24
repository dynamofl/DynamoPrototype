import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const VERSION_PREFERENCE_KEY = 'dynamo-version-preference'

export function useVersionToggle() {
  const navigate = useNavigate()
  const [isV2, setIsV2] = useState<boolean>(() => {
    return localStorage.getItem(VERSION_PREFERENCE_KEY) === 'v2'
  })

  const switchToV2 = () => {
    localStorage.setItem(VERSION_PREFERENCE_KEY, 'v2')
    setIsV2(true)
    navigate('/v2/projects')
  }

  const switchToV1 = () => {
    localStorage.setItem(VERSION_PREFERENCE_KEY, 'v1')
    setIsV2(false)
    navigate('/ai-systems')
  }

  return { isV2, switchToV2, switchToV1 }
}

export function getVersionPreference(): 'v1' | 'v2' {
  return localStorage.getItem(VERSION_PREFERENCE_KEY) === 'v2' ? 'v2' : 'v1'
}
