/**
 * Factory for creating storage instances
 * Provides a unified interface for creating different storage types
 */

import type { TableStorage, TableStorageConfig } from './types'
import { SessionTableStorage } from './session-storage'
import { PersistentTableStorage } from './persistent-storage'
import { SecureTableStorage } from './secure-storage'
import { StaticTableStorage } from './static-storage'
import { TableStorageError } from './types'

export class TableStorageFactory {
  /**
   * Create a storage instance based on configuration
   */
  static create(config: TableStorageConfig): TableStorage {
    try {
      switch (config.type) {
        case 'session':
          return new SessionTableStorage(config)
        case 'persistent':
          return new PersistentTableStorage(config)
        case 'secure':
          return new SecureTableStorage(config)
        case 'static':
          return new StaticTableStorage(config)
        default:
          throw new TableStorageError(
            'UNKNOWN_STORAGE_TYPE',
            `Unknown storage type: ${config.type}. Supported types: session, persistent, secure, static`
          )
      }
    } catch (error) {
      if (error instanceof TableStorageError) {
        throw error
      }
      throw new TableStorageError(
        'STORAGE_CREATION_FAILED',
        'Failed to create storage instance',
        error
      )
    }
  }

  /**
   * Validate storage configuration
   */
  static validateConfig(config: TableStorageConfig): boolean {
    try {
      // Check required fields
      if (!config.type) {
        return false
      }

      // Validate storage type
      if (!['session', 'persistent', 'secure', 'static'].includes(config.type)) {
        return false
      }

      // Check storage key for persistent and secure storage
      if ((config.type === 'persistent' || config.type === 'secure') && !config.storageKey) {
        return false
      }

      // Validate ID generator
      if (config.idGenerator && !['uuid', 'timestamp', 'custom'].includes(config.idGenerator)) {
        return false
      }

      // Check custom ID generator
      if (config.idGenerator === 'custom' && !config.customIdGenerator) {
        return false
      }

      return true
    } catch (error) {
      return false
    }
  }

  /**
   * Create a test storage instance for testing purposes
   */
  static createTestStorage(type: 'session' | 'persistent' | 'secure' = 'session'): TableStorage {
    const config: TableStorageConfig = {
      type,
      storageKey: type === 'session' ? undefined : 'test-storage-key',
      autoSave: false,
      idGenerator: 'uuid'
    }

    return this.create(config)
  }
}

