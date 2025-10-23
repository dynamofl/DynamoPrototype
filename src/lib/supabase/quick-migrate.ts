/**
 * Quick migration script - simpler version for testing
 */

import { migrateLocalStorageToSupabase } from './migrate-to-supabase'

// Expose migration function globally for easy console access
declare global {
  interface Window {
    quickMigrate: () => Promise<void>
  }
}

window.quickMigrate = async () => {
  console.log('🚀 Starting quick migration...')

  try {
    await migrateLocalStorageToSupabase()
    console.log('✅ Migration completed! Please refresh the page.')
  } catch (error) {
    console.error('❌ Migration failed:', error)
  }
}
