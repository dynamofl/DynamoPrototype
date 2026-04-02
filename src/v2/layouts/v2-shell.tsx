import { type ReactNode, useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { LayoutGroup } from 'framer-motion'
import { useProjects } from '@/v2/features/projects/lib/useProjects'
import { PageHeaderContext, usePageHeaderState } from '@/v2/hooks/usePageHeader'
import { ShellSidebar } from './shell/shell-sidebar'
import { ShellHeader } from './shell/shell-header'
import { ShellContent } from './shell/shell-content'

interface V2ShellProps {
  children: ReactNode
  routeKey: string
}

function useProjectIdFromPath(): string | null {
  const location = useLocation()
  const segments = location.pathname.split('/')
  if (segments.length >= 4 && segments[2] === 'projects' && segments[3]) {
    return segments[3]
  }
  return null
}

export function V2Shell({ children, routeKey }: V2ShellProps) {
  const projectId = useProjectIdFromPath()
  const isProjectRoute = !!projectId
  const { projects, refreshProjects } = useProjects()
  const project = isProjectRoute ? projects.find((p) => p.id === projectId) ?? null : null

  // Refetch when navigating to a project not yet in the list
  useEffect(() => {
    if (isProjectRoute && !project && projects.length >= 0) {
      refreshProjects()
    }
  }, [isProjectRoute, project, projectId, refreshProjects])
  const { header, setHeader } = usePageHeaderState()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  return (
    <PageHeaderContext.Provider value={{ header, setHeader }}>
      <LayoutGroup>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-0 flex overflow-hidden">
        <ShellSidebar isProjectRoute={isProjectRoute} project={project} isSidebarOpen={isSidebarOpen} />

        <main className="flex-1 min-h-screen flex flex-col min-w-0">
          <div className="flex-1 bg-gray-0 dark:bg-gray-50 overflow-hidden border border-gray-100 rounded-xl shadow-sm m-2 flex flex-col">
            <ShellHeader isProjectRoute={isProjectRoute} isSidebarOpen={isSidebarOpen} projectName={project?.name} onToggleSidebar={() => setIsSidebarOpen(o => !o)} />
            <ShellContent routeKey={routeKey}>
              {children}
            </ShellContent>
          </div>
        </main>
      </div>
      </LayoutGroup>
    </PageHeaderContext.Provider>
  )
}
