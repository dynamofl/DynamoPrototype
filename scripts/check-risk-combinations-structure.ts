import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://uabbbzzrwgfxiamvnunr.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVhYmJienpyd2dmeGlhbXZudW5yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2MTAxODgsImV4cCI6MjA3NTE4NjE4OH0.VVp4swv7T6VGNCi32198m0vaqXViMB5fmXP548Zg5JQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRiskCombinations() {
  console.log('🔍 Checking risk combinations structure in most recent evaluation...\n');

  // Get most recent completed evaluation with risk_combinations
  const { data: evaluations, error } = await supabase
    .from('evaluations')
    .select('id, name, created_at, risk_combinations')
    .eq('status', 'completed')
    .not('risk_combinations', 'is', null)
    .order('created_at', { ascending: false })
    .limit(1);

  if (error || !evaluations || evaluations.length === 0) {
    console.log('❌ No evaluations with risk_combinations found');
    console.log('Error:', error);
    return;
  }

  const evaluation = evaluations[0];
  console.log('📊 Evaluation:', evaluation.name);
  console.log('📅 Created:', evaluation.created_at);
  console.log('');

  const rc = evaluation.risk_combinations as any;

  if (!rc) {
    console.log('❌ No risk_combinations data');
    return;
  }

  console.log('📈 Risk Combinations Summary:');
  console.log(`   Total combinations: ${rc.total_combinations || rc.combinations?.length || 0}`);
  console.log(`   Granular count: ${rc.granular_count || 'N/A'}`);
  console.log(`   Level count: ${rc.level_count || 'N/A'}`);
  console.log(`   Threshold: ${rc.threshold}%`);
  console.log('');

  if (rc.combinations && rc.combinations.length > 0) {
    console.log('🔎 First 5 combinations:');
    rc.combinations.slice(0, 5).forEach((combo: any, index: number) => {
      console.log(`\n   ${index + 1}. ${combo.attack_area} × ${combo.attack_type || combo.attack_level}`);
      console.log(`      Combination type: ${combo.combination_type || '❌ MISSING'}`);
      console.log(`      Attack success rate: ${combo.attack_success_rate}%`);
      console.log(`      Occurrence: ${combo.occurrence}`);
      console.log(`      Has attack_type: ${combo.attack_type ? '✅' : '❌'}`);
      console.log(`      Has attack_level: ${combo.attack_level ? '✅' : '❌'}`);
    });

    // Check if ANY have combination_type set
    const withType = rc.combinations.filter((c: any) => c.combination_type);
    const granular = rc.combinations.filter((c: any) => c.combination_type === 'granular');
    const level = rc.combinations.filter((c: any) => c.combination_type === 'level');

    console.log('\n📊 Type Distribution:');
    console.log(`   Combinations WITH combination_type: ${withType.length}/${rc.combinations.length}`);
    console.log(`   Granular (attack_type): ${granular.length}`);
    console.log(`   Level (attack_level): ${level.length}`);
    console.log(`   Missing combination_type: ${rc.combinations.length - withType.length}`);

    if (withType.length === 0) {
      console.log('\n⚠️  WARNING: No combinations have combination_type field!');
      console.log('   This means the data was calculated with the OLD logic.');
      console.log('   You need to either:');
      console.log('   1. Run the backfill script to recalculate existing evaluations');
      console.log('   2. Run a NEW evaluation (backend is already deployed with new logic)');
    }
  } else {
    console.log('❌ No combinations array found');
  }
}

checkRiskCombinations().catch(console.error);
