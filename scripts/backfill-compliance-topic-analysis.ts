/**
 * Backfill Topic Analysis for Existing Compliance Evaluations
 *
 * This script:
 * 1. Finds all completed compliance evaluations without topic_analysis
 * 2. Fetches their prompts from compliance_prompts table
 * 3. Calculates topic analysis using the same logic as the Edge Function
 * 4. Updates the evaluations with the calculated topic_analysis
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables!');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Calculate statistical metrics
 */
function calculateMean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}

function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

function calculateMode(values: number[], decimals: number = 0): number {
  if (values.length === 0) return 0;
  const rounded = values.map(v => Math.round(v * Math.pow(10, decimals)) / Math.pow(10, decimals));
  const frequency: Record<string, number> = {};
  let maxFreq = 0;
  let mode = 0;

  for (const val of rounded) {
    const key = val.toString();
    frequency[key] = (frequency[key] || 0) + 1;
    if (frequency[key] > maxFreq) {
      maxFreq = frequency[key];
      mode = val;
    }
  }

  return mode;
}

function calculateStdDev(values: number[]): number {
  if (values.length === 0) return 0;
  const mean = calculateMean(values);
  const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
  return Math.sqrt(calculateMean(squaredDiffs));
}

function calculateVariance(values: number[]): number {
  if (values.length === 0) return 0;
  const mean = calculateMean(values);
  const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
  return calculateMean(squaredDiffs);
}

function calculateIQR(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const q1Index = Math.floor(sorted.length * 0.25);
  const q3Index = Math.floor(sorted.length * 0.75);
  return sorted[q3Index] - sorted[q1Index];
}

function calculateRange(values: number[]): { min: number; max: number } {
  if (values.length === 0) return { min: 0, max: 0 };
  return {
    min: Math.min(...values),
    max: Math.max(...values)
  };
}

/**
 * Calculate logistic regression metrics
 */
function calculateLogisticRegression(
  successCount: number,
  totalCount: number,
  baselineSuccessCount: number,
  baselineTotalCount: number
): any {
  if (totalCount === 0 || baselineTotalCount === 0) {
    return {
      beta: null,
      odds_ratio: null,
      p_value: 0.5,
      ci_lower: null,
      ci_upper: null,
      significance: false
    };
  }

  // Add continuity correction
  const adjustedSuccessCount = successCount + 0.5;
  const adjustedTotalCount = totalCount + 1;
  const adjustedSuccessRate = adjustedSuccessCount / adjustedTotalCount;

  const adjustedBaselineSuccessCount = baselineSuccessCount + 0.5;
  const adjustedBaselineTotalCount = baselineTotalCount + 1;
  const adjustedBaselineSuccessRate = adjustedBaselineSuccessCount / adjustedBaselineTotalCount;

  // Calculate odds ratio
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
  const zStat = Math.abs(beta / seLogOR);
  const pValue = 2 * (1 - normalCDF(zStat));

  return {
    beta: Math.round(beta * 10000) / 10000,
    odds_ratio: Math.round(oddsRatio * 10000) / 10000,
    p_value: Math.round(pValue * 10000) / 10000,
    ci_lower: Math.round(ciLower * 10000) / 10000,
    ci_upper: Math.round(ciUpper * 10000) / 10000,
    significance: pValue < 0.05
  };
}

// Approximate normal CDF
function normalCDF(x: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989423 * Math.exp(-x * x / 2);
  const prob = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return x > 0 ? 1 - prob : prob;
}

/**
 * Calculate topic analysis for compliance evaluation
 */
function calculateTopicAnalysis(prompts: any[]): any {
  // Filter prompts with topics
  const promptsWithTopics = prompts.filter(p => p.topic);
  if (promptsWithTopics.length === 0) {
    return null;
  }

  // Calculate baseline metrics (correct predictions: TP + TN)
  const baselineSuccessCount = prompts.filter(p => p.final_outcome === 'TP' || p.final_outcome === 'TN').length;
  const baselineTotalCount = prompts.length;

  // Group prompts by policy → topic
  const policyTopicMap = new Map<string, Map<string, any[]>>();

  for (const prompt of promptsWithTopics) {
    const policyId = prompt.policy_id || 'unknown';
    if (!policyTopicMap.has(policyId)) {
      policyTopicMap.set(policyId, new Map());
    }

    const topicMap = policyTopicMap.get(policyId)!;
    const topic = prompt.topic!;
    if (!topicMap.has(topic)) {
      topicMap.set(topic, []);
    }

    topicMap.get(topic)!.push(prompt);
  }

  // Build the topic analysis structure
  const policies: any[] = [];

  for (const [policyId, topicMap] of policyTopicMap.entries()) {
    const topics: any[] = [];

    for (const [topicName, topicPrompts] of topicMap.entries()) {
      // Common metrics for all evaluation types
      const confidenceScores = topicPrompts.map(p => p.ai_system_response?.confidenceScore || 0);
      const runtimeSeconds = topicPrompts.map(p => (p.runtime_ms || 0) / 1000);
      const inputTokens = topicPrompts.map(p => p.input_tokens || 0);
      const outputTokens = topicPrompts.map(p => p.ai_system_response?.outputTokens || 0);

      // Compliance-specific metrics
      const accuracyValues: number[] = [];
      const precisionValues: number[] = [];
      const recallValues: number[] = [];
      const f1Values: number[] = [];
      const tpValues: number[] = [];
      const tnValues: number[] = [];
      const fpValues: number[] = [];
      const fnValues: number[] = [];

      for (const p of topicPrompts) {
        const outcome = p.final_outcome;
        const tp = outcome === 'TP' ? 1 : 0;
        const tn = outcome === 'TN' ? 1 : 0;
        const fp = outcome === 'FP' ? 1 : 0;
        const fn = outcome === 'FN' ? 1 : 0;

        tpValues.push(tp);
        tnValues.push(tn);
        fpValues.push(fp);
        fnValues.push(fn);

        // Accuracy for this prompt: 1 if correct (TP or TN), 0 otherwise
        const accuracy = (tp + tn) * 100;
        accuracyValues.push(accuracy);

        // Precision: TP / (TP + FP) - for individual prompt, either 100% or 0%
        const precision = (tp + fp) > 0 ? (tp / (tp + fp)) * 100 : 0;
        precisionValues.push(precision);

        // Recall: TP / (TP + FN) - for individual prompt, either 100% or 0%
        const recall = (tp + fn) > 0 ? (tp / (tp + fn)) * 100 : 0;
        recallValues.push(recall);

        // F1: 2 * (Precision * Recall) / (Precision + Recall)
        const f1 = (precision + recall) > 0 ? (2 * precision * recall) / (precision + recall) : 0;
        f1Values.push(f1);
      }

      // For logistic regression: count correct predictions (TP + TN)
      const topicSuccessCount = topicPrompts.filter(p => p.final_outcome === 'TP' || p.final_outcome === 'TN').length;
      const topicTotalCount = topicPrompts.length;

      // Calculate logistic regression
      const logisticRegression = calculateLogisticRegression(
        topicSuccessCount,
        topicTotalCount,
        baselineSuccessCount,
        baselineTotalCount
      );

      // Calculate ranges
      const accuracyRange = calculateRange(accuracyValues);
      const precisionRange = calculateRange(precisionValues);
      const recallRange = calculateRange(recallValues);
      const f1Range = calculateRange(f1Values);
      const tpRange = calculateRange(tpValues);
      const tnRange = calculateRange(tnValues);
      const fpRange = calculateRange(fpValues);
      const fnRange = calculateRange(fnValues);
      const confidenceRange = calculateRange(confidenceScores);
      const runtimeRange = calculateRange(runtimeSeconds);
      const inputTokensRange = calculateRange(inputTokens);
      const outputTokensRange = calculateRange(outputTokens);

      topics.push({
        topic_name: topicName,
        accuracy: {
          mean: Math.round(calculateMean(accuracyValues) * 100) / 100,
          median: Math.round(calculateMedian(accuracyValues) * 100) / 100,
          mode: Math.round(calculateMode(accuracyValues, 0)),
          std_dev: Math.round(calculateStdDev(accuracyValues) * 100) / 100,
          variance: Math.round(calculateVariance(accuracyValues) * 100) / 100,
          iqr: Math.round(calculateIQR(accuracyValues) * 100) / 100,
          range: {
            min: Math.round(accuracyRange.min),
            max: Math.round(accuracyRange.max)
          }
        },
        precision: {
          mean: Math.round(calculateMean(precisionValues) * 100) / 100,
          median: Math.round(calculateMedian(precisionValues) * 100) / 100,
          mode: Math.round(calculateMode(precisionValues, 0)),
          std_dev: Math.round(calculateStdDev(precisionValues) * 100) / 100,
          variance: Math.round(calculateVariance(precisionValues) * 100) / 100,
          iqr: Math.round(calculateIQR(precisionValues) * 100) / 100,
          range: {
            min: Math.round(precisionRange.min),
            max: Math.round(precisionRange.max)
          }
        },
        recall: {
          mean: Math.round(calculateMean(recallValues) * 100) / 100,
          median: Math.round(calculateMedian(recallValues) * 100) / 100,
          mode: Math.round(calculateMode(recallValues, 0)),
          std_dev: Math.round(calculateStdDev(recallValues) * 100) / 100,
          variance: Math.round(calculateVariance(recallValues) * 100) / 100,
          iqr: Math.round(calculateIQR(recallValues) * 100) / 100,
          range: {
            min: Math.round(recallRange.min),
            max: Math.round(recallRange.max)
          }
        },
        f1_score: {
          mean: Math.round(calculateMean(f1Values) * 100) / 100,
          median: Math.round(calculateMedian(f1Values) * 100) / 100,
          mode: Math.round(calculateMode(f1Values, 0)),
          std_dev: Math.round(calculateStdDev(f1Values) * 100) / 100,
          variance: Math.round(calculateVariance(f1Values) * 100) / 100,
          iqr: Math.round(calculateIQR(f1Values) * 100) / 100,
          range: {
            min: Math.round(f1Range.min),
            max: Math.round(f1Range.max)
          }
        },
        true_positive: {
          mean: Math.round(calculateMean(tpValues) * 100) / 100,
          median: Math.round(calculateMedian(tpValues) * 100) / 100,
          mode: Math.round(calculateMode(tpValues, 0)),
          std_dev: Math.round(calculateStdDev(tpValues) * 100) / 100,
          variance: Math.round(calculateVariance(tpValues) * 100) / 100,
          iqr: Math.round(calculateIQR(tpValues) * 100) / 100,
          range: {
            min: Math.round(tpRange.min),
            max: Math.round(tpRange.max)
          }
        },
        true_negative: {
          mean: Math.round(calculateMean(tnValues) * 100) / 100,
          median: Math.round(calculateMedian(tnValues) * 100) / 100,
          mode: Math.round(calculateMode(tnValues, 0)),
          std_dev: Math.round(calculateStdDev(tnValues) * 100) / 100,
          variance: Math.round(calculateVariance(tnValues) * 100) / 100,
          iqr: Math.round(calculateIQR(tnValues) * 100) / 100,
          range: {
            min: Math.round(tnRange.min),
            max: Math.round(tnRange.max)
          }
        },
        false_positive: {
          mean: Math.round(calculateMean(fpValues) * 100) / 100,
          median: Math.round(calculateMedian(fpValues) * 100) / 100,
          mode: Math.round(calculateMode(fpValues, 0)),
          std_dev: Math.round(calculateStdDev(fpValues) * 100) / 100,
          variance: Math.round(calculateVariance(fpValues) * 100) / 100,
          iqr: Math.round(calculateIQR(fpValues) * 100) / 100,
          range: {
            min: Math.round(fpRange.min),
            max: Math.round(fpRange.max)
          }
        },
        false_negative: {
          mean: Math.round(calculateMean(fnValues) * 100) / 100,
          median: Math.round(calculateMedian(fnValues) * 100) / 100,
          mode: Math.round(calculateMode(fnValues, 0)),
          std_dev: Math.round(calculateStdDev(fnValues) * 100) / 100,
          variance: Math.round(calculateVariance(fnValues) * 100) / 100,
          iqr: Math.round(calculateIQR(fnValues) * 100) / 100,
          range: {
            min: Math.round(fnRange.min),
            max: Math.round(fnRange.max)
          }
        },
        confidence: {
          mean: Math.round(calculateMean(confidenceScores) * 10000) / 10000,
          median: Math.round(calculateMedian(confidenceScores) * 10000) / 10000,
          mode: Math.round(calculateMode(confidenceScores, 2) * 10000) / 10000,
          std_dev: Math.round(calculateStdDev(confidenceScores) * 100) / 100,
          variance: Math.round(calculateVariance(confidenceScores) * 100) / 100,
          iqr: Math.round(calculateIQR(confidenceScores) * 100) / 100,
          range: {
            min: Math.round(confidenceRange.min * 100) / 100,
            max: Math.round(confidenceRange.max * 100) / 100
          }
        },
        runtime_seconds: {
          mean: Math.round(calculateMean(runtimeSeconds) * 100) / 100,
          median: Math.round(calculateMedian(runtimeSeconds) * 100) / 100,
          mode: Math.round(calculateMode(runtimeSeconds, 2) * 100) / 100,
          std_dev: Math.round(calculateStdDev(runtimeSeconds) * 100) / 100,
          variance: Math.round(calculateVariance(runtimeSeconds) * 100) / 100,
          iqr: Math.round(calculateIQR(runtimeSeconds) * 100) / 100,
          range: {
            min: Math.round(runtimeRange.min * 100) / 100,
            max: Math.round(runtimeRange.max * 100) / 100
          }
        },
        input_tokens: {
          mean: Math.round(calculateMean(inputTokens)),
          median: Math.round(calculateMedian(inputTokens)),
          mode: Math.round(calculateMode(inputTokens, 0)),
          std_dev: Math.round(calculateStdDev(inputTokens)),
          variance: Math.round(calculateVariance(inputTokens)),
          iqr: Math.round(calculateIQR(inputTokens)),
          range: {
            min: Math.round(inputTokensRange.min),
            max: Math.round(inputTokensRange.max)
          }
        },
        output_tokens: {
          mean: Math.round(calculateMean(outputTokens)),
          median: Math.round(calculateMedian(outputTokens)),
          mode: Math.round(calculateMode(outputTokens, 0)),
          std_dev: Math.round(calculateStdDev(outputTokens)),
          variance: Math.round(calculateVariance(outputTokens)),
          iqr: Math.round(calculateIQR(outputTokens)),
          range: {
            min: Math.round(outputTokensRange.min),
            max: Math.round(outputTokensRange.max)
          }
        },
        occurrence: topicPrompts.length,
        logistic_regression: logisticRegression
      });
    }

    // Get policy name from first prompt in this policy
    const firstPrompt = Array.from(topicMap.values())[0][0];
    policies.push({
      id: policyId,
      policy_name: firstPrompt.policy_name || 'Unknown',
      topics: topics.sort((a, b) => a.topic_name.localeCompare(b.topic_name))
    });
  }

  return {
    source: {
      type: 'policy_group',
      policies: policies
    }
  };
}

/**
 * Main backfill function
 */
async function backfillComplianceTopicAnalysis() {
  console.log('🔍 Finding compliance evaluations without topic analysis...\n');

  // Find all completed compliance evaluations
  const { data: evaluations, error: evalError } = await supabase
    .from('evaluations')
    .select('id, name, total_prompts, completed_prompts, created_at')
    .eq('evaluation_type', 'compliance')
    .eq('status', 'completed')
    .order('created_at', { ascending: false });

  if (evalError) {
    console.error('❌ Error fetching evaluations:', evalError);
    return;
  }

  if (!evaluations || evaluations.length === 0) {
    console.log('✅ No compliance evaluations found');
    return;
  }

  console.log(`📊 Found ${evaluations.length} completed compliance evaluations\n`);

  let updated = 0;
  let skipped = 0;
  let failed = 0;

  for (const evaluation of evaluations) {
    console.log(`\n📝 Processing: ${evaluation.name} (${evaluation.id})`);
    console.log(`   Prompts: ${evaluation.completed_prompts}/${evaluation.total_prompts}`);

    // Fetch prompts for this evaluation
    const { data: prompts, error: promptsError } = await supabase
      .from('compliance_prompts')
      .select('*')
      .eq('evaluation_id', evaluation.id);

    if (promptsError) {
      console.error(`   ❌ Error fetching prompts:`, promptsError.message);
      failed++;
      continue;
    }

    if (!prompts || prompts.length === 0) {
      console.log(`   ⚠️  No prompts found, skipping`);
      skipped++;
      continue;
    }

    // Check if any prompts have topics
    const promptsWithTopics = prompts.filter(p => p.topic);
    if (promptsWithTopics.length === 0) {
      console.log(`   ⚠️  No prompts with topics found, skipping`);
      skipped++;
      continue;
    }

    console.log(`   📊 Found ${promptsWithTopics.length} prompts with topics`);

    // Calculate topic analysis
    try {
      const topicAnalysis = calculateTopicAnalysis(prompts);

      if (!topicAnalysis) {
        console.log(`   ⚠️  Topic analysis calculation returned null, skipping`);
        skipped++;
        continue;
      }

      console.log(`   ✅ Calculated topic analysis for ${topicAnalysis.source.policies.length} policies`);

      // Update evaluation with topic_analysis
      const { error: updateError } = await supabase
        .from('evaluations')
        .update({ topic_analysis: topicAnalysis })
        .eq('id', evaluation.id);

      if (updateError) {
        console.error(`   ❌ Error updating evaluation:`, updateError.message);
        failed++;
        continue;
      }

      console.log(`   ✅ Successfully updated with topic analysis`);
      updated++;

    } catch (error) {
      console.error(`   ❌ Error calculating topic analysis:`, error);
      failed++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 Backfill Summary:');
  console.log(`   ✅ Updated: ${updated}`);
  console.log(`   ⚠️  Skipped: ${skipped}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log('='.repeat(60) + '\n');
}

// Run the backfill
backfillComplianceTopicAnalysis()
  .then(() => {
    console.log('✅ Backfill complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Backfill failed:', error);
    process.exit(1);
  });
