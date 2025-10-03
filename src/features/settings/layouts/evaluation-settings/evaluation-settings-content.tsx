import { useState, useEffect } from 'react';
import { Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { PageHeader } from '@/components/patterns/ui-patterns/page-header';
import { EvaluationModelStorage } from '../../lib/evaluation-model-storage';
import { AddEvaluationModelSidepane } from '../../components/add-evaluation-model-sidepane';
import type { EvaluationModel, EvaluationModelFormData } from '../../types/evaluation-model';

export function EvaluationSettingsContent() {
  const [models, setModels] = useState<EvaluationModel[]>([]);
  const [showAddPane, setShowAddPane] = useState(false);

  // Load models on mount
  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = () => {
    const loadedModels = EvaluationModelStorage.load();
    setModels(loadedModels);
  };

  const handleAddModel = (data: EvaluationModelFormData) => {
    EvaluationModelStorage.add(data);
    loadModels();
  };

  const handleDeleteModel = (id: string) => {
    if (confirm('Are you sure you want to delete this evaluation model?')) {
      EvaluationModelStorage.delete(id);
      loadModels();
    }
  };

  const handleToggleActive = (id: string, currentlyActive: boolean) => {
    if (!currentlyActive) {
      EvaluationModelStorage.setActive(id);
      loadModels();
    }
  };

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case 'OpenAI':
        return 'bg-green-100 text-green-700';
      case 'Azure':
        return 'bg-blue-100 text-blue-700';
      case 'Anthropic':
        return 'bg-amber-100 text-amber-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6 py-3">
      {/* Header */}
      <PageHeader
        title="Internal Models"
        description="Manage models for running various internal task"
        actions={[
          {
            icon: Plus,
            label: 'Add Evaluation Model',
            onClick: () => setShowAddPane(true),
          }
        ]}
      />

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Where Models Are Used */}
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">Where Models Are Used</h3>
            <p className="text-xs text-gray-600 mb-4">
              Internal models power various evaluation and testing features
            </p>
          </div>

          <div className="space-y-3">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Prompt Generation</h4>
              <p className="text-xs text-gray-600">
                Generates base test prompts and adversarial variants using various attack techniques (DAN, TAP, IRIS, etc.)
              </p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Evaluation & Judgement</h4>
              <p className="text-xs text-gray-600">
                Evaluates guardrail effectiveness and judges whether AI system responses are blocked or answered
              </p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Test Execution</h4>
              <p className="text-xs text-gray-600">
                Runs comprehensive jailbreak tests and safety evaluations across your AI systems
              </p>
            </div>
          </div>
        </div>

        {/* Right Column - Available Models */}
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">Available Models</h3>
            <p className="text-xs text-gray-600 mb-4">
              {models.length === 0
                ? 'No models configured yet'
                : `${models.length} model${models.length > 1 ? 's' : ''} configured`}
            </p>
          </div>

          {models.length === 0 ? (
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <div className="max-w-sm mx-auto">
                <h3 className="text-sm font-medium text-gray-900 mb-2">No Evaluation Models</h3>
                <p className="text-xs text-gray-600 mb-4">
                  Add your first evaluation model to start running jailbreak evaluations
                </p>
                <Button onClick={() => setShowAddPane(true)} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Your First Model
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {models.map((model) => (
                <div
                  key={model.id}
                  className={`bg-gray-0 border rounded-lg p-4 transition-all ${
                    model.isActive
                      ? 'border-blue-500 ring-2 ring-blue-100'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-semibold text-gray-900">{model.name}</h3>
                        {model.isActive && (
                          <span className="flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="h-3 w-3" />
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600">{model.modelId}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteModel(model.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete model"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Model Info */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Provider</span>
                      <span className={`text-xs px-2 py-0.5 rounded ${getProviderColor(model.provider)}`}>
                        {model.provider}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Evaluations Run</span>
                      <span className="text-xs font-medium text-gray-900">{model.evaluationCount}</span>
                    </div>

                    {model.lastUsed && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Last Used</span>
                        <span className="text-xs text-gray-700">
                          {new Date(model.lastUsed).toLocaleDateString()}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                      <span className="text-xs font-medium text-gray-700">Use for Evaluations</span>
                      <Switch
                        checked={model.isActive}
                        onCheckedChange={() => handleToggleActive(model.id, model.isActive)}
                      />
                    </div>
                  </div>

                  {/* API Key Preview */}
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      API Key: {model.apiKey.slice(0, 8)}...{model.apiKey.slice(-4)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Model Sidepane */}
      <AddEvaluationModelSidepane
        open={showAddPane}
        onOpenChange={setShowAddPane}
        onSave={handleAddModel}
      />
    </div>
  );
}
