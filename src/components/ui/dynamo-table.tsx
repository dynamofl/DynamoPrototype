import React, { useState, useEffect, useRef, type KeyboardEvent } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './table'
import { Textarea } from './textarea'
import { Switch } from './switch'
import { Button } from './button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select'

// Column configuration interface
export interface DynamoColumnConfig {
  key: string
  title: string
  width: string
  type: 'freeText' | 'switch' | 'button' | 'dropdown'
  placeholder?: string
  options?: Array<{ value: string; label: string }>
  buttonIcon?: React.ReactNode
  buttonVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  switchLabel?: (value: boolean) => string
  disabled?: boolean
  readonly?: boolean
}

// Edit state interface
interface EditState {
  isEditing: boolean
  editingCell: { row: number; col: number } | null
  editValue: any
  editType: DynamoColumnConfig['type']
  overlayPosition: {
    top: number
    left: number
    width: number
    height: number
    minHeight: number
    maxHeight: number
  } | null
}

// Props interface
export interface DynamoTableProps {
  data: any[]
  columns: DynamoColumnConfig[]
  onDataChange?: (newData: any[]) => void
  onCellAction?: (action: string, rowIndex: number, columnKey: string, value?: any) => void
  editable?: boolean
  className?: string
  rowKey?: string | ((row: any, index: number) => string)
  onKeyNavigation?: (e: KeyboardEvent, row: number, col: number) => void
}

export const DynamoTable: React.FC<DynamoTableProps> = ({
  data,
  columns,
  onDataChange,
  onCellAction,
  editable = false,
  className = '',
  rowKey = 'id',
  onKeyNavigation
}) => {
  // Table-level edit state
  const [editState, setEditState] = useState<EditState>({
    isEditing: false,
    editingCell: null,
    editValue: null,
    editType: 'freeText',
    overlayPosition: null
  })

  const tableRef = useRef<HTMLTableElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  // Calculate precise overlay position with dynamic height for text content
  const calculateOverlayPosition = (row: number, col: number, currentValue?: any, cellType?: string) => {
    const cellElement = document.querySelector(`[data-row="${row}"][data-col="${col}"]`)
    if (!cellElement) return null

    const rect = cellElement.getBoundingClientRect()
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft

    let dynamicHeight = rect.height

    // For text cells, calculate height based on content
    if (cellType === 'freeText' && currentValue) {
      const textContent = String(currentValue)
      
      // Create a temporary div to measure actual text height
      const measureDiv = document.createElement('div')
      measureDiv.style.cssText = `
        position: absolute;
        visibility: hidden;
        width: ${rect.width - 16}px;
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
      const minHeight = rect.height
      const maxHeight = Math.max(300, rect.height * 8)
      dynamicHeight = Math.max(minHeight, Math.min(measuredHeight + 16, maxHeight))
    }

    return {
      top: rect.top + scrollTop,
      left: rect.left + scrollLeft,
      width: rect.width,
      height: dynamicHeight,
      minHeight: rect.height,
      maxHeight: Math.max(300, rect.height * 8) // Allow more expansion
    }
  }

  // Start editing a cell
  const startEditing = (row: number, col: number, cellType: DynamoColumnConfig['type'], currentValue: any) => {
    if (!editable) return

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

    if (commit && onDataChange) {
      const { row, col } = editState.editingCell
      const columnKey = columns[col].key
      const newData = [...data]
      newData[row] = { ...newData[row], [columnKey]: editState.editValue }
      onDataChange(newData)
    }

    setEditState({
      isEditing: false,
      editingCell: null,
      editValue: null,
      editType: 'freeText',
      overlayPosition: null
    })
  }

  // Handle edit value changes with enhanced dynamic height calculation
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

  // Handle keyboard navigation
  const handleKeyDown = (e: KeyboardEvent, row: number, col: number) => {
    if (onKeyNavigation) {
      onKeyNavigation(e, row, col)
    }

    // Tab navigation
    if (e.key === 'Tab') {
      e.preventDefault()
      
      const totalCols = columns.length
      const totalRows = data.length
      
      let nextRow = row
      let nextCol = e.shiftKey ? col - 1 : col + 1
      
      // Handle column overflow
      if (nextCol >= totalCols) {
        nextCol = 0
        nextRow = row + 1
      } else if (nextCol < 0) {
        nextCol = totalCols - 1
        nextRow = row - 1
      }
      
      // Handle row overflow
      if (nextRow >= totalRows) {
        nextRow = 0
        nextCol = 0
      } else if (nextRow < 0) {
        nextRow = totalRows - 1
        nextCol = totalCols - 1
      }

      // Stop current editing and move to next cell
      if (editState.isEditing) {
        stopEditing(true)
      }

      // Focus next cell
      setTimeout(() => {
        const nextCell = document.querySelector(`[data-row="${nextRow}"][data-col="${nextCol}"]`)
        if (nextCell && nextCell instanceof HTMLElement) {
          nextCell.focus()
        }
      }, 10)
    }

    // Enter/Space to start editing or trigger actions
    if ((e.key === 'Enter' || e.key === ' ') && !editState.isEditing) {
      e.preventDefault()
      const column = columns[col]
      const currentValue = data[row][column.key]
      
      if (column.type === 'switch') {
        // Toggle switch
        if (editable && !column.readonly && !column.disabled) {
          const newData = [...data]
          newData[row] = { ...newData[row], [column.key]: !currentValue }
          onDataChange?.(newData)
        }
      } else if (column.type === 'button') {
        // Trigger button action
        if (!column.disabled) {
          onCellAction?.('button-click', row, column.key, currentValue)
        }
      } else if (column.type === 'freeText' || column.type === 'dropdown') {
        // Start editing for text and dropdown cells
        startEditing(row, col, column.type, currentValue)
      }
    }

    // Escape to cancel editing
    if (e.key === 'Escape' && editState.isEditing) {
      e.preventDefault()
      stopEditing(false)
    }
  }

  // Get row key
  const getRowKey = (row: any, index: number): string => {
    if (typeof rowKey === 'function') {
      return rowKey(row, index)
    }
    return row[rowKey] || index.toString()
  }

  // Render cell content based on type
  const renderCellContent = (row: any, column: DynamoColumnConfig, rowIndex: number, colIndex: number) => {
    const value = row[column.key]
    const isCurrentlyEditing = editState.editingCell?.row === rowIndex && editState.editingCell?.col === colIndex

    const cellProps = {
      'data-row': rowIndex,
      'data-col': colIndex,
      className: `cell-content ${isCurrentlyEditing ? 'editing' : ''} ${column.type}`,
      tabIndex: editable ? 0 : -1,
      onKeyDown: (e: KeyboardEvent) => handleKeyDown(e, rowIndex, colIndex),
      onClick: () => {
        // Only start editing for text and dropdown cells
        if (editable && !column.readonly && !column.disabled && 
            (column.type === 'freeText' || column.type === 'dropdown')) {
          startEditing(rowIndex, colIndex, column.type, value)
        }
      },
      style: {
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        padding: '8px',
        cursor: editable && !column.readonly && !column.disabled ? 'pointer' : 'default',
        outline: 'none',
        border: isCurrentlyEditing ? '2px solid #3b82f6' : '1px solid transparent',
        borderRadius: '4px',
        backgroundColor: isCurrentlyEditing ? '#f8fafc' : 'transparent',
        transition: 'all 0.2s ease-in-out'
      }
    }

    switch (column.type) {
      case 'freeText':
        const hasOverflowingText = value && String(value).length > 50 // Approximate overflow threshold
        
        return (
          <div {...cellProps}>
            <div className="w-full overflow-hidden">
              <div className="whitespace-pre-line line-clamp-1 text-ellipsis overflow-hidden text-sm">
                {value || (
                  <span className="text-gray-400 italic">
                    {column.placeholder}
                  </span>
                )}
                {hasOverflowingText && !isCurrentlyEditing && (
                  <span className="text-blue-500 text-xs ml-1" title="Click to expand">
                    ...
                  </span>
                )}
              </div>
            </div>
          </div>
        )

      case 'switch':
        return (
          <div 
            {...cellProps} 
            style={{ 
              ...cellProps.style, 
              justifyContent: 'center',
              cursor: editable && !column.readonly && !column.disabled ? 'pointer' : 'default'
            }}
            onClick={(e) => {
              e.stopPropagation()
              if (editable && !column.readonly && !column.disabled) {
                const newData = [...data]
                newData[rowIndex] = { ...newData[rowIndex], [column.key]: !value }
                onDataChange?.(newData)
              }
            }}
          >
            <div className="flex items-center space-x-2">
              <Switch
                checked={!!value}
                onCheckedChange={(checked) => {
                  if (editable && !column.readonly && !column.disabled) {
                    const newData = [...data]
                    newData[rowIndex] = { ...newData[rowIndex], [column.key]: checked }
                    onDataChange?.(newData)
                  }
                }}
                disabled={!editable || column.readonly || column.disabled}
              />
              {column.switchLabel && (
                <span className="text-xs text-muted-foreground">
                  {column.switchLabel(!!value)}
                </span>
              )}
            </div>
          </div>
        )

      case 'button':
        return (
          <div 
            {...cellProps} 
            style={{ 
              ...cellProps.style, 
              justifyContent: 'center',
              cursor: column.disabled ? 'default' : 'pointer'
            }}
            onClick={(e) => e.stopPropagation()} // Prevent cell editing trigger
          >
            <Button
              type="button"
              variant={column.buttonVariant || 'ghost'}
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                if (!column.disabled) {
                  onCellAction?.('button-click', rowIndex, column.key, value)
                }
              }}
              className="h-8 w-8 p-0"
              disabled={column.disabled}
            >
              {column.buttonIcon}
            </Button>
          </div>
        )

      case 'dropdown':
        return (
          <div {...cellProps} style={{ ...cellProps.style, padding: '4px' }}>
            <Select
              value={value}
              onValueChange={(val) => {
                if (editable && !column.readonly && !column.disabled) {
                  const newData = [...data]
                  newData[rowIndex] = { ...newData[rowIndex], [column.key]: val }
                  onDataChange?.(newData)
                }
              }}
              disabled={!editable || column.readonly || column.disabled}
            >
              <SelectTrigger className="w-full h-8">
                <SelectValue placeholder={column.placeholder} />
              </SelectTrigger>
              <SelectContent>
                {column.options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )

      default:
        return (
          <div {...cellProps}>
            <span className="text-sm">{String(value || '')}</span>
          </div>
        )
    }
  }

  // Auto-focus overlay when editing starts
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

  return (
    <div className="relative">
      {/* Main Table */}
      <div className={`rounded-md overflow-visible border border-gray-200 ${className}`}>
        <Table ref={tableRef} className="enhanced-table">
          <TableHeader>
            <TableRow className="h-10">
              {columns.map((column) => (
                <TableHead 
                  key={column.key} 
                  className="px-4 py-3 font-semibold"
                  style={{ width: column.width }}
                >
                  {column.title}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, rowIndex) => (
              <TableRow key={getRowKey(row, rowIndex)} className="h-10">
                {columns.map((column, colIndex) => (
                  <TableCell 
                    key={column.key}
                    className="p-0 h-10"
                    style={{ width: column.width }}
                  >
                    {renderCellContent(row, column, rowIndex, colIndex)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Global Edit Overlay - Only for text cells */}
      {editState.isEditing && editState.editType === 'freeText' && editState.overlayPosition && (
        <div 
          ref={overlayRef}
          className="global-edit-overlay"
          style={{
            position: 'fixed',
            zIndex: 999999,
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
              if (editState.editingCell) {
                handleKeyDown(e, editState.editingCell.row, editState.editingCell.col)
              }
            }
          }}
        >
          <Textarea
            value={editState.editValue || ''}
            onChange={(e) => handleEditValueChange(e.target.value)}
            onBlur={() => stopEditing(true)}
            placeholder={columns[editState.editingCell?.col || 0].placeholder}
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

      {/* Enhanced Table Styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .enhanced-table {
          border-collapse: separate;
          border-spacing: 0;
          border: none;
          table-layout: fixed;
          width: 100%;
          overflow: visible !important;
        }
        
        .enhanced-table th,
        .enhanced-table td {
          overflow: visible !important;
          position: relative;
        }
        
        .enhanced-table th {
          border-right: 1px solid #e5e7eb;
          border-bottom: 1px solid #e5e7eb;
          background-color: #f9fafb;
          height: 40px;
        }
        
        .enhanced-table th:last-child {
          border-right: none;
        }
        
        .enhanced-table td {
          border-right: 1px solid #e5e7eb;
          border-bottom: 1px solid #e5e7eb;
          height: 40px;
        }
        
        .enhanced-table td:last-child {
          border-right: none;
        }
        
        .enhanced-table tr:last-child td {
          border-bottom: none;
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

export default DynamoTable
