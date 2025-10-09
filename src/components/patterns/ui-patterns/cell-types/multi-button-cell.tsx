import React from 'react';
import { Button } from '@/components/ui/button'
import { MoreHorizontal } from 'lucide-react'

interface MultiButtonAction {
  key: string
  label: string
  icon?: React.ReactNode
  variant?: 'default' | 'outline' | 'ghost' | 'destructive' | 'secondary'
  className?: string
  onClick?: () => void
}

interface MultiButtonCellProps {
  value: any
  row: any
  column: any
  mode: 'view' | 'edit'
  onChange?: (value: any) => void
  onAction?: (action: string, row: any) => void
  disabled?: boolean
  actions?: MultiButtonAction[]
  buttonConfig?: {
    getActions: (row: any) => MultiButtonAction[]
    maxButtons?: number
    showMoreButton?: boolean
  }
}

export const MultiButtonCell = React.memo(function MultiButtonCell({
  value: _value,
  row,
  column: _column,
  mode,
  onChange: _onChange,
  onAction,
  disabled = false,
  actions = [],
  buttonConfig
}: MultiButtonCellProps) {
  // Get actions from buttonConfig if provided, otherwise use actions prop
  const getActions = () => {
    if (buttonConfig?.getActions) {
      return buttonConfig.getActions(row)
    }
    return actions
  }

  const cellActions = getActions()
  const maxButtons = buttonConfig?.maxButtons || 3
  const showMoreButton = buttonConfig?.showMoreButton && cellActions.length > maxButtons

  const visibleActions = cellActions.slice(0, maxButtons)
  const hiddenActions = showMoreButton ? cellActions.slice(maxButtons) : []

  const handleActionClick = (action: MultiButtonAction) => {
    if (action.onClick) {
      action.onClick()
    }
    // Trigger the onAction prop passed from TablePattern
    if (onAction) {
      onAction(action.key, row)
    }
  }

  if (mode === 'edit') {
    return (
      <div className="flex items-center gap-2">
        {cellActions.map((action) => (
          <Button
            key={action.key}
            variant={action.variant || 'outline'}
            size="sm"
            className={action.className}
            onClick={() => handleActionClick(action)}
            disabled={disabled}
          >
            {action.icon && <span className="mr-1">{action.icon}</span>}
            {action.label}
          </Button>
        ))}
      </div>
    )
  }

  return (
    <div className="flex items-center justify-end gap-2">
      {visibleActions.map((action) => (
        <Button
          key={action.key}
          variant={action.variant || 'outline'}
          size="sm"
          className={action.className}
          onClick={() => handleActionClick(action)}
          disabled={disabled}
        >
          {action.icon && <span className="mr-1.5">{action.icon}</span>}
          {action.label}
        </Button>
      ))}
      
      {showMoreButton && (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={() => {
            // Handle more actions dropdown
            console.log('More actions:', hiddenActions)
          }}
        >
          <MoreHorizontal className="h-2 w-2" />
        </Button>
      )}
    </div>
  )
}, (prevProps, nextProps) => {
  // Custom comparison function to prevent unnecessary re-renders
  // Only re-render if the row status changed (which affects button labels)
  return (
    prevProps.row.id === nextProps.row.id &&
    prevProps.row.status === nextProps.row.status &&
    prevProps.disabled === nextProps.disabled &&
    prevProps.mode === nextProps.mode
  );
});
