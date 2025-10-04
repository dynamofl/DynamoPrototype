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
import { AISystemsTableStorage, aiSystemsStorageConfig } from "@/features/ai-systems/lib";
import type { AISystem } from "@/features/ai-systems/types/types";

// Jailbreak evaluation
import { runJailbreakEvaluation } from "./lib/jailbreak-runner";
import { loadPoliciesFromGuardrailIds } from "./lib/policy-converter";
import { validateModelAssignments } from "@/features/settings/lib/model-assignment-helper";
import { EvaluationStorageAdapter } from "./lib/evaluation-storage-adapter";
import type { Guardrail } from "@/types";

export function AISystemEvaluationPage() {
  const { systemName, evaluationId, tab } = useParams<{ systemName: string; evaluationId?: string; tab?: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

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

      try {
        const storage = new AISystemsTableStorage(aiSystemsStorageConfig);
        const systems = await storage.load() as AISystem[];

        const decodedName = decodeURIComponent(systemName);
        const system = systems.find(s => s.name === decodedName);

        if (system) {
          setAiSystem(system);

          // Load evaluation history for this AI system
          const history = EvaluationStorageAdapter.loadHistoryForAISystem(system.name);
          setEvaluationHistory(history);
          const hasExistingEvaluations = history.length > 0;
          setHasEvaluations(hasExistingEvaluations);

          // Check if "new" query parameter is present
          const isNewFlow = searchParams.get('new') === 'true';
          console.log('🔍 Checking - isNewFlow:', isNewFlow, 'evaluationId:', evaluationId, 'hasEvaluations:', hasExistingEvaluations);

          if (isNewFlow) {
            // Show creation flow as overlay
            console.log('✅ MATCH - Setting creation flow overlay');
            setShowCreationFlow(true);
            setCreationFlowVariant("overlay");
            setEvaluationResults(null);
            setSelectedTest(null);
          } else if (evaluationId) {
            // If evaluationId is in URL, load and display that evaluation
            console.log('Loading existing evaluation:', evaluationId);
            const test = history.find(t => t.id === evaluationId);
            if (test) {
              setSelectedTest(test);
              setShowCreationFlow(false);

              // Check if it's a running evaluation
              if (test.status === 'in_progress') {
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
              } else if (test.result) {
                // Convert to JailbreakEvaluationOutput and show results
                const jailbreakOutput: JailbreakEvaluationOutput = {
                  evaluationId: test.id,
                  timestamp: test.createdAt,
                  config: {
                    aiSystemId: test.id,
                    policies: [],
                    guardrailIds: []
                  },
                  results: test.result.promptResults.map((promptResult, idx) => ({
                    policyId: `policy-${idx}`,
                    policyName: 'Policy',
                    behaviorType: promptResult.userMarkedAdversarial === 'Adversarial' ? 'Disallowed' : 'Allowed',
                    basePrompt: promptResult.prompt,
                    attackType: 'Typos',
                    adversarialPrompt: promptResult.prompt,
                    systemResponse: promptResult.candidateResponse,
                    guardrailJudgement: promptResult.judgeDetectedAdversarial ? 'Blocked' : 'Allowed',
                    modelJudgement: 'Answered',
                    attackOutcome: promptResult.judgeDetectedAdversarial ? 'Attack Failure' : 'Attack Success'
                  })),
                  summary: {
                    totalTests: test.result.overallMetrics.totalPrompts,
                    attackSuccesses: test.result.overallMetrics.totalPassed || 0,
                    attackFailures: test.result.overallMetrics.totalBlocked || 0,
                    successRate: test.result.overallMetrics.averageAccuracy || 0,
                    byPolicy: {},
                    byAttackType: {},
                    byBehaviorType: {}
                  }
                };
                setEvaluationResults(jailbreakOutput);
              }
            } else {
              // Evaluation not found, redirect to evaluation list
              navigate(`/ai-systems/${encodeURIComponent(system.name)}/evaluation`);
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
  }, [systemName, evaluationId, tab, searchParams, navigate]);

  // Auto-resume in-progress evaluations
  useEffect(() => {
    if (!selectedTest || selectedTest.status !== 'in_progress' || !aiSystem) {
      return;
    }

    // Check if we have the necessary data to resume
    if (!selectedTest.metadata?.evaluationData) {
      console.warn('Cannot resume evaluation: missing evaluation data');
      return;
    }

    // Resume the evaluation
    const data = selectedTest.metadata.evaluationData as EvaluationCreationData;

    const runEvaluation = async () => {
      try {
        // Convert policies and guardrails
        const policies = loadPoliciesFromGuardrailIds(data.policyIds);

        // Load guardrails
        const guardrailsData = localStorage.getItem('guardrails');
        const allGuardrails: Guardrail[] = guardrailsData ? JSON.parse(guardrailsData) : [];
        const selectedGuardrails = data.guardrailIds
          ? allGuardrails.filter(g => data.guardrailIds?.includes(g.id))
          : [];

        // Run jailbreak evaluation
        const results = await runJailbreakEvaluation(
          {
            aiSystemId: data.aiSystemIds?.[0] || '',
            policies,
            guardrailIds: data.guardrailIds,
          },
          selectedGuardrails,
          (progress) => {
            setEvaluationProgress(progress);
            // Update progress in storage
            EvaluationStorageAdapter.updateTestProgress(selectedTest.id, progress.current, progress.total, progress.message);
          }
        );

        // Add evaluationId to results
        results.evaluationId = selectedTest.id;

        // Update storage with results
        EvaluationStorageAdapter.updateTestWithResults(selectedTest.id, results);

        // Reload history
        const history = EvaluationStorageAdapter.loadHistoryForAISystem(aiSystem.name);
        setEvaluationHistory(history);

        // Navigate back to evaluation list
        navigate(`/ai-systems/${encodeURIComponent(aiSystem.name)}/evaluation`);
      } catch (error) {
        console.error('Evaluation failed:', error);
        alert(`Evaluation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };

    runEvaluation();
  }, [selectedTest, aiSystem]); // Only run when selectedTest or aiSystem changes

  // Handler functions
  const handleCreateEvaluation = () => {
    if (aiSystem) {
      // Navigate to the new evaluation URL with query parameter
      navigate(`/ai-systems/${encodeURIComponent(aiSystem.name)}/evaluation?new=true`);
    }
  };

  const handleEvaluationCreated = async (data: EvaluationCreationData) => {
    console.log("Evaluation created:", data);

    // Only run jailbreak evaluation for jailbreak type
    if (data.type !== 'jailbreak') {
      console.log('Non-jailbreak evaluation type - skipping auto-run');
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

    // Generate evaluation ID
    const evaluationId = `eval-${Date.now()}`;

    // Create in-progress test entry
    EvaluationStorageAdapter.createInProgressTest(data, evaluationId, aiSystem.name);

    // Navigate to the running evaluation URL
    navigate(`/ai-systems/${encodeURIComponent(aiSystem.name)}/evaluation/${evaluationId}`);

    // Close creation flow
    setShowCreationFlow(false);

    try {
      // Convert policies and guardrails
      const policies = loadPoliciesFromGuardrailIds(data.policyIds);

      // Load guardrails
      const guardrailsData = localStorage.getItem('guardrails');
      const allGuardrails: Guardrail[] = guardrailsData ? JSON.parse(guardrailsData) : [];
      const selectedGuardrails = data.guardrailIds
        ? allGuardrails.filter(g => data.guardrailIds?.includes(g.id))
        : [];

      // Run jailbreak evaluation
      const results = await runJailbreakEvaluation(
        {
          aiSystemId: data.aiSystemIds?.[0] || '',
          policies,
          guardrailIds: data.guardrailIds,
        },
        selectedGuardrails,
        (progress) => {
          setEvaluationProgress(progress);
          // Update progress in storage
          EvaluationStorageAdapter.updateTestProgress(evaluationId, progress.current, progress.total);
        }
      );

      // Add evaluationId to results
      results.evaluationId = evaluationId;

      // Update storage with results
      EvaluationStorageAdapter.updateTestWithResults(evaluationId, results);

      // Reload history
      const history = EvaluationStorageAdapter.loadHistoryForAISystem(aiSystem.name);
      setEvaluationHistory(history);
      setHasEvaluations(true);

      // Navigate back to evaluation list (don't automatically open results)
      navigate(`/ai-systems/${encodeURIComponent(aiSystem.name)}/evaluation`);
    } catch (error) {
      console.error('Evaluation failed:', error);
      alert(`Evaluation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleCancelCreation = () => {
    if (aiSystem) {
      // Navigate back to evaluation list
      navigate(`/ai-systems/${encodeURIComponent(aiSystem.name)}/evaluation`);
    }
  };

  // Handle viewing results from history
  const handleViewResults = (test: EvaluationTest) => {
    if (aiSystem) {
      // Navigate to the evaluation URL
      navigate(`/ai-systems/${encodeURIComponent(aiSystem.name)}/evaluation/${test.id}/summary`);
    }
  };

  const handleViewData = (test: EvaluationTest) => {
    console.log('View data for test:', test);
  };

  const handleShowProgress = (test: EvaluationTest) => {
    if (aiSystem) {
      // Navigate to the running evaluation URL
      navigate(`/ai-systems/${encodeURIComponent(aiSystem.name)}/evaluation/${test.id}`);
    }
  };

  const handleTestDetails = (test: EvaluationTest) => {
    console.log('Show details for test:', test);
  };

  const handleMinimize = () => {
    if (aiSystem) {
      // Navigate back to evaluation list while keeping evaluation running
      navigate(`/ai-systems/${encodeURIComponent(aiSystem.name)}/evaluation`);
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
      {evaluationId && selectedTest?.status === 'in_progress' && (
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
      {evaluationResults && (
        <div className="fixed inset-0 z-50 bg-gray-0">
          <EvaluationResults
            results={evaluationResults}
            onClose={() => {
              if (aiSystem) {
                navigate(`/ai-systems/${encodeURIComponent(aiSystem.name)}/evaluation`);
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
