/**
 * Column factory utilities for creating table columns
 */

import type { TableColumn, ButtonVariant, BadgeVariant } from '@/types/table'

export class ColumnFactory {
  /**
   * Create an expand column for expandable rows
   */
  static createExpandColumn(config: Partial<TableColumn> = {}): TableColumn {
    return {
      key: 'expand',
      title: '',
      width: '40px',
      type: 'expand',
      ...config
    }
  }

  /**
   * Create an actions column with dropdown menu
   */
  static createActionsColumn(
    actions: Array<{
      key: string
      label: string
      icon?: any
      variant?: ButtonVariant
      onClick?: (row: any) => void
    }>,
    config: Partial<TableColumn> = {}
  ): TableColumn {
    return {
      key: 'actions',
      title: 'Actions',
      width: `${Math.max(actions.length * 40 + 20, 80)}px`,
      type: 'button',
      buttonVariant: 'ghost',
      ...config
    }
  }

  /**
   * Create a status column with badge
   */
  static createStatusColumn(
    options: Array<{ value: string; label: string; variant?: BadgeVariant }>,
    config: Partial<TableColumn> = {}
  ): TableColumn {
    return {
      key: 'status',
      title: 'Status',
      width: '120px',
      type: 'badge',
      options,
      ...config
    }
  }

  /**
   * Create a text column
   */
  static createTextColumn(
    key: string,
    title: string,
    config: Partial<TableColumn> = {}
  ): TableColumn {
    return {
      key,
      title,
      width: '200px',
      type: 'freeText',
      ...config
    }
  }

  /**
   * Create a multiline text column
   */
  static createMultilineTextColumn(
    key: string,
    title: string,
    config: Partial<TableColumn> = {}
  ): TableColumn {
    return {
      key,
      title,
      width: '300px',
      type: 'freeText',
      ...config
    }
  }

  /**
   * Create a dropdown column
   */
  static createDropdownColumn(
    key: string,
    title: string,
    options: Array<{ value: string; label: string }>,
    config: Partial<TableColumn> = {}
  ): TableColumn {
    return {
      key,
      title,
      width: '150px',
      type: 'dropdown',
      options,
      ...config
    }
  }

  /**
   * Create a switch column
   */
  static createSwitchColumn(
    key: string,
    title: string,
    config: Partial<TableColumn> = {}
  ): TableColumn {
    return {
      key,
      title,
      width: '100px',
      type: 'switch',
      ...config
    }
  }

  /**
   * Create a date column
   */
  static createDateColumn(
    key: string,
    title: string,
    config: Partial<TableColumn> = {}
  ): TableColumn {
    return {
      key,
      title,
      width: '150px',
      type: 'date',
      ...config
    }
  }

  /**
   * Create an icon column
   */
  static createIconColumn(
    key: string,
    title: string,
    config: Partial<TableColumn> = {}
  ): TableColumn {
    return {
      key,
      title,
      width: '200px',
      type: 'icon',
      ...config
    }
  }

  /**
   * Create a delete button column
   */
  static createDeleteColumn(config: Partial<TableColumn> = {}): TableColumn {
    return {
      key: 'delete',
      title: 'Delete',
      width: '80px',
      type: 'button',
      buttonVariant: 'ghost',
      ...config
    }
  }

  /**
   * Create a view button column
   */
  static createViewColumn(config: Partial<TableColumn> = {}): TableColumn {
    return {
      key: 'view',
      title: 'View',
      width: '80px',
      type: 'button',
      buttonVariant: 'ghost',
      ...config
    }
  }

  /**
   * Create an edit button column
   */
  static createEditColumn(config: Partial<TableColumn> = {}): TableColumn {
    return {
      key: 'edit',
      title: 'Edit',
      width: '80px',
      type: 'button',
      buttonVariant: 'ghost',
      ...config
    }
  }

  /**
   * Create a copy button column
   */
  static createCopyColumn(config: Partial<TableColumn> = {}): TableColumn {
    return {
      key: 'copy',
      title: 'Copy',
      width: '80px',
      type: 'button',
      buttonVariant: 'ghost',
      ...config
    }
  }

  /**
   * Create a column with custom configuration
   */
  static createCustomColumn(
    key: string,
    title: string,
    type: TableColumn['type'],
    config: Partial<TableColumn> = {}
  ): TableColumn {
    return {
      key,
      title,
      width: '150px',
      type,
      ...config
    }
  }

  /**
   * Create multiple columns at once
   */
  static createColumns(columnConfigs: Array<{
    key: string
    title: string
    type: TableColumn['type']
    config?: Partial<TableColumn>
  }>): TableColumn[] {
    return columnConfigs.map(({ key, title, type, config = {} }) =>
      this.createCustomColumn(key, title, type, config)
    )
  }

  /**
   * Add common properties to columns
   */
  static addCommonProperties(
    columns: TableColumn[],
    commonProps: Partial<TableColumn>
  ): TableColumn[] {
    return columns.map(column => ({ ...column, ...commonProps }))
  }

  /**
   * Set column widths
   */
  static setColumnWidths(
    columns: TableColumn[],
    widthMap: Record<string, string>
  ): TableColumn[] {
    return columns.map(column => ({
      ...column,
      width: widthMap[column.key] || column.width
    }))
  }

  /**
   * Set column validation
   */
  static setColumnValidation(
    columns: TableColumn[],
    validationMap: Record<string, (value: any) => boolean>
  ): TableColumn[] {
    return columns.map(column => ({
      ...column,
      validation: validationMap[column.key] || column.validation
    }))
  }
}
