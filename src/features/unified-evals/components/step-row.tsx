import type { ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { StepState } from '../types'

interface StepRowProps {
  number: number
  state: StepState
  title: string
  description?: ReactNode
  children?: ReactNode
}

const layoutTransition = { duration: 0.3, ease: [0.32, 0.72, 0, 1] as const }

export function StepRow({ number, state, title, description, children }: StepRowProps) {
  const isCompleted = state === 'completed'
  const isActive = state === 'active'

  return (
    <motion.div
      layout
      transition={{ layout: layoutTransition }}
      className={cn(
        'flex items-start gap-3 rounded-xl p-4',
        isActive && 'bg-gray-50'
      )}
    >
      <motion.div
        layout
        transition={{ layout: layoutTransition }}
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm',
          isCompleted && 'bg-gray-50 text-green-600',
          isActive && 'bg-gray-100 text-gray-500',
          !isCompleted && !isActive && 'bg-gray-50 text-gray-500'
        )}
      >
        {isCompleted ? <Check className="h-5 w-5" /> : number}
      </motion.div>

      <motion.div
        layout
        transition={{ layout: layoutTransition }}
        className="flex min-w-0 flex-1 flex-col gap-3"
      >
        <motion.div layout="position" transition={{ layout: layoutTransition }}>
          <p className="text-sm font-[450] text-gray-900">{title}</p>
          {description && (
            <div className="text-xs text-gray-500">{description}</div>
          )}
        </motion.div>
        <AnimatePresence initial={false}>
          {children && (
            <motion.div
              key="step-children"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="overflow-hidden"
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}
