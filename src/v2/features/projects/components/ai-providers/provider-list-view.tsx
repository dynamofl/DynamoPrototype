import { DialogClose } from '@/components/ui/dialog'
import { AISystemIcon } from '@/components/patterns/ui-patterns/ai-system-icon'
import { Plus, Check, Rss, X } from 'lucide-react'
import { PROVIDERS, CUSTOM_PROVIDER } from './constants'
import type { ProviderDef, ProviderState } from './types'

interface ProviderListViewProps {
  state: Record<string, ProviderState>
  onSelectProvider: (provider: ProviderDef) => void
}

export function ProviderListView({ state, onSelectProvider }: ProviderListViewProps) {
  const hasKeys = (id: string) => {
    const s = state[id]
    return s && s.keys.length > 0 && s.keys.some(k => k.value.length > 0)
  }

  const isValidated = (id: string) => {
    const s = state[id]
    return s && s.keys.some(k => k.validated)
  }

  return (
    <>
      <div className="flex items-center justify-between pl-6 pr-4 py-4">
        <div className="flex flex-col gap-0.5 py-1.5">
          <span className="text-[0.875rem] font-[550] text-gray-800">Connect AI Providers</span>
        </div>
        <DialogClose className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors">
          <X className="h-4 w-4 text-gray-500" />
        </DialogClose>
      </div>

      <div className="px-4 pb-4 max-h-[30rem] overflow-y-auto">
        <div className="divide-y divide-gray-100">
          {PROVIDERS.map(provider => {
            const connected = isValidated(provider.id)
            const hasKey = hasKeys(provider.id)

            return (
              <button
                key={provider.id}
                onClick={() => onSelectProvider(provider)}
                className="w-full flex items-center gap-2 p-2 text-left hover:bg-gray-50 rounded-lg transition-colors"
              >
                <AISystemIcon type={provider.iconType} />
                <span className="text-[0.8125rem] font-[500] text-gray-800 flex-1">{provider.name}</span>
                <div className="flex items-center gap-2">
                  {connected && (
                    <span className="flex items-center gap-1 text-[0.6875rem] font-[500] text-green-700 bg-green-100 rounded-full px-2 py-0.5">
                      <Check className="h-3 w-3" strokeWidth={2.5} />
                      Connected
                    </span>
                  )}
                  {hasKey && !connected && (
                    <span className="text-[0.6875rem] font-[500] text-amber-600 bg-amber-50 rounded-full px-2 py-0.5">
                      Pending
                    </span>
                  )}
                  <Plus className="h-3.5 w-3.5 text-gray-500" />
                </div>
              </button>
            )
          })}
        </div>

        {/* Custom API */}
        <div className="mt-3 py-1">
          <p className="text-[0.75rem] text-gray-400 mb-2">Having your custom API for your model?</p>
          <button
            onClick={() => onSelectProvider(CUSTOM_PROVIDER)}
            className="w-full flex items-center gap-2 p-2 text-left hover:bg-gray-50 rounded-lg transition-colors"
          >
            <Rss className="px-2 h-8 w-8 text-gray-500" strokeWidth={1.5} />
            <span className="text-[0.8125rem] font-[500] text-gray-800 flex-1">Custom API Endpoint</span>
            <Plus className="h-3.5 w-3.5 text-gray-500" />
          </button>
        </div>
      </div>
    </>
  )
}
