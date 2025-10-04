/**
 * Flexible Slot component for expandable row content
 * Can render any React component or content
 */

import React from 'react'
import { cn } from '@/lib/utils'

export interface SlotProps {
  children?: React.ReactNode
  component?: React.ComponentType<any>
  componentProps?: Record<string, any>
  className?: string
  render?: (props: any) => React.ReactNode
  fallback?: React.ReactNode
}

export function Slot({
  children,
  component: Component,
  componentProps = {},
  className = '',
  render,
  fallback = null
}: SlotProps) {
  // If children are provided, render them directly
  if (children) {
    return (
      <div className={cn('w-full max-h-96 overflow-y-auto', className)}>
        {children}
      </div>
    )
  }

  // If a render function is provided, use it
  if (render) {
    return (
      <div className={cn('w-full max-h-96 overflow-y-auto', className)}>
        {render(componentProps)}
      </div>
    )
  }

  // If a component is provided, render it with props
  if (Component) {
    return (
      <div className={cn('w-full max-h-96 overflow-y-auto', className)}>
        <Component {...componentProps} />
      </div>
    )
  }

  // Fallback to provided fallback or null
  return fallback ? (
    <div className={cn('w-full max-h-96 overflow-y-auto', className)}>
      {fallback}
    </div>
  ) : null
}

// Specialized slot components for common use cases
export interface ModelsListSlotProps {
  models: Array<{
    id: string
    object?: string
    created: number | string | Date
    owned_by?: string
  }>
  lastFetched?: string
  emptyMessage?: string
  className?: string
}

export function ModelsListSlot({
  models = [],
  lastFetched,
  emptyMessage = 'No models available',
  className = ''
}: ModelsListSlotProps) {
  const formatModelDate = (date: number | string | Date): string => {
    try {
      const dateObj = typeof date === 'number' ? new Date(date * 1000) : new Date(date)
      return dateObj.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    } catch {
      return 'Invalid date'
    }
  }

  if (models.length === 0) {
    return (
      <div className={cn('flex items-center justify-center py-8', className)}>
        <div className="text-center">
          <div className="text-gray-600 mb-2">
            {emptyMessage}
          </div>
          <div className="text-[0.8125rem]  text-gray-600">
            Use the "Fetch Models" action to discover available models
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('p-4', className)}>
      <div className="space-y-2">
        <h4 className="font-450 text-[0.8125rem] ">Available Models ({models.length})</h4>
        <div className="grid grid-cols-1 gap-2">
          {models
            .sort((a: any, b: any) => new Date(b.created).getTime() - new Date(a.created).getTime())
            .map((model: any) => (
              <div key={model.id} className="flex items-center justify-between py-2 px-3 bg-muted/30 rounded-md">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <div className="font-450 text-[0.8125rem] ">{model.id}</div>
                    <div className="text-[0.8125rem]  text-gray-600">
                      Created: {formatModelDate(model.created)}
                    </div>
                  </div>
                </div>
                <div className="text-[0.8125rem]  text-gray-600">
                  {typeof model.object === 'string' ? model.object : 'model'}
                </div>
              </div>
            ))}
        </div>
        {lastFetched && (
          <p className="text-[0.8125rem]  text-gray-600 mt-2">
            Last updated: {lastFetched}
          </p>
        )}
      </div>
    </div>
  )
}

// Generic table slot for sub-tables
export interface TableSlotProps {
  data: any[]
  columns: Array<{
    key: string
    title: string
    render?: (value: any, row: any) => React.ReactNode
  }>
  className?: string
}

export function TableSlot({ data = [], columns, className = '' }: TableSlotProps) {
  if (data.length === 0) {
    return (
      <div className={cn('flex items-center justify-center py-4', className)}>
        <div className="text-[0.8125rem]  text-gray-600">No data available</div>
      </div>
    )
  }

  return (
    <div className={cn('p-4', className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-[0.8125rem] ">
          <thead>
            <tr className="border-b">
              {columns.map((column) => (
                <th key={column.key} className="text-left py-2 px-3 font-450">
                  {column.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index} className="border-b last:border-b-0">
                {columns.map((column) => (
                  <td key={column.key} className="py-2 px-3">
                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
