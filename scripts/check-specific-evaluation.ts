// Check specific evaluation in detail
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://uabbbzzrwgfxiamvnunr.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVhYmJienpyd2dmeGlhbXZudW5yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2MTAxODgsImV4cCI6MjA3NTE4NjE4OH0.VVp4swv7T6VGNCi32198m0vaqXViMB5fmXP548Zg5JQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkEvaluation() {
  const evalId = '69fd2f71-f8fb-4894-b5d0-a64b26c90e65';

  const { data: evaluation } = await supabase
    .from('evaluations')
    .select('*')
    .eq('id', evalId)
    .single();

  console.log('\n📊 Evaluation Details:');
  console.log('   Name:', evaluation.name);
  console.log('   Status:', evaluation.status);
  console.log('   Has summary_metrics:', evaluation.summary_metrics ? 'YES' : 'NO');
  console.log('   Has topic_analysis:', evaluation.topic_analysis ? 'YES' : 'NO');
  console.log('   ai_system_attack_success_rate:', evaluation.ai_system_attack_success_rate);
  console.log('   ai_system_guardrail_attack_success_rate:', evaluation.ai_system_guardrail_attack_success_rate);
  console.log('   guardrail_success_rate:', evaluation.guardrail_success_rate);
  console.log('   unique_topics:', evaluation.unique_topics);
  console.log('   unique_attack_areas:', evaluation.unique_attack_areas);

  if (evaluation.summary_metrics) {
    console.log('\n📊 Summary Metrics Structure:');
    console.log('   Keys:', Object.keys(evaluation.summary_metrics));
  }

  const { data: logs } = await supabase
    .from('evaluation_logs')
    .select('*')
    .eq('evaluation_id', evalId)
    .order('created_at', { ascending: true });

  console.log(`\n📋 All logs (${logs?.length}):`);
  logs?.forEach((log, i) => {
    console.log(`${i + 1}. [${log.level}] ${log.message.substring(0, 150)}`);
  });
}

checkEvaluation().catch(console.error);
