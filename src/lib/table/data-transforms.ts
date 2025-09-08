/**
 * Data transformation utilities for table data
 */

import type { TableRow } from '@/types/table'

export class DataTransforms {
  /**
   * Add timestamps to data
   */
  static addTimestamps(data: TableRow[]): TableRow[] {
    return data.map(item => ({
      ...item,
      createdAt: item.createdAt || new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    }))
  }

  /**
   * Reset expansion state for all rows
   */
  static resetExpansionState(data: TableRow[]): TableRow[] {
    return data.map(item => ({
      ...item,
      isExpanded: false
    }))
  }

  /**
   * Validate required fields
   */
  static validateRequiredFields(
    data: TableRow[],
    requiredFields: string[]
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = []
    
    data.forEach((item, index) => {
      requiredFields.forEach(field => {
        if (!item[field] || item[field].toString().trim() === '') {
          errors.push(`Row ${index + 1}: ${field} is required`)
        }
      })
    })
    
    return {
      valid: errors.length === 0,
      errors
    }
  }

  /**
   * Filter data by field value
   */
  static filterByField(
    data: TableRow[],
    field: string,
    value: any
  ): TableRow[] {
    return data.filter(item => item[field] === value)
  }

  /**
   * Filter data by multiple conditions
   */
  static filterByConditions(
    data: TableRow[],
    conditions: Array<{
      field: string
      operator: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'contains' | 'startsWith' | 'endsWith'
      value: any
    }>
  ): TableRow[] {
    return data.filter(item => {
      return conditions.every(condition => {
        const itemValue = item[condition.field]
        
        switch (condition.operator) {
          case 'eq':
            return itemValue === condition.value
          case 'ne':
            return itemValue !== condition.value
          case 'gt':
            return itemValue > condition.value
          case 'lt':
            return itemValue < condition.value
          case 'gte':
            return itemValue >= condition.value
          case 'lte':
            return itemValue <= condition.value
          case 'contains':
            return String(itemValue).toLowerCase().includes(String(condition.value).toLowerCase())
          case 'startsWith':
            return String(itemValue).toLowerCase().startsWith(String(condition.value).toLowerCase())
          case 'endsWith':
            return String(itemValue).toLowerCase().endsWith(String(condition.value).toLowerCase())
          default:
            return true
        }
      })
    })
  }

  /**
   * Sort data by field
   */
  static sortByField(
    data: TableRow[],
    field: string,
    direction: 'asc' | 'desc' = 'asc'
  ): TableRow[] {
    return [...data].sort((a, b) => {
      const aValue = a[field]
      const bValue = b[field]
      
      if (aValue < bValue) return direction === 'asc' ? -1 : 1
      if (aValue > bValue) return direction === 'asc' ? 1 : -1
      return 0
    })
  }

  /**
   * Group data by field
   */
  static groupByField(
    data: TableRow[],
    field: string
  ): Record<string, TableRow[]> {
    return data.reduce((groups, item) => {
      const key = String(item[field] || 'undefined')
      if (!groups[key]) {
        groups[key] = []
      }
      groups[key].push(item)
      return groups
    }, {} as Record<string, TableRow[]>)
  }

  /**
   * Transform field values
   */
  static transformField(
    data: TableRow[],
    field: string,
    transformer: (value: any) => any
  ): TableRow[] {
    return data.map(item => ({
      ...item,
      [field]: transformer(item[field])
    }))
  }

  /**
   * Add computed fields
   */
  static addComputedFields(
    data: TableRow[],
    computedFields: Record<string, (item: TableRow) => any>
  ): TableRow[] {
    return data.map(item => {
      const computed = Object.entries(computedFields).reduce((acc, [key, fn]) => {
        acc[key] = fn(item)
        return acc
      }, {} as Record<string, any>)
      
      return { ...item, ...computed }
    })
  }

  /**
   * Remove fields
   */
  static removeFields(
    data: TableRow[],
    fieldsToRemove: string[]
  ): TableRow[] {
    return data.map(item => {
      const filtered = { ...item }
      fieldsToRemove.forEach(field => {
        delete filtered[field]
      })
      return filtered
    })
  }

  /**
   * Rename fields
   */
  static renameFields(
    data: TableRow[],
    fieldMap: Record<string, string>
  ): TableRow[] {
    return data.map(item => {
      const renamed = { ...item }
      Object.entries(fieldMap).forEach(([oldField, newField]) => {
        if (oldField in renamed) {
          renamed[newField] = renamed[oldField]
          delete renamed[oldField]
        }
      })
      return renamed
    })
  }

  /**
   * Merge data with existing data
   */
  static mergeData(
    existingData: TableRow[],
    newData: TableRow[],
    mergeKey: string = 'id'
  ): TableRow[] {
    const existingMap = new Map(existingData.map(item => [item[mergeKey], item]))
    
    newData.forEach(newItem => {
      const key = newItem[mergeKey]
      if (existingMap.has(key)) {
        existingMap.set(key, { ...existingMap.get(key), ...newItem })
      } else {
        existingMap.set(key, newItem)
      }
    })
    
    return Array.from(existingMap.values())
  }

  /**
   * Deduplicate data by field
   */
  static deduplicateByField(
    data: TableRow[],
    field: string
  ): TableRow[] {
    const seen = new Set()
    return data.filter(item => {
      const key = item[field]
      if (seen.has(key)) {
        return false
      }
      seen.add(key)
      return true
    })
  }

  /**
   * Paginate data
   */
  static paginateData(
    data: TableRow[],
    page: number,
    pageSize: number
  ): { data: TableRow[]; totalPages: number; totalItems: number } {
    const totalItems = data.length
    const totalPages = Math.ceil(totalItems / pageSize)
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize
    
    return {
      data: data.slice(startIndex, endIndex),
      totalPages,
      totalItems
    }
  }

  /**
   * Search data
   */
  static searchData(
    data: TableRow[],
    searchTerm: string,
    searchFields: string[]
  ): TableRow[] {
    if (!searchTerm.trim()) return data
    
    const term = searchTerm.toLowerCase()
    
    return data.filter(item => {
      return searchFields.some(field => {
        const value = String(item[field] || '').toLowerCase()
        return value.includes(term)
      })
    })
  }

  /**
   * Export data to CSV format
   */
  static exportToCSV(
    data: TableRow[],
    fields: string[],
    filename: string = 'export.csv'
  ): void {
    if (data.length === 0) return
    
    const headers = fields.join(',')
    const rows = data.map(item => 
      fields.map(field => {
        const value = item[field] || ''
        // Escape commas and quotes in CSV
        return `"${String(value).replace(/"/g, '""')}"`
      }).join(',')
    )
    
    const csvContent = [headers, ...rows].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

