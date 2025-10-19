// Script to check if topic_analysis column exists and diagnose issues
// Run with: npx tsx scripts/check-topic-analysis.ts

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://uabbbzzrwgfxiamvnunr.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVhYmJienpyd2dmeGlhbXZudW5yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2MTAxODgsImV4cCI6MjA3NTE4NjE4OH0.VVp4swv7T6VGNCi32198m0vaqXViMB5fmXP548Zg5JQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTopicAnalysis() {
  console.log('🔍 Checking topic analysis setup...\n');

  // 1. Check if topic_analysis column exists by querying evaluations
  console.log('1. Checking if topic_analysis column exists...');
  const { data: evaluation, error: colError } = await supabase
    .from('evaluations')
    .select('id, name, topic_analysis, status')
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (colError && colError.message.includes('topic_analysis')) {
    console.log('   ❌ topic_analysis column does NOT exist in evaluations table');
    console.log('   📝 Action needed: Apply migration 20250104000031_add_topic_analysis.sql');
    console.log('\n   Run this in Supabase Dashboard → SQL Editor:');
    console.log('   ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS topic_analysis JSONB;');
    return;
  } else if (colError) {
    console.log('   ❌ Error querying evaluations:', colError.message);
    return;
  }

  console.log('   ✅ topic_analysis column exists');
  console.log(`   📊 Sample evaluation: ${evaluation?.name}`);
  console.log(`   📊 Has topic_analysis data: ${evaluation?.topic_analysis ? 'YES' : 'NO'}`);

  // 2. Check if prompts have topic data
  console.log('\n2. Checking if evaluation_prompts have topic data...');
  const { data: prompts, error: promptError } = await supabase
    .from('evaluation_prompts')
    .select('id, topic, policy_name')
    .eq('evaluation_id', evaluation?.id)
    .limit(5);

  if (promptError) {
    console.log('   ❌ Error querying prompts:', promptError.message);
    return;
  }

  const promptsWithTopics = prompts?.filter(p => p.topic) || [];
  console.log(`   📊 Total prompts checked: ${prompts?.length || 0}`);
  console.log(`   📊 Prompts with topics: ${promptsWithTopics.length}`);

  if (promptsWithTopics.length > 0) {
    console.log('   ✅ Prompts have topic data');
    console.log(`   📝 Sample topics: ${promptsWithTopics.map(p => p.topic).join(', ')}`);
  } else {
    console.log('   ❌ No prompts have topic data');
    console.log('   📝 Topics should be populated during prompt generation');
  }

  // 3. Check all completed evaluations
  console.log('\n3. Checking all completed evaluations...');
  const { data: allEvals, error: allError } = await supabase
    .from('evaluations')
    .select('id, name, topic_analysis')
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
    .limit(10);

  if (allError) {
    console.log('   ❌ Error:', allError.message);
    return;
  }

  const evalsWithTopicAnalysis = allEvals?.filter(e => e.topic_analysis) || [];
  console.log(`   📊 Total completed evaluations: ${allEvals?.length || 0}`);
  console.log(`   📊 With topic_analysis: ${evalsWithTopicAnalysis.length}`);
  console.log(`   📊 Without topic_analysis: ${(allEvals?.length || 0) - evalsWithTopicAnalysis.length}`);

  // 4. Summary and recommendations
  console.log('\n📋 Summary:');
  if (evalsWithTopicAnalysis.length === 0) {
    console.log('   ⚠️  No evaluations have topic_analysis data yet');
    console.log('\n🔧 Recommended actions:');
    console.log('   1. Verify edge function has latest code deployed');
    console.log('   2. Run a new evaluation to test topic_analysis generation');
    console.log('   3. For existing evaluations, run: scripts/backfill-topic-analysis.sql');
  } else {
    console.log(`   ✅ ${evalsWithTopicAnalysis.length} evaluations have topic_analysis data`);
  }
}

checkTopicAnalysis().catch(console.error);
