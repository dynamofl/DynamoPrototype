/**
 * Main reusable table pattern component
 * Supports view/edit modes, pagination, expandable rows, and various cell types
 */

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow as UITableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react'
import type { 
  TablePatternProps, 
  TableRow, 
  TableState, 
  PaginationState,
  CellProps,
  EditMode
} from '@/types/table'
import { TableStorageFactory } from '@/lib/storage'

// Import cell components (will be created next)
import { FreeTextCell } from './cell-types/free-text-cell'
import { DropdownCell } from './cell-types/dropdown-cell'
import { SwitchCell } from './cell-types/switch-cell'
import { ButtonCell } from './cell-types/button-cell'
import { BadgeCell } from './cell-types/badge-cell'
import { DateCell } from './cell-types/date-cell'
import { IconCell } from './cell-types/icon-cell'
import { ExpandCell } from './cell-types/expand-cell'
import { RowEditDialog } from './row-edit-dialog'

// Utility function to convert Tailwind width classes to CSS values
const getWidthValue = (width: string): string => {
  // If it's already a CSS value (contains px, %, em, rem, etc.), return as is
  if (width.includes('px') || width.includes('%') || width.includes('em') || width.includes('rem') || width.includes('vw') || width.includes('vh')) {
    return width
  }
  
  // If it's a Tailwind class, return it as a class name
  if (width.startsWith('w-')) {
    return width
  }
  
  // Fallback to the original value
  return width
}

export function TablePattern({
  mode,
  columns,
  storageConfig,
  customStorage,
  pagination,
  expandable,
  onDataChange,
  onCellAction,
  onRowExpand,
  onRowEdit,
  className = '',
  loading = false,
  error = null,
  emptyMessage = 'No data available',
  showHeader = true,
  stickyHeader = false,
  tableWidth = 'full',
  defaultEditMode = 'inline',
  rowEditDialogTitle = 'Edit Row',
  rowEditDialogDescription = 'Edit the row data below'
}: TablePatternProps) {
  // Initialize storage - use custom storage if provided, otherwise create from config
  const storage = useMemo(() => {
    if (customStorage) {
      return customStorage
    }
    
    try {
      return TableStorageFactory.create(storageConfig)
    } catch (error) {
      console.error('Failed to create storage:', error)
      return null
    }
  }, [storageConfig, customStorage])

  // State management
  const [state, setState] = useState<TableState>({
    data: [],
    loading: true,
    error: null,
    expandedRows: new Set(),
    editingCell: null,
    pagination: null
  })

  // Edit state for overlay (like DynamoTable)
  const [editState, setEditState] = useState<{
    isEditing: boolean
    editingCell: { row: number; col: number } | null
    editValue: any
    editType: string
    overlayPosition: {
      top: number
      left: number
      width: number
      height: number
      minHeight: number
      maxHeight: number
    } | null
  }>({
    isEditing: false,
    editingCell: null,
    editValue: null,
    editType: 'freeText',
    overlayPosition: null
  })

  const tableRef = useRef<HTMLTableElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  // Calculate overlay position (exactly like DynamoTable)
  const calculateOverlayPosition = (row: number, col: number, currentValue?: any, cellType?: string) => {
    const cellElement = document.querySelector(`[data-row="${row}"][data-col="${col}"]`)
    if (!cellElement) return null

    // Find the relative container (the div with className="relative")
    const relativeContainer = cellElement.closest('.relative')
    if (!relativeContainer) return null

    const cellRect = cellElement.getBoundingClientRect()
    const containerRect = relativeContainer.getBoundingClientRect()

    // Calculate position relative to the relative container
    const relativeTop = cellRect.top - containerRect.top
    const relativeLeft = cellRect.left - containerRect.left

    let dynamicHeight = cellRect.height

    // For text cells, calculate height based on content
    if (cellType === 'freeText' && currentValue) {
      const textContent = String(currentValue)
      
      // Create a temporary div to measure actual text height
      const measureDiv = document.createElement('div')
      measureDiv.style.cssText = `
        position: absolute;
        visibility: hidden;
        width: ${cellRect.width - 16}px;
        font-size: 14px;
        line-height: 24px;
        font-family: inherit;
        white-space: pre-wrap;
        word-wrap: break-word;
        padding: 8px;
        border: none;
        outline: none;
      `
      measureDiv.textContent = textContent || 'A' // Ensure minimum height
      document.body.appendChild(measureDiv)
      
      const measuredHeight = measureDiv.scrollHeight
      document.body.removeChild(measureDiv)
      
      // Use measured height with some padding, but ensure minimum height
      const minHeight = cellRect.height
      const maxHeight = Math.max(300, cellRect.height * 8)
      dynamicHeight = Math.max(minHeight, Math.min(measuredHeight + 16, maxHeight))
    }

    return {
      top: relativeTop,
      left: relativeLeft,
      width: cellRect.width,
      height: dynamicHeight,
      minHeight: cellRect.height,
      maxHeight: Math.max(300, cellRect.height * 8)
    }
  }

  // Start editing a cell
  const startEditing = (row: number, col: number, cellType: string, currentValue: any) => {
    if (mode !== 'edit') return

    const overlayPosition = calculateOverlayPosition(row, col, currentValue, cellType)
    if (!overlayPosition) return

    setEditState({
      isEditing: true,
      editingCell: { row, col },
      editValue: currentValue,
      editType: cellType,
      overlayPosition
    })
  }

  // Stop editing and commit changes
  const stopEditing = (commit: boolean = true) => {
    if (!editState.editingCell) return

    if (commit && editState.editingCell) {
      const { row, col } = editState.editingCell
      const columnKey = columns[col].key
      const rowData = currentPageData[row]
      
      if (rowData) {
        handleCellChange(rowData.id, columnKey, editState.editValue)
      }
    }

    setEditState({
      isEditing: false,
      editingCell: null,
      editValue: null,
      editType: 'freeText',
      overlayPosition: null
    })
  }

  // Handle edit value changes with dynamic height
  const handleEditValueChange = (newValue: any) => {
    setEditState(prev => ({ ...prev, editValue: newValue }))

    // For text inputs, dynamically adjust height based on content
    if (editState.editType === 'freeText' && editState.overlayPosition) {
      const textContent = String(newValue)
      const lines = textContent.split('\n').length
      const estimatedLineHeight = 24
      const padding = 16
      
      // Calculate height based on line breaks
      const lineBasedHeight = lines * estimatedLineHeight + padding
      
      // Calculate height based on text wrapping
      const avgCharsPerLine = Math.floor(editState.overlayPosition.width / 8)
      const wrappedLines = textContent.split('\n').reduce((total, line) => {
        return total + Math.max(1, Math.ceil(line.length / avgCharsPerLine))
      }, 0)
      const wrappedHeight = wrappedLines * estimatedLineHeight + padding
      
      // Use the larger of the two calculations
      const contentHeight = Math.max(lineBasedHeight, wrappedHeight)
      
      const newHeight = Math.max(
        editState.overlayPosition.minHeight,
        Math.min(contentHeight, editState.overlayPosition.maxHeight)
      )

      setEditState(prev => ({
        ...prev,
        overlayPosition: prev.overlayPosition ? {
          ...prev.overlayPosition,
          height: newHeight
        } : null
      }))
    }
  }

  // Row edit dialog state
  const [rowEditDialog, setRowEditDialog] = useState<{
    open: boolean
    row: TableRow | null
    index: number
  }>({
    open: false,
    row: null,
    index: -1
  })

  // Load data on mount and when storage changes
  useEffect(() => {
    if (!storage) return

    const loadData = async () => {
      setState(prev => ({ ...prev, loading: true, error: null }))
      
      try {
        const data = await storage.load()
        setState(prev => ({ 
          ...prev, 
          data, 
          loading: false,
          pagination: pagination ? calculatePagination(data, pagination, 1) : null
        }))
        
        // Notify parent of data change
        onDataChange?.(data)
      } catch (error) {
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          error: error instanceof Error ? error.message : 'Failed to load data'
        }))
      }
    }

    loadData()
  }, [storage, pagination, onDataChange])

  // Auto-save when data changes
  useEffect(() => {
    if (storage && storageConfig.autoSave && state.data.length > 0 && !state.loading) {
      const saveData = async () => {
        try {
          await storage.save(state.data)
        } catch (error) {
          console.error('Auto-save failed:', error)
        }
      }
      saveData()
    }
  }, [state.data, storage, storageConfig.autoSave, state.loading])

  // Auto-focus overlay when editing starts (exactly like DynamoTable)
  useEffect(() => {
    if (editState.isEditing && overlayRef.current) {
      const input = overlayRef.current.querySelector('textarea, input, select')
      if (input && input instanceof HTMLElement) {
        input.focus()
        if (input instanceof HTMLTextAreaElement || input instanceof HTMLInputElement) {
          input.select()
        }
      }
    }
  }, [editState.isEditing])

  // Calculate pagination
  const calculatePagination = useCallback((
    data: TableRow[], 
    config: any, 
    currentPage: number
  ): PaginationState => {
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
  }, [])

  // Get current page data
  const currentPageData = useMemo(() => {
    if (!pagination || !state.pagination) {
      return state.data
    }

    return state.data.slice(
      state.pagination.startIndex,
      state.pagination.endIndex
    )
  }, [state.data, state.pagination, pagination])

  // Handle row expansion
  const handleRowExpand = useCallback((rowId: string) => {
    setState(prev => {
      const newExpandedRows = new Set(prev.expandedRows)
      const isExpanded = newExpandedRows.has(rowId)
      
      if (isExpanded) {
        newExpandedRows.delete(rowId)
      } else {
        newExpandedRows.add(rowId)
      }

      onRowExpand?.(rowId, !isExpanded)
      
      return {
        ...prev,
        expandedRows: newExpandedRows
      }
    })
  }, [onRowExpand])

  // Handle cell value change
  const handleCellChange = useCallback(async (rowId: string, columnKey: string, value: any) => {
    if (!storage) return

    try {
      await storage.update(rowId, { [columnKey]: value })
      
      setState(prev => ({
        ...prev,
        data: prev.data.map(row => 
          row.id === rowId ? { ...row, [columnKey]: value } : row
        )
      }))
    } catch (error) {
      console.error('Failed to update cell:', error)
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to update cell'
      }))
    }
  }, [storage])

  // Handle cell action
  const handleCellAction = useCallback((action: string, row: TableRow, index: number) => {
    onCellAction?.(action, row, index)
  }, [onCellAction])

  // Handle row edit
  const handleRowEdit = useCallback((row: TableRow, index: number) => {
    setRowEditDialog({
      open: true,
      row,
      index
    })
    onRowEdit?.(row, index)
  }, [onRowEdit])

  // Handle row edit save
  const handleRowEditSave = useCallback(async (updatedRow: TableRow) => {
    if (!storage) return

    try {
      await storage.update(updatedRow.id, updatedRow)
      
      setState(prev => ({
        ...prev,
        data: prev.data.map(row => 
          row.id === updatedRow.id ? updatedRow : row
        )
      }))
    } catch (error) {
      console.error('Failed to update row:', error)
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to update row'
      }))
    }
  }, [storage])

  // Handle row edit cancel
  const handleRowEditCancel = useCallback(() => {
    setRowEditDialog({
      open: false,
      row: null,
      index: -1
    })
  }, [])

  // Handle pagination
  const handlePageChange = useCallback((page: number) => {
    if (!pagination || !state.pagination) return

    const newPagination = calculatePagination(state.data, pagination, page)
    setState(prev => ({ ...prev, pagination: newPagination }))
  }, [pagination, state.data, state.pagination, calculatePagination])

  // Render cell based on type
  const renderCell = useCallback((column: any, row: TableRow, index: number) => {
    // Determine edit mode for this column
    const editMode: EditMode = column.editMode || defaultEditMode

    const cellProps: CellProps = {
      value: row[column.key],
      row,
      column,
      mode,
      onChange: (value) => handleCellChange(row.id, column.key, value),
      onAction: (action) => handleCellAction(action, row, index),
      onRowEdit: (row) => handleRowEdit(row, index),
      disabled: column.disabled,
      className: column.className,
      editMode,
      // Add editing functions for FreeTextCell
      onStartEditing: (cellType: string, currentValue: any) => startEditing(index, columns.findIndex(c => c.key === column.key), cellType, currentValue),
      isCurrentlyEditing: editState.editingCell?.row === index && editState.editingCell?.col === columns.findIndex(c => c.key === column.key)
    }

    switch (column.type) {
      case 'freeText':
        return <FreeTextCell {...cellProps} />
      case 'dropdown':
        return <DropdownCell {...cellProps} />
      case 'switch':
        return <SwitchCell {...cellProps} />
      case 'button':
        return <ButtonCell {...cellProps} />
      case 'badge':
        return <BadgeCell {...cellProps} />
      case 'date':
        return <DateCell {...cellProps} />
      case 'icon':
        return (
          <IconCell
            {...cellProps}
            iconComponent={column.iconComponent}
            iconSrc={column.iconSrc}
            iconAlt={column.iconAlt}
            iconSize={column.iconSize}
            iconPosition={column.iconPosition}
            showText={column.showText}
          />
        )
      case 'expand':
        return (
          <ExpandCell
            {...cellProps}
            isExpanded={state.expandedRows.has(row.id)}
            onToggle={() => handleRowExpand(row.id)}
            expandIcon={column.expandIcon}
            collapseIcon={column.collapseIcon}
          />
        )
      default:
        return <TableCell>{cellProps.value}</TableCell>
    }
  }, [mode, handleCellChange, handleCellAction, handleRowEdit, state.expandedRows, handleRowExpand, defaultEditMode])

  // Render expandable content
  const renderExpandableContent = useCallback((row: TableRow) => {
    if (!expandable?.enabled || !state.expandedRows.has(row.id)) {
      return null
    }

    return (
      <UITableRow>
        <TableCell colSpan={columns.length} className="p-0">
          {expandable.renderContent(row)}
        </TableCell>
      </UITableRow>
    )
  }, [expandable, state.expandedRows, columns.length])

  // Render pagination controls
  const renderPagination = () => {
    if (!pagination?.enabled || !state.pagination) return null

    const { currentPage, totalPages, totalItems, startIndex, endIndex } = state.pagination

    return (
      <div className="flex items-center justify-between px-4 py-3 border-t">
        <div className="text-sm text-gray-600">
          Showing {startIndex + 1} to {endIndex} of {totalItems} entries
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <span className="text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  // Loading state
  if (state.loading || loading) {
    return (
      <div className={`border rounded-lg ${className}`}>
        <div className="p-4">
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (state.error || error) {
    return (
      <div className={`border rounded-lg ${className}`}>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {state.error || error}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // Empty state
  if (state.data.length === 0) {
    return (
      <div className={`border rounded-lg ${className}`}>
        <div className="p-8 text-center text-gray-500">
          {emptyMessage}
        </div>
      </div>
    )
  }

  return (
    <div className={`border rounded-lg ${className}`}>
      <div className="relative">
        <ScrollArea className="h-full">
          <div className="relative overflow-visible border-t border-b border-gray-200" style={{ position: 'relative' }}>
            <Table 
              ref={tableRef} 
              className={`enhanced-table ${mode === 'edit' ? 'edit-mode' : ''}`}
              style={{ 
                width: tableWidth === 'full' ? '100%' : tableWidth === 'auto' ? 'auto' : tableWidth 
              }}
            >
              {showHeader && (
                <TableHeader className={stickyHeader ? 'sticky top-0 bg-background z-10' : ''}>
                  <UITableRow className="h-8">
                    {columns.map((column) => {
                      const widthValue = getWidthValue(column.width)
                      const isTailwindClass = widthValue.startsWith('w-')
                      
                      return (
                        <TableHead 
                          key={column.key} 
                          className={`py-3 font-450 ${isTailwindClass ? widthValue : ''}`}
                          style={isTailwindClass ? {} : { 
                            width: widthValue,
                            minWidth: widthValue,
                            maxWidth: widthValue
                          }}
                        >
                          {column.title}
                        </TableHead>
                      )
                    })}
                  </UITableRow>
                </TableHeader>
              )}
              <TableBody>
                {currentPageData.map((row, index) => (
                  <React.Fragment key={row.id}>
                    <UITableRow className="h-8">
                      {columns.map((column, colIndex) => {
                        const widthValue = getWidthValue(column.width)
                        const isTailwindClass = widthValue.startsWith('w-')
                        
                        return (
                          <TableCell 
                            key={column.key}
                            className={`p-0 h-8 ${isTailwindClass ? widthValue : ''}`}
                            style={isTailwindClass ? {} : { 
                              width: widthValue,
                              minWidth: widthValue,
                              maxWidth: widthValue
                            }}
                          >
                            <div data-row={index} data-col={colIndex}>
                              {renderCell(column, row, index)}
                            </div>
                          </TableCell>
                        )
                      })}
                    </UITableRow>
                    {renderExpandableContent(row)}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </div>
        </ScrollArea>

        {/* Global Edit Overlay - Only for text cells (exactly like DynamoTable) */}
        {editState.isEditing && editState.editType === 'freeText' && editState.overlayPosition && (
          <div 
            ref={overlayRef}
            className="global-edit-overlay"
            style={{
              position: 'absolute',
              zIndex: 1000,
              top: `${editState.overlayPosition.top}px`,
              left: `${editState.overlayPosition.left}px`,
              width: `${editState.overlayPosition.width}px`,
              height: `${editState.overlayPosition.height}px`,
              backgroundColor: 'white',
              border: '2px solid #3b82f6',
              borderRadius: '6px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              overflow: 'visible'
            }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                e.preventDefault()
                stopEditing(false)
              }
              if (e.key === 'Tab') {
                e.preventDefault()
                stopEditing(true)
              }
            }}
          >
            <Textarea
              value={editState.editValue || ''}
              onChange={(e) => handleEditValueChange(e.target.value)}
              onBlur={() => stopEditing(true)}
              placeholder={columns[editState.editingCell?.col || 0]?.placeholder}
              className="w-full h-full resize-none border-0 focus:ring-0 focus:outline-none p-2 whitespace-pre-wrap overflow-y-auto"
              style={{ 
                minHeight: `${editState.overlayPosition.minHeight - 4}px`,
                height: `${editState.overlayPosition.height - 4}px`,
                lineHeight: '24px',
                fontSize: '14px'
              }}
              onInput={(e) => {
                // Auto-adjust height based on scroll height for more precise sizing
                const target = e.target as HTMLTextAreaElement
                if (target.scrollHeight > target.clientHeight) {
                  const newHeight = Math.min(
                    target.scrollHeight + 8, // Add some padding
                    editState.overlayPosition?.maxHeight || 300
                  )
                  
                  if (newHeight !== editState.overlayPosition?.height) {
                    setEditState(prev => ({
                      ...prev,
                      overlayPosition: prev.overlayPosition ? {
                        ...prev.overlayPosition,
                        height: newHeight
                      } : null
                    }))
                  }
                }
              }}
            />
          </div>
        )}
      </div>
      {renderPagination()}

      {/* Row Edit Dialog */}
      <RowEditDialog
        open={rowEditDialog.open}
        onOpenChange={(open) => setRowEditDialog(prev => ({ ...prev, open }))}
        row={rowEditDialog.row}
        columns={columns}
        title={rowEditDialogTitle}
        description={rowEditDialogDescription}
        onSave={handleRowEditSave}
        onCancel={handleRowEditCancel}
      />

      {/* Enhanced Table Styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .enhanced-table {
          border-collapse: separate;
          border-spacing: 0;
          border: none;
          table-layout: fixed;
          overflow: visible !important;
        }
        
        .enhanced-table th,
        .enhanced-table td {
          overflow: visible !important;
          position: relative;
        }
        
        .enhanced-table th {
          border-bottom: 1px solid #e5e7eb;
          background-color: #f9fafb;
          height: 40px;
          padding-left: 16px;
          padding-right: 16px;
        }
        
        .enhanced-table td {
          border-bottom: 1px solid #e5e7eb;
          height: 40px;
          padding-left: 16px;
          padding-right: 16px;
        }
        
        .enhanced-table tr:last-child td {
          border-bottom: none;
        }
        
        /* Column separators only in edit mode */
        .enhanced-table.edit-mode th {
          border-right: 1px solid #e5e7eb;
          padding-left: 0;
          padding-right: 0;
        }
        
        .enhanced-table.edit-mode th:last-child {
          border-right: none;
        }
        
        .enhanced-table.edit-mode td {
          border-right: 1px solid #e5e7eb;
          padding-left: 0;
          padding-right: 0;
        }
        
        .enhanced-table.edit-mode td:last-child {
          border-right: none;
        }
        
        .cell-content:hover {
          background-color: #f9fafb !important;
        }
        
        .cell-content:focus {
          outline: none;
          background-color: #f8fafc !important;
          border-color: #d1d5db !important;
        }
        
        .cell-content.switch:hover,
        .cell-content.button:hover {
          background-color: #f1f5f9 !important;
          border-color: #cbd5e1 !important;
        }
        
        .cell-content.switch:focus,
        .cell-content.button:focus {
          background-color: #e2e8f0 !important;
          border-color: #94a3b8 !important;
        }
        
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      `}} />
    </div>
  )
}
