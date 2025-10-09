// Migration script to move data from localStorage to Supabase

import { supabase, ensureAuthenticated } from './client';
import { AISystemsStorage } from '@/features/ai-systems/lib/ai-systems-storage';

// Generate proper UUID (crypto.randomUUID)
function generateUUID(): string {
  return crypto.randomUUID();
}

export async function migrateLocalStorageToSupabase() {
  await ensureAuthenticated();

  console.log('🚀 Starting migration from localStorage to Supabase...');

  try {
    // 1. Migrate AI Systems using storage API
    console.log('📦 Migrating AI Systems...');
    const aiSystemsStorage = new AISystemsStorage();
    const aiSystems = await aiSystemsStorage.getAISystems();

    if (aiSystems && aiSystems.length > 0) {
      console.log(`Found ${aiSystems.length} AI systems in storage`);

      for (const system of aiSystems) {
        // Generate UUID if ID is not already a valid UUID
        const id = system.id?.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
          ? system.id
          : generateUUID();

        const { error } = await supabase
          .from('ai_systems')
          .upsert({
            id,
            name: system.name,
            description: system.description || '',
            provider: system.providerId || system.providerName || 'unknown',
            model: system.selectedModel || system.model || 'unknown',
            config: {
              apiKeyId: system.apiKeyId,
              apiKeyName: system.apiKeyName,
              modelDetails: system.modelDetails,
              icon: system.icon,
              status: system.status,
              createdAt: system.createdAt
            }
          });

        if (error) {
          console.error(`Error migrating AI system ${system.name}:`, error);
        } else {
          console.log(`✅ Migrated AI system: ${system.name} (ID: ${id})`);
        }
      }
    } else {
      console.log('⚠️  No AI systems found in storage');
    }

    // 2. Migrate Guardrails from localStorage
    console.log('🛡️  Migrating Guardrails...');
    const guardrailsData = localStorage.getItem('guardrails');

    if (guardrailsData) {
      const guardrails = JSON.parse(guardrailsData);
      console.log(`Found ${guardrails.length} guardrails in localStorage`);

      for (const guardrail of guardrails) {
        // Generate UUID if ID is not already a valid UUID
        const id = guardrail.id?.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
          ? guardrail.id
          : generateUUID();

        // Structure policy data - only essential fields
        const policies = [{
          description: guardrail.description || '',
          allowedBehavior: guardrail.allowedBehavior || '',
          disallowedBehavior: guardrail.disallowedBehavior || ''
        }];

        const { error } = await supabase
          .from('guardrails')
          .upsert({
            id,
            name: guardrail.name,
            type: guardrail.type || 'Input Policy',
            category: guardrail.category || 'Content',
            policies: policies
          });

        if (error) {
          console.error(`Error migrating guardrail ${guardrail.name}:`, error);
        } else {
          console.log(`✅ Migrated guardrail: ${guardrail.name} (ID: ${id})`);
        }
      }
    } else {
      console.log('⚠️  No guardrails found in localStorage');
    }

    console.log('🎉 Migration complete!');
    console.log('');
    console.log('Summary:');

    // Verify migration
    const { data: aiSystemsCount } = await supabase
      .from('ai_systems')
      .select('*', { count: 'exact', head: true });

    const { data: guardrailsCount } = await supabase
      .from('guardrails')
      .select('*', { count: 'exact', head: true });

    console.log(`AI Systems in Supabase: ${aiSystemsCount?.length || 0}`);
    console.log(`Guardrails in Supabase: ${guardrailsCount?.length || 0}`);

    return {
      success: true,
      aiSystemsCount: aiSystemsCount?.length || 0,
      guardrailsCount: guardrailsCount?.length || 0
    };

  } catch (error) {
    console.error('❌ Migration failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Function to verify data in Supabase
export async function verifySupabaseData() {
  await ensureAuthenticated();

  const { data: aiSystems } = await supabase
    .from('ai_systems')
    .select('id, name, provider, model');

  const { data: guardrails } = await supabase
    .from('guardrails')
    .select('id, name, type, policies');

  console.log('AI Systems in Supabase:', aiSystems);
  console.log('Guardrails in Supabase:', guardrails);

  return { aiSystems, guardrails };
}

// Make functions available globally for console access
if (typeof window !== 'undefined') {
  (window as any).migrateToSupabase = migrateLocalStorageToSupabase;
  (window as any).verifySupabaseData = verifySupabaseData;
}
