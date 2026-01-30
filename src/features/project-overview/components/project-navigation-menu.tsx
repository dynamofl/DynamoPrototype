import { Home, Microscope, Shield, ActivitySquare, BarChart3, FileCheck, ListChecks, FileText, Settings, Wrench, Bot, ClipboardList, Database } from 'lucide-react'
import { cn } from '@/lib/utils'

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

interface ProjectNavigationMenuProps {
  activePage: ProjectOverviewPage
  onPageChange: (page: ProjectOverviewPage) => void
}

interface NavGroup {
  label: string
  items: NavItem[]
}

interface NavItem {
  id: ProjectOverviewPage
  label: string
  icon: React.ReactNode
}

export function ProjectNavigationMenu({ activePage, onPageChange }: ProjectNavigationMenuProps) {
  const navGroups: NavGroup[] = [
    {
      label: 'Summary',
      items: [
        {
          id: 'overview',
          label: 'Overview',
          icon: <Home className="h-4 w-4" />
        },
        {
          id: 'playground',
          label: 'Playground',
          icon: <Microscope className="h-4 w-4" />
        }
      ]
    },
    {
      label: 'Guard',
      items: [
        {
          id: 'guard-monitoring',
          label: 'Live Monitoring',
          icon: <ActivitySquare className="h-4 w-4" />
        },
        {
          id: 'guard-logs',
          label: 'Logs',
          icon: <FileText className="h-4 w-4" />
        },
     
      ]
    },
    {
      label: 'Evaluations',
      items: [
        {
          id: 'evaluation-summary',
          label: 'Summary',
          icon: <BarChart3 className="h-4 w-4" />
        },
        {
          id: 'evaluation-runs',
          label: 'Eval Run',
          icon: <ListChecks className="h-4 w-4" />
        },
        {
          id: 'evaluation-data-points',
          label: 'Evaluators',
          icon: <FileCheck className="h-4 w-4" />
        },
        {
          id: 'evaluation-benchmark-dataset',
          label: 'Benchmark Dataset',
          icon: <Database className="h-4 w-4" />
        }
      ]
    },
    {
      label: 'Resources',
      items: [
         {
          id: 'resources-agents',
          label: 'Agents',
          icon: <Bot className="h-4 w-4" />
        },
        {
          id: 'resources-models',
          label: 'AI Models',
          icon: <Settings className="h-4 w-4" />
        },
        {
          id: 'resources-policies',
          label: 'Guardrails',
          icon: <Shield className="h-4 w-4" />
        },
        {
          id: 'resources-tools',
          label: 'Tools',
          icon: <Wrench className="h-4 w-4" />
        }
      ]
    }
  ]

  return (
    <nav className="space-y-5">
      {navGroups.map((group) => (
        <div key={group.label}>
          <h3 className="ml-2 mb-2 text-xs font-450 text-gray-500">
            {group.label}
          </h3>
          <ul className="space-y-0">
            {group.items.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => onPageChange(item.id)}
                  className={cn(
                    "flex w-full items-center gap-2 px-3 py-1 text-[0.8125rem] font-450 rounded-md transition-colors",
                    activePage === item.id
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  )}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  )
}
