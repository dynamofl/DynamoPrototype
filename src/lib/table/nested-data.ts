/**
 * Nested data utilities for expandable rows
 */

import type { TableRow } from '@/types/table'

export interface NestedDataConfig {
  parentKey: string
  childrenKey: string
  expandKey: string
  defaultExpanded?: boolean
}

export class NestedDataUtils {
  /**
   * Flatten nested data structure
   */
  static flattenNestedData(
    data: TableRow[],
    config: NestedDataConfig
  ): TableRow[] {
    const flattened: TableRow[] = []
    
    data.forEach(item => {
      // Add parent item
      flattened.push({
        ...item,
        [config.expandKey]: false,
        level: 0,
        isParent: true,
        hasChildren: Boolean(item[config.childrenKey]?.length)
      })
      
      // Add children if expanded
      if (item[config.expandKey] && item[config.childrenKey]) {
        item[config.childrenKey].forEach((child: TableRow) => {
          flattened.push({
            ...child,
            [config.expandKey]: false,
            level: 1,
            isParent: false,
            hasChildren: false,
            parentId: item.id
          })
        })
      }
    })
    
    return flattened
  }

  /**
   * Restore nested data structure
   */
  static restoreNestedData(
    flattenedData: TableRow[],
    config: NestedDataConfig
  ): TableRow[] {
    const nested: TableRow[] = []
    const childrenMap = new Map<string, TableRow[]>()
    
    // Group children by parent ID
    flattenedData.forEach(item => {
      if (item.level === 1 && item.parentId) {
        if (!childrenMap.has(item.parentId)) {
          childrenMap.set(item.parentId, [])
        }
        childrenMap.get(item.parentId)!.push(item)
      }
    })
    
    // Build nested structure
    flattenedData.forEach(item => {
      if (item.level === 0) {
        const nestedItem = { ...item }
        delete nestedItem.level
        delete nestedItem.isParent
        delete nestedItem.hasChildren
        
        if (childrenMap.has(item.id)) {
          nestedItem[config.childrenKey] = childrenMap.get(item.id)!.map(child => {
            const cleanChild = { ...child }
            delete cleanChild.level
            delete cleanChild.isParent
            delete cleanChild.hasChildren
            delete cleanChild.parentId
            return cleanChild
          })
        }
        
        nested.push(nestedItem)
      }
    })
    
    return nested
  }

  /**
   * Toggle expansion state
   */
  static toggleExpansion(
    data: TableRow[],
    itemId: string,
    config: NestedDataConfig
  ): TableRow[] {
    return data.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          [config.expandKey]: !item[config.expandKey]
        }
      }
      return item
    })
  }

  /**
   * Set expansion state for all items
   */
  static setExpansionState(
    data: TableRow[],
    expanded: boolean,
    config: NestedDataConfig
  ): TableRow[] {
    return data.map(item => ({
      ...item,
      [config.expandKey]: expanded
    }))
  }

  /**
   * Get expanded items
   */
  static getExpandedItems(
    data: TableRow[],
    config: NestedDataConfig
  ): TableRow[] {
    return data.filter(item => item[config.expandKey])
  }

  /**
   * Get collapsed items
   */
  static getCollapsedItems(
    data: TableRow[],
    config: NestedDataConfig
  ): TableRow[] {
    return data.filter(item => !item[config.expandKey])
  }

  /**
   * Check if item has children
   */
  static hasChildren(
    item: TableRow,
    config: NestedDataConfig
  ): boolean {
    return Boolean(item[config.childrenKey]?.length)
  }

  /**
   * Get children count
   */
  static getChildrenCount(
    item: TableRow,
    config: NestedDataConfig
  ): number {
    return item[config.childrenKey]?.length || 0
  }

  /**
   * Add child to parent
   */
  static addChild(
    data: TableRow[],
    parentId: string,
    child: TableRow,
    config: NestedDataConfig
  ): TableRow[] {
    return data.map(item => {
      if (item.id === parentId) {
        const children = item[config.childrenKey] || []
        return {
          ...item,
          [config.childrenKey]: [...children, child]
        }
      }
      return item
    })
  }

  /**
   * Remove child from parent
   */
  static removeChild(
    data: TableRow[],
    parentId: string,
    childId: string,
    config: NestedDataConfig
  ): TableRow[] {
    return data.map(item => {
      if (item.id === parentId) {
        const children = item[config.childrenKey] || []
        return {
          ...item,
          [config.childrenKey]: children.filter((child: TableRow) => child.id !== childId)
        }
      }
      return item
    })
  }

  /**
   * Update child in parent
   */
  static updateChild(
    data: TableRow[],
    parentId: string,
    childId: string,
    updates: Partial<TableRow>,
    config: NestedDataConfig
  ): TableRow[] {
    return data.map(item => {
      if (item.id === parentId) {
        const children = item[config.childrenKey] || []
        return {
          ...item,
          [config.childrenKey]: children.map((child: TableRow) =>
            child.id === childId ? { ...child, ...updates } : child
          )
        }
      }
      return item
    })
  }

  /**
   * Find parent of child
   */
  static findParent(
    data: TableRow[],
    childId: string,
    config: NestedDataConfig
  ): TableRow | null {
    for (const item of data) {
      if (item[config.childrenKey]) {
        const child = item[config.childrenKey].find((child: TableRow) => child.id === childId)
        if (child) {
          return item
        }
      }
    }
    return null
  }

  /**
   * Get all descendants of an item
   */
  static getDescendants(
    item: TableRow,
    config: NestedDataConfig
  ): TableRow[] {
    const descendants: TableRow[] = []
    
    if (item[config.childrenKey]) {
      item[config.childrenKey].forEach((child: TableRow) => {
        descendants.push(child)
        descendants.push(...this.getDescendants(child, config))
      })
    }
    
    return descendants
  }

  /**
   * Get all ancestors of an item
   */
  static getAncestors(
    data: TableRow[],
    itemId: string,
    config: NestedDataConfig
  ): TableRow[] {
    const ancestors: TableRow[] = []
    
    const findAncestors = (items: TableRow[], targetId: string): boolean => {
      for (const item of items) {
        if (item.id === targetId) {
          return true
        }
        
        if (item[config.childrenKey]) {
          if (findAncestors(item[config.childrenKey], targetId)) {
            ancestors.unshift(item)
            return true
          }
        }
      }
      return false
    }
    
    findAncestors(data, itemId)
    return ancestors
  }

  /**
   * Calculate total items including children
   */
  static calculateTotalItems(
    data: TableRow[],
    config: NestedDataConfig
  ): number {
    let total = 0
    
    data.forEach(item => {
      total += 1 // Count parent
      if (item[config.childrenKey]) {
        total += item[config.childrenKey].length
      }
    })
    
    return total
  }

  /**
   * Create nested data config with defaults
   */
  static createNestedDataConfig(
    config: Partial<NestedDataConfig> = {}
  ): NestedDataConfig {
    return {
      parentKey: 'id',
      childrenKey: 'children',
      expandKey: 'isExpanded',
      defaultExpanded: false,
      ...config
    }
  }

  /**
   * Validate nested data config
   */
  static validateNestedDataConfig(
    config: NestedDataConfig
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = []
    
    if (!config.parentKey) {
      errors.push('Parent key is required')
    }
    
    if (!config.childrenKey) {
      errors.push('Children key is required')
    }
    
    if (!config.expandKey) {
      errors.push('Expand key is required')
    }
    
    return {
      valid: errors.length === 0,
      errors
    }
  }
}

