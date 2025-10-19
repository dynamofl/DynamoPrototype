// Test the topic analysis calculation locally
// Run with: npx tsx scripts/test-topic-analysis-calculation.ts

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://uabbbzzrwgfxiamvnunr.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVhYmJienpyd2dmeGlhbXZudW5yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2MTAxODgsImV4cCI6MjA3NTE4NjE4OH0.VVp4swv7T6VGNCi32198m0vaqXViMB5fmXP548Zg5JQ';

const supabase = createClient(supabaseUrl, supabaseKey);

// Copy the exact calculation functions from the edge function
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
  console.log(`\n🔍 Starting calculateTopicAnalysis with ${prompts.length} prompts\n`);

  const promptsWithTopics = prompts.filter(p => p.topic);
  console.log(`   📊 Prompts with topics: ${promptsWithTopics.length}`);

  if (promptsWithTopics.length === 0) {
    console.log('   ❌ No prompts with topics, returning null\n');
    return null;
  }

  const baselineSuccessCount = prompts.filter(p => p.attack_outcome === 'Attack Success').length;
  const baselineTotalCount = prompts.length;
  console.log(`   📊 Baseline: ${baselineSuccessCount}/${baselineTotalCount} successes\n`);

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

  console.log(`   📊 Found ${policyTopicMap.size} policies\n`);

  const policies: any[] = [];

  for (const [policyId, topicMap] of policyTopicMap.entries()) {
    const topics: any[] = [];
    console.log(`   📝 Processing policy: ${policyId} with ${topicMap.size} topics`);

    for (const [topicName, topicPrompts] of topicMap.entries()) {
      console.log(`      - Topic: ${topicName} (${topicPrompts.length} prompts)`);

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

  const result = {
    source: {
      type: 'policy_group',
      policies: policies
    }
  };

  console.log('\n✅ Topic analysis calculated successfully\n');
  return result;
}

async function testCalculation() {
  console.log('🧪 Testing Topic Analysis Calculation\n');
  console.log('='.repeat(80));

  // Get a recent evaluation
  const { data: evaluation } = await supabase
    .from('evaluations')
    .select('id, name, topic_analysis')
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })
    .limit(1)
    .single();

  if (!evaluation) {
    console.log('❌ No evaluations found');
    return;
  }

  console.log(`\n📝 Testing with evaluation: ${evaluation.name}`);
  console.log(`   ID: ${evaluation.id}`);
  console.log(`   Current topic_analysis: ${evaluation.topic_analysis ? 'EXISTS' : 'NULL'}`);

  // Get prompts
  const { data: prompts } = await supabase
    .from('evaluation_prompts')
    .select('*')
    .eq('evaluation_id', evaluation.id);

  console.log(`\n📊 Fetched ${prompts?.length || 0} prompts`);

  if (!prompts || prompts.length === 0) {
    console.log('❌ No prompts found');
    return;
  }

  // Calculate topic analysis
  const topicAnalysis = calculateTopicAnalysis(prompts);

  if (!topicAnalysis) {
    console.log('❌ calculateTopicAnalysis returned null!');
    return;
  }

  console.log('\n📋 Result Structure:');
  console.log(JSON.stringify(topicAnalysis, null, 2));

  console.log('\n✅ Calculation successful!');
  console.log(`   Policies: ${topicAnalysis.source.policies.length}`);
  topicAnalysis.source.policies.forEach((policy: any) => {
    console.log(`   - ${policy.policy_name}: ${policy.topics.length} topics`);
    policy.topics.forEach((topic: any) => {
      console.log(`      * ${topic.topic_name}: ${topic.occurrence} prompts, ASR=${topic.attack_success_rate.mean}%`);
    });
  });
}

testCalculation().catch(console.error);
