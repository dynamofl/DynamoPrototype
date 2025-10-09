/**
 * AI Systems storage management
 */

import { TableStorageFactory } from '@/lib/storage'
import type { TableStorage, TableStorageConfig, TableRow } from '@/types/table'
import type { AISystem } from '../types'
import { AI_SYSTEMS_STORAGE_KEY } from '../constants'
import { aiSystemsStateManager } from './ai-systems-state-manager'

export class AISystemsStorage {
  private storage: any

  constructor() {
    this.storage = TableStorageFactory.create({
      type: 'secure',
      storageKey: AI_SYSTEMS_STORAGE_KEY,
      autoSave: true,
      idGenerator: 'uuid'
    })
  }

  // Get all AI systems with enhanced state
  async getAISystems(): Promise<AISystem[]> {
    try {
      const data = await this.storage.load()
      const systems = data || []
      
      // Enhance systems with validation state
      return await aiSystemsStateManager.enhanceAISystems(systems)
    } catch (error) {
      console.error('Failed to get AI systems:', error)
      return []
    }
  }

  // Add a new AI system
  async addAISystem(system: AISystem): Promise<void> {
    try {
      // Enhance system with validation state before saving
      const enhancedSystem = await aiSystemsStateManager.enhanceAISystem(system)
      await this.storage.add(enhancedSystem)
    } catch (error) {
      console.error('Failed to add AI system:', error)
      throw error
    }
  }

  // Update an AI system
  async updateAISystem(id: string, updates: Partial<AISystem>): Promise<void> {
    try {
      // Get current system to merge with updates
      const currentSystems = await this.storage.load()
      const currentSystem = currentSystems.find((s: AISystem) => s.id === id)
      
      if (currentSystem) {
        const updatedSystem = { ...currentSystem, ...updates }
        // Enhance system with validation state before saving
        const enhancedSystem = await aiSystemsStateManager.enhanceAISystem(updatedSystem)
        await this.storage.update(id, enhancedSystem)
      } else {
        await this.storage.update(id, updates)
      }
    } catch (error) {
      console.error('Failed to update AI system:', error)
      throw error
    }
  }

  // Delete an AI system
  async deleteAISystem(id: string): Promise<void> {
    try {
      await this.storage.delete(id)
    } catch (error) {
      console.error('Failed to delete AI system:', error)
      throw error
    }
  }

  // Get AI system by ID
  async getAISystemById(id: string): Promise<AISystem | null> {
    try {
      const systems = await this.getAISystems()
      return systems.find(system => system.id === id) || null
    } catch (error) {
      console.error('Failed to get AI system by ID:', error)
      return null
    }
  }
}

// TableStorage implementation for AI Systems
export class AISystemsTableStorage implements TableStorage {
  private storage: TableStorage

  constructor(config: TableStorageConfig) {
    this.storage = TableStorageFactory.create(config)
  }

  async load(): Promise<TableRow[]> {
    const data = await this.storage.load()
    const systems = data || []
    
    // Enhance systems with validation state
    return await aiSystemsStateManager.enhanceAISystems(systems)
  }

  async save(data: TableRow[]): Promise<boolean> {
    return await this.storage.save(data)
  }

  async add(row: Omit<TableRow, 'id'>): Promise<TableRow> {
    // Enhance system with validation state before adding
    const enhancedSystem = await aiSystemsStateManager.enhanceAISystem(row as AISystem)
    return await this.storage.add(enhancedSystem)
  }

  async update(id: string, updates: Partial<TableRow>): Promise<boolean> {
    return await this.storage.update(id, updates)
  }

  async delete(id: string): Promise<boolean> {
    return await this.storage.delete(id)
  }

  async clear(): Promise<boolean> {
    return await this.storage.clear()
  }

  validate(data: TableRow[]): boolean {
    return this.storage.validate(data)
  }

}
