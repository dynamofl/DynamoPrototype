import type { JailbreakEvaluationResult, JailbreakEvaluationSummary } from '../types/jailbreak-evaluation'

export function calculateSummaryFromResults(results: JailbreakEvaluationResult[]): JailbreakEvaluationSummary {
  const totalTests = results.length
  const attackSuccesses = results.filter(r => r.attackOutcome === 'Attack Success').length
  const attackFailures = results.filter(r => r.attackOutcome === 'Attack Failure').length
  const successRate = totalTests > 0 ? (attackSuccesses / totalTests) * 100 : 0

  // NEW: Calculate AI system-only metrics
  const aiSystemOnlySuccesses = results.filter(r => r.aiSystemAttackOutcome === 'Attack Success').length
  const aiSystemOnlyFailures = results.filter(r => r.aiSystemAttackOutcome === 'Attack Failure').length
  const aiSystemOnlySuccessRate = totalTests > 0 ? (aiSystemOnlySuccesses / totalTests) * 100 : 0

  // Calculate by policy
  const byPolicy: JailbreakEvaluationSummary['byPolicy'] = {}
  results.forEach(result => {
    if (!byPolicy[result.policyId]) {
      byPolicy[result.policyId] = {
        policyName: result.policyName,
        total: 0,
        successes: 0,
        failures: 0,
        successRate: 0
      }
    }
    byPolicy[result.policyId].total++
    if (result.attackOutcome === 'Attack Success') {
      byPolicy[result.policyId].successes++
    } else {
      byPolicy[result.policyId].failures++
    }
  })

  // Calculate success rates for policies
  Object.keys(byPolicy).forEach(policyId => {
    const policy = byPolicy[policyId]
    policy.successRate = policy.total > 0 ? (policy.successes / policy.total) * 100 : 0
  })

  // Calculate by attack type
  const byAttackType: JailbreakEvaluationSummary['byAttackType'] = {}
  results.forEach(result => {
    if (!byAttackType[result.attackType]) {
      byAttackType[result.attackType] = {
        total: 0,
        successes: 0,
        failures: 0,
        successRate: 0
      }
    }
    byAttackType[result.attackType].total++
    if (result.attackOutcome === 'Attack Success') {
      byAttackType[result.attackType].successes++
    } else {
      byAttackType[result.attackType].failures++
    }
  })

  // Calculate success rates for attack types
  Object.keys(byAttackType).forEach(attackType => {
    const stats = byAttackType[attackType]
    stats.successRate = stats.total > 0 ? (stats.successes / stats.total) * 100 : 0
  })

  // Calculate by behavior type
  const byBehaviorType: JailbreakEvaluationSummary['byBehaviorType'] = {}
  results.forEach(result => {
    if (!byBehaviorType[result.behaviorType]) {
      byBehaviorType[result.behaviorType] = {
        total: 0,
        successes: 0,
        failures: 0,
        successRate: 0
      }
    }
    byBehaviorType[result.behaviorType].total++
    if (result.attackOutcome === 'Attack Success') {
      byBehaviorType[result.behaviorType].successes++
    } else {
      byBehaviorType[result.behaviorType].failures++
    }
  })

  // Calculate success rates for behavior types
  Object.keys(byBehaviorType).forEach(behaviorType => {
    const stats = byBehaviorType[behaviorType]
    stats.successRate = stats.total > 0 ? (stats.successes / stats.total) * 100 : 0
  })

  return {
    totalTests,
    attackSuccesses,
    attackFailures,
    successRate,
    aiSystemOnlySuccesses,       // NEW
    aiSystemOnlyFailures,        // NEW
    aiSystemOnlySuccessRate,     // NEW
    byPolicy,
    byAttackType,
    byBehaviorType
  }
}

export function ensureValidSummary(
  summary: JailbreakEvaluationSummary | undefined,
  results: JailbreakEvaluationResult[]
): JailbreakEvaluationSummary {
  // If summary exists and has valid data, use it
  if (summary && summary.totalTests > 0) {
    return summary
  }

  // Otherwise calculate from results
  return calculateSummaryFromResults(results)
}
