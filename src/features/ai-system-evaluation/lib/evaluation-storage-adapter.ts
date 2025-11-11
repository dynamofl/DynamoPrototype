import { EvaluationTestStorage } from '@/features/evaluation/lib/evaluation-test-storage';
import type { EvaluationTest } from '@/features/evaluation/types/evaluation-test';
import type { JailbreakEvaluationOutput } from '../types/jailbreak-evaluation';
import type { EvaluationCreationData } from '../types/evaluation-creation';

/**
 * Adapter to convert and save jailbreak evaluations to the evaluation storage
 */
export class EvaluationStorageAdapter {
  /**
   * Save a jailbreak evaluation to storage
   */
  static saveJailbreakEvaluation(
    evaluationData: EvaluationCreationData,
    results: JailbreakEvaluationOutput,
    aiSystemName: string
  ): EvaluationTest {
    // Create config object first to avoid circular reference
    const config = {
      candidateModel: aiSystemName,
      judgeModel: 'Internal Judge Model', // From settings
      temperature: 1.0,
      maxLength: 2048,
      topP: 1.0
    };

    const now = new Date().toISOString();
    const test: EvaluationTest = {
      id: results.evaluationId,
      name: evaluationData.name,
      status: 'completed',
      config,
      input: {
        prompts: results.results.map(r => ({
          id: `prompt-${r.policyId}`,
          prompt: r.basePrompt,
          topic: r.policyName,
          userMarkedAdversarial: r.behaviorType === 'Disallowed' ? 'Adversarial' : 'Not Adversarial'
        }))
      },
      result: {
        input: {
          prompts: results.results.map(r => ({
            id: `prompt-${r.policyId}`,
            prompt: r.jailbreakPrompt, // Use extracted text from adversarial prompt
            topic: r.policyName,
            userMarkedAdversarial: r.behaviorType === 'Disallowed' ? 'Adversarial' : 'Not Adversarial'
          }))
        },
        config,
        promptResults: results.results.map(r => ({
          promptId: `prompt-${r.policyId}`,
          prompt: r.jailbreakPrompt, // Use extracted text from adversarial prompt
          topic: r.policyName,
          userMarkedAdversarial: r.behaviorType === 'Disallowed' ? 'Adversarial' : 'Not Adversarial',
          judgeDetectedAdversarial: r.guardrailJudgement === 'Blocked',
          candidateResponse: r.systemResponse,
          confusionMatrix: {
            tp: 0, tn: 0, fp: 0, fn: 0
          },
          localScores: {},
          // Store jailbreak-specific metadata
          metadata: {
            basePrompt: r.basePrompt,
            adversarialPrompt: r.adversarialPrompt,
            attackType: r.attackType,
            behaviorType: r.behaviorType,
            guardrailJudgement: r.guardrailJudgement,
            modelJudgement: r.modelJudgement,
            attackOutcome: r.attackOutcome
          }
        })),
        overallMetrics: {
          averageAccuracy: ((results.summary.attackFailures ?? 0) / (results.summary.totalTests ?? 1)) * 100,
          totalPrompts: results.summary.totalTests ?? 0,
          totalBlocked: results.summary.attackFailures ?? 0,
          totalPassed: results.summary.attackSuccesses ?? 0,
          averagePrecision: 0,
          averageRecall: 0
        },
        timestamp: results.timestamp
      },
      createdAt: results.timestamp,
      startedAt: results.timestamp, // Set start time when test begins
      completedAt: now, // Set completion time
      metadata: {
        evaluationData
        // Note: Complete jailbreak results are stored in the result field
      }
    };

    return EvaluationTestStorage.addTest(test);
  }

  /**
   * Create an in-progress test entry
   */
  static createInProgressTest(
    evaluationData: EvaluationCreationData,
    evaluationId: string,
    aiSystemName: string
  ): EvaluationTest {
    const now = new Date().toISOString();
    const test: EvaluationTest = {
      id: evaluationId,
      name: evaluationData.name,
      status: 'running',
      config: {
        candidateModel: aiSystemName,
        judgeModel: 'Internal Judge Model',
        temperature: 1.0,
        maxLength: 2048,
        topP: 1.0
      },
      input: {
        prompts: [] // Will be populated during execution
      },
      metadata: {
        evaluationData // Store for resuming
      },
      createdAt: now,
      startedAt: now // Set start time when test is created
    };

    return EvaluationTestStorage.addTest(test);
  }

  /**
   * Update test with results
   */
  static updateTestWithResults(
    testId: string,
    results: JailbreakEvaluationOutput
  ): EvaluationTest | null {
    const test = EvaluationTestStorage.getTest(testId);
    if (!test) return null;

    return EvaluationTestStorage.updateTestStatus(testId, 'completed', {
      result: {
        input: {
          prompts: results.results.map(r => ({
            id: `prompt-${r.policyId}`,
            prompt: r.basePrompt,
            topic: r.policyName,
            userMarkedAdversarial: r.behaviorType === 'Disallowed' ? 'Adversarial' : 'Not Adversarial'
          }))
        },
        config: test.config,
        promptResults: results.results.map(r => ({
          promptId: `prompt-${r.policyId}`,
          prompt: r.basePrompt,
          topic: r.policyName,
          userMarkedAdversarial: r.behaviorType === 'Disallowed' ? 'Adversarial' : 'Not Adversarial',
          judgeDetectedAdversarial: r.guardrailJudgement === 'Blocked',
          candidateResponse: r.systemResponse,
          confusionMatrix: {
            tp: 0, tn: 0, fp: 0, fn: 0
          },
          localScores: {}
        })),
        overallMetrics: {
          averageAccuracy: ((results.summary.attackFailures ?? 0) / (results.summary.totalTests ?? 1)) * 100,
          totalPrompts: results.summary.totalTests ?? 0,
          totalBlocked: results.summary.attackFailures ?? 0,
          totalPassed: results.summary.attackSuccesses ?? 0,
          averagePrecision: 0,
          averageRecall: 0
        },
        timestamp: results.timestamp
      },
      input: {
        prompts: results.results.map(r => ({
          id: `prompt-${r.policyId}`,
          prompt: r.basePrompt,
          topic: r.policyName,
          userMarkedAdversarial: r.behaviorType === 'Disallowed' ? 'Adversarial' : 'Not Adversarial'
        }))
      }
    });
  }

  /**
   * Get a test by ID
   */
  static getTest(testId: string): EvaluationTest | null {
    return EvaluationTestStorage.getTest(testId);
  }

  /**
   * Update test progress
   */
  static updateTestProgress(
    testId: string,
    current: number,
    total: number,
    currentPrompt?: string
  ): EvaluationTest | null {
    return EvaluationTestStorage.updateTestProgress(testId, current, total, currentPrompt);
  }

  /**
   * Load evaluation history for a specific AI system
   */
  static loadHistoryForAISystem(aiSystemName: string): EvaluationTest[] {
    const allTests = EvaluationTestStorage.loadTests();
    return allTests.filter(test => test.config.candidateModel === aiSystemName);
  }
}
