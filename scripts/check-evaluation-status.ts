// Check detailed status of recent evaluations
// Run with: npx tsx scripts/check-evaluation-status.ts

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://uabbbzzrwgfxiamvnunr.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVhYmJienpyd2dmeGlhbXZudW5yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2MTAxODgsImV4cCI6MjA3NTE4NjE4OH0.VVp4swv7T6VGNCi32198m0vaqXViMB5fmXP548Zg5JQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkStatus() {
  console.log('🔍 Checking recent evaluation statuses...\n');

  const { data: evals } = await supabase
    .from('evaluations')
    .select('id, name, status, total_prompts, completed_prompts, created_at, started_at, completed_at, topic_analysis')
    .order('created_at', { ascending: false })
    .limit(5);

  for (const evaluation of evals || []) {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`📝 ${evaluation.name}`);
    console.log(`   ID: ${evaluation.id}`);
    console.log(`   Status: ${evaluation.status}`);
    console.log(`   Progress: ${evaluation.completed_prompts}/${evaluation.total_prompts}`);
    console.log(`   Created: ${evaluation.created_at}`);
    console.log(`   Started: ${evaluation.started_at || 'N/A'}`);
    console.log(`   Completed: ${evaluation.completed_at || 'N/A'}`);
    console.log(`   Has topic_analysis: ${evaluation.topic_analysis ? 'YES' : 'NO'}`);

    // Check prompt statuses
    const { data: promptStats } = await supabase
      .rpc('count_prompt_statuses', { eval_id: evaluation.id })
      .single();

    if (!promptStats) {
      // Fallback: manual count
      const { data: prompts } = await supabase
        .from('evaluation_prompts')
        .select('status, topic')
        .eq('evaluation_id', evaluation.id);

      const completed = prompts?.filter(p => p.status === 'completed').length || 0;
      const pending = prompts?.filter(p => p.status === 'pending').length || 0;
      const running = prompts?.filter(p => p.status === 'running').length || 0;
      const failed = prompts?.filter(p => p.status === 'failed').length || 0;
      const withTopics = prompts?.filter(p => p.topic).length || 0;

      console.log(`\n   Prompt Statuses:`);
      console.log(`      Completed: ${completed}`);
      console.log(`      Pending: ${pending}`);
      console.log(`      Running: ${running}`);
      console.log(`      Failed: ${failed}`);
      console.log(`      With Topics: ${withTopics}`);
    }
  }
}

checkStatus().catch(console.error);
