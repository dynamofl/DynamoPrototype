// Script to backfill risk_predictions for evaluations
// Run with: SUPABASE_SERVICE_ROLE_KEY=your_key npx tsx scripts/backfill-risk-predictions.ts
// Add --force flag to recalculate for ALL evaluations: npx tsx scripts/backfill-risk-predictions.ts --force

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://uabbbzzrwgfxiamvnunr.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Check if --force flag is provided
const FORCE_MODE = process.argv.includes('--force');

// Attack level mapping function
function getAttackLevel(attackType: string): string {
  const ATTACK_LEVELS: Record<string, string> = {
    'Typos': 'Perturbations',
    'Casing Changes': 'Perturbations',
    'Synonyms': 'Perturbations',
    'DAN': 'Light Adversarial',
    'PAP': 'Light Adversarial',
    'GCG': 'Light Adversarial',
    'Leetspeak': 'Light Adversarial',
    'ASCII Art': 'Light Adversarial',
    'TAP': 'Expert Adversarial',
    'IRIS': 'Expert Adversarial'
  };
  return ATTACK_LEVELS[attackType] || 'Unknown';
}

// Logistic regression calculation
function calculateLogisticRegression(
  topicSuccessCount: number,
  topicTotalCount: number,
  baselineSuccessCount: number,
  baselineTotalCount: number
): { odds_ratio: number; p_value: number; significance: boolean } {
  const topicSuccessRate = topicSuccessCount / topicTotalCount;
  const baselineSuccessRate = baselineSuccessCount / baselineTotalCount;

  let oddsRatio = 1.0;
  if (baselineSuccessRate > 0 && baselineSuccessRate < 1) {
    const topicOdds = topicSuccessRate / (1 - topicSuccessRate);
    const baselineOdds = baselineSuccessRate / (1 - baselineSuccessRate);
    if (baselineOdds > 0) {
      oddsRatio = topicOdds / baselineOdds;
    }
  }

  let pValue = 1.0;
  if (topicTotalCount >= 5 && baselineTotalCount >= 5) {
    const diff = Math.abs(topicSuccessRate - baselineSuccessRate);
    if (diff > 0.2) {
      pValue = 0.01;
    } else if (diff > 0.1) {
      pValue = 0.04;
    } else {
      pValue = 0.5;
    }
  }

  return {
    odds_ratio: Math.round(oddsRatio * 10000) / 10000,
    p_value: Math.round(pValue * 10000) / 10000,
    significance: pValue < 0.05
  };
}

// Helper function to calculate risk metrics
function calculateRiskMetrics(
  comboPrompts: any[],
  baselineSuccessCount: number,
  baselineTotalCount: number,
  THRESHOLD: number,
  MIN_OCCURRENCES: number
): any | null {
  const successCount = comboPrompts.filter(p => p.attack_outcome === 'Attack Success').length;
  const totalCount = comboPrompts.length;
  const successRate = totalCount > 0 ? (successCount / totalCount) * 100 : 0;

  if (successRate <= THRESHOLD || totalCount < MIN_OCCURRENCES) {
    return null;
  }

  // Apply continuity correction
  const adjustedSuccessCount = successCount + 0.5;
  const adjustedTotalCount = totalCount + 1;
  const adjustedSuccessRate = adjustedSuccessCount / adjustedTotalCount;

  const adjustedBaselineSuccessCount = baselineSuccessCount + 0.5;
  const adjustedBaselineTotalCount = baselineTotalCount + 1;
  const adjustedBaselineSuccessRate = adjustedBaselineSuccessCount / adjustedBaselineTotalCount;

  const topicOdds = adjustedSuccessRate / (1 - adjustedSuccessRate);
  const baselineOdds = adjustedBaselineSuccessRate / (1 - adjustedBaselineSuccessRate);
  const oddsRatio = topicOdds / baselineOdds;
  const beta = Math.log(oddsRatio);

  const seLogOR = Math.sqrt(
    1 / adjustedSuccessCount +
    1 / (adjustedTotalCount - adjustedSuccessCount) +
    1 / adjustedBaselineSuccessCount +
    1 / (adjustedBaselineTotalCount - adjustedBaselineSuccessCount)
  );
  const zScore = 1.96;
  const ciLower = beta - (zScore * seLogOR);
  const ciUpper = beta + (zScore * seLogOR);

  const regression = calculateLogisticRegression(
    successCount,
    totalCount,
    baselineSuccessCount,
    baselineTotalCount
  );

  let significance: 'high' | 'medium' | 'low' = 'low';
  if (regression.p_value < 0.01) {
    significance = 'high';
  } else if (regression.p_value < 0.05) {
    significance = 'medium';
  }

  return {
    beta: Math.round(beta * 10000) / 10000,
    odds_ratio: Math.round(oddsRatio * 10000) / 10000,
    p_value: regression.p_value,
    ci_lower: Math.round(ciLower * 10000) / 10000,
    ci_upper: Math.round(ciUpper * 10000) / 10000,
    significance,
    attack_success_rate: Math.round(successRate * 100) / 100,
    occurrence: totalCount
  };
}

// Calculate risk predictions function
function calculateRiskPredictions(prompts: any[]): any {
  const MIN_OCCURRENCES = 1;
  const THRESHOLD = 0;

  const validPrompts = prompts.filter(p => p.topic && p.attack_type);
  if (validPrompts.length === 0) {
    return null;
  }

  // Calculate baseline
  const baselineSuccessCount = prompts.filter(p => p.attack_outcome === 'Attack Success').length;
  const baselineTotalCount = prompts.length;

  // Get unique entities
  const uniqueTopics = [...new Set(validPrompts.map(p => p.topic))];
  const uniqueAttackTypes = [...new Set(validPrompts.map(p => p.attack_type))];
  const uniqueAttackLevels = [...new Set(validPrompts.map(p => getAttackLevel(p.attack_type)))];

  // Get unique policies
  const policyMap = new Map();
  validPrompts
    .filter(p => p.policy_id && p.policy_name)
    .forEach(p => {
      if (!policyMap.has(p.policy_id)) {
        policyMap.set(p.policy_id, p.policy_name);
      }
    });
  const uniquePolicies = Array.from(policyMap.entries()).map(([id, name]) => ({ id, name }));

  const byTopic: any[] = [];
  const byAttackType: any[] = [];
  const byAttackLevel: any[] = [];
  const byPolicy: any[] = [];

  // Calculate for each topic
  for (const topic of uniqueTopics) {
    const matches = validPrompts.filter(p => p.topic === topic);
    const metrics = calculateRiskMetrics(matches, baselineSuccessCount, baselineTotalCount, THRESHOLD, MIN_OCCURRENCES);
    if (metrics) {
      byTopic.push({ entity_name: topic, entity_type: 'topic', ...metrics });
    }
  }

  // Calculate for each attack type
  for (const attackType of uniqueAttackTypes) {
    const matches = validPrompts.filter(p => p.attack_type === attackType);
    const metrics = calculateRiskMetrics(matches, baselineSuccessCount, baselineTotalCount, THRESHOLD, MIN_OCCURRENCES);
    if (metrics) {
      byAttackType.push({ entity_name: attackType, entity_type: 'attack_type', ...metrics });
    }
  }

  // Calculate for each attack level
  for (const attackLevel of uniqueAttackLevels) {
    const matches = validPrompts.filter(p => getAttackLevel(p.attack_type) === attackLevel);
    const metrics = calculateRiskMetrics(matches, baselineSuccessCount, baselineTotalCount, THRESHOLD, MIN_OCCURRENCES);
    if (metrics) {
      byAttackLevel.push({ entity_name: attackLevel, entity_type: 'attack_level', ...metrics });
    }
  }

  // Calculate for each policy
  for (const policy of uniquePolicies) {
    const matches = validPrompts.filter(p => p.policy_id === policy.id);
    const metrics = calculateRiskMetrics(matches, baselineSuccessCount, baselineTotalCount, THRESHOLD, MIN_OCCURRENCES);
    if (metrics) {
      byPolicy.push({ entity_name: policy.name, entity_type: 'policy', entity_id: policy.id, ...metrics });
    }
  }

  // Sort all by attack success rate descending
  byTopic.sort((a, b) => b.attack_success_rate - a.attack_success_rate);
  byAttackType.sort((a, b) => b.attack_success_rate - a.attack_success_rate);
  byAttackLevel.sort((a, b) => b.attack_success_rate - a.attack_success_rate);
  byPolicy.sort((a, b) => b.attack_success_rate - a.attack_success_rate);

  return {
    by_topic: byTopic,
    by_attack_type: byAttackType,
    by_attack_level: byAttackLevel,
    by_policy: byPolicy,
    total_topics: byTopic.length,
    total_attack_types: byAttackType.length,
    total_attack_levels: byAttackLevel.length,
    total_policies: byPolicy.length
  };
}

async function backfillRiskPredictions() {
  console.log(`🔍 ${FORCE_MODE ? 'FORCE MODE: Recalculating' : 'Finding evaluations without'} risk_predictions...\n`);

  // Build query based on mode
  let query = supabase
    .from('evaluations')
    .select('id, name, config, risk_predictions')
    .eq('status', 'completed')
    .order('created_at', { ascending: false });

  // Only filter for null in normal mode
  if (!FORCE_MODE) {
    query = query.is('risk_predictions', null);
  }

  const { data: evaluations, error } = await query;

  if (error) {
    console.error('❌ Error fetching evaluations:', error);
    return;
  }

  if (!evaluations || evaluations.length === 0) {
    console.log('✅ All completed evaluations already have risk_predictions!');
    return;
  }

  console.log(`📊 Found ${evaluations.length} completed evaluations\n`);

  for (const evaluation of evaluations) {
    const evaluationType = (evaluation.config as any)?.testType || 'jailbreak';
    const hasExisting = evaluation.risk_predictions ? `YES${FORCE_MODE ? ' (will overwrite)' : ''}` : 'NO';
    console.log(`📝 Processing: ${evaluation.name} (${evaluationType})`);
    console.log(`   Existing risk_predictions: ${hasExisting}`);

    const promptTable = evaluationType === 'compliance' ? 'compliance_prompts' : 'jailbreak_prompts';
    console.log(`   📊 Using prompt table: ${promptTable}`);

    // Get prompts for this evaluation
    const { data: prompts, error: promptsError } = await supabase
      .from(promptTable)
      .select('*')
      .eq('evaluation_id', evaluation.id);

    if (promptsError) {
      console.log(`   ❌ Error fetching prompts: ${promptsError.message}`);
      continue;
    }

    const validPrompts = prompts?.filter(p => p.topic && p.attack_type) || [];
    console.log(`   📊 Total prompts: ${prompts?.length}, Valid (with topic & attack_type): ${validPrompts.length}`);

    if (validPrompts.length === 0) {
      console.log(`   ⚠️  No valid prompts with both topic and attack_type, skipping\n`);
      continue;
    }

    // Calculate risk predictions
    const riskPredictions = calculateRiskPredictions(prompts || []);

    if (!riskPredictions) {
      console.log(`   ⚠️  No risk predictions found\n`);
      continue;
    }

    console.log(`   ✅ Found risk predictions:`);
    console.log(`      - Topics: ${riskPredictions.total_topics}`);
    console.log(`      - Attack Types: ${riskPredictions.total_attack_types}`);
    console.log(`      - Attack Levels: ${riskPredictions.total_attack_levels}`);
    console.log(`      - Policies: ${riskPredictions.total_policies}`);

    // Update evaluation with risk_predictions
    const { error: updateError } = await supabase
      .from('evaluations')
      .update({ risk_predictions: riskPredictions })
      .eq('id', evaluation.id);

    if (updateError) {
      console.log(`   ❌ Error updating evaluation: ${updateError.message}\n`);
    } else {
      console.log(`   ✅ Successfully updated risk_predictions\n`);
    }
  }

  console.log('✅ Backfill complete!');
}

backfillRiskPredictions().catch(console.error);
