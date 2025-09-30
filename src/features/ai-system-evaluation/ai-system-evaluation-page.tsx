import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

// Components
import { AppBar } from "@/components/patterns";
import type { BreadcrumbItem, AppBarActionButton } from "@/components/patterns";
import { Plus } from "lucide-react";
import { EvaluationCreationFlow } from "./components";

// Types and services
import type { EvaluationCreationData } from "./types/evaluation-creation";

// AI Systems
import { AISystemsTableStorage, aiSystemsStorageConfig } from "@/features/ai-systems/lib";
import type { AISystem } from "@/features/ai-systems/types/types";

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

  const handleEvaluationCreated = (data: EvaluationCreationData) => {
    console.log("Evaluation created:", data);
    // TODO: Save evaluation data to storage
    setShowCreationFlow(false);
    setHasEvaluations(true);
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
      <main className="flex-1 border rounded-lg shadow m-2 mt-0 bg-gray-50">
        <div className="flex flex-col h-full">
          {showCreationFlow ? (
            /* Show creation flow */
            <EvaluationCreationFlow
              variant={creationFlowVariant}
              onComplete={handleEvaluationCreated}
              onCancel={handleCancelCreation}
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
