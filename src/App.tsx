import { useMemo } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AppBar } from '@/components/app-bar'
import { Breadcrumb } from '@/components/breadcrumb'
import { HeaderStats } from '@/components/header-stats'
import { AISystemsTable } from '@/components/ai-systems-table'
import { EvaluationSandbox } from '@/components/evaluation-sandbox'
import { AIProviders } from '@/components/ai-providers'
import { Guardrails } from '@/components/guardrails'
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
          {/* Default redirect to Evaluation Sandbox */}
          <Route path="/" element={<Navigate to="/evaluation-sandbox" replace />} />
          
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
          <Route path="/evaluation-sandbox" element={<EvaluationSandbox />} />
          
          {/* AI Providers Route */}
          <Route path="/ai-providers" element={<AIProviders />} />
          
          {/* Guardrails Route */}
          <Route path="/guardrails" element={<Guardrails />} />
          
          {/* 404 Route - Catch all unmatched routes */}
          <Route path="*" element={
            <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
              <h1 className="text-4xl font-bold text-muted-foreground mb-4">404</h1>
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