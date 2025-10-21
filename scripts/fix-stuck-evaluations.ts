#!/usr/bin/env tsx

/**
 * Recovery script for stuck evaluations
 *
 * This script identifies and fixes evaluations that are stuck in 'pending' status
 * for more than 10 minutes. These typically failed during background prompt generation
 * but didn't update their status properly.
 *
 * Usage:
 *   npm run fix-stuck-evaluations
 *   or
 *   tsx scripts/fix-stuck-evaluations.ts
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing required environment variables:');
  console.error('   - VITE_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

interface StuckEvaluation {
  id: string;
  name: string;
  ai_system_id: string;
  created_at: string;
  total_prompts: number;
  completed_prompts: number;
  current_stage: string | null;
}

async function findStuckEvaluations(): Promise<StuckEvaluation[]> {
  console.log('🔍 Searching for stuck evaluations...\n');

  // Find evaluations that are:
  // 1. status = 'pending'
  // 2. created more than 10 minutes ago
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();

  const { data: stuckEvaluations, error } = await supabase
    .from('evaluations')
    .select('id, name, ai_system_id, created_at, total_prompts, completed_prompts, current_stage')
    .eq('status', 'pending')
    .lt('created_at', tenMinutesAgo)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Error querying evaluations:', error);
    throw error;
  }

  return stuckEvaluations || [];
}

async function fixStuckEvaluation(evaluation: StuckEvaluation): Promise<void> {
  console.log(`\n📝 Fixing evaluation: ${evaluation.name} (${evaluation.id})`);
  console.log(`   Created: ${new Date(evaluation.created_at).toLocaleString()}`);
  console.log(`   Total prompts: ${evaluation.total_prompts}`);
  console.log(`   Current stage: ${evaluation.current_stage || 'None'}`);

  // Update status to failed with explanation
  const { error: updateError } = await supabase
    .from('evaluations')
    .update({
      status: 'failed',
      current_stage: 'Failed: Stuck in preparation (auto-fixed by recovery script)',
      updated_at: new Date().toISOString()
    })
    .eq('id', evaluation.id);

  if (updateError) {
    console.error(`   ❌ Failed to update evaluation:`, updateError);
    return;
  }

  // Log the recovery action
  const { error: logError } = await supabase
    .from('evaluation_logs')
    .insert({
      evaluation_id: evaluation.id,
      level: 'error',
      message: 'Evaluation stuck in pending status for >10 minutes. Auto-marked as failed by recovery script.',
      metadata: {
        original_created_at: evaluation.created_at,
        total_prompts: evaluation.total_prompts,
        recovery_timestamp: new Date().toISOString()
      }
    });

  if (logError) {
    console.warn(`   ⚠️  Failed to create log entry:`, logError);
  }

  console.log(`   ✅ Evaluation marked as failed`);
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('   Stuck Evaluation Recovery Script');
  console.log('═══════════════════════════════════════════════════════════\n');

  try {
    const stuckEvaluations = await findStuckEvaluations();

    if (stuckEvaluations.length === 0) {
      console.log('✅ No stuck evaluations found. All evaluations are healthy!');
      return;
    }

    console.log(`⚠️  Found ${stuckEvaluations.length} stuck evaluation(s)\n`);
    console.log('━'.repeat(60));

    for (const evaluation of stuckEvaluations) {
      await fixStuckEvaluation(evaluation);
    }

    console.log('\n━'.repeat(60));
    console.log(`\n✅ Recovery complete! Fixed ${stuckEvaluations.length} evaluation(s)`);
    console.log('\n💡 Tip: These evaluations likely failed due to:');
    console.log('   - Missing API keys for internal models');
    console.log('   - Network issues during prompt generation');
    console.log('   - Database permission issues');
    console.log('\n   Check the evaluation_logs table for detailed error messages.');

  } catch (error) {
    console.error('\n❌ Recovery script failed:', error);
    process.exit(1);
  }
}

// Run the script
main().catch(console.error);
