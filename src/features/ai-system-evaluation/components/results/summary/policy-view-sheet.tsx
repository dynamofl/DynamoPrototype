/**
 * PolicyViewSheet component for viewing policy details from topic analysis
 */

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ViewEditSheet } from '@/components/patterns'

export interface PolicyData {
  id: string
  name: string
  description?: string
  allowed: string[]
  disallowed: string[]
  type?: string
  category?: string
  updatedAt?: string
  createdAt?: string
}

export interface PolicyViewSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  policy: PolicyData | null
}

export function PolicyViewSheet({
  open,
  onOpenChange,
  policy
}: PolicyViewSheetProps) {
  const [activeTab, setActiveTab] = useState('allowed')

  if (!policy) return null

  const allowedCount = policy.allowed?.length || 0
  const disallowedCount = policy.disallowed?.length || 0

  // Convert array to newline-separated string with bullet points (matching GuardrailViewSheet format)
  const formatBehaviors = (behaviors: string[]): string => {
    if (!behaviors || behaviors.length === 0) return ''
    return behaviors.map(b => `• ${b}`).join('\n')
  }

  const allowedText = formatBehaviors(policy.allowed || [])
  const disallowedText = formatBehaviors(policy.disallowed || [])

  return (
    <ViewEditSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Policy Details"
      size="lg"
      footer={
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <div className='space-y-2'>
          <p className='font-lg'>{policy.name}</p>
          {/* Badges Section */}
          <div className="flex flex-wrap gap-1">
            {policy.type && <Badge variant="default">{policy.type}</Badge>}
            {policy.category && <Badge variant="default">{policy.category}</Badge>}
            {policy.updatedAt && policy.updatedAt !== policy.createdAt && (
              <Badge variant="default">Last Updated On: {policy.updatedAt}</Badge>
            )}
          </div>
        </div>

        {/* Description */}
        {policy.description && policy.description.trim() && (
          <div className="space-y-2">
            <Label className="text-[0.8125rem]  font-450 text-gray-600">Description</Label>
            <p className="text-[0.8125rem]  text-gray-900 whitespace-pre-wrap">{policy.description}</p>
          </div>
        )}

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
                {allowedText ? (
                  <div className="text-[0.8125rem]  text-gray-900 whitespace-pre-wrap ">
                    {allowedText}
                  </div>
                ) : (
                  <p className="text-[0.8125rem]  text-gray-500">No allowed behaviors defined</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="disallowed" className="mt-4">
              <div className="p-3 rounded-md border border-gray-200">
                {disallowedText ? (
                  <div className="text-[0.8125rem]  text-gray-900 whitespace-pre-wrap ">
                    {disallowedText}
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
