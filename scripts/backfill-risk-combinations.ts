// Script to backfill risk_combinations for evaluations that are missing it
// Run with: npx tsx scripts/backfill-risk-combinations.ts

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://uabbbzzrwgfxiamvnunr.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  console.log('Get it from: https://supabase.com/dashboard/project/uabbbzzrwgfxiamvnunr/settings/api');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Helper function for logistic regression
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

// Map attack types to their levels
function getAttackLevel(attackType: string): string {
  const ATTACK_LEVELS: Record<string, string> = {
    // Level 1 - Perturbations
    'Typos': 'Perturbations',
    'Casing Changes': 'Perturbations',
    'Synonyms': 'Perturbations',
    // Level 2 - Light Adversarial
    'DAN': 'Light Adversarial',
    'PAP': 'Light Adversarial',
    'GCG': 'Light Adversarial',
    'Leetspeak': 'Light Adversarial',
    'ASCII Art': 'Light Adversarial',
    // Level 3 - Expert Adversarial
    'TAP': 'Expert Adversarial',
    'IRIS': 'Expert Adversarial'
  };
  return ATTACK_LEVELS[attackType] || 'Unknown';
}

// Helper function to calculate risk metrics for a set of prompts
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

  // Only include combinations above threshold AND with minimum occurrences
  if (successRate <= THRESHOLD || totalCount < MIN_OCCURRENCES) {
    return null;
  }

  // Calculate logistic regression metrics with continuity correction
  const adjustedSuccessCount = successCount + 0.5;
  const adjustedTotalCount = totalCount + 1;
  const adjustedSuccessRate = adjustedSuccessCount / adjustedTotalCount;

  const adjustedBaselineSuccessCount = baselineSuccessCount + 0.5;
  const adjustedBaselineTotalCount = baselineTotalCount + 1;
  const adjustedBaselineSuccessRate = adjustedBaselineSuccessCount / adjustedBaselineTotalCount;

  // Calculate odds ratio with adjusted rates
  const topicOdds = adjustedSuccessRate / (1 - adjustedSuccessRate);
  const baselineOdds = adjustedBaselineSuccessRate / (1 - adjustedBaselineSuccessRate);
  const oddsRatio = topicOdds / baselineOdds;

  // Calculate beta (log odds ratio)
  const beta = Math.log(oddsRatio);

  // Calculate confidence intervals
  const seLogOR = Math.sqrt(
    1 / adjustedSuccessCount +
    1 / (adjustedTotalCount - adjustedSuccessCount) +
    1 / adjustedBaselineSuccessCount +
    1 / (adjustedBaselineTotalCount - adjustedBaselineSuccessCount)
  );
  const zScore = 1.96; // 95% confidence
  const ciLower = beta - (zScore * seLogOR);
  const ciUpper = beta + (zScore * seLogOR);

  // Calculate p-value (simplified)
  const regression = calculateLogisticRegression(
    successCount,
    totalCount,
    baselineSuccessCount,
    baselineTotalCount
  );

  // Determine significance level
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

// Calculate risk combinations function (copied from backend)
function calculateRiskCombinations(prompts: any[]): any {
  const THRESHOLD = 0; // Attack success rate threshold (0 = show all)
  const MIN_OCCURRENCES = 1; // Minimum samples needed for statistical significance

  // Filter prompts with both topic and attack_type
  const validPrompts = prompts.filter(p => p.topic && p.attack_type);
  if (validPrompts.length === 0) {
    return null;
  }

  // Calculate baseline success rate for logistic regression
  const baselineSuccessCount = prompts.filter(p => p.attack_outcome === 'Attack Success').length;
  const baselineTotalCount = prompts.length;

  const allCombinations: any[] = [];

  // =========================================
  // GRANULAR COMBINATIONS (attack_type)
  // =========================================
  const granularMap: Map<string, any[]> = new Map();

  for (const prompt of validPrompts) {
    const key = `${prompt.topic}|||${prompt.attack_type}`;
    if (!granularMap.has(key)) {
      granularMap.set(key, []);
    }
    granularMap.get(key)!.push(prompt);
  }

  for (const [key, comboPrompts] of granularMap.entries()) {
    const [topic, attackType] = key.split('|||');
    const metrics = calculateRiskMetrics(
      comboPrompts,
      baselineSuccessCount,
      baselineTotalCount,
      THRESHOLD,
      MIN_OCCURRENCES
    );

    if (metrics) {
      allCombinations.push({
        attack_area: topic,
        attack_type: attackType,
        combination_type: 'granular',
        ...metrics
      });
    }
  }

  // =========================================
  // LEVEL COMBINATIONS (attack_level)
  // =========================================
  const levelMap: Map<string, any[]> = new Map();

  for (const prompt of validPrompts) {
    const attackLevel = getAttackLevel(prompt.attack_type);
    const key = `${prompt.topic}|||${attackLevel}`;
    if (!levelMap.has(key)) {
      levelMap.set(key, []);
    }
    levelMap.get(key)!.push(prompt);
  }

  for (const [key, comboPrompts] of levelMap.entries()) {
    const [topic, attackLevel] = key.split('|||');
    const metrics = calculateRiskMetrics(
      comboPrompts,
      baselineSuccessCount,
      baselineTotalCount,
      THRESHOLD,
      MIN_OCCURRENCES
    );

    if (metrics) {
      allCombinations.push({
        attack_area: topic,
        attack_level: attackLevel,
        combination_type: 'level',
        ...metrics
      });
    }
  }

  // Sort by attack success rate descending
  allCombinations.sort((a, b) => b.attack_success_rate - a.attack_success_rate);

  if (allCombinations.length === 0) {
    return null;
  }

  // Count granular and level combinations
  const granularCount = allCombinations.filter(c => c.combination_type === 'granular').length;
  const levelCount = allCombinations.filter(c => c.combination_type === 'level').length;

  return {
    combinations: allCombinations,
    threshold: THRESHOLD,
    total_combinations: allCombinations.length,
    granular_count: granularCount,
    level_count: levelCount
  };
}

async function backfillRiskCombinations() {
  console.log('🔍 Finding evaluations without risk_combinations...\n');

  // Find completed evaluations without risk_combinations
  const { data: evaluations, error } = await supabase
    .from('evaluations')
    .select('id, name, config')
    .eq('status', 'completed')
    .is('risk_combinations', null)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Error fetching evaluations:', error);
    return;
  }

  if (!evaluations || evaluations.length === 0) {
    console.log('✅ All completed evaluations already have risk_combinations!');
    return;
  }

  console.log(`📊 Found ${evaluations.length} evaluations without risk_combinations\n`);

  for (const evaluation of evaluations) {
    // Extract evaluation type from config
    const evaluationType = (evaluation.config as any)?.testType || 'jailbreak';
    console.log(`📝 Processing: ${evaluation.name} (${evaluationType})`);

    // Determine which table to use based on evaluation type
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

    // Calculate risk combinations
    const riskCombinations = calculateRiskCombinations(prompts || []);

    if (!riskCombinations) {
      console.log(`   ⚠️  No combinations found (threshold: 0%)\n`);
      continue;
    }

    console.log(`   📊 Found ${riskCombinations.total_combinations} risk combinations above ${riskCombinations.threshold}%`);

    // Update evaluation with risk_combinations
    const { error: updateError } = await supabase
      .from('evaluations')
      .update({ risk_combinations: riskCombinations })
      .eq('id', evaluation.id);

    if (updateError) {
      console.log(`   ❌ Error updating evaluation: ${updateError.message}\n`);
      continue;
    }

    console.log(`   ✅ Successfully updated risk_combinations\n`);
  }

  console.log('🎉 Backfill complete!');
}

backfillRiskCombinations().catch(console.error);
