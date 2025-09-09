/**
 * AI System View/Edit Sheet component
 * Displays detailed information about an AI system
 */

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { AISystemIcon } from '@/components/patterns'
import { ViewEditSheet } from '@/components/patterns'
import type { AISystem } from '../types'
import { statusOptions } from '../constants'

export interface AISystemViewSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  system: AISystem | null
  onSystemUpdate?: (system: AISystem) => void
  onSystemDelete?: (systemId: string) => void
}

export function AISystemViewSheet({ 
  open, 
  onOpenChange, 
  system,
  onSystemUpdate,
  onSystemDelete
}: AISystemViewSheetProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState<Partial<AISystem>>({})

  // Initialize edit data when system changes
  useEffect(() => {
    if (system) {
      setEditData({
        name: system.name,
        status: system.status
      })
    }
  }, [system])

  const handleSave = () => {
    if (system && onSystemUpdate) {
      const updatedSystem = { ...system, ...editData }
      onSystemUpdate(updatedSystem)
      setIsEditing(false)
    }
  }

  const handleCancel = () => {
    if (system) {
      setEditData({
        name: system.name,
        status: system.status
      })
    }
    setIsEditing(false)
  }

  const handleDelete = () => {
    if (system && onSystemDelete) {
      onSystemDelete(system.id)
      onOpenChange(false)
    }
  }

  if (!system) return null

  return (
    <ViewEditSheet
      open={open}
      onOpenChange={onOpenChange}
      title={system.name}
      description="View and manage AI system details"
      size="lg"
      footer={
        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button onClick={handleSave} className="bg-blue-600 text-white hover:bg-blue-700">
                  Save Changes
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  Edit
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleDelete}
                  disabled={!onSystemDelete}
                >
                  Delete
                </Button>
              </>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* System Overview */}
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <AISystemIcon type={system.icon} className="w-8 h-8" />
            <div>
              <h3 className="text-lg font-450 text-gray-900">{system.name}</h3>
              <p className="text-sm text-gray-600">{system.providerName} System</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Badge 
              variant={system.status === 'active' ? 'default' : 'secondary'}
              className={system.status === 'active' ? 'bg-green-100 text-green-800' : ''}
            >
              {system.status}
            </Badge>
            {system.hasGuardrails && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                Guardrails
              </Badge>
            )}
            {system.isEvaluated && (
              <Badge variant="outline" className="bg-purple-50 text-purple-700">
                Evaluated
              </Badge>
            )}
          </div>
        </div>

        {/* System Details */}
        <div className="grid grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h4 className="text-sm font-450 text-gray-900">Basic Information</h4>
            
            <div className="space-y-3">
              <div>
                <Label className="text-xs font-450 text-gray-700">System Name</Label>
                {isEditing ? (
                  <Input
                    value={editData.name || ''}
                    onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                    className="mt-1"
                  />
                ) : (
                  <p className="text-sm text-gray-900 mt-1">{system.name}</p>
                )}
              </div>


              <div>
                <Label className="text-xs font-450 text-gray-700">Status</Label>
                {isEditing ? (
                  <select
                    value={editData.status || system.status}
                    onChange={(e) => setEditData(prev => ({ ...prev, status: e.target.value as 'active' | 'inactive' }))}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-sm text-gray-900 mt-1 capitalize">{system.status}</p>
                )}
              </div>

              <div>
                <Label className="text-xs font-450 text-gray-700">Created At</Label>
                <p className="text-sm text-gray-900 mt-1">{system.createdAt}</p>
              </div>
            </div>
          </div>

          {/* Technical Details */}
          <div className="space-y-4">
            <h4 className="text-sm font-450 text-gray-900">Technical Details</h4>
            
            <div className="space-y-3">
              <div>
                <Label className="text-xs font-450 text-gray-700">Provider</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <AISystemIcon type={system.icon} className="w-4 h-4" />
                  <p className="text-sm text-gray-900">{system.providerName}</p>
                </div>
              </div>

              <div>
                <Label className="text-xs font-450 text-gray-700">API Key</Label>
                <p className="text-sm text-gray-900 mt-1">{system.apiKeyName}</p>
              </div>

              <div>
                <Label className="text-xs font-450 text-gray-700">Selected Model</Label>
                <p className="text-sm text-gray-900 mt-1 font-mono">{system.selectedModel}</p>
              </div>

              {system.modelDetails && (
                <div>
                  <Label className="text-xs font-450 text-gray-700">Model Details</Label>
                  <div className="mt-1 space-y-1">
                    <p className="text-xs text-gray-600">
                      Created: {new Date(system.modelDetails.created * 1000).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-600">
                      Owned by: {system.modelDetails.owned_by}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* System ID */}
        <div className="pt-4 border-t">
          <Label className="text-xs font-450 text-gray-700">System ID</Label>
          <p className="text-xs text-gray-500 mt-1 font-mono">{system.id}</p>
        </div>
      </div>
    </ViewEditSheet>
  )
}
