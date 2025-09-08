/**
 * Table storage system exports
 * Provides a unified interface for all storage-related functionality
 */

export type {
  TableStorageConfig,
  TableRow,
  TableStorage,
  StorageError
} from './types'

export {
  TableStorageError
} from './types'

export {
  SessionTableStorage
} from './session-storage'

export {
  PersistentTableStorage
} from './persistent-storage'

export {
  SecureTableStorage
} from './secure-storage'

export {
  TableStorageFactory
} from './storage-factory'

