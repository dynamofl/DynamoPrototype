import { Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom'
import { V2Shell } from './layouts/v2-shell'
import { ProjectsPage } from './features/projects'
import { ProjectDetailContent } from './features/projects/project-detail-page'

export function V2App() {
  const location = useLocation()

  // Derive a route key for content transitions:
  // - "/v2/projects" → "projects-list"
  // - "/v2/projects/:id/..." → "project-:id"
  const segments = location.pathname.split('/')
  const routeKey = segments.length > 3 && segments[3]
    ? `project-${segments[3]}`
    : 'projects-list'

  return (
    <V2Shell routeKey={routeKey}>
      <Routes>
        <Route path="/" element={<Navigate to="/v2/projects" replace />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="projects/:projectId/*" element={<ProjectDetailContent />} />
        <Route path="*" element={<Navigate to="/v2/projects" replace />} />
      </Routes>
    </V2Shell>
  )
}
