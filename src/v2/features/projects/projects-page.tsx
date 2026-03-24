import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, FolderOpen, Lock, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { OnboardingFlow } from './components/onboarding-flow'
import { CreateProjectDialog } from './components/create-project-dialog'
import { useProjects } from './lib/useProjects'
import type { V2Project } from './types/project'

export function ProjectsPage() {
  const { projects, loading, refreshProjects } = useProjects()
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const navigate = useNavigate()

  const hasProjects = projects.length > 0

  // Split projects: top 3 as cards, rest as list (max 5)
  const cardProjects = projects.slice(0, 3)
  const listProjects = projects.slice(3, 8)
  const hasMoreProjects = projects.length > 8

  const handleOnboardingComplete = (project: V2Project) => {
    refreshProjects()
    navigate(`/v2/projects/${project.id}`)
  }

  const handleProjectCreated = () => {
    refreshProjects()
  }

  const openProject = (projectId: string) => {
    navigate(`/v2/projects/${projectId}`)
  }

  // Loading state
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="space-y-3">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
          <div className="mt-8 grid grid-cols-3 gap-4">
            <Skeleton className="h-32 w-full rounded-lg" />
            <Skeleton className="h-32 w-full rounded-lg" />
            <Skeleton className="h-32 w-full rounded-lg" />
          </div>
        </div>
      </div>
    )
  }

  // No projects → inline onboarding flow
  if (!hasProjects) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />
  }

  // Has projects → card + list layout
  return (
    <>
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-lg font-[550] text-gray-800 tracking-tight">Projects</h1>
            <p className="text-[0.8125rem] text-gray-500 mt-1">
              Create and manage your AI evaluation projects.
            </p>
          </div>
          <Button
            onClick={() => setCreateDialogOpen(true)}
            className="h-8 px-3 text-[0.8125rem] font-450 flex items-center gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            Create Project
          </Button>
        </div>

        {/* Top Projects — Cards */}
        <div className={`grid gap-4 ${cardProjects.length === 1 ? 'grid-cols-1 max-w-sm' : cardProjects.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
          {cardProjects.map((project) => (
            <ProjectCard key={project.id} project={project} onClick={() => openProject(project.id)} />
          ))}
        </div>

        {/* More Projects — List */}
        {listProjects.length > 0 && (
          <div className="mt-8">
            <h2 className="text-[0.8125rem] font-[550] text-gray-500 mb-3">More Projects</h2>
            <div className="space-y-1">
              {listProjects.map((project) => (
                <ProjectListItem key={project.id} project={project} onClick={() => openProject(project.id)} />
              ))}
            </div>
            {hasMoreProjects && (
              <button className="mt-3 text-[0.8125rem] font-450 text-gray-500 hover:text-gray-700 duration-regular transition-colors">
                View all projects ({projects.length})
              </button>
            )}
          </div>
        )}
      </div>

      <CreateProjectDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onProjectCreated={handleProjectCreated}
      />
    </>
  )
}

function ProjectCard({ project, onClick }: { project: V2Project; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="bg-gray-50 dark:bg-gray-100 border border-gray-100 rounded-lg p-4 hover:border-gray-300 duration-regular transition-colors cursor-pointer flex flex-col justify-between min-h-[120px]"
    >
      <div>
        <div className="flex items-center gap-2 mb-2">
          <FolderOpen className="h-4 w-4 text-gray-400" />
          <h3 className="text-[0.8125rem] font-[500] text-gray-800 truncate">{project.name}</h3>
        </div>
        {project.use_case && (
          <p className="text-[0.75rem] text-gray-450 line-clamp-2">{project.use_case}</p>
        )}
      </div>
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-1 text-gray-400">
          {project.visibility === 'private' ? (
            <Lock className="h-3 w-3" />
          ) : (
            <Globe className="h-3 w-3" />
          )}
          <span className="pt-0.5 text-[0.75rem] capitalize">{project.visibility}</span>
        </div>
        <span className="text-[0.6875rem] text-gray-400">
          {new Date(project.created_at).toLocaleDateString()}
        </span>
      </div>
    </div>
  )
}

function ProjectListItem({ project, onClick }: { project: V2Project; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="flex items-center justify-between px-3 py-2.5 rounded-md hover:bg-gray-50 duration-regular transition-colors cursor-pointer"
    >
      <div className="flex items-center gap-2.5">
        <FolderOpen className="h-3.5 w-3.5 text-gray-400" />
        <span className="text-[0.8125rem] font-450 text-gray-800">{project.name}</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 text-gray-400">
          {project.visibility === 'private' ? (
            <Lock className="h-3 w-3" />
          ) : (
            <Globe className="h-3 w-3" />
          )}
          <span className="text-[0.6875rem] capitalize">{project.visibility}</span>
        </div>
        <span className="text-[0.6875rem] text-gray-400">
          {new Date(project.created_at).toLocaleDateString()}
        </span>
      </div>
    </div>
  )
}
