/**
 * GuardrailViewSheet component for viewing guardrail details
 */

import React from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { ViewEditSheet } from '@/components/patterns'
import type { TableRow } from '@/types/table'

export interface GuardrailViewSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  guardrail: TableRow | null
  onEdit: (guardrail: TableRow) => void
}

export function GuardrailViewSheet({ 
  open, 
  onOpenChange, 
  guardrail, 
  onEdit 
}: GuardrailViewSheetProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const getCategoryBadge = (category: string) => {
    const categoryColors = {
      Safety: 'bg-red-100 text-red-800 border-red-200',
      Privacy: 'bg-blue-100 text-blue-800 border-blue-200',
      Compliance: 'bg-purple-100 text-purple-800 border-purple-200',
      Quality: 'bg-green-100 text-green-800 border-green-200',
      Security: 'bg-orange-100 text-orange-800 border-orange-200',
      Ethics: 'bg-gray-100 text-gray-800 border-gray-200'
    }

    return (
      <Badge 
        variant="outline" 
        className={categoryColors[category as keyof typeof categoryColors] || 'bg-gray-100 text-gray-800 border-gray-200'}
      >
        {category}
      </Badge>
    )
  }

  const handleEdit = () => {
    if (guardrail) {
      onEdit(guardrail)
      onOpenChange(false)
    }
  }

  if (!guardrail) return null

  return (
    <ViewEditSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Guardrail Details"
      description="View detailed information about this guardrail policy."
      size="lg"
    >
      <div className="space-y-6 mt-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-450 text-muted-foreground">Guardrail Name</Label>
            <p className="text-sm font-medium">{guardrail.name}</p>
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm font-450 text-muted-foreground">Category</Label>
            <div>
              {guardrail.category ? getCategoryBadge(guardrail.category) : (
                <span className="text-sm text-muted-foreground">No category assigned</span>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm font-450 text-muted-foreground">Status</Label>
            <div>
              {getStatusBadge(guardrail.status)}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm font-450 text-muted-foreground">Description</Label>
            <p className="text-sm">{guardrail.description}</p>
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm font-450 text-muted-foreground">Created</Label>
            <p className="text-sm">{guardrail.createdAt}</p>
          </div>
          
          {guardrail.updatedAt && guardrail.updatedAt !== guardrail.createdAt && (
            <div className="space-y-2">
              <Label className="text-sm font-450 text-muted-foreground">Last Updated</Label>
              <p className="text-sm">{guardrail.updatedAt}</p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-450 text-muted-foreground">Guardrail Content</Label>
            <div className="p-4 bg-muted rounded-md">
              <p className="text-sm whitespace-pre-wrap">{guardrail.content}</p>
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Close
          </Button>
          <Button
            onClick={handleEdit}
            className="flex-1"
          >
            Edit Guardrail
          </Button>
        </div>
      </div>
    </ViewEditSheet>
  )
}
