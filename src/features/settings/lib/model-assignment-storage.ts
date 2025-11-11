import type { ModelAssignment } from '../types/evaluation-model';

const STORAGE_KEY = 'model-assignments';

export class ModelAssignmentStorage {
  static load(): ModelAssignment {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      try {
        return JSON.parse(data);
      } catch {
        return {
          topicGeneration: null,
          promptGeneration: null,
          evaluationJudgement: null,
          testExecution: null,
          inputGuardrail: null,
          outputGuardrail: null,
          judgeModel: null,
          topicInsightModel: null,
        };
      }
    }
    return {
      topicGeneration: null,
      promptGeneration: null,
      evaluationJudgement: null,
      testExecution: null,
      inputGuardrail: null,
      outputGuardrail: null,
      judgeModel: null,
      topicInsightModel: null,
    };
  }

  static save(assignments: ModelAssignment): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(assignments));
  }

  static updateAssignment(type: keyof ModelAssignment, modelId: string | null): void {
    const assignments = this.load();
    assignments[type] = modelId;
    this.save(assignments);
  }

  static getAssignment(type: keyof ModelAssignment): string | null {
    const assignments = this.load();
    return assignments[type];
  }
}
