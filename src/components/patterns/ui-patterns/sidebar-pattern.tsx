import type { ReactNode } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'

export interface SidebarMenuItem {
  id: string
  label: string
  icon: ReactNode
  onClick: () => void
  isActive?: boolean
}

export interface SidebarGroup {
  label: string
  items: SidebarMenuItem[]
}

export interface SidebarPatternProps {
  variant?: 'default' | 'settings'
  backButton?: {
    label: string
    onClick?: () => void
    defaultPath?: string
  }
  groups: SidebarGroup[]
  className?: string
}

export function SidebarPattern({ 
  variant = 'default',
  backButton,
  groups,
  className 
}: SidebarPatternProps) {
  const navigate = useNavigate()

  const handleBackClick = () => {
    if (backButton?.onClick) {
      backButton.onClick()
    } else if (backButton?.defaultPath) {
      navigate(backButton.defaultPath)
    }
  }

  const getVariantStyles = () => {
    switch (variant) {
      case 'settings':
        return {
          container: 'w-64 border-r border-gray-200 bg-white',
          headerButton: 'flex items-center gap-2 text-xs font-450 text-gray-600 hover:text-gray-900 transition-colors',
          groupLabel: 'px-3 py-2 text-xs font-450 text-gray-500',
          menuButton: 'flex items-center gap-2 px-2 py-1.5 text-[13px] font-450 text-gray-600 hover:text-gray-900 hover:bg-gray-50',
          activeMenuButton: 'flex items-center gap-2 px-2 py-1.5 text-[13px] font-450 bg-gray-50 text-gray-900 rounded-md'
        }
      default:
        return {
          container: 'w-64 border-r border-gray-200 bg-white',
          headerButton: 'flex items-center gap-2 text-xs font-450 text-gray-600 hover:text-gray-900 transition-colors',
          groupLabel: 'px-3 py-2 text-xs font-450 text-gray-500',
          menuButton: 'flex items-center gap-2 px-2 py-1.5 text-[13px] font-450 text-gray-600 hover:text-gray-900 hover:bg-gray-50',
          activeMenuButton: 'flex items-center gap-2 px-2 py-1.5 text-[13px] font-450 bg-gray-50 text-gray-900 rounded-md'
        }
    }
  }

  const styles = getVariantStyles()

  return (
    <Sidebar className={cn(styles.container, className)}>
      {backButton && (
        <SidebarHeader>
          <div className="flex items-center gap-2 p-3">
            <button
              onClick={handleBackClick}
              className={styles.headerButton}
            >
              <ArrowLeft className="h-4 w-4" />
              {backButton.label}
            </button>
          </div>
        </SidebarHeader>
      )}
      
      <SidebarContent>
        {groups.map((group, groupIndex) => (
          <SidebarGroup key={groupIndex}>
            <SidebarGroupLabel className={styles.groupLabel}>
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      onClick={item.onClick}
                      isActive={item.isActive}
                      className={cn(
                        item.isActive ? styles.activeMenuButton : styles.menuButton
                      )}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  )
}
