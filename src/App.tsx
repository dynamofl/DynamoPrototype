import { useMemo, useState } from 'react'
import { AppBar } from '@/components/app-bar'
import { HeaderStats } from '@/components/header-stats'
import { AISystemsTable } from '@/components/ai-systems-table'
import { EvaluationSandbox } from '@/components/evaluation-sandbox'
import { AIProviders } from '@/components/ai-providers'
import { Guardrails } from '@/components/guardrails'
import aiSystemsData from '@/data/aiSystems.json'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

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

type NavigationTab = 'ai-systems' | 'evaluation-sandbox' | 'ai-providers' | 'guardrails'

function App() {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('ai-systems')
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

  const renderContent = () => {
    switch (currentTab) {
      case 'evaluation-sandbox':
        return <EvaluationSandbox />
      case 'ai-providers':
        return <AIProviders />
      case 'guardrails':
        return <Guardrails />
      case 'ai-systems':
      default:
        return (
          <>
            {/* Page Header */}
            <div className="px-6">
              <div className="flex items-center justify-between mb-4">
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
        )
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <AppBar currentTab={currentTab} onTabChange={setCurrentTab} />

      {/* Main Content */}
      <main className="mx-auto py-4">
        {renderContent()}
      </main>
    </div>
  )
}

export default App