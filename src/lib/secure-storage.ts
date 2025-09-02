// Simple encryption utility for storing API keys locally
// In a production environment, you would use proper encryption libraries and secure key management

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
