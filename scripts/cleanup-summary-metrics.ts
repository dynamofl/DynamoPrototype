/**
 * Cleanup Script: Set all summary_metrics to NULL
 *
 * Use this if you want to clear out all summary_metrics data
 * without dropping the column entirely
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Error: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function cleanupSummaryMetrics() {
  console.log('🧹 Starting summary_metrics cleanup...\n');

  try {
    // Get count of evaluations with summary_metrics
    const { count: beforeCount } = await supabase
      .from('evaluations')
      .select('*', { count: 'exact', head: true })
      .not('summary_metrics', 'is', null);

    console.log(`📊 Found ${beforeCount || 0} evaluations with summary_metrics\n`);

    if (!beforeCount || beforeCount === 0) {
      console.log('✅ No summary_metrics to clean up');
      return;
    }

    // Confirm
    const readline = await import('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const answer = await new Promise<string>((resolve) => {
      rl.question(`⚠️  This will set summary_metrics to NULL for ${beforeCount} evaluations. Continue? (yes/no): `, resolve);
    });
    rl.close();

    if (answer.toLowerCase() !== 'yes') {
      console.log('❌ Cleanup cancelled');
      return;
    }

    // Set all summary_metrics to NULL
    const { error } = await supabase
      .from('evaluations')
      .update({ summary_metrics: null })
      .not('summary_metrics', 'is', null);

    if (error) {
      throw new Error(`Error updating evaluations: ${error.message}`);
    }

    console.log('\n✅ Successfully cleared all summary_metrics!');

    // Verify
    const { count: afterCount } = await supabase
      .from('evaluations')
      .select('*', { count: 'exact', head: true })
      .not('summary_metrics', 'is', null);

    console.log(`📊 Remaining evaluations with summary_metrics: ${afterCount || 0}`);

  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

cleanupSummaryMetrics();
