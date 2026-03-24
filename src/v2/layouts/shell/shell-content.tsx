import { type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CONTENT_EASE } from './shell-constants'

interface ShellContentProps {
  children: ReactNode
  routeKey: string
}

export function ShellContent({ children, routeKey }: ShellContentProps) {
  return (
    <div className="flex-1 overflow-auto">
      <AnimatePresence mode="wait">
        <motion.div
          key={routeKey}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15, ease: CONTENT_EASE, delay: 0.05 }}
          className="h-full"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
