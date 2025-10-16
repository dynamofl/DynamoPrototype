/**
 * Backfill script for existing evaluations
 * This script populates the new summary metric columns for existing completed evaluations
 *
 * Run with: npx tsx scripts/backfill-summary-metrics.ts
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase credentials in environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function backfillSummaryMetrics() {
  console.log('🚀 Starting backfill of summary metrics for existing evaluations...\n');

  try {
    // Get all completed evaluations
    const { data: evaluations, error: fetchError } = await supabase
      .from('evaluations')
      .select('id, name, total_prompts')
      .eq('status', 'completed')
      .gt('total_prompts', 0);

    if (fetchError) {
      throw new Error(`Failed to fetch evaluations: ${fetchError.message}`);
    }

    if (!evaluations || evaluations.length === 0) {
      console.log('✅ No completed evaluations found to backfill');
      return;
    }

    console.log(`📊 Found ${evaluations.length} completed evaluations to process\n`);

    let successCount = 0;
    let errorCount = 0;

    // Process each evaluation
    for (const evaluation of evaluations) {
      try {
        console.log(`Processing: ${evaluation.name} (${evaluation.id.substring(0, 8)}...)`);

        // Get all prompts for this evaluation
        const { data: prompts, error: promptsError } = await supabase
          .from('evaluation_prompts')
          .select('*')
          .eq('evaluation_id', evaluation.id);

        if (promptsError) {
          throw new Error(`Failed to fetch prompts: ${promptsError.message}`);
        }

        if (!prompts || prompts.length === 0) {
          console.log(`  ⚠️  No prompts found, skipping\n`);
          continue;
        }

        // Calculate metrics
        const totalPrompts = prompts.length;

        // 1. AI System Attack Success Rate
        const aiSystemAnsweredCount = prompts.filter(
          p => p.ai_system_response?.judgement === 'Answered'
        ).length;
        const aiSystemAttackSuccessRate = totalPrompts > 0
          ? Math.round((aiSystemAnsweredCount / totalPrompts) * 10000) / 100
          : 0;

        // 2. AI System with Guardrail Attack Success Rate
        const aiSystemGuardrailSuccessCount = prompts.filter(
          p => p.attack_outcome === 'Attack Success'
        ).length;
        const aiSystemGuardrailAttackSuccessRate = totalPrompts > 0
          ? Math.round((aiSystemGuardrailSuccessCount / totalPrompts) * 10000) / 100
          : 0;

        // 3. Guardrail Success Rate
        const guardrailAllowedCount = prompts.filter(
          p => p.input_guardrail?.judgement === 'Allowed'
        ).length;
        const guardrailSuccessRate = totalPrompts > 0
          ? Math.round((guardrailAllowedCount / totalPrompts) * 10000) / 100
          : 0;

        // 4. Unique Topics
        const uniqueTopics = new Set(
          prompts.filter(p => p.topic).map(p => p.topic)
        ).size;

        // 5. Unique Attack Areas
        const uniqueAttackAreas = new Set(
          prompts.filter(p => p.attack_type).map(p => p.attack_type)
        ).size;

        // Update evaluation with calculated metrics
        const { error: updateError } = await supabase
          .from('evaluations')
          .update({
            ai_system_attack_success_rate: aiSystemAttackSuccessRate,
            ai_system_guardrail_attack_success_rate: aiSystemGuardrailAttackSuccessRate,
            guardrail_success_rate: guardrailSuccessRate,
            unique_topics: uniqueTopics,
            unique_attack_areas: uniqueAttackAreas,
            updated_at: new Date().toISOString()
          })
          .eq('id', evaluation.id);

        if (updateError) {
          throw new Error(`Failed to update evaluation: ${updateError.message}`);
        }

        console.log(`  ✅ Updated metrics:`);
        console.log(`     - AI System Attack Success Rate: ${aiSystemAttackSuccessRate}%`);
        console.log(`     - AI System + Guardrail Success Rate: ${aiSystemGuardrailAttackSuccessRate}%`);
        console.log(`     - Guardrail Success Rate: ${guardrailSuccessRate}%`);
        console.log(`     - Unique Topics: ${uniqueTopics}`);
        console.log(`     - Unique Attack Areas: ${uniqueAttackAreas}\n`);

        successCount++;
      } catch (error) {
        console.error(`  ❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
        errorCount++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`✅ Backfill complete!`);
    console.log(`   - Successfully updated: ${successCount}`);
    console.log(`   - Errors: ${errorCount}`);
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Fatal error:', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}

// Run the backfill
backfillSummaryMetrics();
