/**
 * GuardrailViewSheet component for viewing guardrail details
 */

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ViewEditSheet } from '@/components/patterns'
import type { TableRow } from '@/types/table'

export interface GuardrailViewSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  guardrail: TableRow | null
  onEdit?: (guardrail: TableRow) => void
}

export function GuardrailViewSheet({
  open,
  onOpenChange,
  guardrail,
  onEdit
}: GuardrailViewSheetProps) {
  const [activeTab, setActiveTab] = useState('allowed')

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">Active</Badge>
      case 'inactive':
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800">Inactive</Badge>
      default:
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800">Unknown</Badge>
    }
  }

  const getCategoryBadge = (category: string) => {
    const categoryColors = {
      'Content': 'bg-amber-100 text-amber-800 border-amber-200',
      'Safety': 'bg-red-100 text-red-800 border-red-200',
      'PII Detection': 'bg-gray-100 text-gray-800 border-gray-200',
      'Key Word Detection': 'bg-gray-100 text-gray-800 border-gray-200',
      'Hallucination Detection': 'bg-gray-100 text-gray-800 border-gray-200'
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

  const getTypeBadge = (type: string) => {
    return (
      <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">
        {type}
      </Badge>
    )
  }

  // Count number of behaviors (non-empty bullet points)
  const countBehaviors = (text: string): number => {
    if (!text || !text.trim()) return 0
    const lines = text.split('\n').filter(line => line.trim().startsWith('•') && line.trim().length > 1)
    return lines.length
  }

  const allowedCount = countBehaviors((guardrail?.allowedBehavior as string) || '')
  const disallowedCount = countBehaviors((guardrail?.disallowedBehavior as string) || '')

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
      title="Policy Details"
      size="lg"
      footer={
        onEdit && (
          <div className="flex gap-2">
            <Button
              onClick={handleEdit}
              className="flex-1"
            >
              Edit Guardrail
            </Button>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
          </div>
        ) 
      }
    >
      <div className="space-y-6">

      <div className='space-y-2'>
        <p className='font-lg'>{guardrail.name}</p>
        {/* Badges Section */}
        <div className="flex flex-wrap gap-1">
          <Badge variant="default">{guardrail.type}</Badge>
          <Badge variant="default">{guardrail.category}</Badge>
          {guardrail.updatedAt && guardrail.updatedAt !== guardrail.createdAt && (
                      <Badge variant="default">Last Updated On: {guardrail.updatedAt}</Badge>

      
          )}
        </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label className="text-[0.8125rem]  font-450 text-gray-600">Description</Label>
          <p className="text-[0.8125rem]  text-gray-900 whitespace-pre-wrap">{guardrail.description || 'No description provided'}</p>
        </div>

        {/* Behavior Tabs */}
        <div className="space-y-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="allowed">
                Allowed Behavior {allowedCount > 0 && `(${allowedCount})`}
              </TabsTrigger>
              <TabsTrigger value="disallowed">
                Disallowed Behavior {disallowedCount > 0 && `(${disallowedCount})`}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="allowed" className="mt-4">
              <div className="p-3 rounded-md border border-gray-200">
                {guardrail.allowedBehavior ? (
                  <div className="text-[0.8125rem]  text-gray-900 whitespace-pre-wrap ">
                    {guardrail.allowedBehavior}
                  </div>
                ) : (
                  <p className="text-[0.8125rem]  text-gray-500">No allowed behaviors defined</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="disallowed" className="mt-4">
              <div className="p-3 rounded-md border border-gray-200">
                {guardrail.disallowedBehavior ? (
                  <div className="text-[0.8125rem]  text-gray-900 whitespace-pre-wrap ">
                    {guardrail.disallowedBehavior}
                  </div>
                ) : (
                  <p className="text-[0.8125rem]  text-gray-500">No disallowed behaviors defined</p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

       
      </div>
    </ViewEditSheet>
  )
}
