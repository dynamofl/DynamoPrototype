import { useState } from 'react'
import { DialogClose } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { AISystemIcon } from '@/components/patterns/ui-patterns/ai-system-icon'
import { Info, Search, ChevronsUpDown } from 'lucide-react'
import { AILoader } from '@/components/ui/ai-loader'
import { cn } from '@/lib/utils'
import type { AIModel } from '@/features/ai-systems/types/types'
import type { ProviderModels, SelectedModel } from './types'

interface ModelListViewProps {
  providerModels: ProviderModels[]
  selectedModels: SelectedModel[]
  onToggleModel: (model: AIModel, providerId: string, providerName: string) => void
  onToggleAllModels: (models: AIModel[], providerId: string, providerName: string, select: boolean) => void
  onViewDetail: (model: AIModel, providerId: string, providerName: string) => void
  onSave: () => void
}

export function ModelListView({
  providerModels,
  selectedModels,
  onToggleModel,
  onToggleAllModels,
  onViewDetail,
  onSave,
}: ModelListViewProps) {
  const [search, setSearch] = useState('')
  const [collapsedProviders, setCollapsedProviders] = useState<Record<string, boolean>>({})

  const isSelected = (modelId: string) =>
    selectedModels.some(m => m.modelId === modelId)

  const selectedCount = selectedModels.length
  const hasMultipleProviders = providerModels.length > 1

  const toggleCollapse = (providerId: string) => {
    setCollapsedProviders(prev => ({ ...prev, [providerId]: !prev[providerId] }))
  }

  const searchLower = search.toLowerCase()

  return (
    <>
      {/* Header */}
      <div className="flex items-center pl-6 pr-4 py-4">
        <div className="flex flex-col gap-0.5 py-1.5">
          <span className="text-[0.875rem] font-[550] text-gray-800">Add AI Models</span>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 pb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search models..."
            className="pl-9 text-[0.8125rem]"
          />
        </div>
      </div>

      {/* Model list */}
      <div className="px-4 max-h-[24rem] overflow-y-auto">
        {providerModels.length === 0 && (
          <div className="min-h-[20rem] flex flex-col items-center justify-center">
            <p className="text-[0.8125rem] text-gray-500">No AI providers connected yet.</p>
            <p className="text-[0.75rem] text-gray-400 mt-1">Connect a provider first to see available models.</p>
          </div>
        )}

        {providerModels.length > 0 && providerModels.every(p => p.loading) && (
          <div className="min-h-[20rem] flex flex-col items-center justify-center gap-2">
            <AILoader size={20} className="text-gray-400" />
            <p className="text-[0.8125rem] text-gray-400">Loading models...</p>
          </div>
        )}

        {providerModels.some(p => !p.loading) && providerModels.map(provider => {
          const isCollapsed = !!collapsedProviders[provider.providerId]
          const filteredModels = search
            ? provider.models.filter(m => m.id.toLowerCase().includes(searchLower))
            : provider.models

          // Hide provider section if all models filtered out
          if (search && filteredModels.length === 0 && !provider.loading) return null

          return (
            <div key={provider.providerId} className="mb-2">
              {/* Provider header — sticky */}
              <div className="sticky top-0 z-10 bg-gray-0">
                {(() => {
                  const allSelected = filteredModels.length > 0 && filteredModels.every(m => isSelected(m.id))
                  const someSelected = filteredModels.some(m => isSelected(m.id))
                  return (
                    <div className="flex items-center gap-2 px-2 py-2">
                      {/* Bulk select checkbox */}
                      {!provider.loading && filteredModels.length > 0 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onToggleAllModels(filteredModels, provider.providerId, provider.providerName, !allSelected)
                          }}
                          className={cn(
                            'h-4 w-4 rounded border-[1.5px] shrink-0 flex items-center justify-center transition-colors',
                            allSelected
                              ? 'bg-gray-900 border-gray-900'
                              : someSelected
                                ? 'bg-gray-400 border-gray-400'
                                : 'border-gray-300 hover:border-gray-400'
                          )}
                        >
                          {(allSelected || someSelected) && (
                            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                              {allSelected ? (
                                <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              ) : (
                                <path d="M2 4H8" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                              )}
                            </svg>
                          )}
                        </button>
                      )}

                      <button
                        onClick={() => hasMultipleProviders && toggleCollapse(provider.providerId)}
                        className={cn(
                          'flex items-center gap-2 flex-1',
                          hasMultipleProviders && 'cursor-pointer'
                        )}
                      >
                        <span className="text-[0.875rem] font-[550] text-gray-700 flex-1 text-left">{provider.providerName}</span>
                        {provider.loading && (
                          <AILoader size={14} className="text-gray-400" />
                        )}
                        {!provider.loading && (
                          <span className="text-[0.6875rem] text-gray-400">
                            {filteredModels.length} model{filteredModels.length !== 1 ? 's' : ''}
                          </span>
                        )}
                        {hasMultipleProviders && (
                          <ChevronsUpDown className={cn(
                            'h-3.5 w-3.5 text-gray-400 transition-transform',
                            isCollapsed && 'rotate-180'
                          )} />
                        )}
                      </button>
                    </div>
                  )
                })()}
              </div>

              {/* Error */}
              {provider.error && (
                <p className="px-2 text-[0.75rem] text-red-500 mb-2">{provider.error}</p>
              )}

              {/* Model rows — collapsible */}
              {!isCollapsed && (
                <>
                  {!provider.loading && filteredModels.length === 0 && !provider.error && (
                    <p className="px-2 text-[0.75rem] text-gray-400 mb-2">
                      {search ? 'No matching models' : 'No models available'}
                    </p>
                  )}

                  <div className="">
                    {filteredModels.map(model => {
                      const selected = isSelected(model.id)
                      return (
                        <div
                          key={model.id}
                          className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          {/* Checkbox */}
                          <button
                            onClick={() => onToggleModel(model, provider.providerId, provider.providerName)}
                            className={cn(
                              'h-4 w-4 rounded border-[1.5px] shrink-0 flex items-center justify-center transition-colors',
                              selected
                                ? 'bg-gray-900 border-gray-900'
                                : 'border-gray-300 hover:border-gray-400'
                            )}
                          >
                            {selected && (
                              <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                          </button>

                          {/* Provider icon + Model name */}
                          <button
                            onClick={() => onToggleModel(model, provider.providerId, provider.providerName)}
                            className="flex-1 flex items-center gap-2 text-left"
                          >
                            <AISystemIcon type={provider.iconType as any} className="h-4 w-4 shrink-0" />
                            <span className={cn(
                              'text-[0.8125rem] font-[450]',
                              selected ? 'text-gray-900' : 'text-gray-700'
                            )}>
                              {model.id}
                            </span>
                          </button>

                          {/* Info icon */}
                          <button
                            onClick={() => onViewDetail(model, provider.providerId, provider.providerName)}
                            className="shrink-0 h-7 w-7 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                          >
                            <Info className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
        <span className="text-[0.75rem] text-gray-500">
          {selectedCount > 0 ? `${selectedCount} model${selectedCount > 1 ? 's' : ''} selected` : 'No models selected'}
        </span>
        <div className="flex items-center gap-2">
          <DialogClose asChild>
            <Button variant="outline" size="default">Cancel</Button>
          </DialogClose>
          <Button size="default" onClick={onSave} disabled={selectedCount === 0}>
            Save Selection
          </Button>
        </div>
      </div>
    </>
  )
}
