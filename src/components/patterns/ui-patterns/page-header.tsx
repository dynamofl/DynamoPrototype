import * as React from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface PageHeaderAction {
  icon?: React.ComponentType<{ className?: string }>
  label: string
  onClick: () => void
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive'
  className?: string
  disabled?: boolean
}

export interface PageHeaderProps {
  title: string
  description?: string
  actions?: PageHeaderAction[]
  children?: React.ReactNode
  className?: string
  titleClassName?: string
  descriptionClassName?: string
  actionsClassName?: string
}

export function PageHeader({
  title,
  description,
  actions = [],
  children,
  className,
  titleClassName,
  descriptionClassName,
  actionsClassName
}: PageHeaderProps) {
  return (
    <div className={cn("px-4 ", className)}>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className={cn("text-md font-450 tracking-tight", titleClassName)}>
            {title}
          </h1>
          {description && (
            <p className={cn("text-[13px] text-muted-foreground", descriptionClassName)}>
              {description}
            </p>
          )}
        </div>
        
        {actions.length > 0 && (
          <div className={cn("flex items-center gap-2", actionsClassName)}>
            {actions.map((action, index) => (
              <Button
                key={index}
                onClick={action.onClick}
                variant={action.variant || 'default'}
                className={cn("flex items-center gap-2", action.className)}
                disabled={action.disabled}
              >
                {action.icon && <action.icon className="h-4 w-4" />}
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>
      
      {children && (
        <div className="mt-4">
          {children}
        </div>
      )}
    </div>
  )
}