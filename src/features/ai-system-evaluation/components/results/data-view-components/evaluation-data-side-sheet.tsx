import { ChevronUp, ChevronDown, Expand, X } from 'lucide-react'
import {
  Sheet,
  SheetContent,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { EvaluationDataDetail } from '../evaluation-data-detail'
import type { JailbreakEvaluationResult } from '../../../types/jailbreak-evaluation'

interface EvaluationDataSideSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  record: JailbreakEvaluationResult | null
  allRecords: JailbreakEvaluationResult[]
  onNavigateNext: () => void
  onNavigatePrevious: () => void
  onExpand: () => void
  hasGuardrails?: boolean
}

export function EvaluationDataSideSheet({
  open,
  onOpenChange,
  record,
  allRecords,
  onNavigateNext,
  onNavigatePrevious,
  onExpand,
  hasGuardrails = true
}: EvaluationDataSideSheetProps) {
  if (!record) return null

  // Find current position
  const currentIndex = allRecords.findIndex(r => (r as any).id === (record as any).id)
  const position = currentIndex + 1
  const total = allRecords.length

  // Navigation state
  const canNavigatePrevious = currentIndex > 0
  const canNavigateNext = currentIndex < allRecords.length - 1

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        className="w-[600px] sm:max-w-[600px] p-0 flex flex-col [&>button]:hidden"
        onWheel={(e) => e.stopPropagation()}
      >
        {/* Custom Header */}
        <div className="flex-shrink-0 border-b border-gray-200 p-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <h2 className="text-[0.8125rem]  font-medium text-foreground">
              Conversation Details
            </h2>
            <div className="flex items-center gap-2">
              {/* Position indicator */}
              <div className="text-[0.8125rem]  text-gray-500">
                {position}/{total}
              </div>

              {/* Navigation controls */}
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onNavigatePrevious}
                  disabled={!canNavigatePrevious}
                  className="h-8 w-8 p-0"
                  title="Previous conversation"
                >
                  <ChevronUp className="h-4 w-4" strokeWidth={2} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onNavigateNext}
                  disabled={!canNavigateNext}
                  className="h-8 w-8 p-0"
                  title="Next conversation"
                >
                  <ChevronDown className="h-4 w-4" strokeWidth={2} />
                </Button>
              </div>

              {/* Expand button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={onExpand}
                className="h-8 w-8 p-0"
                title="Open in conversation view"
              >
                <Expand className="h-4 w-4" strokeWidth={2} />
              </Button>

              {/* Close button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="h-8 w-8 p-0"
                title="Close"
              >
                <X className="h-4 w-4" strokeWidth={2} />
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div
          className="flex-1 overflow-hidden"
          onWheel={(e) => e.stopPropagation()}
        >
          <EvaluationDataDetail record={record} hasGuardrails={hasGuardrails} />
        </div>
      </SheetContent>
    </Sheet>
  )
}
