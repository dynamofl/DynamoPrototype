import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";

// Components
import { AppBar } from "@/components/patterns";
import type { BreadcrumbItem, AppBarActionButton } from "@/components/patterns";
import { Plus, X, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EvaluationCreationFlow, EvaluationInProgress, EvaluationResults } from "./components";
import { EvaluationHistoryTable } from "@/features/evaluation/components/evaluation-history-table";

// Types and services
import type { EvaluationCreationData } from "./types/evaluation-creation";
import type { JailbreakEvaluationOutput } from "./types/jailbreak-evaluation";
import type { EvaluationTest } from "@/features/evaluation/types/evaluation-test";

// AI Systems
import { useAISystemsSupabase } from "@/features/ai-systems/lib/useAISystemsSupabase";
import type { AISystem } from "@/features/ai-systems/types/types";

// Services and validation
import { validateModelAssignments } from "@/features/settings/lib/model-assignment-helper";
import { EvaluationService } from "@/lib/supabase/evaluation-service";
import type { EvaluationSummary } from "@/lib/supabase/evaluation-service";
import { toUrlSlug, fromUrlSlug } from "@/lib/utils";

// Helper function to map Supabase evaluation format to EvaluationTest format
function mapSupabaseToEvaluationTests(
  supabaseHistory: EvaluationSummary[],
  aiSystem: AISystem
): any[] {
  return supabaseHistory.map(evaluation => ({
    id: evaluation.id,
    name: evaluation.name,
    status: evaluation.status as 'pending' | 'running' | 'completed' | 'failed' | 'cancelled',
    aiSystemId: evaluation.aiSystemId,
    aiSystemName: aiSystem.name,
    createdAt: evaluation.createdAt,
    completedAt: evaluation.completedAt,
    config: {
      candidateModel: aiSystem.selectedModel || 'Unknown',
      judgeModel: 'GPT-4o' // Default judge model
    },
    input: {
      prompts: [] // Prompts stored in Supabase evaluation_prompts table
    },
    result: evaluation.summaryMetrics ? {
      overallMetrics: evaluation.summaryMetrics,
      promptResults: []
    } : undefined,
    progress: {
      current: evaluation.completedPrompts,
      total: evaluation.totalPrompts,
      currentPrompt: ''
    }
  }));
}

export function AISystemEvaluationPage() {
  const { systemName, evaluationId, tab } = useParams<{ systemName: string; evaluationId?: string; tab?: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Load AI systems from Supabase
  const { aiSystems, loading: supabaseLoading } = useAISystemsSupabase();

  // AI System state
  const [aiSystem, setAiSystem] = useState<AISystem | null>(null);
  const [loading, setLoading] = useState(true);

  // Evaluation management state
  const [hasEvaluations, setHasEvaluations] = useState(false);
  const [showCreationFlow, setShowCreationFlow] = useState(false);
  const [creationFlowVariant, setCreationFlowVariant] = useState<"onboarding" | "overlay">("onboarding");
  const [evaluationHistory, setEvaluationHistory] = useState<EvaluationTest[]>([]);
  const [selectedTest, setSelectedTest] = useState<EvaluationTest | null>(null);

  // Evaluation execution state
  const [evaluationResults, setEvaluationResults] = useState<JailbreakEvaluationOutput | null>(null);
  const [evaluationProgress, setEvaluationProgress] = useState({
    stage: '',
    current: 0,
    total: 0,
    message: ''
  });

  // Load AI System on mount
  useEffect(() => {
    const loadAISystem = async () => {
      if (!systemName) {
        navigate('/ai-systems');
        return;
      }

      // Wait for Supabase data to load
      if (supabaseLoading) {
        return;
      }

      try {
        // Convert URL slug back to AI system name
        const aiSystemNames = aiSystems.map(s => s.name);
        const decodedName = fromUrlSlug(systemName, aiSystemNames);
        const system = aiSystems.find(s => s.name === decodedName);

        if (system) {
          setAiSystem(system);

          // Load evaluation history from Supabase
          const supabaseHistory = await EvaluationService.getEvaluationsForAISystem(system.name);

          // Convert to EvaluationTest format for display
          const history = mapSupabaseToEvaluationTests(supabaseHistory, system);

          setEvaluationHistory(history);
          const hasExistingEvaluations = history.length > 0;
          setHasEvaluations(hasExistingEvaluations);

          // Check if "new" query parameter is present
          const isNewFlow = searchParams.get('new') === 'true';

          if (isNewFlow) {
            // Show creation flow as overlay
            setShowCreationFlow(true);
            setCreationFlowVariant("overlay");
            setEvaluationResults(null);
            setSelectedTest(null);
          } else if (evaluationId) {
            // If evaluationId is in URL, load and display that evaluation
            const test = history.find(t => t.id === evaluationId);
            if (test) {
              setSelectedTest(test);
              setShowCreationFlow(false);

              // Check if it's a running evaluation
              if (test.status === 'running') {
                setEvaluationResults(null);
                // Set progress from stored state
                if (test.progress) {
                  setEvaluationProgress({
                    stage: 'Running evaluation',
                    current: test.progress.current,
                    total: test.progress.total,
                    message: test.progress.currentPrompt || ''
                  });
                }
              } else if (test.status === 'completed') {
                // Load full evaluation results from Supabase
                const { evaluation, prompts } = await EvaluationService.getEvaluationResults(evaluationId);

                // Convert to JailbreakEvaluationOutput format
                const jailbreakOutput: JailbreakEvaluationOutput = {
                  evaluationId: evaluation.id,
                  timestamp: evaluation.created_at,
                  config: evaluation.config || {
                    aiSystemId: evaluation.ai_system_id,
                    policies: [],
                    guardrailIds: []
                  },
                  results: prompts.map(prompt => ({
                    policyId: prompt.policy_id || 'unknown',
                    policyName: prompt.policy_name || 'Policy',
                    behaviorType: prompt.behavior_type || 'Disallowed',
                    basePrompt: prompt.base_prompt || '',
                    attackType: prompt.attack_type || 'Unknown',
                    adversarialPrompt: prompt.adversarial_prompt || prompt.base_prompt || '',
                    systemResponse: prompt.system_response || '',
                    guardrailJudgement: prompt.guardrail_judgement || 'Unknown',
                    modelJudgement: prompt.model_judgement || 'Unknown',
                    attackOutcome: prompt.attack_outcome || 'Unknown'
                  })),
                  summary: evaluation.summary_metrics || {
                    totalTests: prompts.length,
                    attackSuccesses: 0,
                    attackFailures: 0,
                    successRate: 0,
                    byPolicy: {},
                    byAttackType: {},
                    byBehaviorType: {}
                  }
                };
                setEvaluationResults(jailbreakOutput);
              }
            } else {
              // Evaluation not found, redirect to evaluation list
              navigate(`/ai-systems/${toUrlSlug(system.name)}/evaluation`);
            }
          } else {
            // No evaluationId in URL - clear results and show appropriate view
            setEvaluationResults(null);
            setSelectedTest(null);
            setShowCreationFlow(false);

            if (!hasExistingEvaluations) {
              // If no evaluations exist, show creation flow immediately
              setShowCreationFlow(true);
              setCreationFlowVariant("onboarding");
            }
          }
        } else {
          navigate('/ai-systems');
        }
      } catch (error) {
        console.error('Failed to load AI system:', error);
        navigate('/ai-systems');
      } finally {
        setLoading(false);
      }
    };

    loadAISystem();
  }, [systemName, evaluationId, tab, searchParams.get('new'), supabaseLoading, navigate]);

  // Subscribe to ALL running evaluations for real-time table updates
  // ONLY when NOT viewing a specific evaluation (to avoid duplicate subscriptions)
  useEffect(() => {
    if (!aiSystem || evaluationHistory.length === 0 || evaluationId) {
      return; // Skip if viewing a specific evaluation
    }

    // Find all running evaluations
    const runningEvaluations = evaluationHistory.filter(test => test.status === 'running');

    if (runningEvaluations.length === 0) {
      return;
    }

    // Subscribe to each running evaluation
    const unsubscribers = runningEvaluations.map(evaluation =>
      EvaluationService.subscribeToEvaluation(
        evaluation.id,
        (progress) => {
          // Update the history table
          setEvaluationHistory(prev => prev.map(test =>
            test.id === evaluation.id
              ? {
                  ...test,
                  status: progress.status as any,
                  progress: {
                    current: progress.completed,
                    total: progress.total,
                    currentPrompt: progress.currentPrompt || ''
                  }
                }
              : test
          ));

          // If completed, reload full data
          if (progress.status === 'completed' || progress.status === 'failed') {
            (async () => {
              const supabaseHistory = await EvaluationService.getEvaluationsForAISystem(aiSystem.name);
              const history = mapSupabaseToEvaluationTests(supabaseHistory, aiSystem);
              setEvaluationHistory(history);
            })();
          }
        }
      )
    );

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [aiSystem?.name, evaluationId, evaluationHistory.filter(e => e.status === 'running').map(e => e.id).join(',')]);

  // Subscribe to real-time evaluation progress updates from backend (for progress overlay)
  // This subscribes ONLY when viewing a specific evaluation
  useEffect(() => {
    if (!selectedTest || selectedTest.status !== 'running' || !evaluationId) {
      return;
    }

    // Subscribe to real-time updates
    const unsubscribe = EvaluationService.subscribeToEvaluation(
      selectedTest.id,
      (progress) => {
        setEvaluationProgress({
          stage: progress.currentStage || 'Running evaluation',
          current: progress.completed,
          total: progress.total,
          message: progress.currentPrompt || ''
        });

        setEvaluationHistory(prev => prev.map(test =>
          test.id === selectedTest.id
            ? {
                ...test,
                progress: {
                  current: progress.completed,
                  total: progress.total,
                  currentPrompt: progress.currentPrompt || ''
                }
              }
            : test
        ));

        // If evaluation completed, reload the data
        if (progress.status === 'completed' || progress.status === 'failed') {
          // Reload from Supabase instead of localStorage
          if (aiSystem) {
            (async () => {
              const supabaseHistory = await EvaluationService.getEvaluationsForAISystem(aiSystem.name);
              const history = mapSupabaseToEvaluationTests(supabaseHistory, aiSystem);
              const updatedTest = history.find(t => t.id === selectedTest.id);

              if (updatedTest) {
                setSelectedTest(updatedTest);
                setEvaluationHistory(history); // Also update the table

                // Navigate back to list view to show completed status
                navigate(`/ai-systems/${toUrlSlug(aiSystem.name)}/evaluation`);
              }
            })();
          }
        }
      }
    );

    return () => {
      unsubscribe();
    };
  }, [selectedTest?.id, selectedTest?.status, aiSystem?.name]);

  // Handler functions
  const handleCreateEvaluation = () => {
    if (aiSystem) {
      // Navigate to the new evaluation URL with query parameter
      navigate(`/ai-systems/${toUrlSlug(aiSystem.name)}/evaluation?new=true`);
    }
  };

  const handleEvaluationCreated = async (data: EvaluationCreationData) => {
    // Only run jailbreak evaluation for jailbreak type
    if (data.type !== 'jailbreak') {
      setShowCreationFlow(false);
      setHasEvaluations(true);
      return;
    }

    // Validate model assignments before running
    const validation = validateModelAssignments();
    if (!validation.valid) {
      alert(`Please configure model assignments in Settings → Internal Models.\n\nMissing assignments for:\n- ${validation.missing.join('\n- ')}`);
      return;
    }

    if (!aiSystem) return;

    // Close creation flow
    setShowCreationFlow(false);

    try {
      // Create evaluation in backend - it will run automatically
      const result = await EvaluationService.createEvaluation(data, aiSystem.id);

      // Navigate to the running evaluation URL
      navigate(`/ai-systems/${toUrlSlug(aiSystem.name)}/evaluation/${result.evaluationId}`);

      // Reload history from Supabase
      const supabaseHistory = await EvaluationService.getEvaluationsForAISystem(aiSystem.name);
      const history = mapSupabaseToEvaluationTests(supabaseHistory, aiSystem);
      setEvaluationHistory(history);
      setHasEvaluations(true);

    } catch (error) {
      console.error('Evaluation creation failed:', error);
      alert(`Evaluation creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleCancelCreation = () => {
    if (aiSystem) {
      // Navigate back to evaluation list
      navigate(`/ai-systems/${toUrlSlug(aiSystem.name)}/evaluation`);
    }
  };

  // Handle viewing results from history
  const handleViewResults = (test: EvaluationTest) => {
    if (aiSystem) {
      // Navigate to the evaluation URL
      navigate(`/ai-systems/${toUrlSlug(aiSystem.name)}/evaluation/${test.id}/summary`);
    }
  };

  const handleViewData = (_test: EvaluationTest) => {
    // View data handler - placeholder
  };

  const handleShowProgress = (test: EvaluationTest) => {
    if (aiSystem) {
      // Navigate to the running evaluation URL
      navigate(`/ai-systems/${toUrlSlug(aiSystem.name)}/evaluation/${test.id}`);
    }
  };

  const handleTestDetails = (_test: EvaluationTest) => {
    // Test details handler - placeholder
  };

  const handleMinimize = () => {
    if (aiSystem) {
      // Navigate back to evaluation list while keeping evaluation running
      navigate(`/ai-systems/${toUrlSlug(aiSystem.name)}/evaluation`);
    }
  };

  // Breadcrumb configuration
  const breadcrumbs: BreadcrumbItem[] = [
    { name: "AI Systems", path: "/ai-systems" },
  ];

  // Action buttons configuration - only show when there are evaluations
  const actionButtons: AppBarActionButton[] = hasEvaluations ? [
    {
      label: 'New Evaluation',
      onClick: handleCreateEvaluation,
      variant: 'primary',
      icon: <Plus className="h-3 w-3" />,
    },
  ] : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <AppBar
          variant="breadcrumb"
          breadcrumbs={breadcrumbs}
          currentSection={{ name: "Loading...", badge: "Evaluation" }}
        />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">Loading AI system...</p>
        </div>
      </div>
    );
  }

  if (!aiSystem) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Breadcrumb App Bar */}
      <AppBar
        variant="breadcrumb"
        breadcrumbs={breadcrumbs}
        currentSection={{ name: aiSystem.name, badge: "Evaluation" }}
        actionButtons={actionButtons}
      />

      {/* Main Content */}
      <main className="flex-1 border rounded-lg shadow m-2 mt-0 bg-gray-0">
        <div className="flex flex-col h-full">
          {showCreationFlow && creationFlowVariant === "onboarding" ? (
            /* Show creation flow in onboarding mode (no evaluations) */
            <EvaluationCreationFlow
              variant={creationFlowVariant}
              onComplete={handleEvaluationCreated}
              onCancel={handleCancelCreation}
              aiSystemId={aiSystem.id}
            />
          ) : evaluationResults && !hasEvaluations ? (
            /* Show evaluation results for first-time completion */
            <EvaluationResults
              results={evaluationResults}
              onExport={(format) => {
                if (format === 'json') {
                  const blob = new Blob([JSON.stringify(evaluationResults, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `evaluation-${evaluationResults.evaluationId}.json`;
                  a.click();
                } else if (format === 'csv') {
                  const headers = ['Policy', 'Behavior Type', 'Attack Type', 'Base Prompt', 'Adversarial Prompt', 'Guardrail', 'Model', 'Outcome'];
                  const rows = evaluationResults.results.map(r => [
                    r.policyName,
                    r.behaviorType,
                    r.attackType,
                    r.basePrompt,
                    r.adversarialPrompt,
                    r.guardrailJudgement,
                    r.modelJudgement,
                    r.attackOutcome
                  ]);
                  const csvContent = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
                  const blob = new Blob([csvContent], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `evaluation-${evaluationResults.evaluationId}.csv`;
                  a.click();
                }
              }}
            />
          ) : hasEvaluations ? (
            /* Show evaluations list when evaluations exist */
            <div className="p-6">
              <EvaluationHistoryTable
                tests={evaluationHistory}
                onViewReport={handleViewResults}
                onViewData={handleViewData}
                onShowProgress={handleShowProgress}
                onTestDetails={handleTestDetails}
              />
            </div>
          ) : null}
        </div>
      </main>

      {/* Creation flow overlay */}
      {showCreationFlow && creationFlowVariant === "overlay" && (
        <div className="fixed inset-0 z-50 bg-gray-0 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-0">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">New Evaluation</h2>
              <p className="text-sm text-gray-600 mt-1">
                Create a new evaluation for {aiSystem.name}
              </p>
            </div>
            <Button
              onClick={handleCancelCreation}
              variant="ghost"
              size="icon"
              className="ml-2"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Creation flow content */}
          <div className="flex-1 overflow-auto">
            <EvaluationCreationFlow
              variant="onboarding"
              onComplete={handleEvaluationCreated}
              onCancel={handleCancelCreation}
              aiSystemId={aiSystem.id}
            />
          </div>
        </div>
      )}

      {/* Running evaluation overlay */}
      {evaluationId && selectedTest?.status === 'running' && (
        <div className="fixed inset-0 z-50 bg-gray-0 flex flex-col">
          {/* Header with minimize button */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-0">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">
                {selectedTest.name}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Evaluation in progress...
              </p>
            </div>
            <Button
              onClick={handleMinimize}
              variant="ghost"
              size="icon"
              className="ml-2"
            >
              <Minus className="h-4 w-4" />
            </Button>
          </div>

          {/* Progress content */}
          <div className="flex-1 overflow-auto">
            <EvaluationInProgress
              stage={evaluationProgress.stage}
              current={evaluationProgress.current}
              total={evaluationProgress.total}
              message={evaluationProgress.message}
            />
          </div>
        </div>
      )}

      {/* Results overlay */}
      {evaluationResults && selectedTest?.status !== 'running' && (
        <div className="fixed inset-0 z-50 bg-gray-0">
          <EvaluationResults
            results={evaluationResults}
            onClose={() => {
              if (aiSystem) {
                navigate(`/ai-systems/${toUrlSlug(aiSystem.name)}/evaluation`);
              }
            }}
            currentTab={tab || 'summary'}
            onExport={(format) => {
              if (format === 'json') {
                const blob = new Blob([JSON.stringify(evaluationResults, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `evaluation-${evaluationResults.evaluationId}.json`;
                a.click();
              } else if (format === 'csv') {
                // Simple CSV export
                const headers = ['Policy', 'Behavior Type', 'Attack Type', 'Base Prompt', 'Adversarial Prompt', 'Guardrail', 'Model', 'Outcome'];
                const rows = evaluationResults.results.map(r => [
                  r.policyName,
                  r.behaviorType,
                  r.attackType,
                  r.basePrompt,
                  r.adversarialPrompt,
                  r.guardrailJudgement,
                  r.modelJudgement,
                  r.attackOutcome
                ]);
                const csvContent = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
                const blob = new Blob([csvContent], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `evaluation-${evaluationResults.evaluationId}.csv`;
                a.click();
              }
            }}
          />
        </div>
      )}
    </div>
  );
}
