/**
 * Fix invalid UUIDs in Supabase that were created by the flawed generateUUIDFromString function
 */

import { supabase, ensureAuthenticated } from './client';

/**
 * Check if a UUID is valid (proper format and not all zeros at the start)
 */
function isValidUUID(uuid: string): boolean {
  // Check format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuid || !uuidRegex.test(uuid)) {
    return false;
  }

  // Check if it's a suspicious UUID (starts with many zeros - likely from bad hash)
  // Bad UUIDs from generateUUIDFromString look like: 00000000-0000-4000-8000-000051999194
  if (uuid.startsWith('00000000-0000')) {
    return false;
  }

  return true;
}

/**
 * Fix invalid UUIDs in ai_systems table
 */
export async function fixInvalidUUIDs(): Promise<{
  success: boolean;
  fixed: { aiSystems: number; guardrails: number; evaluations: number };
  errors: string[];
}> {
  await ensureAuthenticated();

  const errors: string[] = [];
  const fixed = { aiSystems: 0, guardrails: 0, evaluations: 0 };

  try {
    console.log('🔍 Scanning for invalid UUIDs in Supabase...');

    // 1. Fix AI Systems
    console.log('\n📦 Checking AI Systems...');
    const { data: aiSystems, error: aiSystemsError } = await supabase
      .from('ai_systems')
      .select('*');

    if (aiSystemsError) {
      errors.push(`Failed to fetch AI systems: ${aiSystemsError.message}`);
    } else if (aiSystems) {
      for (const system of aiSystems) {
        if (!isValidUUID(system.id)) {
          console.log(`❌ Invalid UUID found: ${system.id} (${system.name})`);

          const newId = crypto.randomUUID();
          console.log(`   Replacing with: ${newId}`);

          // Delete old record
          const { error: deleteError } = await supabase
            .from('ai_systems')
            .delete()
            .eq('id', system.id);

          if (deleteError) {
            errors.push(`Failed to delete AI system ${system.id}: ${deleteError.message}`);
            continue;
          }

          // Insert with new UUID
          const { error: insertError } = await supabase
            .from('ai_systems')
            .insert({
              ...system,
              id: newId
            });

          if (insertError) {
            errors.push(`Failed to re-insert AI system with new UUID: ${insertError.message}`);
          } else {
            console.log(`   ✅ Fixed AI system: ${system.name}`);
            fixed.aiSystems++;

            // Update any evaluations referencing this AI system
            const { error: updateEvalError } = await supabase
              .from('evaluations')
              .update({ ai_system_id: newId })
              .eq('ai_system_id', system.id);

            if (updateEvalError) {
              console.warn(`   ⚠️  Warning: Could not update evaluation references: ${updateEvalError.message}`);
            }
          }
        }
      }
    }

    // 2. Fix Guardrails
    console.log('\n🛡️  Checking Guardrails...');
    const { data: guardrails, error: guardrailsError } = await supabase
      .from('guardrails')
      .select('*');

    if (guardrailsError) {
      errors.push(`Failed to fetch guardrails: ${guardrailsError.message}`);
    } else if (guardrails) {
      for (const guardrail of guardrails) {
        if (!isValidUUID(guardrail.id)) {
          console.log(`❌ Invalid UUID found: ${guardrail.id} (${guardrail.name})`);

          const newId = crypto.randomUUID();
          console.log(`   Replacing with: ${newId}`);

          // Delete old record
          const { error: deleteError } = await supabase
            .from('guardrails')
            .delete()
            .eq('id', guardrail.id);

          if (deleteError) {
            errors.push(`Failed to delete guardrail ${guardrail.id}: ${deleteError.message}`);
            continue;
          }

          // Insert with new UUID
          const { error: insertError } = await supabase
            .from('guardrails')
            .insert({
              ...guardrail,
              id: newId
            });

          if (insertError) {
            errors.push(`Failed to re-insert guardrail with new UUID: ${insertError.message}`);
          } else {
            console.log(`   ✅ Fixed guardrail: ${guardrail.name}`);
            fixed.guardrails++;
          }
        }
      }
    }

    // 3. Fix Evaluations (if any have invalid UUIDs)
    console.log('\n📊 Checking Evaluations...');
    const { data: evaluations, error: evaluationsError } = await supabase
      .from('evaluations')
      .select('*');

    if (evaluationsError) {
      errors.push(`Failed to fetch evaluations: ${evaluationsError.message}`);
    } else if (evaluations) {
      for (const evaluation of evaluations) {
        if (!isValidUUID(evaluation.id)) {
          console.log(`❌ Invalid UUID found: ${evaluation.id} (${evaluation.name})`);

          const newId = crypto.randomUUID();
          console.log(`   Replacing with: ${newId}`);

          // Delete old record
          const { error: deleteError } = await supabase
            .from('evaluations')
            .delete()
            .eq('id', evaluation.id);

          if (deleteError) {
            errors.push(`Failed to delete evaluation ${evaluation.id}: ${deleteError.message}`);
            continue;
          }

          // Insert with new UUID
          const { error: insertError } = await supabase
            .from('evaluations')
            .insert({
              ...evaluation,
              id: newId
            });

          if (insertError) {
            errors.push(`Failed to re-insert evaluation with new UUID: ${insertError.message}`);
          } else {
            console.log(`   ✅ Fixed evaluation: ${evaluation.name}`);
            fixed.evaluations++;
          }
        }
      }
    }

    console.log('\n✅ UUID fix complete!');
    console.log('Summary:');
    console.log(`  - AI Systems fixed: ${fixed.aiSystems}`);
    console.log(`  - Guardrails fixed: ${fixed.guardrails}`);
    console.log(`  - Evaluations fixed: ${fixed.evaluations}`);

    if (errors.length > 0) {
      console.log(`  - Errors encountered: ${errors.length}`);
      errors.forEach(err => console.error(`    ❌ ${err}`));
    }

    return {
      success: errors.length === 0,
      fixed,
      errors
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('❌ UUID fix failed:', errorMessage);
    return {
      success: false,
      fixed,
      errors: [errorMessage]
    };
  }
}

// Make function available globally for console access
if (typeof window !== 'undefined') {
  (window as any).fixInvalidUUIDs = fixInvalidUUIDs;
}
