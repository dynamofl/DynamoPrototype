/**
 * Core types and interfaces for the table storage system
 */

export interface TableStorageConfig {
  type: 'session' | 'persistent' | 'secure' | 'static'
  storageKey?: string
  autoSave?: boolean
  encryption?: boolean
  idGenerator?: 'uuid' | 'timestamp' | 'custom'
  customIdGenerator?: () => string
  validation?: (data: any[]) => boolean
  transform?: {
    onSave?: (data: any[]) => any[]
    onLoad?: (data: any[]) => any[]
  }
  minRows?: number
  maxRows?: number
  // Static data configuration
  data?: TableRow[]
}

export interface TableRow {
  id: string
  [key: string]: any
}

export interface TableStorage {
  load: () => Promise<TableRow[]>
  save: (data: TableRow[]) => Promise<boolean>
  add: (row: Omit<TableRow, 'id'>) => Promise<TableRow>
  update: (id: string, updates: Partial<TableRow>) => Promise<boolean>
  delete: (id: string) => Promise<boolean>
  clear: () => Promise<boolean>
  validate: (data: TableRow[]) => boolean
}

export interface StorageError {
  code: string
  message: string
  details?: any
}

export class TableStorageError extends Error {
  public code: string
  public details?: any

  constructor(code: string, message: string, details?: any) {
    super(message)
    this.name = 'TableStorageError'
    this.code = code
    this.details = details
  }
}

