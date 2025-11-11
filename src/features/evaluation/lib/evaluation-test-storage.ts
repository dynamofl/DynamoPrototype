import type { EvaluationTest, EvaluationTestStatus } from '../types/evaluation-test';

const STORAGE_KEY = 'evaluation_tests';

export class EvaluationTestStorage {
  /**
   * Load all evaluation tests from localStorage
   */
  static loadTests(): EvaluationTest[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        return [];
      }
      return JSON.parse(stored);
    } catch (error) {
      console.error('Failed to load evaluation tests:', error);
      return [];
    }
  }

  /**
   * Save evaluation tests to localStorage
   */
  static saveTests(tests: EvaluationTest[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tests));
    } catch (error) {
      console.error('Failed to save evaluation tests:', error);
      throw error;
    }
  }

  /**
   * Add a new evaluation test
   */
  static addTest(test: EvaluationTest): EvaluationTest {
    const tests = this.loadTests();
    tests.unshift(test); // Add to beginning for most recent first
    this.saveTests(tests);
    return test;
  }

  /**
   * Update an existing evaluation test
   */
  static updateTest(id: string, updates: Partial<EvaluationTest>): EvaluationTest | null {
    const tests = this.loadTests();
    const index = tests.findIndex(test => test.id === id);

    if (index === -1) {
      return null;
    }

    tests[index] = { ...tests[index], ...updates };
    this.saveTests(tests);
    return tests[index];
  }

  /**
   * Get a specific evaluation test by ID
   */
  static getTest(id: string): EvaluationTest | null {
    const tests = this.loadTests();
    return tests.find(test => test.id === id) || null;
  }

  /**
   * Delete an evaluation test
   */
  static deleteTest(id: string): boolean {
    const tests = this.loadTests();
    const filteredTests = tests.filter(test => test.id !== id);

    if (filteredTests.length === tests.length) {
      return false; // No test was deleted
    }

    this.saveTests(filteredTests);
    return true;
  }

  /**
   * Update test status
   */
  static updateTestStatus(
    id: string,
    status: EvaluationTestStatus,
    additionalUpdates?: Partial<EvaluationTest>
  ): EvaluationTest | null {
    const updates: Partial<EvaluationTest> = { status, ...additionalUpdates };

    if (status === 'completed') {
      updates.completedAt = new Date().toISOString();
    } else if (status === 'running' && !additionalUpdates?.startedAt) {
      updates.startedAt = new Date().toISOString();
    }

    return this.updateTest(id, updates);
  }

  /**
   * Update test progress
   */
  static updateTestProgress(
    id: string,
    current: number,
    total: number,
    currentPrompt?: string
  ): EvaluationTest | null {
    return this.updateTest(id, {
      progress: { current, total, currentPrompt }
    });
  }

  /**
   * Clear all evaluation tests
   */
  static clearAllTests(): void {
    localStorage.removeItem(STORAGE_KEY);
  }

  /**
   * Get tests by status
   */
  static getTestsByStatus(status: EvaluationTestStatus): EvaluationTest[] {
    const tests = this.loadTests();
    return tests.filter(test => test.status === status);
  }
}
