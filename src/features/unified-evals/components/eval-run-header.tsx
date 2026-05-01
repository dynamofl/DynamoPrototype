import type { ReactNode } from 'react'
import { ArrowLeft, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EvalRunHeaderProps {
  title: string
  onClose?: () => void
  onBack?: () => void
  actions?: ReactNode
}

export function EvalRunHeader({ title, onClose, onBack, actions }: EvalRunHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b border-gray-200 px-4 py-2">
      <div className="flex items-center gap-2">
        {onBack && (
          <Button
            variant="ghost"
            onClick={onBack}
            aria-label="Back"
            className="h-8 w-8 p-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        <p className="text-sm font-medium text-gray-900">{title}</p>
      </div>
      {actions ?? (
        onClose && (
          <Button
            variant="outline"
            onClick={onClose}
            aria-label="Close"
            className="h-8 w-8 rounded-full p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )
      )}
    </div>
  )
}
