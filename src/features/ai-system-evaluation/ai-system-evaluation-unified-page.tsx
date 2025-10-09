import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";

// Components
import { AppBar } from "@/components/patterns";
import type { BreadcrumbItem, AppBarActionButton } from "@/components/patterns";
import { Plus, X, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EvaluationCreationFlow, EvaluationInProgress, EvaluationResults } from "./components";
import { EvaluationHistoryTable } from "@/features/evaluation/components/evaluation-history-table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Hooks
import { useAISystemLoader } from "./hooks/useAISystemLoader";
import { useEvaluationHistory } from "./hooks/useEvaluationHistory";

// Types and services
import type { EvaluationCreationData } from "./types/evaluation-creation";
import type { JailbreakEvaluationOutput } from "./types/jailbreak-evaluation";
import type { EvaluationTest } from "@/features/evaluation/types/evaluation-test";
import { validateModelAssignments } from "@/features/settings/lib/model-assignment-helper";
import { EvaluationService } from "@/lib/supabase/evaluation-service";
import { toUrlSlug } from "@/lib/utils";

export function AISystemEvaluationUnifiedPage() {
  const { systemName, evaluationId, tab } = useParams<{
    systemName: string;
    evaluationId?: string;
    tab?: string;
  }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Load AI system
  const { aiSystem, loading: aiSystemLoading } = useAISystemLoader(systemName);

  // Load evaluation history
  const {
    evaluationHistory,
    hasEvaluations,
    loading: historyLoading,
    reloadHistory,
    setEvaluationHistory
  } = useEvaluationHistory(aiSystem);

  // UI state management
  const [initialized, setInitialized] = useState(false); // Track if initial data load is complete
  const [showCreationFlow, setShowCreationFlow] = useState(false);
  const [creationFlowVariant, setCreationFlowVariant] = useState<"onboarding" | "overlay">("onboarding");
  const [selectedTest, setSelectedTest] = useState<EvaluationTest | null>(null);
  const [loadingResults, setLoadingResults] = useState(false); // Track if we're loading evaluation results
  const [loadingProgress, setLoadingProgress] = useState(false); // Track if we're loading progress details
  const [evaluationResults, setEvaluationResults] = useState<JailbreakEvaluationOutput | null>(null);
  const [evaluationProgress, setEvaluationProgress] = useState({
    stage: '',
    current: 0,
    total: 0,
    message: ''
  });

  // Delete confirmation dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [evaluationToDelete, setEvaluationToDelete] = useState<EvaluationTest | null>(null);

  // Initial load - wait for async data before deciding what to show
  useEffect(() => {
    // Don't do anything while loading
    if (aiSystemLoading || historyLoading) {
      setInitialized(false);
      return;
    }

    // Mark as initialized after loading completes
    setInitialized(true);

    const isNewFlow = searchParams.get('new') === 'true';

    // Handle creation flow overlay (from New Evaluation button)
    if (isNewFlow) {
      setShowCreationFlow(true);
      setCreationFlowVariant("overlay");
      return;
    }

    // IMPORTANT: Never show creation flow onboarding if evaluations exist
    // This prevents the flash when page refreshes
    if (hasEvaluations) {
      setShowCreationFlow(false);
      return;
    }

    // Only show creation flow onboarding when truly no evaluations exist
    if (!hasEvaluations && !evaluationId && !isNewFlow) {
      setShowCreationFlow(true);
      setCreationFlowVariant("onboarding");
    } else {
      setShowCreationFlow(false);
    }
  }, [aiSystemLoading, historyLoading, searchParams.get('new'), hasEvaluations, evaluationId]);

  // Handle evaluation detail view separately
  useEffect(() => {
    console.log('📍 Detail view useEffect triggered:', {
      evaluationId,
      aiSystemLoading,
      historyLoading,
      hasEvaluations,
      evaluationHistoryLength: evaluationHistory.length,
      selectedTestId: selectedTest?.id,
      timestamp: new Date().toISOString()
    });

    if (aiSystemLoading || historyLoading) {
      console.log('⏳ Skipping detail load - still loading');
      return;
    }

    // Clear selection when no evaluationId
    if (!evaluationId) {
      console.log('🧹 No evaluationId, clearing selection');
      setSelectedTest(null);
      setEvaluationResults(null);
      return;
    }

    // Wait for evaluations to load
    if (!hasEvaluations || evaluationHistory.length === 0) {
      console.log('⏳ Waiting for evaluations to load');
      return;
    }

    // IMPORTANT: Only load details if we don't already have this evaluation selected
    // This prevents re-loading when evaluationHistory updates from subscriptions
    if (selectedTest?.id === evaluationId) {
      console.log('✅ Already have this evaluation selected, skipping reload');
      return;
    }

    // Load evaluation details
    const test = evaluationHistory.find(t => t.id === evaluationId);
    if (test) {
      console.log('✅ Found evaluation, loading details:', {
        testId: test.id,
        testName: test.name,
        status: test.status
      });
      loadEvaluationDetails(test);
    } else {
      console.warn('❌ Evaluation not found in history:', evaluationId);
      console.log('Available IDs:', evaluationHistory.map(t => t.id));
      // Evaluation not found, go back to list after a short delay to avoid race conditions
      setTimeout(() => {
        if (aiSystem) {
          console.log('🔙 Navigating back to list');
          navigate(`/ai-systems/${toUrlSlug(aiSystem.name)}/evaluation`);
        }
      }, 100);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [evaluationId, aiSystemLoading, historyLoading, hasEvaluations]);

  // Sync selectedTest with real-time updates without triggering detail load
  useEffect(() => {
    if (selectedTest && evaluationHistory.length > 0) {
      const updatedTest = evaluationHistory.find(t => t.id === selectedTest.id);
      if (updatedTest) {
        // Only update if the test data actually changed
        const hasChanges =
          selectedTest.status !== updatedTest.status ||
          selectedTest.progress?.current !== updatedTest.progress?.current ||
          selectedTest.progress?.total !== updatedTest.progress?.total;

        if (hasChanges) {
          console.log('🔄 Syncing selectedTest with real-time update');
          setSelectedTest(updatedTest);
        }
      }
    }
  }, [evaluationHistory]);

  // Load evaluation details
  const loadEvaluationDetails = async (test: EvaluationTest) => {
    setSelectedTest(test);
    setShowCreationFlow(false);

    if (test.status === 'running' || test.status === 'pending') {
      // Set loading state for progress
      setLoadingProgress(true);
      setLoadingResults(false);
      setEvaluationResults(null);

      // Simulate async loading of progress details (in real scenario, fetch from backend)
      // For now, we'll use the test data we already have
      await new Promise(resolve => setTimeout(resolve, 300)); // Small delay to show loading state

      setEvaluationProgress({
        stage: test.status === 'pending' ? 'Starting Evaluation...' : 'Running Evaluation',
        current: test.progress?.current || 0,
        total: test.progress?.total || 100,
        message: test.progress?.currentPrompt || ''
      });
      setLoadingProgress(false);
    } else if (test.status === 'completed') {
      try {
        // Set loading state before fetching results
        setLoadingResults(true);
        setEvaluationResults(null);

        const { evaluation, prompts } = await EvaluationService.getEvaluationResults(test.id);

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
        setLoadingResults(false);
      } catch (error) {
        console.error('Failed to load evaluation results:', error);
        setLoadingResults(false);
      }
    }
  };

  // Subscribe to running evaluations for real-time table updates
  useEffect(() => {
    if (!aiSystem || evaluationHistory.length === 0 || evaluationId) {
      return;
    }

    const runningEvaluations = evaluationHistory.filter(test => test.status === 'running');
    if (runningEvaluations.length === 0) {
      return;
    }

    const unsubscribers = runningEvaluations.map(evaluation =>
      EvaluationService.subscribeToEvaluation(
        evaluation.id,
        (progress) => {
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

          if (progress.status === 'completed' || progress.status === 'failed') {
            reloadHistory();
          }
        }
      )
    );

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [aiSystem?.name, evaluationId, evaluationHistory.filter(e => e.status === 'running').map(e => e.id).join(',')]);

  // Subscribe to specific evaluation progress
  useEffect(() => {
    if (!selectedTest || !evaluationId) {
      return;
    }

    // Subscribe for both running and pending status
    if (selectedTest.status !== 'running' && selectedTest.status !== 'pending') {
      return;
    }

    const unsubscribe = EvaluationService.subscribeToEvaluation(
      selectedTest.id,
      async (progress) => {
        setEvaluationProgress({
          stage: progress.currentStage || 'Running evaluation',
          current: progress.completed,
          total: progress.total,
          message: progress.currentPrompt || ''
        });

        setSelectedTest(prev => prev ? {
          ...prev,
          status: progress.status as any,
          progress: {
            current: progress.completed,
            total: progress.total,
            currentPrompt: progress.currentPrompt || ''
          }
        } : null);

        setEvaluationHistory(prev => prev.map(test =>
          test.id === selectedTest.id
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

        if (progress.status === 'completed' || progress.status === 'failed') {
          await reloadHistory();
          const updatedTest = evaluationHistory.find(t => t.id === selectedTest.id);
          if (updatedTest) {
            loadEvaluationDetails(updatedTest);
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
      navigate(`/ai-systems/${toUrlSlug(aiSystem.name)}/evaluation?new=true`);
    }
  };

  const handleEvaluationCreated = async (data: EvaluationCreationData) => {
    if (data.type !== 'jailbreak') {
      setShowCreationFlow(false);
      return;
    }

    const validation = validateModelAssignments();
    if (!validation.valid) {
      alert(`Please configure model assignments in Settings → Internal Models.\n\nMissing assignments for:\n- ${validation.missing.join('\n- ')}`);
      return;
    }

    if (!aiSystem) return;

    try {
      // Close creation flow
      setShowCreationFlow(false);

      // Create a temporary test object with the form data
      // This will be shown immediately in "Preparing..." state
      const tempTest: EvaluationTest = {
        id: 'temp-' + Date.now(),
        name: data.name || 'New Evaluation',
        status: 'pending',
        aiSystemId: aiSystem.id,
        aiSystemName: aiSystem.name,
        createdAt: new Date().toISOString(),
        config: {
          candidateModel: aiSystem.selectedModel || 'Unknown',
          judgeModel: 'GPT-4o',
          temperature: 0.7,
          maxLength: 2000,
          topP: 1.0
        } as any,
        input: { prompts: [] },
        progress: { current: 0, total: 100, currentPrompt: '' }
      };

      // Set the test and show progress overlay immediately with "Preparing..." state
      setSelectedTest(tempTest);
      setEvaluationProgress({
        stage: 'Preparing Evaluation...',
        current: 0,
        total: 100,
        message: 'Setting up test environment and generating prompts...'
      });

      // Create the evaluation in backend
      const result = await EvaluationService.createEvaluation(data, aiSystem.id);

      // Navigate to the actual evaluation URL
      navigate(`/ai-systems/${toUrlSlug(aiSystem.name)}/evaluation/${result.evaluationId}`);

      // Reload history in background - this will trigger the detail view useEffect
      // which will load the actual test and update the progress overlay
      await reloadHistory();

    } catch (error) {
      console.error('Evaluation creation failed:', error);
      setSelectedTest(null);
      alert(`Evaluation creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleCancelCreation = () => {
    setShowCreationFlow(false);
    if (aiSystem) {
      navigate(`/ai-systems/${toUrlSlug(aiSystem.name)}/evaluation`);
    }
  };

  // Handle clicks from history table - memoized to prevent table re-renders
  const handleViewResults = useCallback((test: EvaluationTest) => {
    console.log('🔀 handleViewResults called:', {
      testId: test.id,
      testName: test.name,
      aiSystemName: aiSystem?.name,
      timestamp: new Date().toISOString()
    });

    if (aiSystem) {
      const url = `/ai-systems/${toUrlSlug(aiSystem.name)}/evaluation/${test.id}/summary`;
      console.log('🔀 Navigating to:', url);
      navigate(url);
    } else {
      console.warn('⚠️ No aiSystem available for navigation');
    }
  }, [aiSystem, navigate]);

  const handleShowProgress = useCallback((test: EvaluationTest) => {
    console.log('🔀 handleShowProgress called:', {
      testId: test.id,
      testName: test.name,
      testStatus: test.status,
      aiSystemName: aiSystem?.name,
      timestamp: new Date().toISOString()
    });

    if (aiSystem) {
      const url = `/ai-systems/${toUrlSlug(aiSystem.name)}/evaluation/${test.id}`;
      console.log('🔀 Navigating to:', url);
      navigate(url);
    } else {
      console.warn('⚠️ No aiSystem available for navigation');
    }
  }, [aiSystem, navigate]);

  const handleTestDetails = useCallback((test: EvaluationTest) => {
    console.log('🔀 handleTestDetails called:', {
      testId: test.id,
      testName: test.name,
      testStatus: test.status,
      aiSystemName: aiSystem?.name,
      timestamp: new Date().toISOString()
    });

    if (aiSystem) {
      const url = `/ai-systems/${toUrlSlug(aiSystem.name)}/evaluation/${test.id}`;
      console.log('🔀 Navigating to:', url);
      navigate(url);
    } else {
      console.warn('⚠️ No aiSystem available for navigation');
    }
  }, [aiSystem, navigate]);

  const handleViewData = useCallback((_test: EvaluationTest) => {
    // Placeholder for viewing data
  }, []);

  const handleDeleteRequest = useCallback((test: EvaluationTest) => {
    setEvaluationToDelete(test);
    setIsDeleteDialogOpen(true);
  }, []);

  const handleDeleteConfirm = async () => {
    if (!evaluationToDelete) return;

    try {
      // Delete from backend
      await EvaluationService.deleteEvaluation(evaluationToDelete.id);

      // If we're viewing the deleted evaluation, navigate back to list
      if (selectedTest?.id === evaluationToDelete.id) {
        setSelectedTest(null);
        setEvaluationResults(null);
        if (aiSystem) {
          navigate(`/ai-systems/${toUrlSlug(aiSystem.name)}/evaluation`);
        }
      }

      // Reload evaluation history to update the table
      await reloadHistory();

      // Close dialog and reset state
      setIsDeleteDialogOpen(false);
      setEvaluationToDelete(null);
    } catch (error) {
      console.error('Failed to delete evaluation:', error);
      alert(`Failed to delete evaluation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false);
    setEvaluationToDelete(null);
  };

  const handleMinimize = () => {
    if (aiSystem) {
      // Clear selected test and navigate back to list
      setSelectedTest(null);
      setEvaluationResults(null);
      navigate(`/ai-systems/${toUrlSlug(aiSystem.name)}/evaluation`);
    }
  };

  const handleExport = (format: 'json' | 'csv') => {
    if (!evaluationResults) return;

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
  };

  // Breadcrumb configuration
  const breadcrumbs: BreadcrumbItem[] = [
    { name: "AI Systems", path: "/ai-systems" },
  ];

  const actionButtons: AppBarActionButton[] = hasEvaluations ? [
    {
      label: 'New Evaluation',
      onClick: handleCreateEvaluation,
      variant: 'primary',
      icon: <Plus className="h-3 w-3" />,
    },
  ] : [];

  // Show loading state if either AI system or history is loading
  // Also show loading if we're still determining whether to show creation flow
  const loading = aiSystemLoading || historyLoading;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <AppBar
          variant="breadcrumb"
          breadcrumbs={breadcrumbs}
          currentSection={{ name: "Loading...", badge: "Evaluation" }}
        />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">Loading evaluations...</p>
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
          {/* Show loading state until initialization completes */}
          {!initialized ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-gray-500">Loading evaluations...</p>
            </div>
          ) : (
            <>
              {/* Show creation flow as new page only when no evaluations exist */}
              {showCreationFlow && creationFlowVariant === "onboarding" && !hasEvaluations ? (
                <EvaluationCreationFlow
                  variant={creationFlowVariant}
                  onComplete={handleEvaluationCreated}
                  onCancel={handleCancelCreation}
                  aiSystemId={aiSystem.id}
                />
              ) : hasEvaluations ? (
                /* Show evaluation history table when evaluations exist */
                <div className="p-6">
                  <EvaluationHistoryTable
                    tests={evaluationHistory}
                    onViewReport={handleViewResults}
                    onViewData={handleViewData}
                    onShowProgress={handleShowProgress}
                    onTestDetails={handleTestDetails}
                    onDelete={handleDeleteRequest}
                  />
                </div>
              ) : null}
            </>
          )}
        </div>
      </main>

      {/* Creation flow overlay (when clicking New Evaluation button) */}
      {showCreationFlow && creationFlowVariant === "overlay" && (
        <div className="fixed inset-0 z-50 bg-gray-0 flex flex-col">
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

      {/* Loading progress overlay - shown when clicking on existing running test */}
      {loadingProgress && selectedTest && (
        <div className="fixed inset-0 z-50 bg-gray-0 flex flex-col">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-0">
            <div className="flex-1">
              <h2 className="text-2xl font-semibold text-gray-900">
                {selectedTest.name}
              </h2>
              <Skeleton className="h-4 w-48 bg-gray-200 mt-2" />
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
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500">Loading Progress...</p>
          </div>
        </div>
      )}

      {/* Running evaluation progress overlay - shown for pending/running tests or temp test */}
      {!loadingProgress && selectedTest && (selectedTest.status === 'running' || selectedTest.status === 'pending') && (
        <div className="fixed inset-0 z-50 bg-gray-0 flex flex-col">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-0">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">
                {selectedTest.name}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Evaluation In Progress...
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

      {/* Loading evaluation results overlay */}
      {loadingResults && selectedTest && (
        <div className="fixed inset-0 z-50 bg-gray-0 flex flex-col">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-0">
            <div className="flex-1">
              <h2 className="text-2xl font-semibold text-gray-900">
                {selectedTest.name}
              </h2>
              <Skeleton className="h-4 w-48 bg-gray-200 mt-2" />
            </div>
            <Button
              onClick={handleMinimize}
              variant="ghost"
              size="icon"
              className="ml-2"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500">Loading Report...</p>
          </div>
        </div>
      )}

      {/* Completed evaluation results overlay */}
      {evaluationResults && !loadingResults && selectedTest?.status !== 'running' && selectedTest?.status !== 'pending' && (
        <div className="fixed inset-0 z-50 bg-gray-0">
          <EvaluationResults
            results={evaluationResults}
            evaluationName={selectedTest?.name}
            onClose={handleMinimize}
            currentTab={tab || 'summary'}
            onExport={handleExport}
          />
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Evaluation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{evaluationToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDeleteCancel}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}