import { type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CONTENT_EASE } from './shell-constants'

interface ShellContentProps {
  children: ReactNode
  routeKey: string
}

export function ShellContent({ children, routeKey }: ShellContentProps) {
  return (
    <div className="flex-1 overflow-auto flex flex-col">
      <AnimatePresence mode="wait">
        <motion.div
          key={routeKey}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15, ease: CONTENT_EASE, delay: 0.05 }}
          className="flex-1 flex flex-col"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
