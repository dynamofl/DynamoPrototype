/**
 * Table pattern type definitions
 */

import type { ReactNode } from 'react'
import type { TableStorage } from '@/lib/storage/types'

export type TableMode = 'view' | 'edit'

export type EditMode = 'inline' | 'dialog' | 'both'

export type CellType = 
  | 'freeText' 
  | 'dropdown' 
  | 'switch' 
  | 'button' 
  | 'badge' 
  | 'date' 
  | 'icon' 
  | 'expand'

export type ButtonVariant = 
  | 'default' 
  | 'destructive' 
  | 'outline' 
  | 'secondary' 
  | 'ghost' 
  | 'link'

export type BadgeVariant = 
  | 'default' 
  | 'secondary' 
  | 'destructive' 
  | 'outline'

export type WidthValue = 
  | 'w-auto' | 'w-fit' | 'w-full' | 'w-min' | 'w-max' | 'w-screen'
  | 'w-0' | 'w-px' | 'w-0.5' | 'w-1' | 'w-1.5' | 'w-2' | 'w-2.5' | 'w-3' | 'w-3.5' | 'w-4' | 'w-5' | 'w-6' | 'w-7' | 'w-8' | 'w-9' | 'w-10' | 'w-11' | 'w-12' | 'w-14' | 'w-16' | 'w-20' | 'w-24' | 'w-28' | 'w-32' | 'w-36' | 'w-40' | 'w-44' | 'w-48' | 'w-52' | 'w-56' | 'w-60' | 'w-64' | 'w-72' | 'w-80' | 'w-96'
  | 'w-1/2' | 'w-1/3' | 'w-2/3' | 'w-1/4' | 'w-2/4' | 'w-3/4' | 'w-1/5' | 'w-2/5' | 'w-3/5' | 'w-4/5' | 'w-1/6' | 'w-2/6' | 'w-3/6' | 'w-4/6' | 'w-5/6' | 'w-1/12' | 'w-2/12' | 'w-3/12' | 'w-4/12' | 'w-5/12' | 'w-6/12' | 'w-7/12' | 'w-8/12' | 'w-9/12' | 'w-10/12' | 'w-11/12'
  | string // Fallback for custom CSS values like '200px', '50%', etc.

export interface TableColumn {
  key: string
  title: string
  width: WidthValue
  type: CellType
  placeholder?: string
  options?: Array<{ value: string; label: string }>
  buttonIcon?: ReactNode
  buttonVariant?: ButtonVariant
  switchLabel?: (value: boolean) => string
  disabled?: boolean
  readonly?: boolean
  expandIcon?: ReactNode
  collapseIcon?: ReactNode
  validation?: (value: any) => boolean
  format?: (value: any, row?: any) => string | ReactNode
  className?: string
  multiline?: boolean
  actions?: Array<{
    key: string
    label: string
    icon?: ReactNode
    variant?: ButtonVariant
    onClick?: (row: any) => void
  }>
  // Row editing configuration
  editMode?: EditMode
  rowEditTrigger?: boolean
  rowEditLabel?: string
  rowEditIcon?: ReactNode
  // Icon-related props
  iconComponent?: React.ComponentType<{ className?: string }>
  iconSrc?: string
  iconAlt?: string
  iconSize?: 'sm' | 'md' | 'lg'
  iconPosition?: 'left' | 'right' | 'top' | 'bottom'
  showText?: boolean
}

export interface ExpandableConfig {
  enabled: boolean
  expandColumnKey: string
  contentKey: string
  renderContent: (row: any) => ReactNode
  defaultExpanded?: boolean
}

export interface PaginationConfig {
  enabled: boolean
  itemsPerPage: number
  showPageInfo?: boolean
  showPageSizeSelector?: boolean
  pageSizeOptions?: number[]
}

export interface TableRow {
  id: string
  [key: string]: any
}

export interface TableStorageConfig {
  type: 'session' | 'persistent' | 'secure'
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
}

export interface TablePatternProps {
  mode: TableMode
  columns: TableColumn[]
  storageConfig: TableStorageConfig
  customStorage?: TableStorage // Optional custom storage instance
  pagination?: PaginationConfig
  expandable?: ExpandableConfig
  onDataChange?: (data: TableRow[]) => void
  onCellAction?: (action: string, row: TableRow, index: number) => void
  onRowExpand?: (rowId: string, expanded: boolean) => void
  onRowEdit?: (row: TableRow, index: number) => void
  className?: string
  loading?: boolean
  error?: string | null
  emptyMessage?: string
  showHeader?: boolean
  stickyHeader?: boolean
  // Table layout configuration
  tableWidth?: string | 'auto' | 'full'
  // Global editing configuration
  defaultEditMode?: EditMode
  rowEditDialogTitle?: string
  rowEditDialogDescription?: string
}

export interface CellProps {
  value: any
  row: TableRow
  column: TableColumn
  mode: TableMode
  onChange?: (value: any) => void
  onAction?: (action: string, value?: any) => void
  onRowEdit?: (row: TableRow) => void
  disabled?: boolean
  className?: string
  isEditing?: boolean
  onEditStart?: () => void
  onEditEnd?: () => void
  editMode?: EditMode
  onStartEditing?: (cellType: string, currentValue: any) => void
  isCurrentlyEditing?: boolean
}

export interface ExpandCellProps extends CellProps {
  isExpanded: boolean
  onToggle: () => void
  expandIcon?: ReactNode
  collapseIcon?: ReactNode
}

export interface PaginationState {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  startIndex: number
  endIndex: number
}

export interface TableState {
  data: TableRow[]
  loading: boolean
  error: string | null
  expandedRows: Set<string>
  editingCell: { rowId: string; columnKey: string } | null
  pagination: PaginationState | null
}
