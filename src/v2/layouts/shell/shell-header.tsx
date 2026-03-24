import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { DynamoLogoTypeface } from '@/assets/icons/dynamo-logo-typeface'
import { ProfileDropdown } from '@/v2/components/profile-dropdown'
import { usePageHeader } from '@/v2/hooks/usePageHeader'
import { LAYOUT_DURATION, LAYOUT_EASE } from './shell-constants'
import { SidebarToggleIcon } from '@/assets/icons/sidebar-toggle-icon'

interface ShellHeaderProps {
  isProjectRoute: boolean
  onToggleSidebar: () => void
}

export function ShellHeader({ isProjectRoute, onToggleSidebar }: ShellHeaderProps) {
  const { header } = usePageHeader()

  return (
    <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 flex-shrink-0">
      <div className="flex items-center gap-2 min-w-0">
        {/* Logo — layoutId shared with sidebar, only rendered when NOT in project */}
        {!isProjectRoute && (
          <Link to="/v2/projects" className="flex items-center whitespace-nowrap">
            <motion.div layoutId="dynamo-logo" transition={{ duration: LAYOUT_DURATION, ease: LAYOUT_EASE }}>
              <DynamoLogoTypeface />
            </motion.div>
          </Link>
        )}

        {/* Sidebar toggle — shown when in project */}
        {isProjectRoute && (
          <button
            onClick={onToggleSidebar}
            className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-quick flex-shrink-0"
          >
            <SidebarToggleIcon />
          </button>
        )}

        {/* Page title — shown when in project */}
        {isProjectRoute && header.title && (
          <h1 className="text-[0.875rem] font-[450] text-gray-800 whitespace-nowrap">
            {header.title}
          </h1>
        )}
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {header.action}
        <ProfileDropdown />
      </div>
    </div>
  )
}
