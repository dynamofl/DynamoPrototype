// Internal Models Configuration Component
// Allows configuration of models used for guardrails and judge evaluation

import { ModelAssignmentCard } from './model-assignment-card';
import type { EvaluationModel, ModelAssignment } from '../types/evaluation-model';

interface InternalModelsConfigurationProps {
  models: EvaluationModel[];
  assignments: ModelAssignment;
  onAssignmentChange: (type: keyof ModelAssignment, modelId: string) => void;
}

export function InternalModelsConfiguration({
  models,
  assignments,
  onAssignmentChange
}: InternalModelsConfigurationProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Internal Models Configuration</h3>
        <p className="text-sm text-gray-500 mt-1">
          Configure the models used for evaluating guardrails and determining AI responses
        </p>
      </div>

      <div className="border border-gray-200 rounded-lg px-4">
        <ModelAssignmentCard
          title="Input Guardrail Model"
          description="Evaluates prompts for safety before sending to your AI system"
          selectedModelId={assignments.inputGuardrail}
          models={models}
          onModelChange={(value) => onAssignmentChange('inputGuardrail', value)}
        />

        <ModelAssignmentCard
          title="Output Guardrail Model"
          description="Evaluates AI responses for safety after generation"
          selectedModelId={assignments.outputGuardrail}
          models={models}
          onModelChange={(value) => onAssignmentChange('outputGuardrail', value)}
        />

        <ModelAssignmentCard
          title="Judge Model"
          description="Determines whether the AI answered or refused the user's question"
          selectedModelId={assignments.judgeModel}
          models={models}
          onModelChange={(value) => onAssignmentChange('judgeModel', value)}
          isLast={true}
        />
      </div>

      {/* Info Box */}
      <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">About Internal Models</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• <strong>Input Guardrail Model:</strong> Evaluates prompts for safety before sending to your AI system</li>
          <li>• <strong>Output Guardrail Model:</strong> Evaluates AI responses for safety after generation</li>
          <li>• <strong>Judge Model:</strong> Determines whether the AI answered or refused the user's question</li>
          <li>• <strong>Note:</strong> These models run independently and don't affect your main AI system</li>
        </ul>
      </div>
    </div>
  );
}
