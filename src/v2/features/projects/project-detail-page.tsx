import { useEffect, type ReactNode } from 'react'
import { useParams, Routes, Route } from 'react-router-dom'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { useProjects } from './lib/useProjects'
import { usePageHeader } from '@/v2/hooks/usePageHeader'

export function ProjectDetailContent() {
  const { projectId } = useParams<{ projectId: string }>()
  const { projects, loading } = useProjects()

  const project = projects.find((p) => p.id === projectId)

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-72" />
        <div className="grid grid-cols-3 gap-4 mt-4">
          <Skeleton className="h-20 rounded-lg" />
          <Skeleton className="h-20 rounded-lg" />
          <Skeleton className="h-20 rounded-lg" />
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h2 className="text-lg font-[550] text-gray-800">Project Not Found</h2>
          <p className="text-[0.8125rem] text-gray-500 mt-1">The project you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/" element={
        <PageShell
          title="Overview"
          action={
            <Button variant="outline" size="default" className=''>Share Access</Button>
          }
        />
      } />
      <Route path="playground" element={<PageShell title="Playground" />} />
      <Route path="ai-systems" element={<PageShell title="AI Systems" />} />
      <Route path="policies" element={<PageShell title="Policies" />} />
      <Route path="evaluations" element={
        <PageShell
          title="Evaluations"
          action={
            <Button size="sm">New Evaluation</Button>
          }
        />
      } />
      <Route path="datasets" element={<PageShell title="Benchmark Datasets" />} />
      <Route path="evaluators" element={<PageShell title="Evaluators" />} />
      <Route path="human-review" element={<PageShell title="Human Review" />} />
      <Route path="observability" element={<PageShell title="Observability" />} />
      <Route path="guardrails" element={<PageShell title="Guardrails" />} />
      <Route path="monitoring-logs" element={<PageShell title="Monitoring Logs" />} />
      <Route path="settings" element={<PageShell title="Settings" />} />
    </Routes>
  )
}

function PageShell({ title, action }: { title: string; action?: ReactNode }) {
  const { setHeader } = usePageHeader()

  useEffect(() => {
    setHeader({ title, action })
    return () => setHeader({ title: '' })
  }, [title, action, setHeader])

  return (
    <div className="px-4 py-5">
      <p className="text-[0.8125rem] text-gray-500">This section is coming soon.</p>
    </div>
  )
}
