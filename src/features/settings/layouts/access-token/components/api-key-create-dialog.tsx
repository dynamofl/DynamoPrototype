/**
 * APIKeyCreateSheet component for adding new API keys
 */

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ViewEditSheet } from '@/components/patterns'
import { AISystemIcon } from '@/components/patterns/ui-patterns/ai-system-icon'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'
import type { TableRow } from '@/types/table'

export interface APIKeyCreateSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  provider: TableRow | null
  onAPIKeyCreated: (provider: TableRow, name: string, apiKey: string) => void
}

// API validation functions for different providers
const validateAPIKey = async (provider: string, apiKey: string): Promise<boolean> => {
  // Simulate API validation - in real implementation, you would make actual API calls
  return new Promise((resolve) => {
    setTimeout(() => {
      // Mock validation logic
      if (provider === 'OpenAI' && apiKey.startsWith('sk-')) {
        resolve(true)
      } else if (provider === 'Azure OpenAI' && apiKey.length > 20) {
        resolve(true)
      } else if (provider === 'Anthropic' && apiKey.startsWith('sk-ant-')) {
        resolve(true)
      } else if (provider === 'Mistral' && apiKey.length > 30) {
        resolve(true)
      } else if (provider === 'AWS Bedrock' && apiKey.length > 20) {
        resolve(true)
      } else if (provider === 'Databricks' && apiKey.length > 20) {
        resolve(true)
      } else {
        resolve(false)
      }
    }, 2000) // Simulate network delay
  })
}

export function APIKeyCreateSheet({ 
  open, 
  onOpenChange, 
  provider,
  onAPIKeyCreated 
}: APIKeyCreateSheetProps) {
  const [formData, setFormData] = useState({
    name: '',
    apiKey: ''
  })
  const [validationError, setValidationError] = useState('')
  const [isValidating, setIsValidating] = useState(false)
  const [validationStatus, setValidationStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const resetForm = () => {
    setFormData({
      name: '',
      apiKey: ''
    })
    setValidationError('')
    setValidationStatus('idle')
    setIsValidating(false)
  }

  const handleDialogOpenChange = (open: boolean) => {
    onOpenChange(open)
    if (!open) {
      resetForm()
    }
  }

  const handleValidateAndSave = async () => {
    if (!provider) return

    // Validation
    if (!formData.name.trim()) {
      setValidationError('API key name is required')
      return
    }

    if (!formData.apiKey.trim()) {
      setValidationError('API key is required')
      return
    }

    setValidationError('')
    setIsValidating(true)
    setValidationStatus('idle')

    try {
      const isValid = await validateAPIKey(provider.provider, formData.apiKey.trim())
      
      if (isValid) {
        setValidationStatus('success')
        // Save the API key
        onAPIKeyCreated(provider, formData.name.trim(), formData.apiKey.trim())
        handleDialogOpenChange(false)
      } else {
        setValidationStatus('error')
        setValidationError('Invalid API key. Please check your key and try again.')
      }
    } catch (error) {
      setValidationStatus('error')
      setValidationError('Failed to validate API key. Please try again.')
    } finally {
      setIsValidating(false)
    }
  }

  if (!provider) return null

  const getProviderIconType = (providerName: string) => {
    const iconMap: Record<string, any> = {
      'OpenAI': 'OpenAI',
      'Azure OpenAI': 'Azure',
      'Databricks': 'Databricks',
      'Mistral': 'Mistral',
      'AWS Bedrock': 'AWS',
      'Anthropic': 'Anthropic'
    }
    return iconMap[providerName] || 'Remote'
  }

  return (
    <ViewEditSheet
      open={open}
      onOpenChange={handleDialogOpenChange}
      title="Add API Key"
      description={`Add a new API key for ${provider.provider} to enable AI system integration.`}
      size="md"
    >
      <div className="space-y-6 mt-6">
        {/* Provider Info */}
        <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
          <AISystemIcon 
            type={getProviderIconType(provider.provider)} 
            className="w-8 h-8" 
          />
          <div>
            <h3 className="font-450 text-gray-900">{provider.provider}</h3>
            <p className="text-[13px] text-gray-600">API Provider</p>
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="api-key-name">API Key Name</Label>
            <Input
              id="api-key-name"
              placeholder="Enter a name for this API key"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <p className="text-xs text-gray-500">
              Give your API key a descriptive name to help you identify it later.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="api-key">API Key</Label>
            <Input
              id="api-key"
              type="password"
              placeholder="Enter your API key"
              value={formData.apiKey}
              onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
              required
            />
            <p className="text-xs text-gray-500">
              Your API key will be encrypted and stored securely.
            </p>
          </div>
        </div>

        {/* Validation Status */}
        {validationStatus === 'success' && (
          <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-md">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-[13px] text-green-800">API key validated successfully!</span>
          </div>
        )}

        {validationStatus === 'error' && (
          <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
            <XCircle className="h-4 w-4 text-red-600" />
            <span className="text-[13px] text-red-800">API key validation failed</span>
          </div>
        )}

        {validationError && (
          <div className="text-[13px] text-red-600 bg-red-50 p-3 rounded-md">
            {validationError}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4">
          <Button
            onClick={handleValidateAndSave}
            disabled={isValidating}
            className="flex-1"
          >
            {isValidating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Validating...
              </>
            ) : (
              'Validate & Save'
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => handleDialogOpenChange(false)}
            disabled={isValidating}
          >
            Cancel
          </Button>
        </div>
      </div>
    </ViewEditSheet>
  )
}
