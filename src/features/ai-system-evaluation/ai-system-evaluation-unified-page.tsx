import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence, easeInOut } from "framer-motion";

// Components
import { AppBar, OverlayHeader } from "@/components/patterns";
import type { BreadcrumbItem, AppBarActionButton } from "@/components/patterns";
import { Download, Trash2, ChevronsUpDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BulkActionBar } from "@/components/patterns/ui-patterns/bulk-action-bar";
import type { BulkAction } from "@/components/patterns/ui-patterns/bulk-action-bar";
import {
  EvaluationCreationFlow,
  EvaluationInProgress,
  EvaluationTableProgress,
  EvaluationResults,
  EvaluationHistoryTableDirect,
  EvaluationHistoryHeader,
  EvaluationSummarySection
} from "./components";
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
import { useGuardrailsSupabase } from "@/features/guardrails/lib/useGuardrailsSupabase";
import { useAISystemsSupabase } from "@/features/ai-systems/lib/useAISystemsSupabase";

// Types and services
import type { EvaluationCreationData } from "./types/evaluation-creation";
import type { BaseEvaluationOutput } from "./types/base-evaluation";
import type { EvaluationTest } from "@/features/evaluation/types/evaluation-test";
import { validateModelAssignments } from "@/features/settings/lib/model-assignment-helper";
import { EvaluationService, calculateCheckpointPercentage } from "@/lib/supabase/evaluation-service";
import { supabase } from "@/lib/supabase/client";
import { toUrlSlug } from "@/lib/utils";
import { exportEvaluationsToCSV } from "./lib/export-utils";
import { getEvaluationStrategy } from "./strategies/strategy-factory";

// Progress view variant: 'bar' | 'table' | 'unified'
// 'bar' - Original progress bar with attack cards
// 'table' - Table-based progress view
// 'unified' - Same UI as results (Summary/Data tabs) with progress checkpoints
const PROGRESS_VIEW_VARIANT: 'bar' | 'table' | 'unified' = 'unified';

export function AISystemEvaluationUnifiedPage() {
  const { systemName, evaluationId, view } = useParams<{
    systemName: string;
    evaluationId?: string;
    view?: string;
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

  // Load guardrails for evaluation creation
  const { guardrails } = useGuardrailsSupabase();

  // Load all AI systems for system switching
  const { aiSystems, loading: aiSystemsLoading, reload: reloadAISystems } = useAISystemsSupabase();

  // Force reload AI systems on mount to ensure fresh data
  useEffect(() => {
    reloadAISystems();
  }, []);

  // UI state management
  const [initialized, setInitialized] = useState(false); // Track if initial data load is complete
  const [showCreationFlow, setShowCreationFlow] = useState(false);
  const [creationFlowVariant, setCreationFlowVariant] = useState<"onboarding" | "overlay">("onboarding");
  const [selectedTest, setSelectedTest] = useState<EvaluationTest | null>(null);
  const [loadingResults, setLoadingResults] = useState(false); // Track if we're loading evaluation results
  const [loadingProgress, setLoadingProgress] = useState(false); // Track if we're loading progress details
  const [evaluationResults, setEvaluationResults] = useState<BaseEvaluationOutput | null>(null);
  const [evaluationProgress, setEvaluationProgress] = useState({
    stage: '',
    current: 0,
    total: 0,
    message: '',
    percentage: 0,
    currentCheckpoint: null as string | null,
    checkpoints: undefined as any,
    policies: [] as any[]
  });

  // Delete confirmation dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [evaluationToDelete, setEvaluationToDelete] = useState<EvaluationTest | null>(null);
  const [isBulkDelete, setIsBulkDelete] = useState(false);

  // Selection state
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  // Search state for evaluation dropdown
  const [searchQuery, setSearchQuery] = useState("");

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
    if (aiSystemLoading || historyLoading) {
      return;
    }

    // Clear selection when no evaluationId
    if (!evaluationId) {
      setSelectedTest(null);
      setEvaluationResults(null);
      return;
    }

    // Wait for evaluations to load
    if (!hasEvaluations || evaluationHistory.length === 0) {
      return;
    }

    // IMPORTANT: Only load details if we don't already have this evaluation selected
    // This prevents re-loading when evaluationHistory updates from subscriptions
    if (selectedTest?.id === evaluationId) {
      return;
    }

    // Load evaluation details
    const test = evaluationHistory.find(t => t.id === evaluationId);
    if (test) {
      loadEvaluationDetails(test);
    } else {
      // Evaluation not found, go back to list after a short delay to avoid race conditions
      setTimeout(() => {
        if (aiSystem) {
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

      // Calculate checkpoint-aware percentage if checkpoint state exists
      const percentage = test.checkpointState
        ? calculateCheckpointPercentage(test.checkpointState)
        : (test.progress?.percentage || 0);

      console.log('[loadEvaluationDetails] Setting progress for test:', test.id, {
        hasCheckpointState: !!test.checkpointState,
        checkpointState: test.checkpointState,
        policies: test.checkpointState?.policies,
        percentage
      });

      // WORKAROUND: If checkpoint_state doesn't have policies, fetch from evaluation config
      let policies = test.checkpointState?.policies || [];

      if (policies.length === 0 && test.config) {
        // Extract guardrail IDs from config
        const guardrailIds = (test.config as any).guardrailIds || (test.config as any).policyIds || [];

        if (guardrailIds.length > 0) {
          console.log('[loadEvaluationDetails] Fetching guardrails as workaround:', guardrailIds);

          try {
            // Fetch guardrails from database
            const { data: guardrails, error } = await supabase
              .from('guardrails')
              .select('id, name')
              .in('id', guardrailIds);

            if (!error && guardrails) {
              // Construct temporary policy objects
              policies = guardrails.map((g: { id: string; name: string }) => ({
                id: g.id,
                name: g.name,
                current: test.progress?.current || 0,
                total: test.progress?.total || 0,
                status: (test.status === 'pending' ? 'pending' : 'in_progress') as 'pending' | 'in_progress' | 'completed'
              }));

              console.log('[loadEvaluationDetails] Created temporary policies:', policies);
            }
          } catch (error) {
            console.error('[loadEvaluationDetails] Failed to fetch guardrails:', error);
          }
        }
      }

      setEvaluationProgress({
        stage: test.currentStage || (test.status === 'pending' ? 'Setting up test environment and preparing the prompts' : 'Running Evaluation'),
        current: test.progress?.current || 0,
        total: test.progress?.total || 100,
        message: test.progress?.currentPrompt || '',
        percentage,
        currentCheckpoint: test.checkpointState?.current_checkpoint || null,
        checkpoints: test.checkpointState?.checkpoints,
        policies
      });
      setLoadingProgress(false);
    } else if (test.status === 'completed') {
      try {
        // Set loading state before fetching results
        setLoadingResults(true);
        setEvaluationResults(null);

        // Service already returns BaseEvaluationOutput with transformed data
        const evaluationOutput = await EvaluationService.getEvaluationResults(test.id);

        setEvaluationResults(evaluationOutput);
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
          message: progress.currentPrompt || '',
          percentage: progress.percentage || 0,
          currentCheckpoint: progress.currentCheckpoint || null,
          checkpoints: progress.checkpoints,
          policies: progress.policies || []
        });

        setSelectedTest(prev => prev ? {
          ...prev,
          status: progress.status as any,
          currentStage: progress.currentStage,
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
                currentStage: progress.currentStage,
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
    const validation = validateModelAssignments();
    if (!validation.valid) {
      alert(`Please configure model assignments in Settings → Internal Models.\n\nMissing assignments for:\n- ${validation.missing.join('\n- ')}`);
      return;
    }

    if (!aiSystem) return;

    try {
      // Close creation flow
      setShowCreationFlow(false);

      // Create the evaluation in backend - this now returns immediately with evaluation ID
      const result = await EvaluationService.createEvaluation(data, aiSystem.id);

      // Navigate to the evaluation URL IMMEDIATELY
      // The backend will generate prompts in the background
      navigate(`/ai-systems/${toUrlSlug(aiSystem.name)}/evaluation/${result.evaluationId}`);

      // Reload history in background to get the new evaluation
      // Real-time subscriptions will handle updates as prompts are generated
      reloadHistory();

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
    if (aiSystem) {
      const url = `/ai-systems/${toUrlSlug(aiSystem.name)}/evaluation/${test.id}/summary`;
      navigate(url);
    }
  }, [aiSystem, navigate]);

  const handleShowProgress = useCallback((test: EvaluationTest) => {
    if (aiSystem) {
      const url = `/ai-systems/${toUrlSlug(aiSystem.name)}/evaluation/${test.id}`;
      navigate(url);
    }
  }, [aiSystem, navigate]);

  const handleTestDetails = useCallback((test: EvaluationTest) => {
    if (aiSystem) {
      const url = `/ai-systems/${toUrlSlug(aiSystem.name)}/evaluation/${test.id}`;
      navigate(url);
    }
  }, [aiSystem, navigate]);

  const handleViewData = useCallback((_test: EvaluationTest) => {
    // Placeholder for viewing data
  }, []);

  const handleDeleteRequest = useCallback((test: EvaluationTest) => {
    setEvaluationToDelete(test);
    setIsDeleteDialogOpen(true);
  }, []);

  // Filter evaluation history based on search query
  const filteredEvaluationHistory = evaluationHistory.filter((test) =>
    test.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle row selection
  const handleRowSelect = useCallback((id: string, selected: boolean) => {
    setSelectedRows(prev =>
      selected
        ? [...prev, id]
        : prev.filter(rowId => rowId !== id)
    )
  }, []);

  // Handle select all
  const handleSelectAll = useCallback((selected: boolean) => {
    setSelectedRows(selected ? evaluationHistory.map(test => test.id) : [])
  }, [evaluationHistory]);

  const handleDeleteConfirm = async () => {
    try {
      if (isBulkDelete) {
        // Bulk delete: delete all selected evaluations
        if (selectedRows.length === 0) return;

        await Promise.all(
          selectedRows.map(id => EvaluationService.deleteEvaluation(id))
        );

        // If we're viewing one of the deleted evaluations, navigate back to list
        if (selectedTest && selectedRows.includes(selectedTest.id)) {
          setSelectedTest(null);
          setEvaluationResults(null);
          if (aiSystem) {
            navigate(`/ai-systems/${toUrlSlug(aiSystem.name)}/evaluation`);
          }
        }

        // Clear selection
        setSelectedRows([]);
      } else {
        // Single delete
        if (!evaluationToDelete) return;

        await EvaluationService.deleteEvaluation(evaluationToDelete.id);

        // If we're viewing the deleted evaluation, navigate back to list
        if (selectedTest?.id === evaluationToDelete.id) {
          setSelectedTest(null);
          setEvaluationResults(null);
          if (aiSystem) {
            navigate(`/ai-systems/${toUrlSlug(aiSystem.name)}/evaluation`);
          }
        }
      }

      // Reload evaluation history to update the table
      await reloadHistory();

      // Close dialog and reset state
      setIsDeleteDialogOpen(false);
      setEvaluationToDelete(null);
      setIsBulkDelete(false);
    } catch (error) {
      console.error('Failed to delete evaluation(s):', error);
      alert(`Failed to delete evaluation(s): ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false);
    setEvaluationToDelete(null);
    setIsBulkDelete(false);
  };

  // Bulk action handlers
  const handleBulkDelete = () => {
    if (selectedRows.length === 0) return;

    // Open the delete dialog in bulk mode
    setIsBulkDelete(true);
    setIsDeleteDialogOpen(true);
  };

  const handleBulkDownload = () => {
    if (selectedRows.length === 0) return;

    // Get selected evaluations
    const selectedEvaluations = evaluationHistory.filter(test =>
      selectedRows.includes(test.id)
    );

    // Export to CSV
    const filename = aiSystem
      ? `${toUrlSlug(aiSystem.name)}-evaluations-${new Date().toISOString().split('T')[0]}.csv`
      : `evaluations-${new Date().toISOString().split('T')[0]}.csv`;

    exportEvaluationsToCSV(selectedEvaluations, filename);
  };

  const handleClearSelection = () => {
    setSelectedRows([]);
  };

  // Define bulk actions
  const bulkActions: BulkAction[] = [
    {
      key: 'download',
      label: 'Download',
      icon: <Download className="h-4 w-4" />,
      variant: 'outline',
      onClick: handleBulkDownload
    },
    {
      key: 'delete',
      label: 'Delete',
      icon: <Trash2 className="h-4 w-4" />,
      variant: 'destructive',
      onClick: handleBulkDelete
    }
  ];

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
      a.download = `evaluation-${evaluationResults.evaluation_id}.json`;
      a.click();
    } else if (format === 'csv') {
      // Use strategy to get export fields
      const strategy = getEvaluationStrategy(evaluationResults.test_type);
      const exportFields = strategy.getExportFields();

      // Extract headers
      const headers = exportFields.map(field => field.label);

      // Extract rows using strategy's getValue functions
      const rows = evaluationResults.results.map(result =>
        exportFields.map(field => {
          const value = field.getValue(result);
          return value !== null && value !== undefined ? String(value) : '';
        })
      );

      // Escape CSV cells properly
      const escapeCsvCell = (cell: string) => {
        // Replace double quotes with two double quotes and wrap in quotes if contains comma, quote, or newline
        if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
          return `"${cell.replace(/"/g, '""')}"`;
        }
        return cell;
      };

      const csvContent = [
        headers.map(escapeCsvCell).join(','),
        ...rows.map(row => row.map(escapeCsvCell).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `evaluation-${evaluationResults.evaluation_id}.csv`;
      a.click();
    }
  };

  // Breadcrumb configuration
  const breadcrumbs: BreadcrumbItem[] = [
    { name: "AI Systems", path: "/ai-systems" },
  ];

  // Remove action buttons from AppBar - button is now in the header
  const actionButtons: AppBarActionButton[] = [];

  if (!aiSystem && !systemName) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Breadcrumb App Bar */}
      <AppBar
        variant="breadcrumb"
        breadcrumbs={breadcrumbs}
        currentSection={{
          name: aiSystem?.name || systemName || "",
          dropdownOptions: !aiSystemsLoading && aiSystems.length > 1 ? aiSystems.map(system => ({
            id: system.id,
            name: system.name,
            isActive: system.id === aiSystem?.id
          })) : undefined,
          onDropdownSelect: (systemId) => {
            const selectedSystem = aiSystems.find(s => s.id === systemId);
            if (selectedSystem) {
              navigate(`/ai-systems/${toUrlSlug(selectedSystem.name)}/evaluation`);
            }
          }
        }}
        actionButtons={actionButtons}
      />

      {/* Main Content */}
      <main className="flex-1 border rounded-lg shadow m-2 mt-0 bg-gray-0">
        <div className="flex flex-col h-full">
          {/* Show loading state until initialization completes */}
          {!initialized ? (
            <div className="space-y-3 py-3">
              {/* Header Skeleton */}
              <div className="px-4">
                <Skeleton className="h-8 w-48" />
              </div>

              {/* Filters Skeleton */}
              <div className="px-4">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-9 w-32" />
                  <Skeleton className="h-9 w-32" />
                  <Skeleton className="h-9 flex-1 max-w-md ml-auto" />
                </div>
              </div>

              {/* Table Skeleton */}
              <div className="px-4">
                <div className="space-y-3">
                  {/* Table Header */}
                  <Skeleton className="h-10 w-full" />

                  {/* Table Rows */}
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Show creation flow as new page only when no evaluations exist */}
              {showCreationFlow && creationFlowVariant === "onboarding" && !hasEvaluations && aiSystem ? (
                <EvaluationCreationFlow
                  variant={creationFlowVariant}
                  onComplete={handleEvaluationCreated}
                  onCancel={handleCancelCreation}
                  aiSystemId={aiSystem.id}
                  guardrails={guardrails}
                />
              ) : hasEvaluations ? (
                /* Show evaluation history table when evaluations exist */
                <div className="space-y-3 py-3">
                  {/* Page Header with New Evaluation button */}
                  <EvaluationHistoryHeader
                    onNewEvaluation={handleCreateEvaluation}
                  />

                  {/* Evaluation Summary Section - Aggregated metrics across all evaluations */}
                  <EvaluationSummarySection
                    evaluations={evaluationHistory}
                    aiSystemName={aiSystem?.name}
                  />

                  {/* Evaluation Table */}
                  <EvaluationHistoryTableDirect
                    data={evaluationHistory}
                    selectedRows={selectedRows}
                    onRowSelect={handleRowSelect}
                    onSelectAll={handleSelectAll}
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
      <AnimatePresence>
        {showCreationFlow && creationFlowVariant === "overlay" && (
          <motion.div
            className="fixed inset-0 z-50 bg-gray-0 flex flex-col m-1.5 rounded-lg border shadow-sm overflow-hidden"
            initial={{ opacity: 0.8, scaleY: 0.98 }}
            animate={{ opacity: 1, filter: "none", scaleY: 1 }}
            exit={{ opacity: 0, filter: "blur(10px)", scaleY: 0.98 }}
            transition={{ duration: 0.15, ease:easeInOut }}
            onWheel={(e) => e.stopPropagation()}
          >
            <OverlayHeader
              title="New Evaluation"
              onClose={handleCancelCreation}
            />
            <div className="flex-1 overflow-auto">
              {aiSystem && (
                <EvaluationCreationFlow
                  variant="onboarding"
                  onComplete={handleEvaluationCreated}
                  onCancel={handleCancelCreation}
                  aiSystemId={aiSystem.id}
                  guardrails={guardrails}
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading progress overlay - shown when clicking on existing running test */}
      <AnimatePresence>
        {loadingProgress && selectedTest && (
          <motion.div
            className="fixed inset-0 z-50 bg-gray-0 flex flex-col m-1.5 rounded-lg border shadow-sm overflow-hidden"
            initial={{ opacity: 0.8, scaleY: 0.98 }}
            animate={{ opacity: 1, filter: "none", scaleY: 1 }}
            exit={{ opacity: 0, filter: "blur(10px)", scaleY: 0.98 }}
            transition={{ duration: 0.15, ease: "easeInOut" }}
            onWheel={(e) => e.stopPropagation()}
          >
            <OverlayHeader
              title={selectedTest.name}
              breadcrumbs={aiSystem?.name ? [{ label: aiSystem.name }] : undefined}
              titleDropdownOptions={evaluationHistory.length > 1 ? evaluationHistory.map(test => ({
                id: test.id,
                label: test.name,
                isActive: test.id === selectedTest.id,
              })) : undefined}
              onTitleDropdownSelect={(evaluationId) => {
                const evaluation = evaluationHistory.find(e => e.id === evaluationId);
                if (evaluation && aiSystem) {
                  navigate(`/ai-systems/${toUrlSlug(aiSystem.name)}/evaluation/${evaluationId}`);
                }
              }}
              onMinimize={handleMinimize}
            />
            <div className="flex-1 flex items-center justify-center">
              <div className="space-y-4 w-full max-w-md px-8">
                <Skeleton className="h-6 w-48 mx-auto" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4 mx-auto" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Running evaluation progress overlay - shown for pending/running tests or temp test */}
      <AnimatePresence>
        {!loadingProgress && selectedTest && (selectedTest.status === 'running' || selectedTest.status === 'pending') && (
          <motion.div
            className="fixed inset-0 z-50 bg-gray-0 flex flex-col m-1.5 rounded-lg border shadow-sm overflow-hidden"
            initial={{ opacity: 0.8, scaleY: 0.98 }}
            animate={{ opacity: 1, filter: "none", scaleY: 1 }}
            exit={{ opacity: 0, filter: "blur(10px)", scaleY: 0.98 }}
            transition={{ duration: 0.15, ease: "easeInOut" }}
            onWheel={(e) => e.stopPropagation()}
          >
            {PROGRESS_VIEW_VARIANT === 'unified' ? (
              /* Unified view - Same UI as results with Summary/Data tabs */
              <EvaluationResults
                results={{
                  evaluation_id: selectedTest.id,
                  test_type: selectedTest.type as 'jailbreak' | 'compliance' | 'hallucination',
                  timestamp: selectedTest.createdAt,
                  summary: {} as any, // Empty summary during progress
                  results: [], // Empty results during progress (will be populated via real-time)
                  config: {} as any,
                  topic_analysis: undefined
                }}
                evaluationName={selectedTest.name}
                evaluationType={selectedTest.type === 'compliance' ? 'Compliance' : selectedTest.type === 'hallucination' ? 'Hallucination' : 'Jailbreak'}
                aiSystemName={aiSystem?.name}
                aiSystemIcon={aiSystem?.icon}
                startedAt={selectedTest.startedAt}
                completedAt={undefined}
                onClose={handleMinimize}
                currentTab={view || 'summary'}
                onExport={handleExport}
                availableTests={evaluationHistory}
                availableAISystems={aiSystems}
                currentTestId={selectedTest.id}
                currentAISystemId={aiSystem?.id}
                onTestChange={(testId) => {
                  const test = evaluationHistory.find(t => t.id === testId);
                  if (test && aiSystem) {
                    navigate(`/ai-systems/${toUrlSlug(aiSystem.name)}/evaluation/${testId}/${view || 'summary'}`);
                  }
                }}
                onAISystemChange={(systemId) => {
                  const system = aiSystems.find(s => s.id === systemId);
                  if (system && selectedTest) {
                    navigate(`/ai-systems/${toUrlSlug(system.name)}/evaluation/${selectedTest.id}/${view || 'summary'}`);
                  }
                }}
                evaluationStatus={selectedTest.status as 'pending' | 'running'}
                evaluationProgress={{
                  current: evaluationProgress.current,
                  total: evaluationProgress.total,
                  stage: evaluationProgress.stage,
                  message: evaluationProgress.message,
                  startedAt: selectedTest.startedAt,
                  percentage: evaluationProgress.percentage,
                  currentCheckpoint: evaluationProgress.currentCheckpoint,
                  checkpoints: evaluationProgress.checkpoints,
                  policies: evaluationProgress.policies
                }}
              />
            ) : (
              /* Old progress views */
              <>
                <OverlayHeader
                  title={selectedTest.name}
                  breadcrumbs={aiSystem?.name ? [{ label: aiSystem.name }] : undefined}
                  titleDropdownOptions={evaluationHistory.length > 1 ? evaluationHistory.map(test => ({
                    id: test.id,
                    label: test.name,
                    isActive: test.id === selectedTest.id,
                  })) : undefined}
                  onTitleDropdownSelect={(evaluationId) => {
                    const evaluation = evaluationHistory.find(e => e.id === evaluationId);
                    if (evaluation && aiSystem) {
                      navigate(`/ai-systems/${toUrlSlug(aiSystem.name)}/evaluation/${evaluationId}`);
                    }
                  }}
                  onMinimize={handleMinimize}
                />
                <div className="flex-1 overflow-auto">
                  {PROGRESS_VIEW_VARIANT === 'table' ? (
                    <EvaluationTableProgress
                      evaluationId={selectedTest.id}
                      evaluationType={selectedTest.type as 'jailbreak' | 'compliance' | 'hallucination'}
                      aiSystemName={aiSystem?.name}
                      aiSystemIcon={aiSystem?.icon}
                      evaluationName={selectedTest.name}
                      startedAt={selectedTest.startedAt}
                      stage={evaluationProgress.stage}
                      current={evaluationProgress.current}
                      total={evaluationProgress.total}
                      message={evaluationProgress.message}
                    />
                  ) : (
                    <EvaluationInProgress
                      stage={evaluationProgress.stage}
                      current={evaluationProgress.current}
                      total={evaluationProgress.total}
                      message={evaluationProgress.message}
                      percentage={evaluationProgress.percentage}
                      aiSystemName={aiSystem?.name}
                      aiSystemIcon={aiSystem?.icon}
                      evaluationName={selectedTest.name}
                      evaluationType={selectedTest.type === 'compliance' ? 'Compliance Evaluation' : 'Jailbreak Evaluation'}
                      startedAt={selectedTest.startedAt}
                      attacks={[
                        {
                          id: '1',
                          name: 'Attack 1',
                          temperature: 1,
                          status: 'in-progress',
                          progress: 50,
                          currentStage: 'Evaluate Output Guardrails',
                          substages: [
                            { id: '1-1', name: 'Evaluate Input Guardrails', status: 'completed' },
                            { id: '1-2', name: 'Call AI System', status: 'completed' },
                            { id: '1-3', name: 'Evaluate Output Guardrails', status: 'in-progress' },
                            { id: '1-4', name: 'Judge Model Evaluation', status: 'pending' },
                            { id: '1-5', name: 'Determine Attack Outcome', status: 'pending' },
                            { id: '1-6', name: 'Save Results', status: 'pending' }
                          ]
                        },
                        {
                          id: '2',
                          name: 'Attack 2',
                          temperature: 0.50,
                          status: 'in-progress',
                          progress: 33,
                          currentStage: 'Call AI System',
                          substages: [
                            { id: '2-1', name: 'Evaluate Input Guardrails', status: 'completed' },
                            { id: '2-2', name: 'Call AI System', status: 'in-progress' },
                            { id: '2-3', name: 'Evaluate Output Guardrails', status: 'pending' },
                            { id: '2-4', name: 'Judge Model Evaluation', status: 'pending' },
                            { id: '2-5', name: 'Determine Attack Outcome', status: 'pending' },
                            { id: '2-6', name: 'Save Results', status: 'pending' }
                          ]
                        }
                      ]}
                    />
                  )}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Evaluation results overlay - shows loading or results */}
      <AnimatePresence mode="wait">
        {(loadingResults || evaluationResults) && selectedTest?.status !== 'running' && selectedTest?.status !== 'pending' && selectedTest && (
          <motion.div
            key="results-overlay"
            className="fixed inset-0 z-50 bg-gray-0 flex flex-col m-1.5 rounded-lg border shadow-sm overflow-hidden"
            initial={{ opacity: 0.8, scaleY: 0.98 }}
            animate={{ opacity: 1, filter: "none", scaleY: 1 }}
            exit={{ opacity: 0, filter: "blur(10px)", scaleY: 0.98 }}
            transition={{ duration: 0.15, ease: "easeInOut" }}
            onWheel={(e) => e.stopPropagation()}
          >
            {loadingResults ? (
              /* Loading State */
              <>
                <OverlayHeader
                  title={
                    <div className="flex items-center gap-3 text-sm font-450">
                      {/* AI System Name */}
                      {aiSystem?.name && (
                        <div className="flex items-center gap-1">
                          <span className="max-w-[200px] truncate text-sm font-450 text-gray-900">
                            {aiSystem.name}
                          </span>
                        </div>
                      )}

                      {/* Separator */}
                      {aiSystem?.name && (
                        <span className="text-gray-400">/</span>
                      )}

                      {/* Test/Evaluation Name with Badge and Dropdown */}
                      {selectedTest && (
                        <div className="flex items-center gap-2">
                         
                          {evaluationHistory.length > 1 && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                 <div className="flex items-center gap-1">
                            <span className="max-w-[200px] truncate text-sm font-450 text-gray-900">
                              {selectedTest.name}
                            </span>
                            <Badge variant="secondary" className="text-xs ml-1">
                              {selectedTest.type === 'compliance' ? 'Compliance' : 'Jailbreak'}
                            </Badge>
                            <button className="p-0.5 hover:bg-gray-100 rounded transition-colors">
                                  <ChevronsUpDown className="h-3.5 w-3.5 text-gray-500" />
                                </button>
                          </div>
                                
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="start" className="w-[320px] p-0">
                                {/* Search Box */}
                                <div className="p-2 border-b border-gray-200">
                                  <div className="relative">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                                    <Input
                                      type="text"
                                      placeholder="Search evaluations..."
                                      value={searchQuery}
                                      onChange={(e) => setSearchQuery(e.target.value)}
                                      className="pl-8 h-9 text-sm"
                                    />
                                  </div>
                                </div>

                                {/* Scrollable List */}
                                <div className="max-h-[300px] overflow-y-auto">
                                  {filteredEvaluationHistory.length > 0 ? (
                                    filteredEvaluationHistory.map((test) => (
                                      <DropdownMenuItem
                                        key={test.id}
                                        onClick={() => {
                                          if (aiSystem) {
                                            navigate(`/ai-systems/${toUrlSlug(aiSystem.name)}/evaluation/${test.id}/${view || 'summary'}`);
                                          }
                                          setSearchQuery("");
                                        }}
                                        className={`px-3 py-2.5 ${selectedTest.id === test.id ? 'bg-gray-100 font-medium' : ''}`}
                                      >
                                        <div className="flex flex-col gap-0.5 w-full">
                                          <span className="text-sm font-450">{test.name}</span>
                                          <span className="text-xs text-gray-500">
                                            {test.type || 'jailbreak'} • {test.status} • {new Date(test.createdAt).toLocaleDateString()}
                                          </span>
                                        </div>
                                      </DropdownMenuItem>
                                    ))
                                  ) : (
                                    <div className="px-3 py-6 text-center text-sm text-gray-500">
                                      No evaluations found
                                    </div>
                                  )}
                                </div>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      )}

                      {/* Separator */}
                      <span className="text-gray-400">/</span>

                      {/* Tab Skeleton */}
                      <Skeleton className="h-8 w-32 rounded-full" />
                    </div>
                  }
                  onClose={handleMinimize}
                />
                <div className="flex-1 flex items-center justify-center">
                  <div className="space-y-4 w-full max-w-2xl px-8">
                    <Skeleton className="h-8 w-64 mx-auto" />
                    <div className="grid grid-cols-3 gap-4 pt-4">
                      <Skeleton className="h-24 w-full" />
                      <Skeleton className="h-24 w-full" />
                      <Skeleton className="h-24 w-full" />
                    </div>
                    <Skeleton className="h-64 w-full mt-4" />
                  </div>
                </div>
              </>
            ) : evaluationResults ? (
              /* Results Content */
              <EvaluationResults
                results={evaluationResults}
                evaluationName={selectedTest?.name}
                evaluationType={selectedTest?.type === 'compliance' ? 'Compliance' : 'Jailbreak'}
                aiSystemName={aiSystem?.name}
                aiSystemIcon={aiSystem?.icon}
                startedAt={selectedTest?.startedAt}
                completedAt={selectedTest?.completedAt}
                onClose={handleMinimize}
                currentTab={view || 'summary'}
                onExport={handleExport}
                // New props for test and system selection
                availableTests={evaluationHistory}
                availableAISystems={aiSystems}
                currentTestId={selectedTest?.id}
                currentAISystemId={aiSystem?.id}
                onTestChange={(testId) => {
                  const test = evaluationHistory.find(t => t.id === testId);
                  if (test && aiSystem) {
                    navigate(`/ai-systems/${toUrlSlug(aiSystem.name)}/evaluation/${testId}/${view || 'summary'}`);
                  }
                }}
                onAISystemChange={(systemId) => {
                  const system = aiSystems.find(s => s.id === systemId);
                  if (system && selectedTest) {
                    navigate(`/ai-systems/${toUrlSlug(system.name)}/evaluation/${selectedTest.id}/${view || 'summary'}`);
                  }
                }}
                evaluationStatus={selectedTest?.status as 'completed' | 'failed'}
                evaluationProgress={selectedTest?.progress ? {
                  current: selectedTest.progress.total,
                  total: selectedTest.progress.total,
                  stage: 'Completed',
                  message: '',
                  startedAt: selectedTest.startedAt,
                  percentage: 100,
                  currentCheckpoint: 'summary',
                  checkpoints: undefined,
                  policies: []
                } : undefined}
              />
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isBulkDelete ? 'Delete Evaluations' : 'Delete Evaluation'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isBulkDelete
                ? `Are you sure you want to delete ${selectedRows.length} evaluation${selectedRows.length > 1 ? 's' : ''}? This action cannot be undone.`
                : `Are you sure you want to delete "${evaluationToDelete?.name}"? This action cannot be undone.`
              }
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

      {/* Bulk Action Bar */}
      <BulkActionBar
        selectedCount={selectedRows.length}
        onClearSelection={handleClearSelection}
        actions={bulkActions}
      />
    </div>
  );
}