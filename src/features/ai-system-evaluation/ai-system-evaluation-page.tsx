import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

// Components
import { AppBar } from "@/components/patterns";
import type { BreadcrumbItem, AppBarActionButton } from "@/components/patterns";
import { Plus } from "lucide-react";
import { EvaluationCreationFlow, EvaluationInProgress, EvaluationResults } from "./components";

// Types and services
import type { EvaluationCreationData } from "./types/evaluation-creation";
import type { JailbreakEvaluationOutput } from "./types/jailbreak-evaluation";

// AI Systems
import { AISystemsTableStorage, aiSystemsStorageConfig } from "@/features/ai-systems/lib";
import type { AISystem } from "@/features/ai-systems/types/types";

// Jailbreak evaluation
import { runJailbreakEvaluation } from "./lib/jailbreak-runner";
import { loadPoliciesFromGuardrailIds } from "./lib/policy-converter";
import { validateModelAssignments } from "@/features/settings/lib/model-assignment-helper";
import type { Guardrail } from "@/types";

export function AISystemEvaluationPage() {
  const { systemName } = useParams<{ systemName: string }>();
  const navigate = useNavigate();

  // AI System state
  const [aiSystem, setAiSystem] = useState<AISystem | null>(null);
  const [loading, setLoading] = useState(true);

  // Evaluation management state
  const [hasEvaluations, setHasEvaluations] = useState(false);
  const [showCreationFlow, setShowCreationFlow] = useState(false);
  const [creationFlowVariant, setCreationFlowVariant] = useState<"onboarding" | "overlay">("onboarding");

  // Evaluation execution state
  const [isRunningEvaluation, setIsRunningEvaluation] = useState(false);
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
          // TODO: Load evaluations for this system and set hasEvaluations
          const hasExistingEvaluations = false; // For now, default to false
          setHasEvaluations(hasExistingEvaluations);

          // If no evaluations exist, show creation flow immediately
          if (!hasExistingEvaluations) {
            setShowCreationFlow(true);
            setCreationFlowVariant("onboarding");
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
  }, [systemName, navigate]);

  // Handler functions
  const handleCreateEvaluation = () => {
    if (hasEvaluations) {
      setCreationFlowVariant("overlay");
    } else {
      setCreationFlowVariant("onboarding");
    }
    setShowCreationFlow(true);
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

    setShowCreationFlow(false);
    setIsRunningEvaluation(true);

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
        }
      );

      setEvaluationResults(results);
      setHasEvaluations(true);
    } catch (error) {
      console.error('Evaluation failed:', error);
      alert(`Evaluation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsRunningEvaluation(false);
    }
  };

  const handleCancelCreation = () => {
    setShowCreationFlow(false);
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
          {showCreationFlow ? (
            /* Show creation flow */
            <EvaluationCreationFlow
              variant={creationFlowVariant}
              onComplete={handleEvaluationCreated}
              onCancel={handleCancelCreation}
              aiSystemId={aiSystem.id}
            />
          ) : isRunningEvaluation ? (
            /* Show evaluation in progress */
            <EvaluationInProgress
              stage={evaluationProgress.stage}
              current={evaluationProgress.current}
              total={evaluationProgress.total}
              message={evaluationProgress.message}
            />
          ) : evaluationResults ? (
            /* Show evaluation results */
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
          ) : hasEvaluations ? (
            /* Show evaluations list when evaluations exist */
            <div className="p-6">
              <p className="text-gray-600">Evaluation list will be shown here...</p>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}
