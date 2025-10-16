/**
 * Migration Script: Update summary_metrics to include per-guardrail breakdown
 *
 * This script:
 * 1. Fetches all completed evaluations from Supabase
 * 2. For each evaluation, re-reads all prompt results
 * 3. Recalculates summary_metrics with new guardrail breakdown
 * 4. Updates evaluation record in database
 * 5. Runs in batches to avoid timeout
 */

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Error: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

interface PolicyMetrics {
  total: number;
  failures: number;
  successes: number;
  policyName: string;
  successRate: number;
}

interface AttackTypeMetrics {
  total: number;
  failures: number;
  successes: number;
  successRate: number;
}

interface BehaviorTypeMetrics {
  total: number;
  failures: number;
  successes: number;
  successRate: number;
}

interface GuardrailSummaryMetrics {
  id: string;
  name: string;
  type: 'input' | 'output';
  byPolicy: Record<string, PolicyMetrics>;
  totalTests: number;
  successRate: number;
  byAttackType: Record<string, AttackTypeMetrics>;
  attackFailures: number;
  byBehaviorType: Record<string, BehaviorTypeMetrics>;
  attackSuccesses: number;
  guardrailOnlyFailures: number;
  guardrailOnlySuccesses: number;
  guardrailOnlySuccessRate: number;
}

interface NewSummaryMetrics {
  aiSystem: {
    totalTests: number;
    attackSuccesses: number;
    attackFailures: number;
    successRate: number;
    aiSystemOnlySuccesses: number;
    aiSystemOnlyFailures: number;
    aiSystemOnlySuccessRate: number;
    byPolicy: Record<string, PolicyMetrics>;
    byAttackType: Record<string, AttackTypeMetrics>;
    byBehaviorType: Record<string, BehaviorTypeMetrics>;
  };
  guardrails?: GuardrailSummaryMetrics[];
  // Legacy fields for backward compatibility
  totalTests: number;
  attackSuccesses: number;
  attackFailures: number;
  successRate: number;
  aiSystemOnlySuccesses?: number;
  aiSystemOnlyFailures?: number;
  aiSystemOnlySuccessRate?: number;
  byPolicy: Record<string, any>;
  byAttackType: Record<string, any>;
  byBehaviorType: Record<string, any>;
}

/**
 * Recalculate summary metrics with per-guardrail breakdown
 */
function calculateNewSummaryMetrics(prompts: any[]): NewSummaryMetrics {
  const totalTests = prompts.length;
  let attackSuccesses = 0;
  let attackFailures = 0;
  let aiSystemOnlySuccesses = 0;
  let aiSystemOnlyFailures = 0;

  const byPolicy: Record<string, any> = {};
  const byAttackType: Record<string, any> = {};
  const byBehaviorType: Record<string, any> = {};

  // Track per-guardrail metrics
  const guardrailMetricsMap: Map<string, any> = new Map();

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
        total: 0,
        successes: 0,
        failures: 0,
        policyName: prompt.policy_name || 'Unknown'
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
      byAttackType[attackType] = { total: 0, successes: 0, failures: 0 };
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
      byBehaviorType[behaviorType] = { total: 0, successes: 0, failures: 0 };
    }
    byBehaviorType[behaviorType].total++;
    if (prompt.attack_outcome === 'Attack Success') {
      byBehaviorType[behaviorType].successes++;
    } else {
      byBehaviorType[behaviorType].failures++;
    }

    // Process per-guardrail metrics
    const inputGuardrails = prompt.input_guardrail?.details || [];
    const outputGuardrails = prompt.output_guardrail?.details || [];
    const allGuardrailDetails = [...inputGuardrails, ...outputGuardrails];

    for (const detail of allGuardrailDetails) {
      if (!detail.guardrailId || !detail.guardrailName) continue;

      // Initialize guardrail metrics if not exists
      if (!guardrailMetricsMap.has(detail.guardrailId)) {
        guardrailMetricsMap.set(detail.guardrailId, {
          id: detail.guardrailId,
          name: detail.guardrailName,
          type: inputGuardrails.some((g: any) => g.guardrailId === detail.guardrailId) ? 'input' : 'output',
          byPolicy: {},
          totalTests: 0,
          attackSuccesses: 0,
          attackFailures: 0,
          byAttackType: {},
          byBehaviorType: {},
          guardrailOnlySuccesses: 0,
          guardrailOnlyFailures: 0
        });
      }

      const guardrailMetrics = guardrailMetricsMap.get(detail.guardrailId);
      guardrailMetrics.totalTests++;

      // Determine if this guardrail blocked the attack
      const guardrailBlocked = detail.judgement === 'Blocked';
      const attackSuccess = prompt.attack_outcome === 'Attack Success';
      const aiSystemSuccess = prompt.ai_system_attack_outcome === 'Attack Success';

      // Count successes/failures based on overall attack outcome
      if (attackSuccess) {
        guardrailMetrics.attackSuccesses++;
      } else {
        guardrailMetrics.attackFailures++;
      }

      // Calculate "guardrail-only" metrics
      if (guardrailBlocked && aiSystemSuccess) {
        guardrailMetrics.guardrailOnlySuccesses++;
      }
      if (!guardrailBlocked && !attackSuccess && !aiSystemSuccess) {
        guardrailMetrics.guardrailOnlyFailures++;
      }

      // By Policy
      if (!guardrailMetrics.byPolicy[policyId]) {
        guardrailMetrics.byPolicy[policyId] = {
          total: 0,
          successes: 0,
          failures: 0,
          policyName: prompt.policy_name || 'Unknown'
        };
      }
      guardrailMetrics.byPolicy[policyId].total++;
      if (attackSuccess) {
        guardrailMetrics.byPolicy[policyId].successes++;
      } else {
        guardrailMetrics.byPolicy[policyId].failures++;
      }

      // By Attack Type
      if (!guardrailMetrics.byAttackType[attackType]) {
        guardrailMetrics.byAttackType[attackType] = {
          total: 0,
          successes: 0,
          failures: 0
        };
      }
      guardrailMetrics.byAttackType[attackType].total++;
      if (attackSuccess) {
        guardrailMetrics.byAttackType[attackType].successes++;
      } else {
        guardrailMetrics.byAttackType[attackType].failures++;
      }

      // By Behavior Type
      if (!guardrailMetrics.byBehaviorType[behaviorType]) {
        guardrailMetrics.byBehaviorType[behaviorType] = {
          total: 0,
          successes: 0,
          failures: 0
        };
      }
      guardrailMetrics.byBehaviorType[behaviorType].total++;
      if (attackSuccess) {
        guardrailMetrics.byBehaviorType[behaviorType].successes++;
      } else {
        guardrailMetrics.byBehaviorType[behaviorType].failures++;
      }
    }
  }

  // Calculate success rates for policies
  for (const policyId in byPolicy) {
    const policy = byPolicy[policyId];
    policy.successRate = policy.total > 0 ? (policy.successes / policy.total) * 100 : 0;
  }

  // Calculate success rates for attack types
  for (const attackType in byAttackType) {
    const stats = byAttackType[attackType];
    stats.successRate = stats.total > 0 ? (stats.successes / stats.total) * 100 : 0;
  }

  // Calculate success rates for behavior types
  for (const behaviorType in byBehaviorType) {
    const stats = byBehaviorType[behaviorType];
    stats.successRate = stats.total > 0 ? (stats.successes / stats.total) * 100 : 0;
  }

  // Calculate success rates for guardrails
  const guardrailsArray = Array.from(guardrailMetricsMap.values()).map(g => {
    // Calculate success rates for this guardrail's policies
    for (const policyId in g.byPolicy) {
      const policy = g.byPolicy[policyId];
      policy.successRate = policy.total > 0 ? (policy.successes / policy.total) * 100 : 0;
    }

    // Calculate success rates for this guardrail's attack types
    for (const attackType in g.byAttackType) {
      const stats = g.byAttackType[attackType];
      stats.successRate = stats.total > 0 ? (stats.successes / stats.total) * 100 : 0;
    }

    // Calculate success rates for this guardrail's behavior types
    for (const behaviorType in g.byBehaviorType) {
      const stats = g.byBehaviorType[behaviorType];
      stats.successRate = stats.total > 0 ? (stats.successes / stats.total) * 100 : 0;
    }

    // Calculate overall success rate and guardrail-only success rate
    const successRate = g.totalTests > 0 ? (g.attackSuccesses / g.totalTests) * 100 : 0;
    const guardrailOnlySuccessRate = g.totalTests > 0
      ? (g.guardrailOnlySuccesses / g.totalTests) * 100
      : 0;

    return {
      ...g,
      successRate,
      guardrailOnlySuccessRate
    };
  });

  const successRate = totalTests > 0 ? (attackSuccesses / totalTests) * 100 : 0;
  const aiSystemOnlySuccessRate = totalTests > 0
    ? (aiSystemOnlySuccesses / totalTests) * 100
    : 0;

  return {
    aiSystem: {
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
    },
    guardrails: guardrailsArray.length > 0 ? guardrailsArray : undefined,
    // Legacy fields for backward compatibility
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

/**
 * Main migration function
 */
async function migrateEvaluations() {
  console.log('🚀 Starting migration of summary_metrics...\n');

  // Fetch all completed evaluations
  const { data: evaluations, error: fetchError } = await supabase
    .from('evaluations')
    .select('id, name, summary_metrics')
    .eq('status', 'completed')
    .order('created_at', { ascending: false });

  if (fetchError) {
    console.error('❌ Error fetching evaluations:', fetchError);
    return;
  }

  if (!evaluations || evaluations.length === 0) {
    console.log('✅ No evaluations to migrate');
    return;
  }

  console.log(`📊 Found ${evaluations.length} completed evaluations\n`);

  let migratedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  for (const evaluation of evaluations) {
    try {
      console.log(`\n📝 Processing: ${evaluation.name} (${evaluation.id})`);

      // Check if already migrated (has aiSystem structure)
      if (evaluation.summary_metrics?.aiSystem) {
        console.log('   ⏭️  Already migrated, skipping');
        skippedCount++;
        continue;
      }

      // Fetch all prompts for this evaluation
      const { data: prompts, error: promptsError } = await supabase
        .from('evaluation_prompts')
        .select('*')
        .eq('evaluation_id', evaluation.id)
        .eq('status', 'completed');

      if (promptsError) {
        console.error(`   ❌ Error fetching prompts:`, promptsError);
        errorCount++;
        continue;
      }

      if (!prompts || prompts.length === 0) {
        console.log('   ⚠️  No completed prompts found, skipping');
        skippedCount++;
        continue;
      }

      console.log(`   📊 Found ${prompts.length} completed prompts`);

      // Recalculate summary metrics
      const newSummaryMetrics = calculateNewSummaryMetrics(prompts);

      console.log(`   🔢 Calculated new metrics:`);
      console.log(`      - AI System ASR: ${newSummaryMetrics.aiSystem.aiSystemOnlySuccessRate.toFixed(1)}%`);
      console.log(`      - With Guardrails ASR: ${newSummaryMetrics.aiSystem.successRate.toFixed(1)}%`);
      if (newSummaryMetrics.guardrails) {
        console.log(`      - Guardrails tracked: ${newSummaryMetrics.guardrails.length}`);
        newSummaryMetrics.guardrails.forEach(g => {
          console.log(`        • ${g.name} (${g.type}): ${g.guardrailOnlySuccessRate.toFixed(1)}% only-ASR`);
        });
      }

      // Update evaluation with new summary_metrics
      const { error: updateError } = await supabase
        .from('evaluations')
        .update({ summary_metrics: newSummaryMetrics })
        .eq('id', evaluation.id);

      if (updateError) {
        console.error(`   ❌ Error updating evaluation:`, updateError);
        errorCount++;
        continue;
      }

      console.log(`   ✅ Successfully migrated`);
      migratedCount++;

    } catch (error) {
      console.error(`   ❌ Unexpected error:`, error);
      errorCount++;
    }
  }

  console.log('\n\n📊 Migration Summary:');
  console.log(`   ✅ Migrated: ${migratedCount}`);
  console.log(`   ⏭️  Skipped: ${skippedCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
  console.log(`   📈 Total: ${evaluations.length}`);
  console.log('\n🎉 Migration complete!\n');
}

// Run migration
migrateEvaluations().catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
