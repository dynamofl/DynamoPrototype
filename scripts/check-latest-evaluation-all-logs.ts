// Check ALL logs including errors
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://uabbbzzrwgfxiamvnunr.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVhYmJienpyd2dmeGlhbXZudW5yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2MTAxODgsImV4cCI6MjA3NTE4NjE4OH0.VVp4swv7T6VGNCi32198m0vaqXViMB5fmXP548Zg5JQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkLogs() {
  const { data: evaluation } = await supabase
    .from('evaluations')
    .select('id, name')
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })
    .limit(1)
    .single();

  console.log(`\n📝 Evaluation: ${evaluation.name}`);
  console.log(`   ID: ${evaluation.id}\n`);

  const { data: logs } = await supabase
    .from('evaluation_logs')
    .select('*')
    .eq('evaluation_id', evaluation.id)
    .order('created_at', { ascending: true });

  console.log(`📋 ALL LOGS (${logs?.length}):\n`);

  logs?.forEach((log, i) => {
    const time = new Date(log.created_at).toLocaleTimeString();
    console.log(`${i + 1}. [${time}] [${log.level.toUpperCase()}]`);
    console.log(`   ${log.message}\n`);
  });
}

checkLogs().catch(console.error);
