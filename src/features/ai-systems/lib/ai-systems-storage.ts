/**
 * AI Systems storage management
 */

import { TableStorageFactory } from '@/lib/storage'
import type { AISystem } from '../types'
import { AI_SYSTEMS_STORAGE_KEY } from '../constants'

export class AISystemsStorage {
  private storage: any

  constructor() {
    this.storage = TableStorageFactory.create({
      type: 'secure',
      storageKey: AI_SYSTEMS_STORAGE_KEY,
      autoSave: true,
      idGenerator: 'timestamp'
    })
  }

  // Get all AI systems
  async getAISystems(): Promise<AISystem[]> {
    try {
      const data = await this.storage.load()
      return data || []
    } catch (error) {
      console.error('Failed to get AI systems:', error)
      return []
    }
  }

  // Add a new AI system
  async addAISystem(system: AISystem): Promise<void> {
    try {
      await this.storage.add(system)
    } catch (error) {
      console.error('Failed to add AI system:', error)
      throw error
    }
  }

  // Update an AI system
  async updateAISystem(id: string, updates: Partial<AISystem>): Promise<void> {
    try {
      await this.storage.update(id, updates)
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


  // Get AI systems by status
  async getAISystemsByStatus(status: 'active' | 'inactive'): Promise<AISystem[]> {
    try {
      const systems = await this.getAISystems()
      return systems.filter(system => system.status === status)
    } catch (error) {
      console.error('Failed to get AI systems by status:', error)
      return []
    }
  }

  // Clear all AI systems
  async clearAllAISystems(): Promise<void> {
    try {
      await this.storage.save([])
    } catch (error) {
      console.error('Failed to clear AI systems:', error)
      throw error
    }
  }
}
