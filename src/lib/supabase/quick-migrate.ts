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
    console.log('📝 Next: Try creating an evaluation - it should now work with UUID IDs')
  } catch (error) {
    console.error('❌ Migration failed:', error)
  }
}

console.log('💡 Migration helper loaded. Run window.quickMigrate() to migrate your data.')
