/**
 * ProviderViewSheet component for viewing AI provider details
 */

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Eye, EyeOff } from 'lucide-react'
import { ViewEditSheet } from '@/components/patterns'
import type { AIProvider } from '../types'
import { formatModelDate } from '../lib'

export interface ProviderViewSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  provider: AIProvider | null
  onEdit: (provider: AIProvider) => void
}

export function ProviderViewSheet({ 
  open, 
  onOpenChange, 
  provider, 
  onEdit 
}: ProviderViewSheetProps) {
  const [showApiKey, setShowApiKey] = useState(false)

  const getStatusBadge = (status: AIProvider['status']) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>
      case 'testing':
        return <Badge variant="outline">Testing</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const handleEdit = () => {
    if (provider) {
      onEdit(provider)
      onOpenChange(false)
    }
  }

  if (!provider) return null

  return (
    <ViewEditSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Provider Details"
      description="View detailed information about this AI service provider."
      size="lg"
    >
      <div className="space-y-6 mt-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-[0.8125rem]  font-450 text-muted-foreground">Provider Name</Label>
            <p className="text-[0.8125rem] ">{provider.name}</p>
          </div>
          
          <div className="space-y-2">
            <Label className="text-[0.8125rem]  font-450 text-muted-foreground">Type</Label>
            <Badge variant="outline">{provider.type}</Badge>
          </div>
          
          <div className="space-y-2">
            <Label className="text-[0.8125rem]  font-450 text-muted-foreground">Status</Label>
            {getStatusBadge(provider.status)}
          </div>
          
          <div className="space-y-2">
            <Label className="text-[0.8125rem]  font-450 text-muted-foreground">API Key</Label>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-[0.8125rem]  bg-muted px-2 py-1 rounded">
                {provider.apiKey.slice(0, 7)}...{provider.apiKey.slice(-4)}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {showApiKey && (
              <p className="font-mono text-[0.8125rem]  bg-muted px-2 py-1 rounded mt-2">
                {provider.apiKey}
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label className="text-[0.8125rem]  font-450 text-muted-foreground">Created</Label>
            <p className="text-[0.8125rem] ">{provider.createdAt}</p>
          </div>
          
          {provider.lastUsed && (
            <div className="space-y-2">
              <Label className="text-[0.8125rem]  font-450 text-muted-foreground">Last Used</Label>
              <p className="text-[0.8125rem] ">{provider.lastUsed}</p>
            </div>
          )}
          
          <div className="space-y-2">
            <Label className="text-[0.8125rem]  font-450 text-muted-foreground">Usage Count</Label>
            <p className="text-[0.8125rem] ">{provider.usageCount}</p>
          </div>
        </div>

        {provider.models && provider.models.length > 0 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[0.8125rem]  font-450 text-muted-foreground">
                Available Models ({provider.models.length})
              </Label>
              <div className="max-h-48 overflow-y-auto border rounded-md p-3 space-y-2">
                {provider.models
                  .sort((a: any, b: any) => new Date(b.created).getTime() - new Date(a.created).getTime())
                  .map((model: any) => (
                  <div key={model.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                    <div>
                      <div className="font-450 text-[0.8125rem] ">{model.id}</div>
                      <div className="text-xs text-muted-foreground">
                        Created: {formatModelDate(model.created)}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {typeof model.object === 'string' ? model.object : 'model'}
                    </Badge>
                  </div>
                ))}
              </div>
              {provider.modelsLastFetched && (
                <p className="text-xs text-muted-foreground">
                  Last updated: {provider.modelsLastFetched}
                </p>
              )}
            </div>
          </div>
        )}

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
            Edit Provider
          </Button>
        </div>
      </div>
    </ViewEditSheet>
  )
}
