import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useExperimentsToggle } from '@/hooks/useExperimentsToggle'

/**
 * Experiments Guard component that monitors the experiments toggle state
 * and automatically redirects users when they're on a page that's not available
 * in the current experiments state.
 */
export function ExperimentsGuard() {
  const { experimentsEnabled } = useExperimentsToggle()
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const currentPath = location.pathname

    // Define pages available in each state
    const experimentPages = ['/evaluation-sandbox', '/evaluation-results', '/ai-providers', '/ai-systems', '/guardrails', '/projects', '/beta-features']
    const standardPages = ['/ai-systems', '/guardrails', '/projects']

    // Check if current page is available in the current experiments state
    const isCurrentPageAvailable = experimentsEnabled 
      ? experimentPages.includes(currentPath)
      : standardPages.includes(currentPath)

    // If current page is not available, redirect to appropriate default page
    if (!isCurrentPageAvailable) {
      const redirectPath = experimentsEnabled ? '/ai-providers' : '/ai-systems'
      navigate(redirectPath, { replace: true })
    }
  }, [experimentsEnabled, location.pathname, navigate])

  // This component doesn't render anything, it just handles side effects
  return null
}
