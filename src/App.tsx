import { Routes, Route } from 'react-router-dom'
import { AppBar, Breadcrumb, SmartRedirect } from '@/components/patterns'
import { Button } from '@/components/ui/button'
import { AIProvidersPage } from '@/features/ai-providers'
import { AISystemsPage } from '@/features/ai-systems'
import { AISystemEvaluationPage } from '@/features/ai-system-evaluation'
import { BetaFeaturesPage } from '@/features/beta-features'
import { EvaluationPage } from '@/features/evaluation'
import { EvaluationResultsPage } from '@/features/evaluation-results'
import { GuardrailsPage } from '@/features/guardrails'
import { ProjectsPage } from '@/features/projects'
import { SettingsPage } from '@/features/settings'
import { TablePatternDemo } from '@/components/table-pattern-demo'
import { usePageTitle } from '@/hooks/usePageTitle'

function App() {
  usePageTitle()

  return (
    <Routes>
      {/* Settings Route - Separate layout without AppBar */}
      <Route path="/settings" element={<SettingsPage />} />

      {/* AI System Evaluation Route - Separate layout with breadcrumb app bar */}
      <Route path="/ai-systems/:systemName/evaluation" element={<AISystemEvaluationPage />} />

      {/* All other routes with default layout */}
      <Route path="/*" element={
        <div className="min-h-screen bg-gray-100 flex flex-col">
          <AppBar />

          {/* Main Content */}
          <main className="flex-1 bg-gray-0 border rounded-lg shadow m-2 mt-0">
            <Breadcrumb />
            <Routes>
              {/* Smart redirect based on experiments toggle state */}
              <Route path="/" element={<SmartRedirect />} />
              
              {/* Projects Route */}
              <Route path="/projects" element={<ProjectsPage />} />
              
              {/* AI Systems Route */}
              <Route path="/ai-systems" element={<AISystemsPage />} />
              
              {/* Beta Features Route */}
              <Route path="/beta-features" element={<BetaFeaturesPage />} />
              
              {/* Evaluation Sandbox Route */}
              <Route path="/evaluation-sandbox" element={<EvaluationPage />} />
              
              {/* Evaluation Results Route */}
              <Route path="/evaluation-results" element={<EvaluationResultsPage />} />
              
              {/* AI Providers Route */}
              <Route path="/ai-providers" element={<AIProvidersPage />} />
              
              {/* Guardrails Route */}
              <Route path="/guardrails" element={<GuardrailsPage />} />
              
              {/* Table Pattern Demo Route */}
              <Route path="/table-demo" element={<TablePatternDemo />} />
              
              {/* 404 Route - Catch all unmatched routes */}
              <Route path="*" element={
                <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
                  <h1 className="text-4xl font-450 text-muted-foreground mb-4">404</h1>
                  <p className="text-lg text-muted-foreground mb-6">Page not found</p>
                  <Button onClick={() => window.location.href = '/evaluation-sandbox'}>
                    Go to Evaluation Sandbox
                  </Button>
                </div>
              } />
            </Routes>
          </main>
        </div>
      } />
    </Routes>
  )
}

export default App