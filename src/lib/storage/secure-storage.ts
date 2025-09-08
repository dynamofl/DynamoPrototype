// Simple encryption utility for storing API keys locally
// In a production environment, you would use proper encryption libraries and secure key management

import type { TableStorage, TableRow, TableStorageConfig } from './types'

const ENCRYPTION_KEY = 'dynamo-ai-secure-key-2024' // In production, this should be environment-specific

export class SecureStorage {
  private static generateKey(password: string, salt: string): string {
    // Simple key derivation - in production, use proper crypto libraries
    let key = password + salt
    for (let i = 0; i < 1000; i++) {
      key = btoa(key).slice(0, 32)
    }
    return key
  }

  private static encrypt(text: string, key: string): string {
    try {
      // Simple XOR encryption - in production, use AES encryption
      let result = ''
      for (let i = 0; i < text.length; i++) {
        const charCode = text.charCodeAt(i) ^ key.charCodeAt(i % key.length)
        result += String.fromCharCode(charCode)
      }
      return btoa(result)
    } catch (error) {
      console.error('Encryption failed:', error)
      return ''
    }
  }

  private static decrypt(encryptedText: string, key: string): string {
    try {
      // Simple XOR decryption - in production, use AES decryption
      const text = atob(encryptedText)
      let result = ''
      for (let i = 0; i < text.length; i++) {
        const charCode = text.charCodeAt(i) ^ key.charCodeAt(i % key.length)
        result += String.fromCharCode(charCode)
      }
      return result
    } catch (error) {
      console.error('Decryption failed:', error)
      return ''
    }
  }

  static setItem(key: string, value: string): boolean {
    try {
      const salt = Math.random().toString(36).substring(2, 15)
      const derivedKey = this.generateKey(ENCRYPTION_KEY, salt)
      const encryptedValue = this.encrypt(value, derivedKey)
      
      const storageData = {
        value: encryptedValue,
        salt: salt,
        timestamp: Date.now()
      }
      
      localStorage.setItem(key, JSON.stringify(storageData))
      return true
    } catch (error) {
      console.error('Failed to store encrypted value:', error)
      return false
    }
  }

  static getItem(key: string): string | null {
    try {
      const stored = localStorage.getItem(key)
      if (!stored) return null
      
      const storageData = JSON.parse(stored)
      const derivedKey = this.generateKey(ENCRYPTION_KEY, storageData.salt)
      const decryptedValue = this.decrypt(storageData.value, derivedKey)
      
      return decryptedValue
    } catch (error) {
      console.error('Failed to retrieve encrypted value:', error)
      return null
    }
  }

  static removeItem(key: string): boolean {
    try {
      localStorage.removeItem(key)
      return true
    } catch (error) {
      console.error('Failed to remove item:', error)
      return false
    }
  }

  static clear(): boolean {
    try {
      localStorage.clear()
      return true
    } catch (error) {
      console.error('Failed to clear storage:', error)
      return false
    }
  }
}

// API Key specific storage
export class APIKeyStorage {
  private static readonly STORAGE_KEY = 'dynamo-ai-providers'

  static saveProviders(providers: Array<{ id: string; apiKey: string; [key: string]: any }>): boolean {
    try {
      // Store provider data without the actual API keys
      const safeProviders = providers.map(provider => ({
        ...provider,
        apiKey: provider.apiKey.slice(0, 7) + '...' + provider.apiKey.slice(-4), // Only store masked version
        // Reset expansion state when saving
        isExpanded: false
      }))
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(safeProviders))
      
      // Store actual API keys separately in secure storage
      providers.forEach(provider => {
        SecureStorage.setItem(`api_key_${provider.id}`, provider.apiKey)
      })
      
      return true
    } catch (error) {
      console.error('Failed to save providers:', error)
      return false
    }
  }

  static loadProviders(): any[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (!stored) return []
      
      const providers = JSON.parse(stored)
      
      // Restore actual API keys from secure storage
      return providers.map((provider: { id: string; [key: string]: any }) => ({
        ...provider,
        apiKey: SecureStorage.getItem(`api_key_${provider.id}`) || provider.apiKey,
        // Ensure expansion state is reset on load
        isExpanded: false
      }))
    } catch (error) {
      console.error('Failed to load providers:', error)
      return []
    }
  }

  static deleteProvider(id: string): boolean {
    try {
      // Remove API key from secure storage
      SecureStorage.removeItem(`api_key_${id}`)
      
      // Update provider list
      const providers = this.loadProviders().filter(p => p.id !== id)
      this.saveProviders(providers)
      
      return true
    } catch (error) {
      console.error('Failed to delete provider:', error)
      return false
    }
  }
}

// Secure table storage implementation
export class SecureTableStorage implements TableStorage {
  private config: TableStorageConfig
  private storageKey: string

  constructor(config: TableStorageConfig) {
    this.config = config
    this.storageKey = config.storageKey || 'secure-table-storage'
  }

  async load(): Promise<TableRow[]> {
    try {
      const stored = SecureStorage.getItem(this.storageKey)
      if (!stored) return []

      const data = JSON.parse(stored)
      
      // Apply transform on load if configured
      if (this.config.transform?.onLoad) {
        return this.config.transform.onLoad(data)
      }
      
      return data
    } catch (error) {
      console.error('Failed to load secure table data:', error)
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

      const success = SecureStorage.setItem(this.storageKey, JSON.stringify(processedData))
      return success
    } catch (error) {
      console.error('Failed to save secure table data:', error)
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
      console.error('Failed to add row to secure storage:', error)
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
      console.error('Failed to update row in secure storage:', error)
      return false
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const data = await this.load()
      const filteredData = data.filter(row => row.id !== id)
      
      if (filteredData.length === data.length) {
        return false // Row not found
      }
      
      return await this.save(filteredData)
    } catch (error) {
      console.error('Failed to delete row from secure storage:', error)
      return false
    }
  }

  async clear(): Promise<boolean> {
    try {
      return SecureStorage.removeItem(this.storageKey)
    } catch (error) {
      console.error('Failed to clear secure storage:', error)
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
