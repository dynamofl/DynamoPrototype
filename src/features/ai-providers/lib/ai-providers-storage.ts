/**
 * Custom storage adapter for AI Providers that bridges APIKeyStorage with TablePattern
 */

import type { TableStorage, TableRow, TableStorageConfig } from '@/types/table'
import { APIKeyStorage } from '@/lib/storage/secure-storage'

export class AIProvidersTableStorage implements TableStorage {
  private config: TableStorageConfig

  constructor(config: TableStorageConfig) {
    this.config = config
  }

  async load(): Promise<TableRow[]> {
    try {
      const providers = APIKeyStorage.loadProviders()
      
      // Apply transform on load if configured
      if (this.config.transform?.onLoad) {
        return this.config.transform.onLoad(providers)
      }
      
      return providers
    } catch (error) {
      console.error('Failed to load AI providers:', error)
      return []
    }
  }

  async save(data: TableRow[]): Promise<boolean> {
    try {
      // Apply transform on save if configured
      let processedData = data
      if (this.config.transform?.onSave) {
        processedData = this.config.transform.onSave(data)
      }

      // Validate data if configured
      if (this.config.validation && !this.config.validation(processedData)) {
        throw new Error('Data validation failed')
      }

      // Save using APIKeyStorage
      const success = APIKeyStorage.saveProviders(processedData)
      return success
    } catch (error) {
      console.error('Failed to save AI providers:', error)
      return false
    }
  }

  async add(row: Omit<TableRow, 'id'>): Promise<TableRow> {
    try {
      const data = await this.load()
      
      // Generate ID
      const id = this.generateId()
      const newRow: TableRow = { ...row, id }
      
      data.push(newRow)
      
      const success = await this.save(data)
      if (!success) {
        throw new Error('Failed to save data after adding row')
      }
      
      return newRow
    } catch (error) {
      console.error('Failed to add AI provider:', error)
      throw error
    }
  }

  async update(id: string, updates: Partial<TableRow>): Promise<boolean> {
    try {
      const data = await this.load()
      const index = data.findIndex(row => row.id === id)
      
      if (index === -1) {
        return false
      }
      
      data[index] = { ...data[index], ...updates }
      return await this.save(data)
    } catch (error) {
      console.error('Failed to update AI provider:', error)
      return false
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      return APIKeyStorage.deleteProvider(id)
    } catch (error) {
      console.error('Failed to delete AI provider:', error)
      return false
    }
  }

  async clear(): Promise<boolean> {
    try {
      // Clear all providers by saving an empty array
      return APIKeyStorage.saveProviders([])
    } catch (error) {
      console.error('Failed to clear AI providers:', error)
      return false
    }
  }

  validate(data: TableRow[]): boolean {
    if (this.config.validation) {
      return this.config.validation(data)
    }
    
    // Default validation
    if (this.config.minRows && data.length < this.config.minRows) {
      return false
    }
    
    if (this.config.maxRows && data.length > this.config.maxRows) {
      return false
    }
    
    return true
  }

  private generateId(): string {
    if (this.config.idGenerator === 'uuid') {
      return crypto.randomUUID()
    } else if (this.config.idGenerator === 'timestamp') {
      return Date.now().toString()
    } else if (this.config.idGenerator === 'custom' && this.config.customIdGenerator) {
      return this.config.customIdGenerator()
    } else {
      // Default to timestamp
      return Date.now().toString()
    }
  }
}
