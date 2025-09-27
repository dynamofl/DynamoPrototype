import { Routes, Route } from 'react-router-dom'
import { AppBar, Breadcrumb, SmartRedirect } from '@/components/patterns'
import { ExperimentsGuard } from '@/components/patterns/experiments-guard'
import { Button } from '@/components/ui/button'
import { AIProvidersPage } from '@/features/ai-providers'
import { AISystemsPage } from '@/features/ai-systems'
import { EvaluationPage } from '@/features/evaluation'
import { EvaluationResultsPage } from '@/features/evaluation-results'
import { GuardrailsPage } from '@/features/guardrails'
import { SettingsPage } from '@/features/settings'
import { TablePatternDemo } from '@/components/table-pattern-demo'
import { usePageTitle } from '@/hooks/usePageTitle'

function App() {
  usePageTitle()

  return (
    <Routes>
      {/* Settings Route - Separate layout without AppBar */}
      <Route path="/settings" element={<SettingsPage />} />
      
      {/* All other routes with default layout */}
      <Route path="/*" element={
        <div className="min-h-screen bg-background">
          <AppBar />
          <ExperimentsGuard />

          {/* Main Content */}
          <main className="mx-auto">
            <Breadcrumb />
            <Routes>
              {/* Smart redirect based on experiments toggle state */}
              <Route path="/" element={<SmartRedirect />} />
              
              {/* AI Systems Route */}
              <Route path="/ai-systems" element={<AISystemsPage />} />
              
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