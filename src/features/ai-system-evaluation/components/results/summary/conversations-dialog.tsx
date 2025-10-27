import { useState, useEffect } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody
} from '@/components/ui/dialog'
import type { JailbreakEvaluationResult } from '../../../types/jailbreak-evaluation'
import type { EvaluationStrategy } from '../../../strategies/base-strategy'
import {
  GenericConversationContent,
  GenericJudgementsSidebar,
  useConversationHighlighting
} from '../../results/conversation-view-components'

interface ConversationsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  conversations: JailbreakEvaluationResult[]
  title: string
  strategy: EvaluationStrategy
  aiSystemName?: string
  judgementSidebarWidth?: number  // Width in pixels for the judgement sidebar (default: 350)
}

export function ConversationsDialog({
  open,
  onOpenChange,
  conversations,
  title,
  strategy,
  aiSystemName,
  judgementSidebarWidth = 400
}: ConversationsDialogProps) {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)

  // Auto-select first conversation when dialog opens or conversations change
  useEffect(() => {
    if (open && conversations.length > 0 && !selectedConversationId) {
      const firstId = (conversations[0] as any).id
      if (firstId) {
        setSelectedConversationId(firstId)
      }
    }
  }, [open, conversations, selectedConversationId])

  // Reset selection when dialog closes
  useEffect(() => {
    if (!open) {
      setSelectedConversationId(null)
    }
  }, [open])

  // Find selected conversation
  const selectedIndex = selectedConversationId
    ? conversations.findIndex(record => (record as any).id === selectedConversationId)
    : -1
  const selectedPosition = selectedIndex >= 0 ? selectedIndex + 1 : 0
  const selectedConversation = selectedIndex >= 0 ? conversations[selectedIndex] : null

  // Use highlighting hook for the selected conversation
  const {
    highlightingContext,
    expandedKeys,
    setExpandedKeys,
    hoveredBehavior,
    setHoveredBehavior,
    selectedBehaviors
  } = useConversationHighlighting(selectedConversation as any)

  // Handle keyboard navigation
  useEffect(() => {
    if (!open) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!event.shiftKey || conversations.length === 0) return

      if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
        event.preventDefault()

        const currentIndex = selectedIndex >= 0 ? selectedIndex : 0

        if (event.key === 'ArrowUp') {
          if (currentIndex > 0) {
            setSelectedConversationId((conversations[currentIndex - 1] as any).id)
          }
        } else if (event.key === 'ArrowDown') {
          if (currentIndex < conversations.length - 1) {
            setSelectedConversationId((conversations[currentIndex + 1] as any).id)
          }
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, selectedIndex, conversations])

  // Navigation functions
  const navigateUp = () => {
    if (conversations.length === 0 || selectedIndex <= 0) return
    setSelectedConversationId((conversations[selectedIndex - 1] as any).id)
  }

  const navigateDown = () => {
    if (conversations.length === 0 || selectedIndex >= conversations.length - 1) return
    setSelectedConversationId((conversations[selectedIndex + 1] as any).id)
  }

  // Check if navigation buttons should be disabled
  const isUpDisabled = conversations.length === 0 || selectedIndex <= 0
  const isDownDisabled = conversations.length === 0 || selectedIndex >= conversations.length - 1

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="xxl" className='h-[80vh]'>
        <DialogHeader>
          <div className="flex items-center justify-between w-full">
            {/* Left: Navigation Controls */}
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                <button
                  onClick={navigateUp}
                  disabled={isUpDisabled}
                  className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center hover:bg-gray-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Previous conversation (Shift + ↑)"
                >
                  <ChevronUp className="w-4 h-4 text-gray-700" />
                </button>
                <button
                  onClick={navigateDown}
                  disabled={isDownDisabled}
                  className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center hover:bg-gray-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Next conversation (Shift + ↓)"
                >
                  <ChevronDown className="w-4 h-4 text-gray-700" />
                </button>
              </div>

              {/* Counter */}
              <div className="text-xs font-medium text-gray-600">
                {conversations.length > 0 ? `${selectedPosition} of ${conversations.length}` : '0 of 0'}
              </div>
            </div>

            {/* Center: Title */}
            <DialogTitle className="pl-1 flex-1 text-center">{title}</DialogTitle>

            {/* Right: Spacer for balance */}
            <div className="w-[90px]" />
          </div>
        </DialogHeader>
        <DialogBody scrollable={false} size="xxl" className="p-0 flex flex-col">
          {/* Conversation Detail (Full Width) */}
          {selectedConversation ? (
            <div
              className="flex-1 grid overflow-hidden"
              style={{ gridTemplateColumns: `1fr ${judgementSidebarWidth}px` }}
            >
              {/* Main Content - Scrollable */}
              <GenericConversationContent
                record={selectedConversation as any}
                strategy={strategy}
                highlightingContext={highlightingContext}
              />

              {/* Judgements Sidebar - Scrollable */}
              <GenericJudgementsSidebar
                record={selectedConversation as any}
                strategy={strategy}
                aiSystemName={aiSystemName}
                expandedKeys={expandedKeys}
                onExpandedKeysChange={setExpandedKeys}
                hoveredBehavior={hoveredBehavior}
                onBehaviorHover={setHoveredBehavior}
                selectedBehaviors={selectedBehaviors}
                
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500 text-sm">
              Select a conversation to view details
            </div>
          )}
        </DialogBody>
      </DialogContent>
    </Dialog>
  )
}
