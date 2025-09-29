import { Navigate } from 'react-router-dom'

/**
 * Smart redirect component that redirects users to AI Systems page
 * regardless of experiments state, since AI Systems is now a main navigation item.
 */
export function SmartRedirect() {
  // Always redirect to AI Systems as it's the main dashboard
  return <Navigate to="/ai-systems" replace />
}
