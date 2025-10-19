// Check ALL logs for an evaluation
// Run with: npx tsx scripts/check-all-evaluation-logs.ts

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://uabbbzzrwgfxiamvnunr.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVhYmJienpyd2dmeGlhbXZudW5yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2MTAxODgsImV4cCI6MjA3NTE4NjE4OH0.VVp4swv7T6VGNCi32198m0vaqXViMB5fmXP548Zg5JQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAllLogs() {
  const { data: evaluation } = await supabase
    .from('evaluations')
    .select('id, name, topic_analysis')
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })
    .limit(1)
    .single();

  if (!evaluation) {
    console.log('No evaluation found');
    return;
  }

  console.log(`\n📝 Evaluation: ${evaluation.name}`);
  console.log(`   ID: ${evaluation.id}`);
  console.log(`   Has topic_analysis: ${evaluation.topic_analysis ? 'YES' : 'NO'}\n`);

  const { data: logs } = await supabase
    .from('evaluation_logs')
    .select('*')
    .eq('evaluation_id', evaluation.id)
    .order('created_at', { ascending: true });

  console.log(`📋 ALL LOGS (${logs?.length || 0} entries):\n`);

  logs?.forEach((log, index) => {
    const time = new Date(log.created_at).toLocaleTimeString();
    console.log(`${index + 1}. [${time}] [${log.level.toUpperCase()}] ${log.message.substring(0, 200)}${log.message.length > 200 ? '...' : ''}`);
  });
}

checkAllLogs().catch(console.error);
