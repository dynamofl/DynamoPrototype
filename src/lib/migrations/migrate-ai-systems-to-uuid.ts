/**
 * Migration script to convert AI system IDs from timestamp-based to UUID
 */

import { AI_SYSTEMS_STORAGE_KEY } from '@/features/ai-systems/constants';

interface AISystemWithTimestampId {
  id: string;
  [key: string]: any;
}

/**
 * Check if an ID is a timestamp (all digits)
 */
function isTimestampId(id: string): boolean {
  return /^\d+$/.test(id);
}

/**
 * Migrate AI systems from timestamp IDs to UUIDs
 */
export async function migrateAISystemsToUUID(): Promise<{
  success: boolean;
  migrated: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let migrated = 0;

  try {
    // Load existing AI systems
    const rawData = localStorage.getItem(AI_SYSTEMS_STORAGE_KEY);

    if (!rawData) {
      return { success: true, migrated: 0, errors: [] };
    }

    let systems: AISystemWithTimestampId[];

    try {
      const parsed = JSON.parse(rawData);

      // Check if data is encrypted/secure storage format (not a plain array)
      if (!Array.isArray(parsed)) {
        console.log('✅ AI systems using secure storage - migration not needed');
        return { success: true, migrated: 0, errors: [] };
      }

      systems = parsed;
    } catch (parseError) {
      console.log('✅ Could not parse AI systems - migration not needed');
      return { success: true, migrated: 0, errors: [] };
    }

    // Check if any systems have timestamp IDs
    const needsMigration = systems.some(system => isTimestampId(system.id));

    if (!needsMigration) {
      console.log('✅ All AI systems already have UUIDs - migration not needed');
      return { success: true, migrated: 0, errors: [] };
    }

    // Create mapping of old IDs to new UUIDs
    const idMapping: Record<string, string> = {};

    // Migrate each system
    const migratedSystems = systems.map(system => {
      if (isTimestampId(system.id)) {
        const newId = crypto.randomUUID();
        idMapping[system.id] = newId;
        migrated++;

        console.log(`📝 Migrating AI system: ${system.name} (${system.id} → ${newId})`);

        return {
          ...system,
          id: newId
        };
      }
      return system;
    });

    // Save migrated systems
    localStorage.setItem(AI_SYSTEMS_STORAGE_KEY, JSON.stringify(migratedSystems));

    // Also update any evaluation references to these AI systems
    await updateEvaluationReferences(idMapping);

    console.log(`✅ Successfully migrated ${migrated} AI system(s) to UUID`);
    console.log('📋 ID Mapping:', idMapping);

    return { success: true, migrated, errors };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    errors.push(errorMessage);
    console.error('❌ Migration failed:', errorMessage);
    return { success: false, migrated, errors };
  }
}

/**
 * Update evaluation references to use new AI system IDs
 */
async function updateEvaluationReferences(idMapping: Record<string, string>): Promise<void> {
  try {
    // Update evaluation history
    const evaluationKeys = Object.keys(localStorage).filter(key =>
      key.startsWith('evaluation-history-')
    );

    for (const key of evaluationKeys) {
      const data = localStorage.getItem(key);
      if (!data) continue;

      try {
        const evaluations = JSON.parse(data);
        let updated = false;

        const updatedEvaluations = evaluations.map((evaluation: any) => {
          if (evaluation.aiSystemId && idMapping[evaluation.aiSystemId]) {
            updated = true;
            return {
              ...evaluation,
              aiSystemId: idMapping[evaluation.aiSystemId]
            };
          }
          return evaluation;
        });

        if (updated) {
          localStorage.setItem(key, JSON.stringify(updatedEvaluations));
          console.log(`📝 Updated evaluation references in ${key}`);
        }
      } catch (error) {
        console.warn(`⚠️  Failed to update ${key}:`, error);
      }
    }

    // Update individual evaluation tests
    const testKeys = Object.keys(localStorage).filter(key =>
      key.startsWith('evaluation-test-')
    );

    for (const key of testKeys) {
      const data = localStorage.getItem(key);
      if (!data) continue;

      try {
        const test = JSON.parse(data);

        if (test.aiSystemId && idMapping[test.aiSystemId]) {
          test.aiSystemId = idMapping[test.aiSystemId];
          localStorage.setItem(key, JSON.stringify(test));
          console.log(`📝 Updated AI system reference in ${key}`);
        }
      } catch (error) {
        console.warn(`⚠️  Failed to update ${key}:`, error);
      }
    }
  } catch (error) {
    console.warn('⚠️  Failed to update evaluation references:', error);
  }
}

/**
 * Automatically run migration on import
 */
(async () => {
  const result = await migrateAISystemsToUUID();

  if (result.success && result.migrated > 0) {
    console.log('🎉 AI System ID migration completed successfully!');
  } else if (result.errors.length > 0) {
    console.error('❌ AI System ID migration encountered errors:', result.errors);
  }
})();

// Make function globally available for manual execution
(window as any).migrateAISystemsToUUID = migrateAISystemsToUUID;
