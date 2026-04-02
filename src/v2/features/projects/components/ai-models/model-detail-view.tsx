import { Button } from '@/components/ui/button'
import { AISystemIcon } from '@/components/patterns/ui-patterns/ai-system-icon'
import { ArrowLeft } from 'lucide-react'
import type { AIModel } from '@/features/ai-systems/types/types'
import { MODEL_DESCRIPTIONS } from './constants'

interface ModelDetailViewProps {
  model: AIModel
  providerId: string
  providerName: string
  iconType: string
  onBack: () => void
}

export function ModelDetailView({
  model,
  providerName,
  iconType,
  onBack,
}: ModelDetailViewProps) {
  const info = MODEL_DESCRIPTIONS[model.id]

  return (
    <>
      <div className="px-6 py-4 space-y-5 min-h-[300px]">
        {/* Provider icon */}
        <div className="h-14 w-14 rounded-full bg-gray-100 flex items-center justify-center">
          <AISystemIcon type={iconType as any} className="h-7 w-7" />
        </div>

        {/* Model info */}
        <div>
          <h3 className="text-base font-[500] text-gray-900">{model.id}</h3>
          <p className="text-[0.75rem] text-gray-400 mt-0.5">by {providerName}</p>
          <p className="text-[0.8125rem] text-gray-500 mt-2 leading-relaxed">
            {info?.description ?? 'An AI model from ' + providerName + '.'}
          </p>
        </div>

        {/* Capabilities */}
        {info?.capabilities && info.capabilities.length > 0 && (
          <div className="space-y-2">
            <p className="text-[0.8125rem] font-[500] text-gray-700">Capabilities</p>
            <div className="flex flex-wrap gap-1.5">
              {info.capabilities.map(cap => (
                <span
                  key={cap}
                  className="px-2.5 py-1 rounded-full text-[0.75rem] font-[450] text-gray-600 bg-gray-100"
                >
                  {cap}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Model metadata */}
        <div className="space-y-2">
          <p className="text-[0.8125rem] font-[500] text-gray-700">Details</p>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[0.8125rem]">
              <span className="text-gray-500">Model ID</span>
              <span className="text-gray-800 font-mono text-[0.75rem]">{model.id}</span>
            </div>
            <div className="flex items-center justify-between text-[0.8125rem]">
              <span className="text-gray-500">Provider</span>
              <span className="text-gray-800">{providerName}</span>
            </div>
            {model.owned_by && (
              <div className="flex items-center justify-between text-[0.8125rem]">
                <span className="text-gray-500">Owned By</span>
                <span className="text-gray-800">{model.owned_by}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center px-4 py-4">
        <Button variant="outline" size="default" onClick={onBack} className="gap-1.5">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to All Models
        </Button>
      </div>
    </>
  )
}
