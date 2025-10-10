import { Download, Trash2, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'

export interface BulkAction {
  key: string
  label: string
  icon: React.ReactNode
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost'
  onClick: () => void
}

export interface BulkActionBarProps {
  selectedCount: number
  onClearSelection: () => void
  actions?: BulkAction[]
  // Quick props for common actions
  onDelete?: () => void
  onDownload?: () => void
}

export function BulkActionBar({
  selectedCount,
  onClearSelection,
  actions,
  onDelete,
  onDownload
}: BulkActionBarProps) {
  // Build default actions if quick props are provided
  const defaultActions: BulkAction[] = []

  if (onDownload) {
    defaultActions.push({
      key: 'download',
      label: 'Download',
      icon: <Download className="h-4 w-4" />,
      variant: 'outline',
      onClick: onDownload
    })
  }

  if (onDelete) {
    defaultActions.push({
      key: 'delete',
      label: 'Delete',
      icon: <Trash2 className="h-4 w-4" />,
      variant: 'destructive',
      onClick: onDelete
    })
  }

  const allActions = actions || defaultActions

  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <div className="fixed inset-x-0 bottom-8 z-50 flex justify-center pointer-events-none">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-auto w-fit"
          >
            <div className="bg-gray-900 text-gray-50 rounded-full shadow-lg border border-gray-700 px-4 py-2 flex items-center gap-3">
              {/* Selection Count */}
              <div className="flex items-center gap-2 px-2">
                <span className="font-450 text-[0.8125rem] text-gray-400">
                  {selectedCount} Selected
                </span>
              </div>

              {/* Divider */}

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {allActions.map((action) => (
                  <Button
                    key={action.key}
                    variant={action.variant || 'outline'}
                    size="sm"
                    onClick={action.onClick}
                    className={`h-7 ${
                      action.variant === 'destructive'
                        ? 'bg-red-900 hover:bg-red-800 text-gray-0 hover:text-gray-50'
                        : 'bg-gray-800 hover:bg-gray-700 text-gray-0 border-none hover:text-gray-50'
                    }`}
                  >
                    {action.icon}
                    <span className="ml-1.5">{action.label}</span>
                  </Button>
                ))}
              </div>

              {/* Divider */}
              <div className="h-6 w-px bg-gray-600" />

              {/* Clear Selection Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearSelection}
                className="h-7 gap-2 hover:bg-gray-800 text-gray-200 hover:text-gray-50"
              >
                <RotateCcw className="h-4 w-4" />
                Clear Selection
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
