import { ModelAssignmentStorage } from './model-assignment-storage';
import { EvaluationModelStorage } from './evaluation-model-storage';
import type { EvaluationModel, ModelAssignment } from '../types/evaluation-model';

/**
 * Get the model assigned for a specific usage type
 */
export function getModelForUsage(usageType: keyof ModelAssignment): EvaluationModel | null {
  const assignments = ModelAssignmentStorage.load();
  const modelId = assignments[usageType];

  if (!modelId) {
    return null;
  }

  const models = EvaluationModelStorage.load();
  return models.find(m => m.id === modelId) || null;
}

/**
 * Get API key for a specific usage type
 */
export function getApiKeyForUsage(usageType: keyof ModelAssignment): string {
  const model = getModelForUsage(usageType);

  if (!model) {
    throw new Error(`No model assigned for ${usageType}. Please configure model assignments in Settings → Internal Models.`);
  }

  return model.apiKey;
}

/**
 * Get model ID for a specific usage type
 */
export function getModelIdForUsage(usageType: keyof ModelAssignment): string {
  const model = getModelForUsage(usageType);

  if (!model) {
    throw new Error(`No model assigned for ${usageType}. Please configure model assignments in Settings → Internal Models.`);
  }

  return model.modelId;
}

/**
 * Check if all required model assignments are configured
 */
export function validateModelAssignments(): { valid: boolean; missing: string[] } {
  const assignments = ModelAssignmentStorage.load();
  const missing: string[] = [];

  if (!assignments.topicGeneration) {
    missing.push('Topic Generation');
  }

  if (!assignments.promptGeneration) {
    missing.push('Prompt Generation');
  }

  if (!assignments.evaluationJudgement) {
    missing.push('Evaluation & Judgement');
  }

  if (!assignments.testExecution) {
    missing.push('Test Execution');
  }

  return {
    valid: missing.length === 0,
    missing
  };
}

/**
 * Increment evaluation count for a specific usage type
 */
export function incrementUsageCount(usageType: keyof ModelAssignment): void {
  const model = getModelForUsage(usageType);

  if (model) {
    EvaluationModelStorage.incrementEvaluationCount(model.id);
  }
}
