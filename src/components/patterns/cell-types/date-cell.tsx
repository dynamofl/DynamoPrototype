/**
 * Date cell component for date display and editing
 */

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { CalendarIcon, Edit2 } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import type { CellProps } from '@/types/table'

interface DateCellProps extends CellProps {
  dateFormat?: string
  showTime?: boolean
}

export function DateCell({
  value,
  row: _row,
  column,
  mode,
  onChange,
  disabled = false,
  className = '',
  dateFormat = 'MMM dd, yyyy',
  showTime = false
}: DateCellProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  // Parse date value
  const parseDate = (dateValue: any): Date | undefined => {
    if (!dateValue) return undefined
    
    if (dateValue instanceof Date) return dateValue
    
    if (typeof dateValue === 'string') {
      const parsed = new Date(dateValue)
      return isNaN(parsed.getTime()) ? undefined : parsed
    }
    
    return undefined
  }

  const dateValue = parseDate(value)

  // Handle date change
  const handleDateChange = (newDate: Date | undefined) => {
    if (newDate) {
      const formattedDate = showTime 
        ? newDate.toISOString() 
        : newDate.toISOString().split('T')[0]
      onChange?.(formattedDate)
    }
    setIsOpen(false)
    setIsEditing(false)
  }

  // Handle edit start
  const handleEditStart = () => {
    if (mode === 'edit' && !disabled && !column.readonly) {
      setIsEditing(true)
      setIsOpen(true)
    }
  }

  // Format date for display
  const formatDate = (date: Date | undefined): string => {
    if (!date) return column.placeholder || 'No date'
    
    try {
      return format(date, dateFormat)
    } catch (error) {
      return date.toLocaleDateString()
    }
  }

  // View mode - display date
  if (mode === 'view' || disabled || column.readonly) {
    return (
      <div className={`min-h-[32px] flex items-center ${className}`}>
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-gray-400" />
          <span className="text-[13px]">
            {formatDate(dateValue)}
          </span>
        </div>
      </div>
    )
  }

  // Edit mode - date picker
  if (isEditing) {
    return (
      <div className={`min-h-[32px] flex items-center ${className}`}>
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "h-8 w-full justify-start text-left font-normal",
                !dateValue && "text-gray-600"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateValue ? formatDate(dateValue) : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={dateValue}
              onSelect={handleDateChange}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
    )
  }

  // Edit mode - display with edit button
  return (
    <div className={`min-h-[32px] flex items-center justify-between group ${className}`}>
      <div className="flex items-center gap-2">
        <CalendarIcon className="h-4 w-4 text-gray-400" />
        <span className="text-[13px]">
          {formatDate(dateValue)}
        </span>
      </div>
      <Button
        size="sm"
        variant="ghost"
        onClick={handleEditStart}
        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Edit2 className="h-3 w-3" />
      </Button>
    </div>
  )
}

