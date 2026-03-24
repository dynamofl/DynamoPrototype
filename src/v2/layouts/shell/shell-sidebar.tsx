import { motion } from 'framer-motion'
import { ProjectSidebar } from '@/v2/features/projects/components/project-sidebar'
import { SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH, LAYOUT_DURATION, LAYOUT_EASE } from './shell-constants'
import type { V2Project } from '@/v2/features/projects/types/project'

interface ShellSidebarProps {
  isProjectRoute: boolean
  project: V2Project | null
  isSidebarOpen: boolean
}

export function ShellSidebar({ isProjectRoute, project, isSidebarOpen }: ShellSidebarProps) {
  const targetWidth = !isProjectRoute ? 0 : isSidebarOpen ? SIDEBAR_WIDTH : SIDEBAR_COLLAPSED_WIDTH

  return (
    <motion.aside
      animate={{ width: targetWidth }}
      transition={{ duration: LAYOUT_DURATION, ease: LAYOUT_EASE }}
      className="flex-shrink-0 overflow-hidden"
    >
      <motion.div
        animate={{ width: isSidebarOpen ? SIDEBAR_WIDTH : SIDEBAR_COLLAPSED_WIDTH }}
        transition={{ duration: LAYOUT_DURATION, ease: LAYOUT_EASE }}
        className="h-full"
      >
        {project ? (
          <ProjectSidebar project={project} isCollapsed={!isSidebarOpen} />
        ) : isProjectRoute ? (
          <SidebarSkeleton />
        ) : null}
      </motion.div>
    </motion.aside>
  )
}

function SidebarSkeleton() {
  return (
    <div className="w-56 flex flex-col min-h-screen p-4 space-y-4">
      <div className="h-4 w-24 bg-gray-100 rounded animate-pulse" />
      <div className="h-8 w-full bg-gray-100 rounded-md animate-pulse" />
      <div className="space-y-2 mt-4">
        <div className="h-6 w-3/4 bg-gray-100 rounded-md animate-pulse" />
        <div className="h-6 w-2/3 bg-gray-100 rounded-md animate-pulse" />
        <div className="mt-4 space-y-1">
          <div className="h-3 w-16 bg-gray-100 rounded animate-pulse" />
          <div className="h-6 w-3/4 bg-gray-100 rounded-md animate-pulse" />
          <div className="h-6 w-2/3 bg-gray-100 rounded-md animate-pulse" />
        </div>
      </div>
    </div>
  )
}
