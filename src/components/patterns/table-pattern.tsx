/**
 * Main reusable table pattern component
 * Supports view/edit modes, pagination, expandable rows, and various cell types
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow as UITableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ScrollArea } from '@/components/ui/scroll-area'
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
      editMode
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
      <ScrollArea className="h-full">
        <Table>
          {showHeader && (
            <TableHeader className={stickyHeader ? 'sticky top-0 bg-background z-10' : ''}>
              <UITableRow>
                {columns.map((column) => (
                  <TableHead key={column.key} style={{ width: column.width }}>
                    {column.title}
                  </TableHead>
                ))}
              </UITableRow>
            </TableHeader>
          )}
          <TableBody>
            {currentPageData.map((row, index) => (
              <React.Fragment key={row.id}>
                <UITableRow>
                  {columns.map((column) => (
                    <TableCell key={column.key}>
                      {renderCell(column, row, index)}
                    </TableCell>
                  ))}
                </UITableRow>
                {renderExpandableContent(row)}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
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
    </div>
  )
}
