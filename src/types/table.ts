/**
 * Table pattern type definitions
 */

import type { ReactNode } from 'react'

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

export interface TableColumn {
  key: string
  title: string
  width: string
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
