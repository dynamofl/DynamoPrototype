import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { PageHeader } from '@/components/patterns/ui-patterns/page-header';
import { EvaluationModelStorage } from '../../lib/evaluation-model-storage';
import { ModelAssignmentStorage } from '../../lib/model-assignment-storage';
import { AddEvaluationModelSidepane } from '../../components/add-evaluation-model-sidepane';
import { ModelAssignmentCard } from '../../components/model-assignment-card';
import type { EvaluationModel, EvaluationModelFormData, ModelAssignment } from '../../types/evaluation-model';

export function EvaluationSettingsContent() {
  const [models, setModels] = useState<EvaluationModel[]>([]);
  const [showAddPane, setShowAddPane] = useState(false);
  const [assignments, setAssignments] = useState<ModelAssignment>({
    topicGeneration: null,
    promptGeneration: null,
    evaluationJudgement: null,
    testExecution: null,
  });
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [modelToDelete, setModelToDelete] = useState<EvaluationModel | null>(null);

  // Load models and assignments on mount
  useEffect(() => {
    loadModels();
    loadAssignments();
  }, []);

  const loadModels = () => {
    const loadedModels = EvaluationModelStorage.load();
    setModels(loadedModels);
  };

  const loadAssignments = () => {
    const loadedAssignments = ModelAssignmentStorage.load();
    setAssignments(loadedAssignments);
  };

  const handleAddModel = (data: EvaluationModelFormData) => {
    EvaluationModelStorage.add(data);
    loadModels();
  };

  const handleDeleteModel = (model: EvaluationModel) => {
    setModelToDelete(model);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (modelToDelete) {
      EvaluationModelStorage.delete(modelToDelete.id);
      loadModels();
      setIsDeleteDialogOpen(false);
      setModelToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false);
    setModelToDelete(null);
  };

  const handleAssignmentChange = (type: keyof ModelAssignment, modelId: string) => {
    const newModelId = modelId === 'none' ? null : modelId;
    ModelAssignmentStorage.updateAssignment(type, newModelId);
    loadAssignments();
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
        title="Internal Models Usage"
        description="Manage and assign models for running various internal task"
      />

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 px-4">
        {/* Left Column - Where Models Are Used */}
        <div className="lg:col-span-2 space-y-4">
         

          <div className="border border-gray-200 rounded-lg px-4">
            <ModelAssignmentCard
              title="Topic Generation"
              description="Analyzes policies and generates test topics from allowed and disallowed behaviors"
              selectedModelId={assignments.topicGeneration}
              models={models}
              onModelChange={(value) => handleAssignmentChange('topicGeneration', value)}
            />

            <ModelAssignmentCard
              title="Prompt Generation"
              description="Generates base test prompts and adversarial variants using various attack techniques"
              selectedModelId={assignments.promptGeneration}
              models={models}
              onModelChange={(value) => handleAssignmentChange('promptGeneration', value)}
            />

            <ModelAssignmentCard
              title="Evaluation & Judgement"
              description="Evaluates guardrail effectiveness and judges whether AI system responses are blocked or answered"
              selectedModelId={assignments.evaluationJudgement}
              models={models}
              onModelChange={(value) => handleAssignmentChange('evaluationJudgement', value)}
            />

            <ModelAssignmentCard
              title="Test Execution"
              description="Runs comprehensive jailbreak tests and safety evaluations across your AI systems"
              selectedModelId={assignments.testExecution}
              models={models}
              onModelChange={(value) => handleAssignmentChange('testExecution', value)}
              isLast={true}
            />
          </div>
        </div>

        {/* Right Column - Available Models */}
        <div className="lg:col-span-1 space-y-2 bg-gray-50 px-2 py-4 rounded-lg h-fit">
          <div className="flex items-center justify-between px-2 pb-4 border-b border-gray-200">
            <div className='space-y-1'>
              <h3 className="text-sm font-450 text-gray-900">Available Internal Usage Models</h3>
             
            </div>
            {models.length > 0 &&
            <Button
              onClick={() => setShowAddPane(true)}
              className="flex items-center gap-1 pl-2"
              size="sm"
            >
              <Plus className="h-4 w-4" />
              Add Model
            </Button>}
          </div>

          {models.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <div className="max-w-sm mx-auto flex flex-col items-center justify-center">
                <h3 className="text-sm font-medium text-gray-900 mb-2">No Internal Usage Models</h3>
                <p className="text-xs text-gray-600 mb-4">
                  Add your first model for internal purposes
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
                  className="hover:bg-gray-100 rounded-lg p-2 transition-all"
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-[0.8125rem]  text-450 text-gray-900 mb-1">{model.name}</h3>
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <span>{model.provider}</span>
                        <span>•</span>
                        <span>{model.modelId}</span>
                        {model.lastUsed && (
                          <>
                            <span>•</span>
                            <span>Last Used: {new Date(model.lastUsed).toLocaleDateString()}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteModel(model)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete model"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Model Info */}
                  

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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Evaluation Model</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{modelToDelete?.name}"? This action cannot be undone.
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
