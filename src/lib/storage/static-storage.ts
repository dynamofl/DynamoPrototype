/**
 * Static storage implementation for read-only data
 * Used for displaying static data that doesn't need persistence
 */

import type { TableStorage, TableStorageConfig, TableRow } from './types'
import { TableStorageError } from './types'

export class StaticTableStorage implements TableStorage {
  private data: TableRow[]
  private config: TableStorageConfig

  constructor(config: TableStorageConfig) {
    this.config = config
    this.data = config.data || []
  }

  async load(): Promise<TableRow[]> {
    return Promise.resolve([...this.data])
  }

  async save(data: TableRow[]): Promise<boolean> {
    // Static storage is read-only, so save operations are no-ops
    console.warn('StaticTableStorage: Save operation ignored - static storage is read-only')
    return Promise.resolve(true)
  }

  async add(row: Omit<TableRow, 'id'>): Promise<TableRow> {
    throw new TableStorageError(
      'READ_ONLY_STORAGE',
      'Cannot add rows to static storage - it is read-only'
    )
  }

  async update(id: string, updates: Partial<TableRow>): Promise<boolean> {
    throw new TableStorageError(
      'READ_ONLY_STORAGE',
      'Cannot update rows in static storage - it is read-only'
    )
  }

  async delete(id: string): Promise<boolean> {
    throw new TableStorageError(
      'READ_ONLY_STORAGE',
      'Cannot delete rows from static storage - it is read-only'
    )
  }

  async clear(): Promise<boolean> {
    throw new TableStorageError(
      'READ_ONLY_STORAGE',
      'Cannot clear static storage - it is read-only'
    )
  }

  validate(data: TableRow[]): boolean {
    if (this.config.validation) {
      return this.config.validation(data)
    }
    return true
  }
}
