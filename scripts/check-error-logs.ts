// Check for ERROR level logs
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://uabbbzzrwgfxiamvnunr.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVhYmJienpyd2dmeGlhbXZudW5yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2MTAxODgsImV4cCI6MjA3NTE4NjE4OH0.VVp4swv7T6VGNCi32198m0vaqXViMB5fmXP548Zg5JQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkErrors() {
  const evalId = '40627425-4824-4d9f-82e3-4bbded43f5b7';

  const { data: allLogs } = await supabase
    .from('evaluation_logs')
    .select('*')
    .eq('evaluation_id', evalId)
    .order('created_at', { ascending: true });

  console.log(`\n📋 Total logs: ${allLogs?.length}\n`);

  allLogs?.forEach((log, i) => {
    console.log(`${i + 1}. [${log.level.toUpperCase()}] ${log.message.substring(0, 150)}`);
  });

  const errorLogs = allLogs?.filter(l => l.level === 'error');
  console.log(`\n🔴 Error logs: ${errorLogs?.length || 0}\n`);

  errorLogs?.forEach(log => {
    console.log(`[ERROR] ${log.message}`);
  });
}

checkErrors().catch(console.error);
