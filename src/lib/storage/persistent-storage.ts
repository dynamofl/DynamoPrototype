/**
 * Persistent storage implementation using localStorage
 * Data persists across browser sessions
 */

import type { TableStorage, TableStorageConfig, TableRow } from './types'
import { TableStorageError } from './types'

export class PersistentTableStorage implements TableStorage {
  private config: TableStorageConfig

  constructor(config: TableStorageConfig) {
    this.config = config
    this.validateConfig()
  }

  private validateConfig(): void {
    if (!this.config.type || this.config.type !== 'persistent') {
      throw new TableStorageError(
        'INVALID_CONFIG',
        'PersistentTableStorage requires type: "persistent"'
      )
    }

    if (!this.config.storageKey) {
      throw new TableStorageError(
        'INVALID_CONFIG',
        'PersistentTableStorage requires storageKey'
      )
    }
  }

  async load(): Promise<TableRow[]> {
    try {
      const stored = localStorage.getItem(this.config.storageKey!)
      if (!stored) {
        return []
      }

      let data = JSON.parse(stored)
      
      if (this.config.transform?.onLoad) {
        data = this.config.transform.onLoad(data)
      }

      return Array.isArray(data) ? data : []
    } catch (error) {
      throw new TableStorageError(
        'LOAD_FAILED',
        `Failed to load data from localStorage key: ${this.config.storageKey}`,
        error
      )
    }
  }

  async save(data: TableRow[]): Promise<boolean> {
    try {
      if (!this.validate(data)) {
        throw new TableStorageError(
          'VALIDATION_FAILED',
          'Data validation failed'
        )
      }

      let dataToSave = data
      if (this.config.transform?.onSave) {
        dataToSave = this.config.transform.onSave(data)
      }

      localStorage.setItem(this.config.storageKey!, JSON.stringify(dataToSave))
      return true
    } catch (error) {
      if (error instanceof TableStorageError) {
        throw error
      }
      throw new TableStorageError(
        'SAVE_FAILED',
        `Failed to save data to localStorage key: ${this.config.storageKey}`,
        error
      )
    }
  }

  async add(row: Omit<TableRow, 'id'>): Promise<TableRow> {
    try {
      const data = await this.load()
      const newRow: TableRow = {
        id: this.generateId(),
        ...row
      }

      const updatedData = [...data, newRow]
      await this.save(updatedData)
      return newRow
    } catch (error) {
      if (error instanceof TableStorageError) {
        throw error
      }
      throw new TableStorageError(
        'ADD_FAILED',
        'Failed to add row to persistent storage',
        error
      )
    }
  }

  async update(id: string, updates: Partial<TableRow>): Promise<boolean> {
    try {
      const data = await this.load()
      const index = data.findIndex(row => row.id === id)
      
      if (index === -1) {
        throw new TableStorageError(
          'ROW_NOT_FOUND',
          `Row with id "${id}" not found`
        )
      }

      const updatedData = [...data]
      updatedData[index] = { ...updatedData[index], ...updates }
      
      await this.save(updatedData)
      return true
    } catch (error) {
      if (error instanceof TableStorageError) {
        throw error
      }
      throw new TableStorageError(
        'UPDATE_FAILED',
        'Failed to update row in persistent storage',
        error
      )
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const data = await this.load()
      const index = data.findIndex(row => row.id === id)
      
      if (index === -1) {
        throw new TableStorageError(
          'ROW_NOT_FOUND',
          `Row with id "${id}" not found`
        )
      }

      const updatedData = data.filter(row => row.id !== id)
      
      if (this.config.minRows && updatedData.length < this.config.minRows) {
        throw new TableStorageError(
          'MIN_ROWS_VIOLATION',
          `Cannot delete row. Minimum ${this.config.minRows} rows required`
        )
      }

      await this.save(updatedData)
      return true
    } catch (error) {
      if (error instanceof TableStorageError) {
        throw error
      }
      throw new TableStorageError(
        'DELETE_FAILED',
        'Failed to delete row from persistent storage',
        error
      )
    }
  }

  async clear(): Promise<boolean> {
    try {
      localStorage.removeItem(this.config.storageKey!)
      return true
    } catch (error) {
      throw new TableStorageError(
        'CLEAR_FAILED',
        `Failed to clear localStorage key: ${this.config.storageKey}`,
        error
      )
    }
  }

  validate(data: TableRow[]): boolean {
    try {
      // Check minimum rows
      if (this.config.minRows && data.length < this.config.minRows) {
        return false
      }

      // Check maximum rows
      if (this.config.maxRows && data.length > this.config.maxRows) {
        return false
      }

      // Custom validation
      if (this.config.validation && !this.config.validation(data)) {
        return false
      }

      // Check for duplicate IDs
      const ids = data.map(row => row.id)
      const uniqueIds = new Set(ids)
      if (ids.length !== uniqueIds.size) {
        return false
      }

      return true
    } catch (error) {
      return false
    }
  }

  private generateId(): string {
    switch (this.config.idGenerator) {
      case 'uuid':
        return crypto.randomUUID()
      case 'timestamp':
        return Date.now().toString()
      case 'custom':
        return this.config.customIdGenerator?.() || crypto.randomUUID()
      default:
        return crypto.randomUUID()
    }
  }
}
