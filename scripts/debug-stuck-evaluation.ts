// Debug script to check stuck evaluation
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://uabbbzzrwgfxiamvnunr.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found in environment');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugStuckEvaluation() {
  console.log('🔍 Checking for stuck evaluations...\n');

  // Get all pending/running evaluations
  const { data: evaluations, error } = await supabase
    .from('evaluations')
    .select('*')
    .in('status', ['pending', 'running', 'preparing'])
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error('❌ Error fetching evaluations:', error);
    return;
  }

  if (!evaluations || evaluations.length === 0) {
    console.log('✅ No stuck evaluations found');
    return;
  }

  console.log(`Found ${evaluations.length} evaluations in pending/running state:\n`);

  for (const eval of evaluations) {
    console.log(`📊 Evaluation: ${eval.name}`);
    console.log(`   ID: ${eval.id}`);
    console.log(`   Status: ${eval.status}`);
    console.log(`   Type: ${eval.evaluation_type}`);
    console.log(`   Created: ${eval.created_at}`);
    console.log(`   Total prompts: ${eval.total_prompts}`);
    console.log(`   Completed prompts: ${eval.completed_prompts}`);
    console.log(`   Current stage: ${eval.current_stage || 'N/A'}`);

    // Check evaluation logs
    const { data: logs, error: logsError } = await supabase
      .from('evaluation_logs')
      .select('*')
      .eq('evaluation_id', eval.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (logsError) {
      console.log(`   ⚠️  Could not fetch logs: ${logsError.message}`);
    } else if (logs && logs.length > 0) {
      console.log(`   📝 Recent logs (${logs.length}):`);
      logs.forEach(log => {
        console.log(`      [${log.level.toUpperCase()}] ${log.message}`);
        if (log.metadata) {
          console.log(`      Metadata:`, JSON.stringify(log.metadata, null, 2));
        }
      });
    } else {
      console.log(`   ⚠️  No logs found`);
    }

    // Check if prompts exist
    const promptTable = eval.config?.testType === 'compliance' ? 'compliance_prompts' : 'jailbreak_prompts';
    const { count: promptCount, error: promptError } = await supabase
      .from(promptTable)
      .select('*', { count: 'exact', head: true })
      .eq('evaluation_id', eval.id);

    if (promptError) {
      console.log(`   ⚠️  Could not count prompts in ${promptTable}: ${promptError.message}`);
    } else {
      console.log(`   📝 Prompts in ${promptTable}: ${promptCount}`);
    }

    console.log('');
  }

  // Provide recommendations
  console.log('\n💡 Recommendations:');
  console.log('1. Check the edge function logs in Supabase dashboard: Functions → create-evaluation & run-evaluation');
  console.log('2. Check browser console for any network errors');
  console.log('3. Verify internal models are configured in Settings → Internal Models');
  console.log('4. Check that OPENAI_API_KEY secret is set in Supabase edge function secrets');
}

debugStuckEvaluation().catch(console.error);
