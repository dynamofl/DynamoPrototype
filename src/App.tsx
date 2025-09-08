import { useMemo } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AppBar, Breadcrumb, HeaderStats, AISystemsTable } from '@/components/patterns'
import { AIProvidersPage } from '@/features/ai-providers'
import { EvaluationPage } from '@/features/evaluation'
import { GuardrailsPage } from '@/features/guardrails'
import { TablePatternDemo } from '@/components/table-pattern-demo'
import aiSystemsData from '@/data/aiSystems.json'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { usePageTitle } from '@/hooks/usePageTitle'

interface AISystem {
  id: string;
  name: string;
  project: string;
  owner: string;
  createdAt: string;
  status: 'active' | 'inactive';
  icon: 'HuggingFace' | 'OpenAI' | 'Azure' | 'Mistral' | 'Anthropic' | 'Databricks' | 'Remote' | 'Local';
  hasGuardrails: boolean;
  isEvaluated: boolean;
}

function App() {
  usePageTitle()
  const data: AISystem[] = aiSystemsData as AISystem[]

  const stats = useMemo(() => {
    const totalSystems = data.length
    const evaluatedSystems = data.filter(system => system.isEvaluated).length
    const systemsWithGuardrails = data.filter(system => system.hasGuardrails).length
    const inactiveSystems = data.filter(system => system.status === 'inactive').length

    return {
      totalSystems,
      evaluatedSystems,
      systemsWithGuardrails,
      inactiveSystems
    }
  }, [data])

  return (
    <div className="min-h-screen bg-background">
      <AppBar />

      {/* Main Content */}
      <main className="mx-auto">
        <Breadcrumb />
        <Routes>
          {/* Default redirect to Table Demo (for testing) */}
          <Route path="/" element={<Navigate to="/table-demo" replace />} />
          
          {/* AI Systems Route */}
          <Route path="/ai-systems" element={
            <>
              {/* Page Header */}
              <div className="px-6">
                <div className="flex items-center justify-between my-4">
                  <h1 className="text-lg font-450 tracking-tight">AI Systems</h1>
                  <Button size="default" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    <Plus className="mr-1 h-4 w-4" />
                    Connect Your AI System
                  </Button>
                </div>
                
                {/* Stats Cards */}
                <HeaderStats
                  totalSystems={stats.totalSystems}
                  evaluatedSystems={stats.evaluatedSystems}
                  systemsWithGuardrails={stats.systemsWithGuardrails}
                  inactiveSystems={stats.inactiveSystems}
                />
              </div>

              {/* Data Table */}
              <AISystemsTable data={data} />
            </>
          } />
          
          {/* Evaluation Sandbox Route */}
          <Route path="/evaluation-sandbox" element={<EvaluationPage />} />
          
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
  )
}

export default App