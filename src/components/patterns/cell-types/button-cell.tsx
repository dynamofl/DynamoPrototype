/**
 * Button cell component for actions
 */

import React from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Edit } from 'lucide-react'
import type { CellProps } from '@/types/table'

interface ButtonCellProps extends CellProps {
  buttonIcon?: React.ReactNode
  buttonVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  actions?: Array<{
    key: string
    label: string
    icon?: React.ReactNode
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
    onClick?: (row: any) => void
  }>
}

export function ButtonCell({
  value: _value,
  row,
  column: _column,
  mode: _mode,
  onAction,
  disabled = false,
  className = '',
  buttonIcon,
  buttonVariant = 'ghost',
  actions = []
}: ButtonCellProps) {
  // Default actions if none provided
  const defaultActions = [
    {
      key: 'edit',
      label: 'Edit',
      icon: <Edit className="h-4 w-4" />,
      variant: 'ghost' as const
    }
  ]

  const availableActions = actions.length > 0 ? actions : defaultActions

  // Handle action click
  const handleActionClick = (actionKey: string) => {
    if (!disabled) {
      onAction?.(actionKey, row)
    }
  }

  // Single action button
  if (availableActions.length === 1) {
    const action = availableActions[0]
    return (
      <div className={`min-h-[32px] flex items-center justify-center ${className}`}>
        <Button
          size="sm"
          variant={action.variant || buttonVariant}
          onClick={() => handleActionClick(action.key)}
          disabled={disabled}
        >
          {action.icon || buttonIcon}
          <span className="ml-1">{action.label}</span>
        </Button>
      </div>
    )
  }

  // Multiple actions - dropdown menu
  return (
    <div className={`min-h-[32px] flex items-center justify-center ${className}`}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="sm"
            variant={buttonVariant}
            disabled={disabled}
          >
            {buttonIcon || <MoreHorizontal className="h-4 w-4" />}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {availableActions.map((action) => (
            <DropdownMenuItem
              key={action.key}
              onClick={() => handleActionClick(action.key)}
              className={action.variant === 'destructive' ? 'text-red-600' : ''}
            >
              {action.icon}
              <span className="ml-2">{action.label}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

