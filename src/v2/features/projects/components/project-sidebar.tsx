import { type LucideIcon } from 'lucide-react'
import { NavLink, Link } from 'react-router-dom'
import { DynamoLogoIcon } from '@/assets/icons/dynamo-logo-icon'
import { DynamoAITypeface } from '@/assets/icons/dynamo-ai-typeface'
import {
  Box,
  ChevronsUpDown,
  GalleryVerticalEnd,
  GalleryThumbnails,
  MessageCircleCode,
  Bot,
  BookOpen,
  ShieldCheck,
  ScanSearch,
  Database,
  Scale,
  ScanEye,
  ListCollapse,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { V2Project } from '../types/project'

interface ProjectSidebarProps {
  project: V2Project
  isCollapsed?: boolean
}

interface NavItem {
  name: string
  path: string
  icon: LucideIcon
}

interface NavSection {
  label?: string
  items: NavItem[]
}

const navSections: NavSection[] = [
  {
    items: [
      { name: 'Overview', path: '', icon: GalleryThumbnails },
      { name: 'Policies', path: 'policies', icon: BookOpen },
    ],
  },
  {
    label: 'AI Stack',
    items: [
      { name: 'Models', path: 'ai-systems', icon: Box },
      { name: 'Guardrails', path: 'guardrails', icon: ShieldCheck },
    ],
  },
  {
    label: 'Risk Assessment',
    items: [
      { name: 'Evaluations', path: 'evaluations', icon: ScanSearch },
      { name: 'Benchmark Datasets', path: 'datasets', icon: Database },
      { name: 'Evaluators', path: 'evaluators', icon: Scale },
    ],
  },
  {
    label: 'Governance',
    items: [
      { name: 'Observability', path: 'observability', icon: ScanEye },
      { name: 'Monitoring Logs', path: 'monitoring-logs', icon: ListCollapse },
      { name: 'Fine Tuning', path: 'fine-tuning', icon: Bot },
      { name: 'Playground', path: 'playground', icon: MessageCircleCode },
    ],
  },
]

export function ProjectSidebar({ project, isCollapsed = false }: ProjectSidebarProps) {
  return (
    <aside
      data-collapsible={isCollapsed ? 'icon' : 'expanded'}
      className="group w-full flex flex-col min-h-screen overflow-hidden"
    >
      {/* Logo — same height as main content header */}
      <div className="px-5 py-6 flex-shrink-0">
        <Link to="/v2/projects" className="flex items-center">
          <div className="pt-0.5 flex items-center">
            <DynamoLogoIcon className="h-4 w-4 text-gray-800 shrink-0" />
            <DynamoAITypeface className="text-gray-800 ml-2 transition-opacity duration-200 ease-linear group-data-[collapsible=icon]:opacity-0" />
          </div>
        </Link>
      </div>

      {/* Project Selector */}
      <div className="pl-2.5 pr-1 group-data-[collapsible=icon]:pl-2.5 group-data-[collapsible=icon]:pr-0.5 my-1.5">
        <button className="w-full flex bg-gray-0 items-center justify-between px-3 py-1.5 rounded-lg ring-1 ring-inset ring-gray-200 hover:ring-gray-300 shadow-sm text-left overflow-hidden">
          <div className="flex items-center gap-2 min-w-0">
            <GalleryVerticalEnd className="h-4 w-4 text-gray-800 shrink-0" />
            <span className="pt-0.5 text-[0.8125rem] font-450 text-gray-800 truncate">{project.name}</span>
          </div>
          <ChevronsUpDown className="h-3.5 w-3.5 text-gray-500 shrink-0 transition-opacity duration-200 ease-linear group-data-[collapsible=icon]:opacity-0" />
        </button>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 pl-2.5 pr-1 group-data-[collapsible=icon]:pl-2.5 group-data-[collapsible=icon]:pr-0.5 py-2 space-y-4 group-data-[collapsible=icon]:space-y-1 overflow-y-auto">
        {navSections.map((section, sectionIdx) => (
          <div key={sectionIdx}>
            {section.label && (
              <div className="flex items-center px-3 mb-2 group-data-[collapsible=icon]:mb-0 h-5 group-data-[collapsible=icon]:h-3 transition-[height,margin] duration-200 ease-linear">
                <span className="text-[0.75rem] font-450 text-gray-400 whitespace-nowrap transition-opacity duration-200 ease-linear group-data-[collapsible=icon]:opacity-0">
                  {section.label}
                </span>
                <div className="flex-1 h-px bg-gray-100 opacity-0 group-data-[collapsible=icon]:opacity-100 transition-opacity duration-200 ease-linear" />
              </div>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon
                const to = `/v2/projects/${project.id}${item.path ? `/${item.path}` : ''}`
                return (
                  <NavLink
                    key={item.name}
                    to={to}
                    end={item.path === ''}
                    title={isCollapsed ? item.name : undefined}
                    className={({ isActive }) => cn(
                      "flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[0.8125rem] font-450 overflow-hidden",
                      isActive
                        ? "bg-gray-200/60 text-gray-800"
                        : "text-gray-600 hover:text-gray-800 hover:bg-gray-200/40"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" strokeWidth={2} />
                    <span className="truncate">{item.name}</span>
                  </NavLink>
                )
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  )
}
