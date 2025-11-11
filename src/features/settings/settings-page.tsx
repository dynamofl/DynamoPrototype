import { useState } from 'react'
import {
  SidebarProvider,
  SidebarInset,
} from '@/components/ui/sidebar'
import { SettingsLayout } from './layouts/settings-layout'
import { AccessTokenContent } from './layouts/access-token'
import { TeamMembersContent } from './layouts/team-members'
import { EvaluationSettingsContent } from './layouts/evaluation-settings'
import { SettingsSidebar } from './components/settings-sidebar'

type SettingsPage = 'access-token' | 'team-members' | 'evaluation'

export function SettingsPage() {
  const [activePage, setActivePage] = useState<SettingsPage>('access-token')

  const renderActiveContent = () => {
    switch (activePage) {
      case 'access-token':
        return <AccessTokenContent />
      case 'team-members':
        return <TeamMembersContent />
      case 'evaluation':
        return <EvaluationSettingsContent />
      default:
        return <AccessTokenContent />
    }
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <SettingsSidebar 
          activePage={activePage} 
          onPageChange={setActivePage} 
        />
        
        <SidebarInset className="flex-1">
          <SettingsLayout>
            {renderActiveContent()}
          </SettingsLayout>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
