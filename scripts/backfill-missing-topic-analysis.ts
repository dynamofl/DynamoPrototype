// Script to backfill topic_analysis for evaluations that are missing it
// Run with: npx tsx scripts/backfill-missing-topic-analysis.ts

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://uabbbzzrwgfxiamvnunr.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  console.log('Get it from: https://supabase.com/dashboard/project/uabbbzzrwgfxiamvnunr/settings/api');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Copy the topic analysis calculation functions from the edge function
function calculateMean(values: number[]): number {
  if (values.length === 0) return 0;
  const sum = values.reduce((acc, val) => acc + val, 0);
  return sum / values.length;
}

function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  return sorted[mid];
}

function calculateMode(values: number[], roundTo: number = 2): number {
  if (values.length === 0) return 0;
  const rounded = values.map(v => Math.round(v * Math.pow(10, roundTo)) / Math.pow(10, roundTo));
  const frequency: Record<number, number> = {};
  rounded.forEach(val => {
    frequency[val] = (frequency[val] || 0) + 1;
  });
  let maxFreq = 0;
  let mode = 0;
  for (const [val, freq] of Object.entries(frequency)) {
    if (freq > maxFreq) {
      maxFreq = freq;
      mode = parseFloat(val);
    }
  }
  return mode;
}

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

function calculateTopicAnalysis(prompts: any[]): any {
  const promptsWithTopics = prompts.filter(p => p.topic);
  if (promptsWithTopics.length === 0) {
    return null;
  }

  const baselineSuccessCount = prompts.filter(p => p.attack_outcome === 'Attack Success').length;
  const baselineTotalCount = prompts.length;

  const policyTopicMap: Map<string, Map<string, any[]>> = new Map();

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

  const policies: any[] = [];

  for (const [policyId, topicMap] of policyTopicMap.entries()) {
    const topics: any[] = [];

    for (const [topicName, topicPrompts] of topicMap.entries()) {
      const attackSuccessRates = topicPrompts.map(p =>
        p.attack_outcome === 'Attack Success' ? 100 : 0
      );
      const confidenceScores = topicPrompts.map(p =>
        p.ai_system_response?.confidenceScore || 0
      );
      const runtimeSeconds = topicPrompts.map(p =>
        (p.runtime_ms || 0) / 1000
      );
      const inputTokens = topicPrompts.map(p => p.input_tokens || 0);
      const outputTokens = topicPrompts.map(p =>
        p.ai_system_response?.outputTokens || 0
      );

      const topicSuccessCount = topicPrompts.filter(p => p.attack_outcome === 'Attack Success').length;
      const topicTotalCount = topicPrompts.length;

      const logisticRegression = calculateLogisticRegression(
        topicSuccessCount,
        topicTotalCount,
        baselineSuccessCount,
        baselineTotalCount
      );

      topics.push({
        topic_name: topicName,
        attack_success_rate: {
          mean: Math.round(calculateMean(attackSuccessRates) * 100) / 100,
          median: Math.round(calculateMedian(attackSuccessRates) * 100) / 100,
          mode: Math.round(calculateMode(attackSuccessRates, 0))
        },
        confidence: {
          mean: Math.round(calculateMean(confidenceScores) * 10000) / 10000,
          median: Math.round(calculateMedian(confidenceScores) * 10000) / 10000,
          mode: Math.round(calculateMode(confidenceScores, 2) * 10000) / 10000
        },
        runtime_seconds: {
          mean: Math.round(calculateMean(runtimeSeconds) * 100) / 100,
          median: Math.round(calculateMedian(runtimeSeconds) * 100) / 100,
          mode: Math.round(calculateMode(runtimeSeconds, 2) * 100) / 100
        },
        input_tokens: {
          mean: Math.round(calculateMean(inputTokens)),
          median: Math.round(calculateMedian(inputTokens)),
          mode: Math.round(calculateMode(inputTokens, 0))
        },
        output_tokens: {
          mean: Math.round(calculateMean(outputTokens)),
          median: Math.round(calculateMedian(outputTokens)),
          mode: Math.round(calculateMode(outputTokens, 0))
        },
        occurrence: topicPrompts.length,
        logistic_regression: logisticRegression
      });
    }

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

async function backfillMissingTopicAnalysis() {
  console.log('🔍 Finding evaluations without topic_analysis...\n');

  // Find completed evaluations without topic_analysis
  const { data: evaluations, error } = await supabase
    .from('evaluations')
    .select('id, name')
    .eq('status', 'completed')
    .is('topic_analysis', null)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Error fetching evaluations:', error);
    return;
  }

  if (!evaluations || evaluations.length === 0) {
    console.log('✅ All completed evaluations already have topic_analysis!');
    return;
  }

  console.log(`📊 Found ${evaluations.length} evaluations without topic_analysis\n`);

  for (const evaluation of evaluations) {
    console.log(`📝 Processing: ${evaluation.name}`);

    // Get prompts for this evaluation
    const { data: prompts, error: promptsError } = await supabase
      .from('evaluation_prompts')
      .select('*')
      .eq('evaluation_id', evaluation.id);

    if (promptsError) {
      console.log(`   ❌ Error fetching prompts: ${promptsError.message}`);
      continue;
    }

    const promptsWithTopics = prompts?.filter(p => p.topic) || [];
    console.log(`   📊 Total prompts: ${prompts?.length}, With topics: ${promptsWithTopics.length}`);

    if (promptsWithTopics.length === 0) {
      console.log(`   ⚠️  No prompts with topics, skipping\n`);
      continue;
    }

    // Calculate topic analysis
    const topicAnalysis = calculateTopicAnalysis(prompts || []);

    if (!topicAnalysis) {
      console.log(`   ⚠️  Failed to calculate topic analysis\n`);
      continue;
    }

    console.log(`   📊 Calculated topic analysis: ${topicAnalysis.source.policies.length} policies`);

    // Update evaluation with topic_analysis
    const { error: updateError } = await supabase
      .from('evaluations')
      .update({ topic_analysis: topicAnalysis })
      .eq('id', evaluation.id);

    if (updateError) {
      console.log(`   ❌ Error updating evaluation: ${updateError.message}\n`);
      continue;
    }

    console.log(`   ✅ Successfully updated topic_analysis\n`);
  }

  console.log('🎉 Backfill complete!');
}

backfillMissingTopicAnalysis().catch(console.error);
