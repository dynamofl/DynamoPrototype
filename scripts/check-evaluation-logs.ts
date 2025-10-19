// Check evaluation logs to see if topic analysis is being calculated
// Run with: npx tsx scripts/check-evaluation-logs.ts

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://uabbbzzrwgfxiamvnunr.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVhYmJienpyd2dmeGlhbXZudW5yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2MTAxODgsImV4cCI6MjA3NTE4NjE4OH0.VVp4swv7T6VGNCi32198m0vaqXViMB5fmXP548Zg5JQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkLogs() {
  console.log('🔍 Checking evaluation logs for topic analysis...\n');

  // Get the most recent evaluation without topic_analysis
  const { data: evaluation, error: evalError } = await supabase
    .from('evaluations')
    .select('id, name, topic_analysis, completed_at')
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })
    .limit(1)
    .single();

  if (evalError || !evaluation) {
    console.log('❌ No evaluations found');
    return;
  }

  console.log(`📝 Checking logs for: ${evaluation.name}`);
  console.log(`   ID: ${evaluation.id}`);
  console.log(`   Completed at: ${evaluation.completed_at}`);
  console.log(`   Has topic_analysis: ${evaluation.topic_analysis ? 'YES' : 'NO'}\n`);

  // Get logs for this evaluation
  const { data: logs, error: logsError } = await supabase
    .from('evaluation_logs')
    .select('*')
    .eq('evaluation_id', evaluation.id)
    .order('created_at', { ascending: true });

  if (logsError) {
    console.log('❌ Error fetching logs:', logsError.message);
    return;
  }

  console.log(`📊 Found ${logs?.length || 0} log entries\n`);

  // Filter for topic analysis related logs
  const topicLogs = logs?.filter(log =>
    log.message.toLowerCase().includes('topic') ||
    log.message.toLowerCase().includes('finalization')
  ) || [];

  console.log('📋 Topic Analysis Related Logs:');
  console.log('================================\n');

  if (topicLogs.length === 0) {
    console.log('⚠️  No logs mentioning "topic" or "finalization" found\n');
    console.log('Recent logs:');
    logs?.slice(-10).forEach(log => {
      console.log(`   [${log.level}] ${log.message}`);
    });
  } else {
    topicLogs.forEach(log => {
      const time = new Date(log.created_at).toLocaleTimeString();
      console.log(`[${time}] [${log.level.toUpperCase()}] ${log.message}`);
    });
  }

  // Check if there are any error logs
  const errorLogs = logs?.filter(log => log.level === 'error') || [];
  if (errorLogs.length > 0) {
    console.log('\n⚠️  Error Logs Found:');
    errorLogs.forEach(log => {
      console.log(`   ${log.message}`);
    });
  }

  // Check prompts
  console.log('\n📊 Prompt Details:');
  const { data: prompts } = await supabase
    .from('evaluation_prompts')
    .select('topic')
    .eq('evaluation_id', evaluation.id);

  const promptsWithTopics = prompts?.filter(p => p.topic) || [];
  console.log(`   Total prompts: ${prompts?.length || 0}`);
  console.log(`   With topics: ${promptsWithTopics.length}`);

  if (promptsWithTopics.length > 0) {
    const uniqueTopics = [...new Set(promptsWithTopics.map(p => p.topic))];
    console.log(`   Unique topics: ${uniqueTopics.join(', ')}`);
  }
}

checkLogs().catch(console.error);
