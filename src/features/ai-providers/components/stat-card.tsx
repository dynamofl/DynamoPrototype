/**
 * StatCard component for displaying statistics in AI Providers page
 */

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

export interface StatCardProps {
  title: string
  value: number | string
  info?: string
  variant?: 'default' | 'success' | 'warning' | 'destructive'
}

export function StatCard({ title, value, info, variant = 'default' }: StatCardProps) {
  const getValueColor = () => {
    switch (variant) {
      case 'success': return 'text-green-600'
      case 'warning': return 'text-orange-600'
      case 'destructive': return 'text-red-600'
      default: return 'text-foreground'
    }
  }

  return (
    <Card className={cn("shadow-none bg-transparent")}>
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              {info ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="text-[13px] font-450 text-muted-foreground border-b border-dashed border-gray-300 hover:text-foreground transition-colors cursor-help">
                        {title}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">{info}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <p className="text-[13px] font-450 text-muted-foreground border-b border-dashed border-gray-300">{title}</p>
              )}
            </div>
            <p className={cn("text-lg font-450", getValueColor())}>{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
