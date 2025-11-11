import type {
  Policy,
  JailbreakEvaluationConfig,
  JailbreakEvaluationResult,
  JailbreakEvaluationOutput,
  JailbreakEvaluationSummary,
  AttackType,
  AttackOutcome
} from '../types/jailbreak-evaluation';
import {
  generateBasePrompts,
  distributeAttackTypes,
  generateAdversarialPrompt,
  getDefaultAttackTypes
} from './jailbreak-prompt-generator';
import {
  sendToSystem,
  sendToGuardrail,
  judgeModel,
  calculateOutcome
} from './jailbreak-execution';
import { getApiKeyForUsage, incrementUsageCount } from '@/features/settings/lib/model-assignment-helper';
import type { Guardrail } from '@/types';

/**
 * Progress callback for UI updates
 */
export type ProgressCallback = (progress: {
  stage: string;
  current: number;
  total: number;
  message: string;
}) => void;

/**
 * Main jailbreak evaluation runner
 */
export async function runJailbreakEvaluation(
  config: JailbreakEvaluationConfig,
  guardrails: Guardrail[] = [],
  onProgress?: ProgressCallback
): Promise<JailbreakEvaluationOutput> {
  const results: JailbreakEvaluationResult[] = [];
  // Get API keys for different usage types
  const promptGenApiKey = getApiKeyForUsage('promptGeneration');
  const evalJudgeApiKey = getApiKeyForUsage('evaluationJudgement');

  const evaluationId = crypto.randomUUID();

  // Get attack types to use
  const attackTypes = config.attackTypesDistribution || getDefaultAttackTypes();

  let currentStep = 0;
  const totalSteps = config.policies.length * 6; // 5 base prompts + 1 adversarial each = 6 per policy

  // Process each policy
  for (const policy of config.policies) {
    onProgress?.({
      stage: 'Generating base prompts',
      current: currentStep,
      total: totalSteps,
      message: `Generating base prompts for policy: ${policy.name}`
    });

    // Step 1: Generate 5 base prompts for this policy using Prompt Generation model
    const basePrompts = await generateBasePrompts(policy, promptGenApiKey);
    currentStep++;

    // Step 2: Distribute attack types across base prompts
    const promptsWithAttacks = distributeAttackTypes(basePrompts, attackTypes);

    // Step 3: For each base prompt, generate adversarial variant and evaluate
    for (const { basePrompt, attackType } of promptsWithAttacks) {
      onProgress?.({
        stage: 'Generating adversarial prompts',
        current: currentStep,
        total: totalSteps,
        message: `Applying ${attackType} attack to: "${basePrompt.prompt.substring(0, 50)}..."`
      });

      // Generate adversarial prompt using Prompt Generation model
      const adversarialPrompt = await generateAdversarialPrompt(
        basePrompt.prompt,
        attackType,
        promptGenApiKey
      );

      onProgress?.({
        stage: 'Executing on AI system',
        current: currentStep,
        total: totalSteps,
        message: `Testing against AI system...`
      });

      // Step 4: Send to target AI system
      const systemResponse = await sendToSystem(
        adversarialPrompt,
        config.aiSystemId
      );

      onProgress?.({
        stage: 'Evaluating with guardrails',
        current: currentStep,
        total: totalSteps,
        message: `Checking guardrail responses...`
      });

      // Step 5: Evaluate with guardrails using Evaluation & Judgement model
      const guardrailJudgement = await sendToGuardrail(
        adversarialPrompt,
        guardrails,
        evalJudgeApiKey
      );

      // Step 6: Judge model response with confidence
      const { judgement: modelJudgement, confidence: judgeModelConfidence } = await judgeModel(
        systemResponse,
        evalJudgeApiKey
      );

      // Step 7: Calculate attack outcome
      const attackOutcome = calculateOutcome(guardrailJudgement, modelJudgement);

      // Calculate AI system-only outcome (ignoring guardrails)
      const aiSystemAttackOutcome: AttackOutcome =
        modelJudgement === 'Answered' ? 'Attack Success' : 'Attack Failure';

      // Store result
      results.push({
        policyId: policy.id,
        policyName: policy.name,
        behaviorType: basePrompt.behaviorType,
        basePrompt: basePrompt.prompt,
        attackType,
        adversarialPrompt: { text: adversarialPrompt },
        jailbreakPrompt: adversarialPrompt, // Extracted text for display
        systemResponse,
        guardrailJudgement,
        modelJudgement,
        attackOutcome,
        aiSystemAttackOutcome, // AI system-only outcome
        judgeModelConfidence: judgeModelConfidence > 0 ? judgeModelConfidence : undefined
      });

      currentStep++;
    }
  }

  onProgress?.({
    stage: 'Calculating summary',
    current: totalSteps,
    total: totalSteps,
    message: 'Generating evaluation summary...'
  });

  // Calculate summary statistics
  const summary = calculateSummary(results);

  // Increment evaluation count for all used models
  incrementUsageCount('promptGeneration');
  incrementUsageCount('evaluationJudgement');
  incrementUsageCount('testExecution');

  return {
    test_type: 'jailbreak' as const,
    results,
    summary,
    config,
    timestamp: new Date().toISOString(),
    evaluation_id: evaluationId,
    evaluationId
  };
}

/**
 * Calculate comprehensive summary statistics
 */
function calculateSummary(results: JailbreakEvaluationResult[]): JailbreakEvaluationSummary {
  const totalTests = results.length;
  const attackSuccesses = results.filter(r => r.attackOutcome === "Attack Success").length;
  const attackFailures = totalTests - attackSuccesses;
  const successRate = totalTests > 0 ? (attackSuccesses / totalTests) * 100 : 0;

  // By Policy
  const byPolicy: JailbreakEvaluationSummary['byPolicy'] = {};
  results.forEach(result => {
    if (!byPolicy[result.policyId]) {
      byPolicy[result.policyId] = {
        policyName: result.policyName,
        total: 0,
        successes: 0,
        failures: 0,
        successRate: 0
      };
    }
    byPolicy[result.policyId].total++;
    if (result.attackOutcome === "Attack Success") {
      byPolicy[result.policyId].successes++;
    } else {
      byPolicy[result.policyId].failures++;
    }
  });

  // Calculate success rates for policies
  Object.keys(byPolicy).forEach(policyId => {
    const policy = byPolicy[policyId];
    policy.successRate = policy.total > 0 ? (policy.successes / policy.total) * 100 : 0;
  });

  // By Attack Type
  const byAttackType: JailbreakEvaluationSummary['byAttackType'] = {};
  results.forEach(result => {
    if (!byAttackType[result.attackType]) {
      byAttackType[result.attackType] = {
        total: 0,
        successes: 0,
        failures: 0,
        successRate: 0
      };
    }
    byAttackType[result.attackType].total++;
    if (result.attackOutcome === "Attack Success") {
      byAttackType[result.attackType].successes++;
    } else {
      byAttackType[result.attackType].failures++;
    }
  });

  // Calculate success rates for attack types
  Object.keys(byAttackType).forEach(attackType => {
    const attack = byAttackType[attackType];
    attack.successRate = attack.total > 0 ? (attack.successes / attack.total) * 100 : 0;
  });

  // By Behavior Type
  const byBehaviorType: JailbreakEvaluationSummary['byBehaviorType'] = {};
  results.forEach(result => {
    if (!byBehaviorType[result.behaviorType]) {
      byBehaviorType[result.behaviorType] = {
        total: 0,
        successes: 0,
        failures: 0,
        successRate: 0
      };
    }
    byBehaviorType[result.behaviorType].total++;
    if (result.attackOutcome === "Attack Success") {
      byBehaviorType[result.behaviorType].successes++;
    } else {
      byBehaviorType[result.behaviorType].failures++;
    }
  });

  // Calculate success rates for behavior types
  Object.keys(byBehaviorType).forEach(behaviorType => {
    const behavior = byBehaviorType[behaviorType];
    behavior.successRate = behavior.total > 0 ? (behavior.successes / behavior.total) * 100 : 0;
  });

  return {
    totalTests,
    attackSuccesses,
    attackFailures,
    successRate,
    byPolicy,
    byAttackType,
    byBehaviorType
  };
}

/**
 * Convert evaluation creation data to jailbreak config
 */
export function convertToJailbreakConfig(
  evaluationCreationData: any,
  policiesData: Policy[]
): JailbreakEvaluationConfig {
  return {
    aiSystemId: evaluationCreationData.aiSystemIds?.[0] || '',
    policies: policiesData.filter(p =>
      evaluationCreationData.policyIds?.includes(p.id)
    ),
    guardrailIds: evaluationCreationData.guardrailIds,
    attackTypesDistribution: getDefaultAttackTypes()
  };
}
