import { useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { AISystemIcon } from '@/components/patterns/ui-patterns/ai-system-icon'
import {
  ArrowRight,
  Plus,
  Minus,
  X,
  Loader2,
  Check,
  AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { StepLayout, StepNav } from './step-layout'
import { validateProviderKeyFormat } from '@/features/ai-systems/lib/provider-validation'
import { validateProviderAPIKey } from '@/features/ai-systems/lib/provider-services'
import type { ProviderType } from '@/features/ai-systems/lib/provider-validation'

/* ------------------------------------------------------------------ */
/*  Provider definitions                                               */
/* ------------------------------------------------------------------ */
interface ProviderDef {
  id: string
  name: string
  iconType: 'OpenAI' | 'Azure' | 'Mistral' | 'Databricks' | 'HuggingFace' | 'Anthropic' | 'Custom' | 'AWS' | 'DynamoAI' | 'Gemini'
  providerType: ProviderType
}

const PROVIDERS: ProviderDef[] = [
  { id: 'anthropic', name: 'Anthropic', iconType: 'Anthropic', providerType: 'Anthropic' },
  { id: 'aws-bedrock', name: 'AWS Bedrock', iconType: 'AWS', providerType: 'AWS' },
  { id: 'azure-openai', name: 'Azure OpenAI', iconType: 'Azure', providerType: 'Azure' },
  { id: 'databricks', name: 'Databricks', iconType: 'Databricks', providerType: 'Databricks' },
  { id: 'gemini', name: 'Gemini', iconType: 'Gemini', providerType: 'Gemini' },
  { id: 'mistral', name: 'Mistral', iconType: 'Mistral', providerType: 'Mistral' },
  { id: 'openai', name: 'OpenAI', iconType: 'OpenAI', providerType: 'OpenAI' },
]

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
export interface ProviderConfig {
  providerId: string
  key: string
  endpoint?: string
  validated: boolean
  validating: boolean
  error?: string
}

/* ------------------------------------------------------------------ */
/*  Real validation                                                    */
/* ------------------------------------------------------------------ */
async function validateKey(providerId: string, apiKey: string): Promise<{ valid: boolean; error?: string }> {
  // Find the provider type for format validation
  const provider = PROVIDERS.find(p => p.id === providerId)
  const providerType: ProviderType = provider?.providerType ?? 'Custom'

  // Step 1: Format validation
  const formatError = validateProviderKeyFormat(providerType, apiKey)
  if (formatError) {
    return { valid: false, error: formatError }
  }

  // Step 2: API validation — ping the provider to verify the key works
  try {
    const isValid = await validateProviderAPIKey(providerType, apiKey)
    if (!isValid) {
      return { valid: false, error: 'Invalid API key. Please check and try again.' }
    }
    return { valid: true }
  } catch {
    return { valid: false, error: 'Could not reach provider. Please try again.' }
  }
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export function StepProviders({
  providers,
  onProvidersChange,
  onBack,
  onSkip,
  onContinue,
}: {
  providers: ProviderConfig[]
  onProvidersChange: (providers: ProviderConfig[]) => void
  onBack: () => void
  onSkip: () => void
  onContinue: () => void
}) {
  const customRef = useRef<HTMLDivElement>(null)
  const getConfig = (id: string) => providers.find(p => p.providerId === id)
  const isOpen = (id: string) => !!getConfig(id)

  const openProvider = (id: string) => {
    if (isOpen(id)) return
    onProvidersChange([...providers, { providerId: id, key: '', validated: false, validating: false }])
    if (id === 'custom') {
      setTimeout(() => customRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }), 50)
    }
  }

  const closeProvider = (id: string) => {
    onProvidersChange(providers.filter(p => p.providerId !== id))
  }

  const updateProvider = (id: string, field: Partial<ProviderConfig>) => {
    onProvidersChange(providers.map(p => p.providerId === id ? { ...p, ...field } : p))
  }

  const handleValidate = async (id: string, value: string) => {
    updateProvider(id, { validating: true, error: undefined })
    const result = await validateKey(id, value)
    updateProvider(id, { validating: false, validated: result.valid, error: result.error })
  }

  return (
    <StepLayout
      title="Connect Your AI Provider"
      subtitle="Short description about why connecting AI provider is needed"
      actions={
        <StepNav
          onBack={onBack}
          onSkip={onSkip}
          skipLabel="Skip"
          primaryDisabled={false}
          onPrimary={onContinue}
          primaryLabel={<>Continue <ArrowRight className="h-3.5 w-3.5" /></>}
        />
      }
    >
      <div className="relative">
        {/* Fade top */}
        <div className="absolute inset-x-0 top-0 h-6 bg-gradient-to-b from-gray-0 to-transparent z-10 pointer-events-none" />
        {/* Fade bottom */}
        <div className="absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-gray-0 to-transparent z-10 pointer-events-none" />

        <div className="max-h-[500px] overflow-y-auto py-1 pr-4">
      <div className="divide-y divide-gray-100">
        {PROVIDERS.map(provider => {
          const config = getConfig(provider.id)
          const open = !!config

          return (
            <div key={provider.id} className="flex items-center gap-2 py-2">
              <AISystemIcon type={provider.iconType} />
              <span className="text-[0.8125rem] font-[500] text-gray-800 w-28 shrink-0">{provider.name}</span>

              <div className="flex-1 flex items-center justify-end gap-2">
                {open ? (
                  <>
                    <button onClick={() => closeProvider(provider.id)} className="shrink-0 h-7 w-7 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
                      <X className="h-3.5 w-3.5 text-gray-500" />
                    </button>
                    <div className="relative flex-1 min-w-0">
                      <Input
                        type="password"
                        value={config.key}
                        onChange={e => updateProvider(provider.id, { key: e.target.value, validated: false, error: undefined })}
                        onKeyDown={e => { if (e.key === 'Enter' && config.key) handleValidate(provider.id, config.key) }}
                        placeholder="Enter API Key"
                        autoFocus
                        className={cn(
                          'w-full text-[0.8125rem]',
                          config.validated && 'border-green-300',
                          config.error && 'border-red-300 pr-8'
                        )}
                      />
                      {config.error && (
                        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 group/error">
                          <AlertCircle className="h-4 w-4 text-red-500 cursor-pointer" />
                          <div className="absolute right-0 bottom-full mb-1.5 hidden group-hover/error:block z-20">
                            <div className="bg-gray-900 text-gray-0 text-[0.6875rem] rounded-md px-2.5 py-1.5 whitespace-nowrap shadow-lg">
                              {config.error}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <Button
                      size="icon"
                      onClick={() => handleValidate(provider.id, config.key)}
                      disabled={!config.key || config.validating}
                      className={cn('shrink-0 h-7 w-7', config.validated && 'bg-green-600 hover:bg-green-700')}
                    >
                      {config.validating ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                      )}
                    </Button>
                  </>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => openProvider(provider.id)} className="gap-1.5">
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Custom API */}
      <div ref={customRef} className="mt-4">
        <p className="text-[0.75rem] text-gray-400 mb-2">Having your custom API for your model?</p>
        {(() => {
          const config = getConfig('custom')
          const open = !!config
          return (
            <div className={cn(
              'overflow-hidden transition-all duration-300 ease-out',
              open && 'rounded-xl border border-gray-200 bg-gray-50'
            )}>
              {/* Header row — same style as other providers */}
              <div className="flex items-center gap-2 py-2">
                <AISystemIcon type="Custom" />
                <span className="text-[0.8125rem] font-[500] text-gray-800">Custom API Endpoint</span>
                <div className="flex-1 flex items-center justify-end gap-2">
                  {open ? (
                    <button onClick={() => closeProvider('custom')} className="shrink-0 h-7 w-7 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
                      <Minus className="h-3.5 w-3.5 text-gray-500" />
                    </button>
                  ) : (
                    <Button variant="outline" size="sm" onClick={() => openProvider('custom')} className="gap-1.5">
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Expandable form */}
              <div
                className={cn(
                  'overflow-hidden transition-all duration-300 ease-out',
                  open ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'
                )}
              >
                {config && (
                  <div className="px-4 pb-4 space-y-4">
                    <div className="border-t border-gray-200" />
                    <div className="space-y-1.5">
                      <label className="text-[0.8125rem] font-[500] text-gray-700">Endpoint URL</label>
                      <Input
                        value={config.endpoint ?? ''}
                        onChange={e => updateProvider('custom', { endpoint: e.target.value })}
                        placeholder="Enter Key"
                        autoFocus
                        className="text-[0.8125rem]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[0.8125rem] font-[500] text-gray-700">API Key</label>
                      <Input
                        type="password"
                        value={config.key}
                        onChange={e => updateProvider('custom', { key: e.target.value, validated: false })}
                        placeholder="Enter Key"
                        className="text-[0.8125rem]"
                      />
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleValidate('custom', config.key)}
                      disabled={!config.key || config.validating}
                      className={cn('px-4', config.validated && 'bg-green-600 hover:bg-green-700')}
                    >
                      {config.validating ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                      ) : config.validated ? (
                        <Check className="h-3.5 w-3.5 mr-1.5" />
                      ) : null}
                      {config.validated ? 'Validated' : 'Validate'}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )
        })()}
      </div>
        </div>
      </div>
    </StepLayout>
  )
}
