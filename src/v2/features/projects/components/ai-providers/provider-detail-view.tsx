import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { AISystemIcon } from '@/components/patterns/ui-patterns/ai-system-icon'
import { Plus, Check, Loader2, AlertCircle, X, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ProviderDef, ProviderKey, ProviderState } from './types'

interface ProviderDetailViewProps {
  provider: ProviderDef
  state: Record<string, ProviderState>
  onUpdateKey: (providerId: string, keyId: string, field: Partial<ProviderKey>) => void
  onAddKey: (providerId: string) => void
  onRemoveKey: (providerId: string, keyId: string) => void
  onValidate: (providerId: string, keyId: string, value: string) => void
  onBack: () => void
}

export function ProviderDetailView({
  provider,
  state,
  onUpdateKey,
  onAddKey,
  onRemoveKey,
  onValidate,
  onBack,
}: ProviderDetailViewProps) {
  const keys = state[provider.id]?.keys ?? []
  const isCustom = provider.id === 'custom'

  return (
    <>
      <div className="px-6 py-4 space-y-5 min-h-[300px]">
        {/* Provider icon */}
        <div className="h-14 w-14 rounded-full bg-gray-100 flex items-center justify-center">
          <AISystemIcon type={provider.iconType} className="h-7 w-7" />
        </div>

        {/* Provider info */}
        <div>
          <h3 className="text-base font-[500] text-gray-900">{provider.name}</h3>
          <p className="text-[0.8125rem] text-gray-500 mt-1 leading-relaxed">
            {provider.description}
          </p>
          {provider.docsUrl && (
            <a
              href={provider.docsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[0.8125rem] font-[500] text-gray-800 underline underline-offset-2 mt-1.5 inline-block hover:text-gray-600 transition-colors"
            >
              {provider.name} Provider Docs
            </a>
          )}
        </div>

        {/* Custom endpoint URL */}
        {isCustom && (
          <div className="space-y-1.5">
            <label className="text-[0.8125rem] font-[500] text-gray-700">Endpoint URL</label>
            <Input
              value={keys[0]?.name === 'Default' ? '' : (keys[0]?.name ?? '')}
              onChange={e => {
                if (keys.length > 0) onUpdateKey(provider.id, keys[0].id, { name: e.target.value })
              }}
              placeholder="https://api.example.com/v1"
              className="text-[0.8125rem]"
            />
          </div>
        )}

        {/* API Keys */}
        <div className="space-y-2">
          {/* Column headers */}
          <div className="flex items-center gap-2">
            {!isCustom && (
              <span className="w-[160px] shrink-0 text-[0.8125rem] font-[500] text-gray-800">Name</span>
            )}
            <span className="flex-1 text-[0.8125rem] font-[500] text-gray-800">API Key</span>
            {!isCustom && <div className="w-9 shrink-0" />}
          </div>

          {/* Key rows */}
          {keys.map((key, idx) => {
            const isFirst = idx === 0
            return (
              <div key={key.id} className="flex items-center gap-2">
                {/* Name field (non-custom only) */}
                {!isCustom && (
                  <div className="w-[160px] shrink-0">
                    <Input
                      value={isFirst && !key.name ? 'Default' : key.name}
                      onChange={e => onUpdateKey(provider.id, key.id, { name: e.target.value })}
                      placeholder="Default"
                      readOnly={isFirst}
                      className={cn('text-[0.8125rem]', isFirst && 'text-gray-400 bg-gray-50')}
                    />
                  </div>
                )}

                {/* Key input */}
                <div className="relative flex-1 min-w-0">
                  <Input
                    type="password"
                    value={key.value}
                    onChange={e => onUpdateKey(provider.id, key.id, { value: e.target.value, validated: false, error: undefined })}
                    onKeyDown={e => { if (e.key === 'Enter' && key.value) onValidate(provider.id, key.id, key.value) }}
                    placeholder="Enter API Key"
                    className={cn(
                      'text-[0.8125rem]',
                      key.validated && 'border-green-300',
                      key.error && 'border-red-300 pr-8'
                    )}
                  />
                  {key.error && (
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 group/error">
                      <AlertCircle className="h-4 w-4 text-red-500 cursor-pointer" />
                      <div className="absolute right-0 bottom-full mb-1.5 hidden group-hover/error:block z-20">
                        <div className="bg-gray-900 text-gray-0 text-[0.6875rem] rounded-md px-2.5 py-1.5 whitespace-nowrap shadow-lg">
                          {key.error}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Validate button (non-custom only) */}
                {!isCustom && (
                  <Button
                    size="icon"
                    onClick={() => onValidate(provider.id, key.id, key.value)}
                    disabled={!key.value || key.validating}
                    className={cn('shrink-0 h-9 w-9 rounded-full', key.validated && 'bg-green-600 hover:bg-green-700')}
                  >
                    {key.validating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" strokeWidth={2.5} />}
                  </Button>
                )}

                {/* Remove (non-first only) */}
                {!isFirst && (
                  <button
                    onClick={() => onRemoveKey(provider.id, key.id)}
                    className="shrink-0 h-7 w-7 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            )
          })}

          {/* Validate button for custom */}
          {isCustom && (
            <Button
              size="default"
              onClick={() => {
                if (keys.length > 0 && keys[0].value) onValidate(provider.id, keys[0].id, keys[0].value)
              }}
              disabled={!keys.some(k => k.value) || keys.some(k => k.validating)}
              className="gap-1.5 mt-2"
            >
              {keys.some(k => k.validating) ? (
                <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Validating...</>
              ) : 'Validate'}
            </Button>
          )}

          {/* Add another key */}
          {keys.some(k => k.validated) && (
            <button
              onClick={() => onAddKey(provider.id)}
              className="flex items-center gap-1.5 text-[0.75rem] font-[500] text-gray-500 hover:text-gray-700 transition-colors mt-1"
            >
              <Plus className="h-3 w-3" />
              Add Another Key
            </button>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center px-4 py-3 border-t border-gray-200">
        <Button variant="outline" size="default" onClick={onBack} className="gap-1.5">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to All Providers
        </Button>
      </div>
    </>
  )
}
