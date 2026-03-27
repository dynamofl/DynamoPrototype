import { useEffect, useState, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowRight,
  Check,
  ChevronsUpDown,
  Lock,
  ScanSearch,
  ShieldPlus,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePageHeader } from '@/v2/hooks/usePageHeader'
import { AiProvidersDialog } from './ai-providers'
import { cn } from '@/lib/utils'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface SetupTask {
  id: string
  title: string
  description: string
  actionLabel: string
  path?: string
  dialog?: 'providers'
}

interface ActionCard {
  id: string
  title: string
  description: string
  icon: React.ElementType
  actions: { label: string; path: string; primary?: boolean }[]
}

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */
const FOUNDATION_TASKS: SetupTask[] = [
  {
    id: 'providers',
    title: 'Connect AI Providers',
    description: 'Add the AI providers and models your system relies on. This is what Dynamo will evaluate, protect, and monitor.',
    actionLabel: 'Select AI Provider',
    dialog: 'providers',
  },
  {
    id: 'models',
    title: 'Add AI Models',
    description: 'Register the specific models you use from your connected providers.',
    actionLabel: 'Add a Model',
    path: 'ai-systems',
  },
  {
    id: 'policies',
    title: 'Enable Policies',
    description: 'Define rules for tone, safety, compliance, and behavior your AI must follow.',
    actionLabel: 'Create a Policy',
    path: 'policies',
  },
]

const NEXT_CARDS: ActionCard[] = [
  {
    id: 'risk',
    title: 'Run Risk Assessment',
    description: 'Test your AI stack against your rules before deploying',
    icon: ScanSearch,
    actions: [
      { label: 'Run Evaluation', path: 'evaluations' },
      { label: 'Browse Benchmarks', path: 'datasets', primary: true },
    ],
  },
  {
    id: 'guardrails',
    title: 'Enable Guardrails',
    description: 'Protect your models at runtime with policy trained guardrails',
    icon: ShieldPlus,
    actions: [
      { label: 'Add Guardrail', path: 'guardrails' },
      { label: 'Learn More', path: 'guardrails', primary: true },
    ],
  },
]

/* ------------------------------------------------------------------ */
/*  Completion hook                                                    */
/* ------------------------------------------------------------------ */
function useSetupCompletion(projectId: string | undefined) {
  const [completed, setCompleted] = useState<Record<string, boolean>>({})

  const refresh = useCallback(() => {
    if (!projectId) return
    const check: Record<string, boolean> = {}

    try {
      const raw = localStorage.getItem(`dynamo:providers:${projectId}`)
      if (raw) {
        const providers = JSON.parse(raw)
        check.providers = Array.isArray(providers) && providers.some((p: any) => p.validated)
      }
    } catch { /* ignore */ }

    check.models = false
    check.policies = false
    setCompleted(check)
  }, [projectId])

  useEffect(() => { refresh() }, [refresh])

  return { completed, refresh }
}

/* ------------------------------------------------------------------ */
/*  Circle checkbox                                                    */
/* ------------------------------------------------------------------ */
function StepCircle({ done }: { done: boolean }) {
  return done ? (
    <div className="h-4 w-4 rounded-full bg-green-500 flex items-center justify-center shrink-0">
      <Check className="h-3 w-3 text-gray-0" strokeWidth={3} />
    </div>
  ) : (
    <div className="h-4 w-4 rounded-full border-2 border-gray-200 shrink-0" />
  )
}

/* ------------------------------------------------------------------ */
/*  Main overview                                                      */
/* ------------------------------------------------------------------ */
export function ProjectOverview() {
  const { setHeader } = usePageHeader()
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const [providersOpen, setProvidersOpen] = useState(false)
  const [expandedTask, setExpandedTask] = useState<string>('providers')

  const { completed, refresh: refreshCompletion } = useSetupCompletion(projectId)
  const doneCount = FOUNDATION_TASKS.filter(t => completed[t.id]).length
  const foundationComplete = doneCount === FOUNDATION_TASKS.length

  useEffect(() => {
    setHeader({
      title: 'Overview',
      action: (
        <Button variant="outline" size="default">
          Share Access
        </Button>
      ),
    })
    return () => setHeader({ title: '' })
  }, [setHeader])

  // Auto-expand the first incomplete task
  useEffect(() => {
    const firstIncomplete = FOUNDATION_TASKS.find(t => !completed[t.id])
    if (firstIncomplete) setExpandedTask(firstIncomplete.id)
  }, [completed])

  const goTo = (path: string) => navigate(`/v2/projects/${projectId}/${path}`)

  const handleTaskAction = (task: SetupTask) => {
    if (task.dialog === 'providers') {
      setProvidersOpen(true)
    } else if (task.path) {
      goTo(task.path)
    }
  }

  return (
    <div className="px-6 py-8 max-w-3xl mx-auto space-y-10">

      {/* Page heading */}
      <div className="space-y-1">
        <h1 className="text-lg font-[500] text-gray-900">Getting Started with Project</h1>
        <p className="text-[0.8125rem] text-gray-500">
          Here we go. Let's start configuring your project. Takes less than 5 minutes.
        </p>
      </div>

      {/* Section 1: Setup Your AI Foundation */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="h-5 w-5 rounded-full bg-gray-200/60 text-gray-500 text-[0.6875rem] font-[600] flex items-center justify-center shrink-0">
            1
          </span>
          <h2 className="text-[0.875rem] font-[500] text-gray-900">Setup Your AI Foundation</h2>
          <span className="text-[0.75rem] text-gray-400 ml-1">
            {doneCount}/{FOUNDATION_TASKS.length} Steps Completed
          </span>
        </div>

        <div className="rounded-xl border-[0.5px] border-gray-200 shadow-sm bg-gray-0 overflow-hidden py-1.5 px-0.5">
          <div className="flex">
            {/* Left: tasks */}
            <div className="flex-1 divide-y divide-gray-100">
              {FOUNDATION_TASKS.map(task => {
                const done = !!completed[task.id]
                const isExpanded = expandedTask === task.id && !done

                return (
                  <div key={task.id} className="px-5">
                    {/* Task header */}
                    <button
                      onClick={() => setExpandedTask(isExpanded ? '' : task.id)}
                      className={cn('w-full flex items-center gap-3 pt-3.5 text-left', isExpanded ? 'pb-1' : 'pb-3.5')}
                    >
                      <StepCircle done={done} />
                      <span className={cn(
                        'text-[0.8125rem] font-[500] flex-1',
                        done ? 'text-gray-400 line-through' : 'text-gray-900'
                      )}>
                        {task.title}
                      </span>
                      {!done && !isExpanded && (
                        <ChevronsUpDown className="h-4 w-4 text-gray-400 hover:text-gray-600 transition-opacity duration-200" />
                      )}
                    </button>

                    {/* Expanded content */}
                    <div className={cn(
                      'overflow-hidden transition-all duration-300 ease-out',
                      isExpanded ? 'max-h-40 opacity-100 pb-4' : 'max-h-0 opacity-0'
                    )}>
                      <p className="text-[0.8125rem] text-gray-500 leading-relaxed mb-2 pl-7">
                        {task.description}
                      </p>
                      <div className="pl-7">
                        <Button
                          size="default"
                          onClick={() => handleTaskAction(task)}
                          className="gap-1.5 px-4"
                        >
                          {task.actionLabel}
                          {/* <ArrowRight className="h-3.5 w-3.5" /> */}
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Right: preview placeholder */}
            <div className="w-[280px] shrink-0 p-4 hidden lg:block">
              <div className="h-full rounded-xl bg-gray-100" />
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Explore Your Path to AI Production Readiness */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="h-5 w-5 rounded-full bg-gray-200/60 text-gray-500 text-[0.6875rem] font-[600] flex items-center justify-center shrink-0">
            2
          </span>
          <h2 className="text-[0.875rem] font-[500] text-gray-900">Explore Your Path to AI Production Readiness</h2>
          {!foundationComplete && (
            <span className="flex items-center gap-1 text-[0.75rem] text-gray-400 ml-1">
              <Lock className="h-3 w-3" />
              Unlock by completing setup
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          {NEXT_CARDS.map(card => (
            <div
              key={card.id}
              className="rounded-xl border border-gray-200 bg-gray-0 p-5 flex flex-col gap-3"
            >
              <card.icon className="h-5 w-5 text-gray-400" strokeWidth={1.5} />
              <div>
                <p className="text-[0.8125rem] font-[500] text-gray-900">{card.title}</p>
                <p className="text-[0.75rem] text-gray-500 mt-1 leading-relaxed">{card.description}</p>
              </div>
              <div className="flex items-center gap-2 mt-auto pt-1">
                {card.actions.map(action => (
                  <Button
                    key={action.label}
                    variant="outline"
                    size="sm"
                    onClick={() => goTo(action.path)}
                    disabled={!action.primary && !foundationComplete}
                    className="gap-1"
                  >
                    {action.label}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* AI Providers Dialog */}
      <AiProvidersDialog open={providersOpen} onOpenChange={(open) => {
        setProvidersOpen(open)
        if (!open) refreshCompletion()
      }} />
    </div>
  )
}
