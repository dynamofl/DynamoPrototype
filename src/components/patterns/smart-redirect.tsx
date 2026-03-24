import { Navigate } from 'react-router-dom'
import { getVersionPreference } from '@/v2/hooks/useVersionToggle'

/**
 * Smart redirect component that redirects users based on version preference.
 * V2 users go to /v2, V1 users go to /ai-systems.
 */
export function SmartRedirect() {
  const preference = getVersionPreference()

  if (preference === 'v2') {
    return <Navigate to="/v2/projects" replace />
  }

  return <Navigate to="/ai-systems" replace />
}
