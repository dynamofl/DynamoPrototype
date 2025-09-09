import { Navigate } from 'react-router-dom'
import { useExperimentsToggle } from '@/hooks/useExperimentsToggle'

/**
 * Smart redirect component that redirects users to the appropriate page
 * based on the experiments toggle state:
 * - If experiments are OFF: redirect to AI Systems
 * - If experiments are ON: redirect to AI Providers
 */
export function SmartRedirect() {
  const { experimentsEnabled } = useExperimentsToggle()
  
  // Redirect based on experiments toggle state
  const redirectPath = experimentsEnabled ? '/ai-providers' : '/ai-systems'
  
  return <Navigate to={redirectPath} replace />
}
