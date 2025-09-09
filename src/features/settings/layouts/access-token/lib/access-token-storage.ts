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
  private readonly STORAGE_KEY = 'dynamo-access-tokens'
  private readonly API_KEYS_STORAGE_KEY = 'dynamo-api-keys'

  async load(): Promise<TableRow[]> {
    // Load data from localStorage
    try {
      const storedData = localStorage.getItem(this.STORAGE_KEY)
      if (storedData) {
        this.data = JSON.parse(storedData)
      }
    } catch (error) {
      console.error('Failed to load access token data:', error)
    }

    // Load API keys from localStorage
    try {
      const storedAPIKeys = localStorage.getItem(this.API_KEYS_STORAGE_KEY)
      if (storedAPIKeys) {
        this.apiKeys = JSON.parse(storedAPIKeys)
      }
    } catch (error) {
      console.error('Failed to load API keys:', error)
    }

    // Update availableKeys count based on stored API keys
    return this.data.map(provider => ({
      ...provider,
      availableKeys: this.apiKeys[provider.provider]?.length || 0,
      hasKeys: (this.apiKeys[provider.provider]?.length || 0) > 0
    }))
  }

  async save(data: TableRow[]): Promise<boolean> {
    try {
      this.data = data
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data))
      return true
    } catch (error) {
      console.error('Failed to save access token data:', error)
      return false
    }
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
    
    // Persist API keys to localStorage
    try {
      localStorage.setItem(this.API_KEYS_STORAGE_KEY, JSON.stringify(this.apiKeys))
    } catch (error) {
      console.error('Failed to save API keys:', error)
    }
    
    return newAPIKey
  }

  async getAPIKeys(provider: string): Promise<APIKey[]> {
    return this.apiKeys[provider] || []
  }

  async getAllAPIKeys(): Promise<Array<APIKey & { provider: string }>> {
    // Load API keys from localStorage first
    try {
      const storedAPIKeys = localStorage.getItem(this.API_KEYS_STORAGE_KEY)
      if (storedAPIKeys) {
        this.apiKeys = JSON.parse(storedAPIKeys)
      }
    } catch (error) {
      console.error('Failed to load API keys:', error)
    }

    const allKeys: Array<APIKey & { provider: string }> = []
    Object.entries(this.apiKeys).forEach(([provider, keys]) => {
      keys.forEach(key => {
        allKeys.push({ ...key, provider })
      })
    })
    return allKeys
  }

  async updateAPIKey(provider: string, keyId: string, updates: Partial<APIKey>): Promise<boolean> {
    if (!this.apiKeys[provider]) return false
    
    const index = this.apiKeys[provider].findIndex(key => key.id === keyId)
    if (index !== -1) {
      this.apiKeys[provider][index] = { ...this.apiKeys[provider][index], ...updates }
      
      // Persist changes to localStorage
      try {
        localStorage.setItem(this.API_KEYS_STORAGE_KEY, JSON.stringify(this.apiKeys))
      } catch (error) {
        console.error('Failed to save API keys:', error)
      }
      
      return true
    }
    return false
  }

  async deleteAPIKey(provider: string, keyId: string): Promise<boolean> {
    if (!this.apiKeys[provider]) return false
    
    const initialLength = this.apiKeys[provider].length
    this.apiKeys[provider] = this.apiKeys[provider].filter(key => key.id !== keyId)
    
    // Persist changes to localStorage
    try {
      localStorage.setItem(this.API_KEYS_STORAGE_KEY, JSON.stringify(this.apiKeys))
    } catch (error) {
      console.error('Failed to save API keys:', error)
    }
    
    return this.apiKeys[provider].length < initialLength
  }
}
