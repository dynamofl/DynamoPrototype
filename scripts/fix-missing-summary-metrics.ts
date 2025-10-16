/**
 * Fix Missing Summary Metrics Script
 *
 * This script re-calculates summary_metrics for evaluations where it's null
 * by querying the evaluation_prompts table and calculating from scratch.
 *
 * Usage:
 *   Run from browser console: window.fixMissingSummaryMetrics()
 */

import { supabase } from '../src/lib/supabase/client';

interface EvaluationPromptRow {
  attack_outcome: string | null;
  ai_system_attack_outcome: string | null;
  policy_id: string | null;
  policy_name: string | null;
  attack_type: string | null;
  behavior_type: string | null;
}

interface SummaryMetrics {
  totalTests: number;
  attackSuccesses: number;
  attackFailures: number;
  successRate: number;
  aiSystemOnlySuccesses: number;
  aiSystemOnlyFailures: number;
  aiSystemOnlySuccessRate: number;
  byPolicy: Record<string, {
    policyName?: string;
    total: number;
    successes: number;
    failures: number;
    successRate: number;
  }>;
  byAttackType: Record<string, {
    total: number;
    successes: number;
    failures: number;
    successRate: number;
  }>;
  byBehaviorType: Record<string, {
    total: number;
    successes: number;
    failures: number;
    successRate: number;
  }>;
}

function calculateSummaryMetrics(prompts: EvaluationPromptRow[]): SummaryMetrics {
  const totalTests = prompts.length;
  let attackSuccesses = 0;
  let attackFailures = 0;
  let aiSystemOnlySuccesses = 0;
  let aiSystemOnlyFailures = 0;

  const byPolicy: SummaryMetrics['byPolicy'] = {};
  const byAttackType: SummaryMetrics['byAttackType'] = {};
  const byBehaviorType: SummaryMetrics['byBehaviorType'] = {};

  for (const prompt of prompts) {
    // Count combined outcome successes and failures
    if (prompt.attack_outcome === 'Attack Success') {
      attackSuccesses++;
    } else if (prompt.attack_outcome === 'Attack Failure') {
      attackFailures++;
    }

    // Count AI system-only outcome successes and failures
    if (prompt.ai_system_attack_outcome === 'Attack Success') {
      aiSystemOnlySuccesses++;
    } else if (prompt.ai_system_attack_outcome === 'Attack Failure') {
      aiSystemOnlyFailures++;
    }

    // Group by policy
    const policyId = prompt.policy_id || 'unknown';
    if (!byPolicy[policyId]) {
      byPolicy[policyId] = {
        policyName: prompt.policy_name || undefined,
        total: 0,
        successes: 0,
        failures: 0,
        successRate: 0
      };
    }
    byPolicy[policyId].total++;
    if (prompt.attack_outcome === 'Attack Success') {
      byPolicy[policyId].successes++;
    } else {
      byPolicy[policyId].failures++;
    }

    // Group by attack type
    const attackType = prompt.attack_type || 'unknown';
    if (!byAttackType[attackType]) {
      byAttackType[attackType] = {
        total: 0,
        successes: 0,
        failures: 0,
        successRate: 0
      };
    }
    byAttackType[attackType].total++;
    if (prompt.attack_outcome === 'Attack Success') {
      byAttackType[attackType].successes++;
    } else {
      byAttackType[attackType].failures++;
    }

    // Group by behavior type
    const behaviorType = prompt.behavior_type || 'unknown';
    if (!byBehaviorType[behaviorType]) {
      byBehaviorType[behaviorType] = {
        total: 0,
        successes: 0,
        failures: 0,
        successRate: 0
      };
    }
    byBehaviorType[behaviorType].total++;
    if (prompt.attack_outcome === 'Attack Success') {
      byBehaviorType[behaviorType].successes++;
    } else {
      byBehaviorType[behaviorType].failures++;
    }
  }

  // Calculate success rates
  Object.keys(byPolicy).forEach(policyId => {
    const policy = byPolicy[policyId];
    policy.successRate = policy.total > 0 ? (policy.successes / policy.total) * 100 : 0;
  });

  Object.keys(byAttackType).forEach(attackType => {
    const stats = byAttackType[attackType];
    stats.successRate = stats.total > 0 ? (stats.successes / stats.total) * 100 : 0;
  });

  Object.keys(byBehaviorType).forEach(behaviorType => {
    const stats = byBehaviorType[behaviorType];
    stats.successRate = stats.total > 0 ? (stats.successes / stats.total) * 100 : 0;
  });

  const successRate = totalTests > 0 ? (attackSuccesses / totalTests) * 100 : 0;
  const aiSystemOnlySuccessRate = totalTests > 0
    ? (aiSystemOnlySuccesses / totalTests) * 100
    : 0;

  return {
    totalTests,
    attackSuccesses,
    attackFailures,
    successRate,
    aiSystemOnlySuccesses,
    aiSystemOnlyFailures,
    aiSystemOnlySuccessRate,
    byPolicy,
    byAttackType,
    byBehaviorType
  };
}

export async function fixMissingSummaryMetrics() {
  console.log('🔧 Starting fix for missing summary_metrics...');

  try {
    // Get all completed evaluations with NULL summary_metrics
    const { data: evaluations, error: evalError } = await supabase
      .from('evaluations')
      .select('id, name, status')
      .eq('status', 'completed')
      .is('summary_metrics', null);

    if (evalError) {
      throw new Error(`Failed to fetch evaluations: ${evalError.message}`);
    }

    if (!evaluations || evaluations.length === 0) {
      console.log('✅ No evaluations with missing summary_metrics found!');
      return { success: true, fixed: 0, skipped: 0, failed: 0 };
    }

    console.log(`📊 Found ${evaluations.length} evaluations with missing summary_metrics`);

    let fixed = 0;
    let skipped = 0;
    let failed = 0;

    for (const evaluation of evaluations) {
      console.log(`🔄 Processing "${evaluation.name}"...`);

      try {
        // Get all prompts for this evaluation
        const { data: prompts, error: promptsError } = await supabase
          .from('evaluation_prompts')
          .select('attack_outcome, ai_system_attack_outcome, policy_id, policy_name, attack_type, behavior_type')
          .eq('evaluation_id', evaluation.id)
          .eq('status', 'completed');

        if (promptsError) {
          throw new Error(`Failed to fetch prompts: ${promptsError.message}`);
        }

        if (!prompts || prompts.length === 0) {
          console.log(`⚠️  No completed prompts found for "${evaluation.name}" - skipping`);
          skipped++;
          continue;
        }

        // Calculate summary metrics
        const summary = calculateSummaryMetrics(prompts as EvaluationPromptRow[]);

        console.log(`  ✓ Calculated metrics:`, {
          totalTests: summary.totalTests,
          successRate: summary.successRate.toFixed(1) + '%',
          aiSystemOnlySuccessRate: summary.aiSystemOnlySuccessRate.toFixed(1) + '%'
        });

        // Update evaluation with summary metrics
        const { error: updateError } = await supabase
          .from('evaluations')
          .update({ summary_metrics: summary })
          .eq('id', evaluation.id);

        if (updateError) {
          throw new Error(`Failed to update evaluation: ${updateError.message}`);
        }

        console.log(`  ✅ Successfully fixed "${evaluation.name}"`);
        fixed++;

      } catch (error) {
        console.error(`  ❌ Failed to fix "${evaluation.name}":`, error);
        failed++;
      }
    }

    const result = {
      success: failed === 0,
      fixed,
      skipped,
      failed,
      total: evaluations.length
    };

    console.log('\n📊 Fix Summary:');
    console.log(`  Total evaluations: ${result.total}`);
    console.log(`  ✅ Fixed: ${result.fixed}`);
    console.log(`  ⏭️  Skipped: ${result.skipped}`);
    console.log(`  ❌ Failed: ${result.failed}`);

    if (result.success) {
      console.log('\n✅ Fix completed successfully!');
    } else {
      console.log('\n⚠️  Fix completed with errors. Check logs above.');
    }

    return result;

  } catch (error) {
    console.error('❌ Fix failed:', error);
    throw error;
  }
}

// Make it available globally in browser console
if (typeof window !== 'undefined') {
  (window as any).fixMissingSummaryMetrics = fixMissingSummaryMetrics;
  console.log('✅ Fix script loaded. Run window.fixMissingSummaryMetrics() to fix evaluations with missing summary_metrics.');
}
