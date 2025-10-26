import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://uabbbzzrwgfxiamvnunr.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVhYmJienpyd2dmeGlhbXZudW5yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2MTAxODgsImV4cCI6MjA3NTE4NjE4OH0.VVp4swv7T6VGNCi32198m0vaqXViMB5fmXP548Zg5JQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyAttackTypeColumn() {
  console.log('🔍 Checking jailbreak_prompts table for attack_type column...\n');

  // Get a sample prompt to check structure
  const { data: prompts, error } = await supabase
    .from('jailbreak_prompts')
    .select('id, topic, attack_type')
    .limit(5);

  if (error) {
    console.log('❌ Error querying jailbreak_prompts:', error.message);
    return;
  }

  if (!prompts || prompts.length === 0) {
    console.log('⚠️  No prompts found in jailbreak_prompts table');
    return;
  }

  console.log(`✅ Found ${prompts.length} sample prompts\n`);

  console.log('📊 Sample Data:');
  prompts.forEach((p, i) => {
    console.log(`\n   ${i + 1}. Prompt ID: ${p.id}`);
    console.log(`      Topic: ${p.topic || '❌ MISSING'}`);
    console.log(`      Attack Type: ${p.attack_type || '❌ MISSING'}`);
  });

  // Check how many have attack_type
  const withAttackType = prompts.filter(p => p.attack_type);
  console.log(`\n✅ Prompts with attack_type: ${withAttackType.length}/${prompts.length}`);

  if (withAttackType.length > 0) {
    // Show unique attack types
    const uniqueTypes = [...new Set(prompts.map(p => p.attack_type).filter(Boolean))];
    console.log(`\n📋 Unique attack types found:`);
    uniqueTypes.forEach(type => {
      console.log(`   - ${type}`);
    });

    console.log('\n✅ SUCCESS! The jailbreak_prompts table HAS the attack_type column.');
    console.log('   The backend will automatically map these to attack_level.');
  } else {
    console.log('\n❌ ISSUE: No prompts have attack_type values');
  }
}

verifyAttackTypeColumn().catch(console.error);
