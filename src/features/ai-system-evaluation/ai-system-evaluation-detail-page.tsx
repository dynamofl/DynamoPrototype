import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

// Components
import { AppBar } from "@/components/patterns";
import type { BreadcrumbItem } from "@/components/patterns";
import { Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EvaluationInProgress, EvaluationResults } from "./components";

// Hooks
import { useAISystemLoader } from "./hooks/useAISystemLoader";
import { useEvaluationHistory, mapSupabaseToEvaluationTests } from "./hooks/useEvaluationHistory";

// Types and services
import type { JailbreakEvaluationOutput } from "./types/jailbreak-evaluation";
import type { EvaluationTest } from "@/features/evaluation/types/evaluation-test";
import { EvaluationService } from "@/lib/supabase/evaluation-service";
import { toUrlSlug } from "@/lib/utils";

export function AISystemEvaluationDetailPage() {
  const { systemName, evaluationId, tab } = useParams<{
    systemName: string;
    evaluationId: string;
    tab?: string;
  }>();
  const navigate = useNavigate();

  // Load AI system
  const { aiSystem, loading: aiSystemLoading } = useAISystemLoader(systemName);

  // State for selected evaluation
  const [selectedTest, setSelectedTest] = useState<EvaluationTest | null>(null);
  const [evaluationResults, setEvaluationResults] = useState<JailbreakEvaluationOutput | null>(null);
  const [evaluationProgress, setEvaluationProgress] = useState({
    stage: '',
    current: 0,
    total: 0,
    message: ''
  });
  const [loading, setLoading] = useState(true);

  // Load specific evaluation on mount
  useEffect(() => {
    if (!aiSystem || !evaluationId || aiSystemLoading) {
      return;
    }

    const loadEvaluation = async () => {
      try {
        // Load evaluation history to get the specific test
        const supabaseHistory = await EvaluationService.getEvaluationsForAISystem(aiSystem.name);
        const history = mapSupabaseToEvaluationTests(supabaseHistory, aiSystem);
        const test = history.find(t => t.id === evaluationId);

        if (test) {
          setSelectedTest(test);

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
          // Evaluation not found, redirect to list
          navigate(`/ai-systems/${toUrlSlug(aiSystem.name)}/evaluation`);
        }
      } catch (error) {
        console.error('Failed to load evaluation:', error);
        navigate(`/ai-systems/${toUrlSlug(aiSystem.name)}/evaluation`);
      } finally {
        setLoading(false);
      }
    };

    loadEvaluation();
  }, [aiSystem?.name, evaluationId, aiSystemLoading, navigate]);

  // Subscribe to real-time evaluation progress updates
  useEffect(() => {
    if (!selectedTest || selectedTest.status !== 'running' || !evaluationId) {
      return;
    }

    // Subscribe to real-time updates
    const unsubscribe = EvaluationService.subscribeToEvaluation(
      selectedTest.id,
      async (progress) => {
        setEvaluationProgress({
          stage: progress.currentStage || 'Running evaluation',
          current: progress.completed,
          total: progress.total,
          message: progress.currentPrompt || ''
        });

        // Update the selected test
        setSelectedTest(prev => prev ? {
          ...prev,
          status: progress.status as any,
          progress: {
            current: progress.completed,
            total: progress.total,
            currentPrompt: progress.currentPrompt || ''
          }
        } : null);

        // If evaluation completed, reload the data
        if (progress.status === 'completed' || progress.status === 'failed') {
          if (aiSystem) {
            // Reload evaluation data
            const supabaseHistory = await EvaluationService.getEvaluationsForAISystem(aiSystem.name);
            const history = mapSupabaseToEvaluationTests(supabaseHistory, aiSystem);
            const updatedTest = history.find(t => t.id === selectedTest.id);

            if (updatedTest) {
              setSelectedTest(updatedTest);

              // Navigate back to list view to show completed status
              navigate(`/ai-systems/${toUrlSlug(aiSystem.name)}/evaluation`);
            }
          }
        }
      }
    );

    return () => {
      unsubscribe();
    };
  }, [selectedTest?.id, selectedTest?.status, aiSystem?.name, navigate]);

  // Handler functions
  const handleMinimize = () => {
    if (aiSystem) {
      // Navigate back to evaluation list
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
    { name: aiSystem?.name || "Loading...", path: aiSystem ? `/ai-systems/${toUrlSlug(aiSystem.name)}/evaluation` : "#" },
  ];

  if (loading || aiSystemLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <AppBar
          variant="breadcrumb"
          breadcrumbs={breadcrumbs}
          currentSection={{ name: "Loading...", badge: "Evaluation" }}
        />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">Loading evaluation...</p>
        </div>
      </div>
    );
  }

  if (!aiSystem || !selectedTest) {
    return null;
  }

  // Show running evaluation overlay
  if (selectedTest.status === 'running') {
    return (
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
    );
  }

  // Show results overlay
  if (evaluationResults) {
    return (
      <div className="fixed inset-0 z-50 bg-gray-0">
        <EvaluationResults
          results={evaluationResults}
          onClose={() => {
            if (aiSystem) {
              navigate(`/ai-systems/${toUrlSlug(aiSystem.name)}/evaluation`);
            }
          }}
          currentTab={tab || 'summary'}
          onExport={handleExport}
        />
      </div>
    );
  }

  return null;
}