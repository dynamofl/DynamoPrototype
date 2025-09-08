/**
 * Pagination utilities for table data
 */

import type { TableRow } from '@/types/table'

export interface PaginationState {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  startIndex: number
  endIndex: number
}

export interface PaginationConfig {
  enabled: boolean
  itemsPerPage: number
  showPageInfo?: boolean
  showPageSizeSelector?: boolean
  pageSizeOptions?: number[]
}

export class PaginationUtils {
  /**
   * Calculate pagination state
   */
  static calculatePagination(
    data: TableRow[],
    config: PaginationConfig,
    currentPage: number = 1
  ): PaginationState {
    const totalItems = data.length
    const itemsPerPage = config.itemsPerPage
    const totalPages = Math.ceil(totalItems / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems)

    return {
      currentPage,
      totalPages,
      totalItems,
      itemsPerPage,
      startIndex,
      endIndex
    }
  }

  /**
   * Get current page data
   */
  static getCurrentPageData(
    data: TableRow[],
    pagination: PaginationState
  ): TableRow[] {
    return data.slice(pagination.startIndex, pagination.endIndex)
  }

  /**
   * Validate page number
   */
  static validatePage(
    page: number,
    totalPages: number
  ): number {
    if (page < 1) return 1
    if (page > totalPages && totalPages > 0) return totalPages
    return page
  }

  /**
   * Get page numbers for pagination controls
   */
  static getPageNumbers(
    currentPage: number,
    totalPages: number,
    maxVisible: number = 5
  ): (number | string)[] {
    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    const pages: (number | string)[] = []
    const halfVisible = Math.floor(maxVisible / 2)

    // Always show first page
    pages.push(1)

    // Calculate start and end of visible range
    let start = Math.max(2, currentPage - halfVisible)
    let end = Math.min(totalPages - 1, currentPage + halfVisible)

    // Adjust range if we're near the beginning or end
    if (currentPage <= halfVisible) {
      end = Math.min(totalPages - 1, maxVisible - 1)
    }
    if (currentPage >= totalPages - halfVisible) {
      start = Math.max(2, totalPages - maxVisible + 2)
    }

    // Add ellipsis if needed
    if (start > 2) {
      pages.push('...')
    }

    // Add visible pages
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    // Add ellipsis if needed
    if (end < totalPages - 1) {
      pages.push('...')
    }

    // Always show last page
    if (totalPages > 1) {
      pages.push(totalPages)
    }

    return pages
  }

  /**
   * Get page size options
   */
  static getPageSizeOptions(
    customOptions?: number[]
  ): number[] {
    return customOptions || [10, 20, 50, 100]
  }

  /**
   * Calculate total pages for given page size
   */
  static calculateTotalPages(
    totalItems: number,
    itemsPerPage: number
  ): number {
    return Math.ceil(totalItems / itemsPerPage)
  }

  /**
   * Get pagination info text
   */
  static getPaginationInfo(
    pagination: PaginationState
  ): string {
    const { startIndex, endIndex, totalItems } = pagination
    
    if (totalItems === 0) {
      return 'No items'
    }
    
    if (startIndex === endIndex) {
      return `Showing ${startIndex + 1} of ${totalItems} items`
    }
    
    return `Showing ${startIndex + 1} to ${endIndex} of ${totalItems} items`
  }

  /**
   * Check if page is valid
   */
  static isValidPage(
    page: number,
    totalPages: number
  ): boolean {
    return page >= 1 && page <= totalPages
  }

  /**
   * Get next page number
   */
  static getNextPage(
    currentPage: number,
    totalPages: number
  ): number | null {
    const nextPage = currentPage + 1
    return this.isValidPage(nextPage, totalPages) ? nextPage : null
  }

  /**
   * Get previous page number
   */
  static getPreviousPage(
    currentPage: number,
    totalPages: number
  ): number | null {
    const prevPage = currentPage - 1
    return this.isValidPage(prevPage, totalPages) ? prevPage : null
  }

  /**
   * Get first page number
   */
  static getFirstPage(): number {
    return 1
  }

  /**
   * Get last page number
   */
  static getLastPage(totalPages: number): number {
    return totalPages
  }

  /**
   * Calculate page range for data
   */
  static calculatePageRange(
    data: TableRow[],
    itemsPerPage: number
  ): { startPage: number; endPage: number } {
    const totalPages = this.calculateTotalPages(data.length, itemsPerPage)
    return {
      startPage: 1,
      endPage: totalPages
    }
  }

  /**
   * Get page data with metadata
   */
  static getPageDataWithMetadata(
    data: TableRow[],
    config: PaginationConfig,
    currentPage: number
  ): {
    data: TableRow[]
    pagination: PaginationState
    hasNextPage: boolean
    hasPreviousPage: boolean
  } {
    const pagination = this.calculatePagination(data, config, currentPage)
    const pageData = this.getCurrentPageData(data, pagination)
    
    return {
      data: pageData,
      pagination,
      hasNextPage: this.getNextPage(currentPage, pagination.totalPages) !== null,
      hasPreviousPage: this.getPreviousPage(currentPage, pagination.totalPages) !== null
    }
  }

  /**
   * Create pagination config with defaults
   */
  static createPaginationConfig(
    config: Partial<PaginationConfig> = {}
  ): PaginationConfig {
    return {
      enabled: true,
      itemsPerPage: 20,
      showPageInfo: true,
      showPageSizeSelector: false,
      pageSizeOptions: [10, 20, 50, 100],
      ...config
    }
  }

  /**
   * Validate pagination config
   */
  static validatePaginationConfig(
    config: PaginationConfig
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = []
    
    if (config.itemsPerPage <= 0) {
      errors.push('Items per page must be greater than 0')
    }
    
    if (config.pageSizeOptions && config.pageSizeOptions.some(size => size <= 0)) {
      errors.push('Page size options must be greater than 0')
    }
    
    return {
      valid: errors.length === 0,
      errors
    }
  }
}

