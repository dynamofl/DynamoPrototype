/**
 * ProviderEditSheet component for editing AI provider details
 */

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RefreshCw } from 'lucide-react'
import { ViewEditSheet } from '@/components/patterns'
import type { AIProvider, AIModel } from '../types'
import { formatModelDate, fetchModelsForProvider } from '../lib'

export interface ProviderEditSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  provider: AIProvider | null
  onProviderUpdated: (provider: AIProvider) => void
}

export function ProviderEditSheet({ 
  open, 
  onOpenChange, 
  provider, 
  onProviderUpdated 
}: ProviderEditSheetProps) {
  const [editingProvider, setEditingProvider] = useState<AIProvider | null>(null)
  const [editAvailableModels, setEditAvailableModels] = useState<AIModel[]>([])
  const [editSelectedModels, setEditSelectedModels] = useState<string[]>([])
  const [isEditFetchingModels, setIsEditFetchingModels] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [validationError, setValidationError] = useState('')

  // Initialize state when provider changes
  useEffect(() => {
    if (provider) {
      setEditingProvider({ ...provider })
      setEditAvailableModels(provider.models || [])
      setEditSelectedModels(provider.models?.map((model: any) => model.id) || [])
      setValidationError('')
    }
  }, [provider])

  const handleEditFetchModels = async () => {
    if (!editingProvider) return

    setIsEditFetchingModels(true)
    
    try {
      const models = await fetchModelsForProvider(editingProvider)
      setEditAvailableModels(models)
      // Keep previously selected models selected, but add any new ones as unselected
      const currentSelectedIds = editingProvider.models?.map((model: any) => model.id) || []
      const newSelectedIds = models.filter((model: any) => currentSelectedIds.includes(model.id)).map((model: any) => model.id)
      setEditSelectedModels(newSelectedIds)
    } catch (error) {
      console.error('Failed to fetch models for editing:', error)
      // Keep existing models if fetch fails
    } finally {
      setIsEditFetchingModels(false)
    }
  }

  const handleUpdateProvider = async () => {
    if (!editingProvider) return

    if (!editingProvider.name.trim()) {
      setValidationError('Provider name is required')
      return
    }

    setIsValidating(true)
    setValidationError('')

    try {
      const updatedProvider: AIProvider = {
        ...editingProvider,
        name: editingProvider.name.trim(),
        models: editAvailableModels.filter(model => editSelectedModels.includes(model.id)),
        modelsLastFetched: editAvailableModels.length > 0 ? new Date().toLocaleString() : editingProvider.modelsLastFetched
      }

      onProviderUpdated(updatedProvider)
      onOpenChange(false)
    } catch (error) {
      setValidationError('Failed to update provider. Please try again.')
    } finally {
      setIsValidating(false)
    }
  }

  const handleCancel = () => {
    onOpenChange(false)
    setEditingProvider(null)
    setValidationError('')
    setEditAvailableModels([])
    setEditSelectedModels([])
  }

  if (!editingProvider) return null

  return (
    <ViewEditSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Edit AI Provider"
      description="Modify the settings for this AI service provider."
      size="lg"
    >
      <div className="space-y-4 mt-6">
        <div className="space-y-2">
          <Label htmlFor="edit-provider-name">Provider Name</Label>
          <Input
            id="edit-provider-name"
            placeholder="e.g., OpenAI Production, OpenAI Development"
            value={editingProvider.name}
            onChange={(e) => setEditingProvider({ ...editingProvider, name: e.target.value })}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="edit-provider-status">Status</Label>
          <Select
            value={editingProvider.status}
            onValueChange={(value) => setEditingProvider({ ...editingProvider, status: value as AIProvider['status'] })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="testing">Testing</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Models Management */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-[0.8125rem]  font-450">Models Management</Label>
            <Button
              variant="outline"
              size="sm"
              onClick={handleEditFetchModels}
              disabled={isEditFetchingModels}
            >
              {isEditFetchingModels ? (
                <>
                  <RefreshCw className="h-3 w-3 animate-spin mr-1" />
                  Fetching...
                </>
              ) : (
                <>
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Fetch All Models
                </>
              )}
            </Button>
          </div>

          {/* Current Models Display */}
          {editingProvider.models && editingProvider.models.length > 0 && (
            <div className="space-y-2">
              <Label className="text-[0.8125rem]  text-muted-foreground">
                Currently Selected Models ({editingProvider.models.length})
              </Label>
              <div className="max-h-32 overflow-y-auto border rounded-md p-3 space-y-2">
                {editingProvider.models
                  .sort((a: any, b: any) => new Date(b.created).getTime() - new Date(a.created).getTime())
                  .map((model: any) => (
                  <div key={model.id} className="flex items-center justify-between py-1">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div>
                        <div className="font-450 text-[0.8125rem] ">{model.id}</div>
                        <div className="text-xs text-muted-foreground">
                          Created: {formatModelDate(model.created)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Available Models Selection */}
          {editAvailableModels.length > 0 && (
            <div className="space-y-2">
              <Label className="text-[0.8125rem]  text-muted-foreground">
                Available Models ({editAvailableModels.length})
              </Label>
              <div className="max-h-48 overflow-y-auto border rounded-md p-3 space-y-2">
                <div className="flex items-center space-x-2 pb-2 border-b">
                  <input
                    type="checkbox"
                    id="edit-select-all-models"
                    checked={editSelectedModels.length === editAvailableModels.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setEditSelectedModels(editAvailableModels.map(model => model.id))
                      } else {
                        setEditSelectedModels([])
                      }
                    }}
                    className="rounded"
                  />
                  <Label htmlFor="edit-select-all-models" className="text-[0.8125rem]  font-450 cursor-pointer">
                    Select All Models
                  </Label>
                </div>
                {editAvailableModels
                  .sort((a: any, b: any) => new Date(b.created).getTime() - new Date(a.created).getTime())
                  .map((model: any) => {
                    const isCurrentlySelected = editingProvider.models?.some((m: any) => m.id === model.id)
                    return (
                      <div key={model.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`edit-model-${model.id}`}
                          checked={editSelectedModels.includes(model.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setEditSelectedModels([...editSelectedModels, model.id])
                            } else {
                              setEditSelectedModels(editSelectedModels.filter(id => id !== model.id))
                            }
                          }}
                          className="rounded"
                        />
                        <Label htmlFor={`edit-model-${model.id}`} className="text-[0.8125rem]  cursor-pointer flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-450">{model.id}</span>
                            {isCurrentlySelected && (
                              <Badge variant="secondary" className="text-xs">
                                Current
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Created: {formatModelDate(model.created)}
                          </div>
                        </Label>
                      </div>
                    )
                  })}
              </div>
              <p className="text-xs text-muted-foreground">
                {editSelectedModels.length} of {editAvailableModels.length} models selected
              </p>
            </div>
          )}

          {editAvailableModels.length === 0 && editingProvider.models && editingProvider.models.length === 0 && (
            <div className="text-center py-4 text-[0.8125rem]  text-muted-foreground">
              No models available. Click "Fetch All Models" to discover available models.
            </div>
          )}
        </div>

        {validationError && (
          <div className="text-[0.8125rem]  text-red-600 bg-red-50 p-3 rounded-md">
            {validationError}
          </div>
        )}

        <div className="flex gap-2 pt-4">
          <Button
            onClick={handleUpdateProvider}
            disabled={isValidating}
            className="flex-1"
          >
            {isValidating ? 'Updating...' : 'Update Provider'}
          </Button>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isValidating}
          >
            Cancel
          </Button>
        </div>
      </div>
    </ViewEditSheet>
  )
}
