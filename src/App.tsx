import { Routes, Route } from 'react-router-dom'
import { AppBar, Breadcrumb, SmartRedirect } from '@/components/patterns'
import { Button } from '@/components/ui/button'
import { Toaster } from '@/components/ui/sonner'
import { AIProvidersPage } from '@/features/ai-providers'
import { AISystemsPage } from '@/features/ai-systems'
import { AISystemEvaluationUnifiedPage } from '@/features/ai-system-evaluation'
import { BetaFeaturesPage } from '@/features/beta-features'
import { ProjectOverviewPage } from '@/features/project-overview'
import { ResultTypesPage } from '@/features/result-types'
import { EvaluationCreatePage, EvaluationListPage, EvaluationDetailPage } from '@/features/evaluation'
import { EvaluationResultsPage } from '@/features/evaluation-results'
import { GuardrailsPage } from '@/features/guardrails'
import { ProjectsPage } from '@/features/projects'
import { SettingsPage } from '@/features/settings'
import { TablePatternDemo } from '@/components/table-pattern-demo'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useGlobalNotifications } from '@/hooks/useGlobalNotifications'
import { useGlobalEvaluationMonitor } from '@/features/ai-system-evaluation/hooks/useGlobalEvaluationMonitor'

function App() {
  console.log('🚀🚀🚀 APP COMPONENT RENDERING 🚀🚀🚀');

  usePageTitle()

  console.log('📞 App: About to call useGlobalEvaluationMonitor');
  // Global evaluation monitor - watches all evaluations and triggers notification events
  useGlobalEvaluationMonitor()
  console.log('✅ App: useGlobalEvaluationMonitor called');

  console.log('📞 App: About to call useGlobalNotifications');
  // Listen for notification events and display toast UI
  useGlobalNotifications()
  console.log('✅ App: useGlobalNotifications called');

  return (
    <>
      <Toaster position="top-right" richColors />
    <Routes>
      {/* Settings Route - Separate layout without AppBar */}
      <Route path="/settings" element={<SettingsPage />} />

      {/* AI System Evaluation Routes - Unified component with URL-based overlays */}
      {/* Route with view parameter (summary or data) and optional query params for mode and item */}
      <Route path="/ai-systems/:systemName/evaluation/:evaluationId/:view" element={<AISystemEvaluationUnifiedPage />} />
      <Route path="/ai-systems/:systemName/evaluation/:evaluationId" element={<AISystemEvaluationUnifiedPage />} />
      <Route path="/ai-systems/:systemName/evaluation" element={<AISystemEvaluationUnifiedPage />} />

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
              
              {/* Evaluation Sandbox Routes */}
              <Route path="/evaluation-sandbox" element={<EvaluationCreatePage />} />
              <Route path="/evaluation-sandbox/new" element={<EvaluationCreatePage />} />
              <Route path="/evaluation-sandbox/list" element={<EvaluationListPage />} />
              <Route path="/evaluation-sandbox/:testId" element={<EvaluationDetailPage />} />
              
              {/* Evaluation Results Route */}
              <Route path="/evaluation-results" element={<EvaluationResultsPage />} />

              {/* Project Overview Route */}
              <Route path="/project-overview" element={<ProjectOverviewPage />} />

              {/* Result Types Route */}
              <Route path="/result-types" element={<ResultTypesPage />} />

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
    </>
  )
}

export default App