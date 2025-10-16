/**
 * Migration Script: Backfill summary_metrics for existing evaluations
 *
 * This script recalculates summary metrics for evaluations that don't have them.
 * It's needed for evaluations created before the aiSystemOnlySuccessRate feature was added.
 *
 * Usage:
 *   Run from browser console: window.migrateEvaluationSummaries()
 */

import { supabase } from '../src/lib/supabase/client';
import type { JailbreakEvaluationSummary } from '../src/features/ai-system-evaluation/types/jailbreak-evaluation';

interface EvaluationPromptRow {
  attack_outcome: string;
  ai_system_attack_outcome: string;
  policy_id: string;
  policy_name: string;
  attack_type: string;
  behavior_type: string;
}

function calculateSummaryMetrics(prompts: EvaluationPromptRow[]): JailbreakEvaluationSummary {
  const totalTests = prompts.length;
  let attackSuccesses = 0;
  let attackFailures = 0;
  let aiSystemOnlySuccesses = 0;
  let aiSystemOnlyFailures = 0;

  const byPolicy: JailbreakEvaluationSummary['byPolicy'] = {};
  const byAttackType: JailbreakEvaluationSummary['byAttackType'] = {};
  const byBehaviorType: JailbreakEvaluationSummary['byBehaviorType'] = {};

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
        policyName: prompt.policy_name,
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

export async function migrateEvaluationSummaries() {
  console.log('🔄 Starting evaluation summaries migration...');

  try {
    // Get all completed evaluations
    const { data: evaluations, error: evalError } = await supabase
      .from('evaluations')
      .select('id, name, status, summary_metrics')
      .eq('status', 'completed');

    if (evalError) {
      throw new Error(`Failed to fetch evaluations: ${evalError.message}`);
    }

    if (!evaluations || evaluations.length === 0) {
      console.log('✅ No completed evaluations found. Migration not needed.');
      return { success: true, migrated: 0, skipped: 0, failed: 0 };
    }

    console.log(`📊 Found ${evaluations.length} completed evaluations`);

    let migrated = 0;
    let skipped = 0;
    let failed = 0;

    for (const evaluation of evaluations) {
      // Skip evaluations that already have summary_metrics
      if (evaluation.summary_metrics && Object.keys(evaluation.summary_metrics).length > 0) {
        console.log(`⏭️  Skipping "${evaluation.name}" - already has summary metrics`);
        skipped++;
        continue;
      }

      console.log(`🔄 Processing "${evaluation.name}"...`);

      try {
        // Get all prompts for this evaluation
        const { data: prompts, error: promptsError } = await supabase
          .from('evaluation_prompts')
          .select('attack_outcome, ai_system_attack_outcome, policy_id, policy_name, attack_type, behavior_type')
          .eq('evaluation_id', evaluation.id);

        if (promptsError) {
          throw new Error(`Failed to fetch prompts: ${promptsError.message}`);
        }

        if (!prompts || prompts.length === 0) {
          console.log(`⚠️  No prompts found for "${evaluation.name}" - skipping`);
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

        console.log(`  ✅ Successfully migrated "${evaluation.name}"`);
        migrated++;

      } catch (error) {
        console.error(`  ❌ Failed to migrate "${evaluation.name}":`, error);
        failed++;
      }
    }

    const result = {
      success: failed === 0,
      migrated,
      skipped,
      failed,
      total: evaluations.length
    };

    console.log('\n📊 Migration Summary:');
    console.log(`  Total evaluations: ${result.total}`);
    console.log(`  ✅ Migrated: ${result.migrated}`);
    console.log(`  ⏭️  Skipped: ${result.skipped}`);
    console.log(`  ❌ Failed: ${result.failed}`);

    if (result.success) {
      console.log('\n✅ Migration completed successfully!');
    } else {
      console.log('\n⚠️  Migration completed with errors. Check logs above.');
    }

    return result;

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

// Make it available globally in browser console
if (typeof window !== 'undefined') {
  (window as any).migrateEvaluationSummaries = migrateEvaluationSummaries;
  console.log('✅ Migration script loaded. Run window.migrateEvaluationSummaries() to migrate existing evaluations.');
}
