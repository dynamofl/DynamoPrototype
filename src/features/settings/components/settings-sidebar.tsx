import { ArrowLeft, Users, KeyRound } from 'lucide-react'
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

type SettingsPage = 'access-token' | 'team-members'

interface SettingsSidebarProps {
  activePage: SettingsPage
  onPageChange: (page: SettingsPage) => void
}

export function SettingsSidebar({ activePage, onPageChange }: SettingsSidebarProps) {
  const navigate = useNavigate()

  const handleBackToApp = () => {
    navigate('/ai-systems')
  }

  return (
    <Sidebar className="w-64 border-r border-gray-200 bg-white">
      <SidebarHeader>
        <div className="flex items-center gap-2 p-3">
          <button
            onClick={handleBackToApp}
            className="flex items-center gap-2 text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to App
          </button>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 py-2 text-xs font-medium text-gray-500">
            Settings
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => onPageChange('team-members')}
                  isActive={activePage === 'team-members'}
                  className="flex items-center gap-2 px-2 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                >
                  <Users className="h-4 w-4" />
                  <span>Team Members</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => onPageChange('access-token')}
                  isActive={activePage === 'access-token'}
                  className="flex items-center gap-2 px-2 py-1.5 text-sm font-medium bg-gray-50 text-gray-900 rounded-md"
                >
                  <KeyRound className="h-4 w-4" />
                  <span>Access Token & API Keys</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
