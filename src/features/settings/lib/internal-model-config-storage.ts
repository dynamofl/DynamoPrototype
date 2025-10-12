// Helper functions for Internal Model Configurations
// Uses the ModelAssignmentStorage to manage guardrail and judge model assignments

import { ModelAssignmentStorage } from './model-assignment-storage';
import { EvaluationModelStorage } from './evaluation-model-storage';
import type { EvaluationModel } from '../types/evaluation-model';

// Get the assigned model for input guardrails
export function getInputGuardrailModel(): EvaluationModel | null {
  const modelId = ModelAssignmentStorage.getAssignment('inputGuardrail');
  if (!modelId) return null;

  const models = EvaluationModelStorage.load();
  return models.find(m => m.id === modelId) || null;
}

// Get the assigned model for output guardrails
export function getOutputGuardrailModel(): EvaluationModel | null {
  const modelId = ModelAssignmentStorage.getAssignment('outputGuardrail');
  if (!modelId) return null;

  const models = EvaluationModelStorage.load();
  return models.find(m => m.id === modelId) || null;
}

// Get the assigned model for judge evaluation
export function getJudgeModel(): EvaluationModel | null {
  const modelId = ModelAssignmentStorage.getAssignment('judgeModel');
  if (!modelId) return null;

  const models = EvaluationModelStorage.load();
  return models.find(m => m.id === modelId) || null;
}

// Set the model for input guardrails
export function setInputGuardrailModel(modelId: string | null): void {
  ModelAssignmentStorage.updateAssignment('inputGuardrail', modelId);
}

// Set the model for output guardrails
export function setOutputGuardrailModel(modelId: string | null): void {
  ModelAssignmentStorage.updateAssignment('outputGuardrail', modelId);
}

// Set the model for judge evaluation
export function setJudgeModel(modelId: string | null): void {
  ModelAssignmentStorage.updateAssignment('judgeModel', modelId);
}

// Check if a model is configured for input guardrails
export function hasInputGuardrailModel(): boolean {
  return ModelAssignmentStorage.getAssignment('inputGuardrail') !== null;
}

// Check if a model is configured for output guardrails
export function hasOutputGuardrailModel(): boolean {
  return ModelAssignmentStorage.getAssignment('outputGuardrail') !== null;
}

// Check if a model is configured for judge evaluation
export function hasJudgeModel(): boolean {
  return ModelAssignmentStorage.getAssignment('judgeModel') !== null;
}
