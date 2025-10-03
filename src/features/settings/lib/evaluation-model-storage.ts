import { SecureStorage } from '@/lib/storage/secure-storage';
import type { EvaluationModel } from '../types/evaluation-model';

const STORAGE_KEY = 'evaluation-models';

export class EvaluationModelStorage {
  /**
   * Load all evaluation models
   */
  static load(): EvaluationModel[] {
    const data = SecureStorage.getItem(STORAGE_KEY);
    if (!data) return [];

    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  /**
   * Save evaluation models
   */
  static save(models: EvaluationModel[]): void {
    SecureStorage.setItem(STORAGE_KEY, JSON.stringify(models));
  }

  /**
   * Add a new evaluation model
   */
  static add(model: Omit<EvaluationModel, 'id' | 'evaluationCount' | 'createdAt' | 'isActive'>): EvaluationModel {
    const models = this.load();

    const newModel: EvaluationModel = {
      ...model,
      id: crypto.randomUUID(),
      evaluationCount: 0,
      createdAt: new Date().toISOString(),
      isActive: true, // All models are active by default
    };

    models.push(newModel);
    this.save(models);

    return newModel;
  }

  /**
   * Update an evaluation model
   */
  static update(id: string, updates: Partial<EvaluationModel>): void {
    const models = this.load();
    const index = models.findIndex(m => m.id === id);

    if (index !== -1) {
      models[index] = { ...models[index], ...updates };
      this.save(models);
    }
  }

  /**
   * Delete an evaluation model
   */
  static delete(id: string): void {
    const models = this.load().filter(m => m.id !== id);
    this.save(models);
  }

  /**
   * Set active evaluation model
   */
  static setActive(id: string): void {
    const models = this.load();

    // Deactivate all models
    models.forEach(m => m.isActive = false);

    // Activate the selected model
    const model = models.find(m => m.id === id);
    if (model) {
      model.isActive = true;
    }

    this.save(models);
  }

  /**
   * Get active evaluation model
   */
  static getActive(): EvaluationModel | null {
    const models = this.load();
    return models.find(m => m.isActive) || null;
  }

  /**
   * Increment evaluation count for a model
   */
  static incrementEvaluationCount(id: string): void {
    const models = this.load();
    const model = models.find(m => m.id === id);

    if (model) {
      model.evaluationCount++;
      model.lastUsed = new Date().toISOString();
      this.save(models);
    }
  }
}
