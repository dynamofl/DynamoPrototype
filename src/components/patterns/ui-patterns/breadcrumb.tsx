import { Link, useLocation } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'

interface BreadcrumbItem {
  name: string
  path: string
  current?: boolean
}

export function Breadcrumb() {
  const location = useLocation()
  
  const getBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = location.pathname.split('/').filter(Boolean)
    
    if (pathSegments.length === 0) {
      return [{ name: 'AI Systems', path: '/ai-systems', current: true }]
    }
    
    const breadcrumbs: BreadcrumbItem[] = []
    let currentPath = ''
    
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`
      
      // Convert segment to readable name
      const name = segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
      
      breadcrumbs.push({
        name,
        path: currentPath,
        current: index === pathSegments.length - 1
      })
    })
    
    return breadcrumbs
  }
  
  const breadcrumbs = getBreadcrumbs()
  
  if (breadcrumbs.length <= 1) {
    return null
  }
  
  return (
    <nav className="flex items-center space-x-1 text-[0.8125rem]  text-gray-600 px-6 py-2">
      <Link
        to="/ai-systems"
        className="flex items-center hover:text-gray-900 transition-colors"
      >
        <Home className="h-4 w-4 mr-1" />
        Home
      </Link>
      
      {breadcrumbs.map((breadcrumb) => (
        <div key={breadcrumb.path} className="flex items-center">
          <ChevronRight className="h-4 w-4 mx-1" />
          {breadcrumb.current ? (
            <span className="text-gray-900 font-450">
              {breadcrumb.name}
            </span>
          ) : (
            <Link
              to={breadcrumb.path}
              className="hover:text-gray-900 transition-colors"
            >
              {breadcrumb.name}
            </Link>
          )}
        </div>
      ))}
    </nav>
  )
}
