import { Users, KeyRound, Box, Database } from 'lucide-react'
import { SidebarPattern, type SidebarGroup } from '@/components/patterns/ui-patterns/sidebar-pattern'

type SettingsPage = 'access-token' | 'team-members' | 'evaluation' | 'migration'

interface SettingsSidebarProps {
  activePage: SettingsPage
  onPageChange: (page: SettingsPage) => void
}

export function SettingsSidebar({ activePage, onPageChange }: SettingsSidebarProps) {
  const groups: SidebarGroup[] = [
    {
      label: 'Settings',
      items: [
        {
          id: 'team-members',
          label: 'Team Members',
          icon: <Users className="h-4 w-4" />,
          onClick: () => onPageChange('team-members'),
          isActive: activePage === 'team-members'
        },
        {
          id: 'access-token',
          label: 'Access Token & API Keys',
          icon: <KeyRound className="h-4 w-4" />,
          onClick: () => onPageChange('access-token'),
          isActive: activePage === 'access-token'
        },
        {
          id: 'evaluation',
          label: 'Internal Models Usage',
          icon: <Box className="h-4 w-4" />,
          onClick: () => onPageChange('evaluation'),
          isActive: activePage === 'evaluation'
        }
      ]
    },
    {
      label: 'Maintenance',
      items: [
        {
          id: 'migration',
          label: 'Data Migration',
          icon: <Database className="h-4 w-4" />,
          onClick: () => onPageChange('migration'),
          isActive: activePage === 'migration'
        }
      ]
    }
  ]

  return (
    <SidebarPattern
      variant="settings"
      backButton={{
        label: 'Back to App',
        defaultPath: '/ai-systems'
      }}
      groups={groups}
    />
  )
}
