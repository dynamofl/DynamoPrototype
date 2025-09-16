import { Users, KeyRound } from 'lucide-react'
import { SidebarPattern, type SidebarGroup } from '@/components/patterns/ui-patterns/sidebar-pattern'

type SettingsPage = 'access-token' | 'team-members'

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
