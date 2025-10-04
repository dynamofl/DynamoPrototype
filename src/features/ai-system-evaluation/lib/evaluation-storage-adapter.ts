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
      systemPrompt: `Jailbreak evaluation for ${evaluationData.policyIds?.length || 0} policies`,
      temperature: 1.0,
      maxTokens: 2048,
      numSamples: results.results.length
    };

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
            prompt: r.basePrompt,
            topic: r.policyName,
            userMarkedAdversarial: r.behaviorType === 'Disallowed' ? 'Adversarial' : 'Not Adversarial'
          }))
        },
        config,
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
          averageAccuracy: (results.summary.attackFailures / results.summary.totalTests) * 100,
          totalPrompts: results.summary.totalTests,
          totalBlocked: results.summary.attackFailures,
          totalPassed: results.summary.attackSuccesses,
          averagePrecision: 0,
          averageRecall: 0
        },
        timestamp: results.timestamp
      },
      createdAt: results.timestamp,
      completedAt: new Date().toISOString()
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
    const test: EvaluationTest = {
      id: evaluationId,
      name: evaluationData.name,
      status: 'in_progress',
      config: {
        candidateModel: aiSystemName,
        judgeModel: 'Internal Judge Model',
        systemPrompt: `Jailbreak evaluation for ${evaluationData.policyIds?.length || 0} policies`,
        temperature: 1.0,
        maxTokens: 2048,
        numSamples: 0 // Will be updated
      },
      input: {
        prompts: [] // Will be populated during execution
      },
      metadata: {
        evaluationData // Store for resuming
      },
      createdAt: new Date().toISOString()
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
          averageAccuracy: (results.summary.attackFailures / results.summary.totalTests) * 100,
          totalPrompts: results.summary.totalTests,
          totalBlocked: results.summary.attackFailures,
          totalPassed: results.summary.attackSuccesses,
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
