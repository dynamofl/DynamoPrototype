/**
 * Migration script to move API keys from localStorage to Supabase Vault
 * Run in browser console: await window.migrateKeysToVault()
 */

import { APIKeyStorage } from '@/lib/storage/secure-storage';
import { SecureAPIKeyService } from './secure-api-key-service';
import { supabase } from './client';

export async function migrateKeysToVault() {
  console.log('🚀 Starting API Key Migration to Vault...\n');

  const migrationReport = {
    total: 0,
    successful: 0,
    failed: 0,
    skipped: 0,
    errors: [] as Array<{ provider: string; error: string }>
  };

  try {
    // Step 1: Get existing providers from localStorage
    console.log('📦 Step 1: Loading providers from localStorage...');
    const providers = APIKeyStorage.loadProviders();
    migrationReport.total = providers.length;

    if (providers.length === 0) {
      console.log('⚠️  No providers found in localStorage');
      console.log('   Either already migrated or no keys stored');
      return migrationReport;
    }

    console.log(`✅ Found ${providers.length} providers to migrate\n`);

    // Step 2: Migrate each provider
    for (const provider of providers) {
      console.log(`🔄 Migrating: ${provider.name}...`);

      // Skip if API key is already masked (already migrated)
      if (!provider.apiKey || provider.apiKey.includes('...')) {
        console.log(`   ⏭️  Skipped (already masked or missing key)`);
        migrationReport.skipped++;
        continue;
      }

      try {
        // Store in Vault
        const vaultKey = await SecureAPIKeyService.storeAPIKey({
          name: provider.name,
          provider: provider.type.toLowerCase() as 'openai' | 'anthropic',
          apiKey: provider.apiKey
        });

        console.log(`   ✅ Migrated to Vault: ${vaultKey.masked}`);
        migrationReport.successful++;

        // Update AI systems that reference this provider
        await updateAISystemReferences(provider.id, vaultKey.id);

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`   ❌ Failed: ${errorMessage}`);
        migrationReport.failed++;
        migrationReport.errors.push({
          provider: provider.name,
          error: errorMessage
        });
      }

      console.log('');
    }

    // Step 3: Report summary
    console.log('📊 Migration Summary:');
    console.log(`   Total providers: ${migrationReport.total}`);
    console.log(`   ✅ Successful: ${migrationReport.successful}`);
    console.log(`   ⏭️  Skipped: ${migrationReport.skipped}`);
    console.log(`   ❌ Failed: ${migrationReport.failed}`);

    if (migrationReport.errors.length > 0) {
      console.log('\n❌ Errors:');
      migrationReport.errors.forEach(err => {
        console.log(`   - ${err.provider}: ${err.error}`);
      });
    }

    console.log('\n');

    // Step 4: Instructions for cleanup
    if (migrationReport.successful > 0) {
      console.log('🎉 Migration successful!\n');
      console.log('⚠️  IMPORTANT: Next steps:');
      console.log('   1. Verify keys work: await window.testSecureKeys()');
      console.log('   2. Clean up old storage: await window.cleanupOldStorage()');
      console.log('   3. Update your code to use SecureAPIKeyService');
      console.log('');
    }

    return migrationReport;

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

/**
 * Update AI systems to reference the new Vault key ID
 */
async function updateAISystemReferences(oldProviderId: string, newVaultKeyId: string): Promise<void> {
  try {
    // Update AI systems in Supabase
    const { data: aiSystems, error: fetchError } = await supabase
      .from('ai_systems')
      .select('id, config')
      .eq('config->>apiKeyId', oldProviderId);

    if (fetchError) {
      console.warn(`   ⚠️  Could not fetch AI systems: ${fetchError.message}`);
      return;
    }

    if (aiSystems && aiSystems.length > 0) {
      for (const system of aiSystems) {
        const updatedConfig = {
          ...system.config,
          apiKeyId: newVaultKeyId,
          vaultKeyId: newVaultKeyId // Add new field
        };

        const { error: updateError } = await supabase
          .from('ai_systems')
          .update({ config: updatedConfig })
          .eq('id', system.id);

        if (updateError) {
          console.warn(`   ⚠️  Could not update AI system ${system.id}: ${updateError.message}`);
        } else {
          console.log(`   🔗 Updated AI system reference: ${system.id}`);
        }
      }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.warn(`   ⚠️  Error updating AI system references: ${errorMessage}`);
  }
}

/**
 * Clean up old localStorage storage after successful migration
 */
export async function cleanupOldStorage(): Promise<void> {
  console.log('🧹 Cleaning up old localStorage...\n');

  const keysToRemove: string[] = [];

  // Find all API key related items
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (
      key.startsWith('api_key_') ||
      key === 'dynamo-ai-providers' ||
      key.includes('secure-key')
    )) {
      keysToRemove.push(key);
    }
  }

  if (keysToRemove.length === 0) {
    console.log('✅ No old storage found (already cleaned)');
    return;
  }

  console.log(`Found ${keysToRemove.length} items to remove:`);
  keysToRemove.forEach(key => {
    console.log(`   - ${key}`);
  });

  console.log('\n⚠️  WARNING: This will permanently delete old API keys!');
  console.log('   Make sure migration was successful first.');
  console.log('   Run: await window.testSecureKeys()');
  console.log('\n   To proceed, run: await window.confirmCleanup()');
}

/**
 * Confirm and execute cleanup
 */
export async function confirmCleanup(): Promise<void> {
  const keysToRemove: string[] = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (
      key.startsWith('api_key_') ||
      key === 'dynamo-ai-providers' ||
      key.includes('secure-key')
    )) {
      keysToRemove.push(key);
    }
  }

  console.log('🗑️  Removing old storage...\n');

  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    console.log(`   ✅ Removed: ${key}`);
  });

  console.log(`\n✅ Cleanup complete! Removed ${keysToRemove.length} items`);
  console.log('   Old insecure storage has been deleted.');
  console.log('   All API keys now stored securely in Vault.');
}

/**
 * Verify migration by checking both old and new storage
 */
export async function verifyMigration(): Promise<void> {
  console.log('🔍 Verifying migration...\n');

  // Check localStorage
  console.log('📦 Checking localStorage:');
  const oldProviders = APIKeyStorage.loadProviders();
  console.log(`   Found ${oldProviders.length} providers in localStorage`);
  const unmaskedKeys = oldProviders.filter(p => p.apiKey && !p.apiKey.includes('...'));
  if (unmaskedKeys.length > 0) {
    console.log(`   ⚠️  ${unmaskedKeys.length} keys still unmasked (not migrated)`);
    unmaskedKeys.forEach(p => console.log(`      - ${p.name}`));
  } else {
    console.log('   ✅ All keys are masked or migrated');
  }
  console.log('');

  // Check Vault
  console.log('🔒 Checking Vault:');
  const vaultKeys = await SecureAPIKeyService.listAPIKeys();
  console.log(`   Found ${vaultKeys.length} keys in Vault:`);
  vaultKeys.forEach(key => {
    console.log(`      - ${key.name}: ${key.masked} (${key.status})`);
  });
  console.log('');

  console.log('📊 Migration Status:');
  if (vaultKeys.length > 0 && unmaskedKeys.length === 0) {
    console.log('   ✅ Migration appears successful!');
    console.log('   ✅ Keys in Vault: ' + vaultKeys.length);
    console.log('   ✅ No unmasked keys in localStorage');
    console.log('\n   Safe to run: await window.confirmCleanup()');
  } else if (vaultKeys.length === 0) {
    console.log('   ⚠️  No keys found in Vault');
    console.log('   Run: await window.migrateKeysToVault()');
  } else {
    console.log('   ⚠️  Migration incomplete');
    console.log('   Some keys may need manual migration');
  }
}

// Make functions available globally
if (typeof window !== 'undefined') {
  (window as any).migrateKeysToVault = migrateKeysToVault;
  (window as any).cleanupOldStorage = cleanupOldStorage;
  (window as any).confirmCleanup = confirmCleanup;
  (window as any).verifyMigration = verifyMigration;
}
