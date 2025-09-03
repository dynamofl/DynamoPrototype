import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const routeTitles: Record<string, string> = {
  '/ai-systems': 'AI Systems - DynamoPrototype',
  '/evaluation-sandbox': 'Evaluation Sandbox - DynamoPrototype',
  '/ai-providers': 'AI Providers - DynamoPrototype',
  '/guardrails': 'Guardrails - DynamoPrototype',
}

export function usePageTitle() {
  const location = useLocation()
  
  useEffect(() => {
    const title = routeTitles[location.pathname] || 'DynamoPrototype'
    document.title = title
  }, [location.pathname])
}
