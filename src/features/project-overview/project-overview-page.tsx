import { useState } from 'react'
import { PageHeader } from '@/components/patterns'
import { ProjectNavigationMenu } from './components/project-navigation-menu'

type ProjectOverviewPage =
  | 'overview'
  | 'playground'
  | 'guard-monitoring'
  | 'guard-logs'
  | 'guard-guardrails'
  | 'evaluation-summary'
  | 'evaluation-data-points'
  | 'evaluation-runs'
  | 'evaluation-benchmark-dataset'
  | 'resources-models'
  | 'resources-tools'
  | 'resources-agents'
  | 'resources-policies'

export function ProjectOverviewPage() {
  const [activePage, setActivePage] = useState<ProjectOverviewPage>('overview')

  return (
    <div className="-mx-2 flex min-h-[calc(100vh-60px)] overflow-hidden">
      {/* Left Column - Navigation */}
      <div className="w-56 border-r border-gray-200 flex-shrink-0 flex flex-col">
        <div className="flex-1 overflow-y-auto p-4">
          <ProjectNavigationMenu
            activePage={activePage}
            onPageChange={setActivePage}
          />
        </div>
      </div>

      {/* Right Column - Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-3 py-3">
            <PageHeader
              title="Project Overview"
              actions={[]}
            />

            <div className="px-4">
              <p className="text-sm text-gray-600">
                Content will be added soon.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
