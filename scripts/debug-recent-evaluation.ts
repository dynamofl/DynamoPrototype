import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://uabbbzzrwgfxiamvnunr.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVhYmJienpyd2dmeGlhbXZudW5yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2MTAxODgsImV4cCI6MjA3NTE4NjE4OH0.VVp4swv7T6VGNCi32198m0vaqXViMB5fmXP548Zg5JQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRecentEvaluation() {
  // Get most recent evaluation
  const { data: evaluations, error } = await supabase
    .from('evaluations')
    .select('id, name, status, config, created_at, risk_combinations')
    .order('created_at', { ascending: false })
    .limit(1);

  if (error || !evaluations || evaluations.length === 0) {
    console.log('❌ Error fetching evaluations:', error);
    return;
  }

  const evaluation = evaluations[0];
  const evaluationType = (evaluation.config as any)?.testType || 'jailbreak';
  console.log('\n📊 Most Recent Evaluation:');
  console.log('   Name:', evaluation.name);
  console.log('   Status:', evaluation.status);
  console.log('   Type:', evaluationType);
  console.log('   Has risk_combinations:', evaluation.risk_combinations ? 'YES ✅' : 'NO ❌');

  if (evaluation.risk_combinations) {
    const rc = evaluation.risk_combinations as any;
    console.log('   Total combinations:', rc.total_combinations);
    console.log('   Threshold:', rc.threshold + '%');
  }

  // Get prompts to check if they have topic and attack_type
  const promptTable = evaluationType === 'compliance' ? 'compliance_prompts' : 'jailbreak_prompts';
  const { data: prompts } = await supabase
    .from(promptTable)
    .select('topic, attack_type, attack_outcome')
    .eq('evaluation_id', evaluation.id);

  console.log('\n📝 Prompt Analysis (from ' + promptTable + '):');
  console.log('   Total prompts:', prompts?.length || 0);

  const withTopic = prompts?.filter(p => p.topic) || [];
  const withAttackType = prompts?.filter(p => p.attack_type) || [];
  const withBoth = prompts?.filter(p => p.topic && p.attack_type) || [];
  const attackSuccesses = prompts?.filter(p => p.attack_outcome === 'Attack Success') || [];

  console.log('   Prompts with topic:', withTopic.length);
  console.log('   Prompts with attack_type:', withAttackType.length);
  console.log('   Prompts with BOTH:', withBoth.length, withBoth.length === 0 ? '⚠️  ISSUE!' : '✅');
  console.log('   Attack successes:', attackSuccesses.length);

  // Show sample topics and attack types
  if (withTopic.length > 0) {
    const uniqueTopics = new Set(withTopic.map(p => p.topic).filter(Boolean));
    console.log('   Sample topics:', Array.from(uniqueTopics).slice(0, 3).join(', '));
  }
  if (withAttackType.length > 0) {
    const uniqueAttackTypes = new Set(withAttackType.map(p => p.attack_type).filter(Boolean));
    console.log('   Sample attack types:', Array.from(uniqueAttackTypes).slice(0, 3).join(', '));
  }

  // Calculate combinations manually
  if (withBoth.length > 0) {
    const combinationMap = new Map();
    for (const prompt of withBoth) {
      const key = `${prompt.topic}|||${prompt.attack_type}`;
      if (!combinationMap.has(key)) {
        combinationMap.set(key, []);
      }
      combinationMap.get(key).push(prompt);
    }

    console.log('\n🔍 Combination Analysis:');
    const combos: any[] = [];
    for (const [key, comboPrompts] of combinationMap.entries()) {
      const [topic, attackType] = key.split('|||');
      const successCount = (comboPrompts as any[]).filter(p => p.attack_outcome === 'Attack Success').length;
      const successRate = (successCount / (comboPrompts as any[]).length) * 100;
      combos.push({ topic, attackType, successRate, count: (comboPrompts as any[]).length });
    }

    combos.sort((a, b) => b.successRate - a.successRate);
    console.log('   Total unique combinations:', combos.length);
    console.log('\n   Top combinations:');
    combos.slice(0, 5).forEach((c, i) => {
      const aboveThreshold = c.successRate > 75 ? '✅ ABOVE 75%' : '❌ Below 75%';
      console.log(`   ${i + 1}. ${c.topic} × ${c.attackType}: ${c.successRate.toFixed(1)}% (${c.count} prompts) ${aboveThreshold}`);
    });

    const above75 = combos.filter(c => c.successRate > 75);
    console.log('\n   Combinations above 75% threshold:', above75.length, above75.length === 0 ? '⚠️  None found!' : '✅');
  }
}

checkRecentEvaluation().catch(console.error);
