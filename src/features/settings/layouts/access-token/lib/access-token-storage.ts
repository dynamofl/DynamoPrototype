import type { TableRow } from '@/types/table'
import type { TableStorage } from '@/lib/storage/types'
import { accessTokenData } from './access-token-config.tsx'

interface APIKey {
  id: string
  name: string
  key: string
  createdAt: string
}

export class AccessTokenStorage implements TableStorage {
  private data: TableRow[] = accessTokenData
  private apiKeys: Record<string, APIKey[]> = {} // provider -> API keys mapping

  async load(): Promise<TableRow[]> {
    // Update availableKeys count based on stored API keys
    return this.data.map(provider => ({
      ...provider,
      availableKeys: this.apiKeys[provider.provider]?.length || 0,
      hasKeys: (this.apiKeys[provider.provider]?.length || 0) > 0
    }))
  }

  async save(data: TableRow[]): Promise<boolean> {
    this.data = data
    return true
  }

  async add(row: Omit<TableRow, 'id'>): Promise<TableRow> {
    const newRow: TableRow = {
      ...row,
      id: `access-token-${Date.now()}`
    }
    this.data.push(newRow)
    return newRow
  }

  async update(id: string, updates: Partial<TableRow>): Promise<boolean> {
    const index = this.data.findIndex(item => item.id === id)
    if (index !== -1) {
      this.data[index] = { ...this.data[index], ...updates }
      return true
    }
    return false
  }

  async delete(id: string): Promise<boolean> {
    const initialLength = this.data.length
    this.data = this.data.filter(item => item.id !== id)
    return this.data.length < initialLength
  }

  async clear(): Promise<boolean> {
    this.data = []
    return true
  }

  validate(data: TableRow[]): boolean {
    return Array.isArray(data) && data.every(item => typeof item.id === 'string')
  }

  // API Key management methods
  async addAPIKey(provider: string, name: string, key: string): Promise<APIKey> {
    const newAPIKey: APIKey = {
      id: `api-key-${Date.now()}`,
      name,
      key,
      createdAt: new Date().toISOString().split('T')[0]
    }

    if (!this.apiKeys[provider]) {
      this.apiKeys[provider] = []
    }
    this.apiKeys[provider].push(newAPIKey)
    return newAPIKey
  }

  async getAPIKeys(provider: string): Promise<APIKey[]> {
    return this.apiKeys[provider] || []
  }

  async updateAPIKey(provider: string, keyId: string, updates: Partial<APIKey>): Promise<boolean> {
    if (!this.apiKeys[provider]) return false
    
    const index = this.apiKeys[provider].findIndex(key => key.id === keyId)
    if (index !== -1) {
      this.apiKeys[provider][index] = { ...this.apiKeys[provider][index], ...updates }
      return true
    }
    return false
  }

  async deleteAPIKey(provider: string, keyId: string): Promise<boolean> {
    if (!this.apiKeys[provider]) return false
    
    const initialLength = this.apiKeys[provider].length
    this.apiKeys[provider] = this.apiKeys[provider].filter(key => key.id !== keyId)
    return this.apiKeys[provider].length < initialLength
  }
}
