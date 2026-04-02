import { motion, AnimatePresence } from 'framer-motion'
import type { PolicyTemplate } from './types'

interface PolicyPreviewPanelProps {
  template: PolicyTemplate | null
}

export function PolicyPreviewPanel({ template }: PolicyPreviewPanelProps) {
  const isActive = template !== null

  return (
    <motion.div
      animate={{ scale: isActive ? 1 : 0.95 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className="h-full rounded-xl bg-gray-50 dark:bg-gray-100 overflow-hidden origin-center"
    >
      <AnimatePresence mode="popLayout">
        {!template ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            className="h-full flex items-center justify-center"
          >
            <p className="text-[0.8125rem] text-gray-400">Preview of the policy comes here</p>
          </motion.div>
        ) : (
          <motion.div
            key={template.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            className="h-full overflow-y-auto px-5 py-5 space-y-4"
          >
            {/* Header */}
            <div>
              <span className="text-[0.6875rem] font-[500] text-gray-400">
                {template.category} Policy
              </span>
              <h3 className="text-[0.9375rem] font-[500] text-gray-900 mt-1">{template.name}</h3>
              <p className="text-[0.75rem] text-gray-500 mt-1.5">{template.detail}</p>
            </div>

            {/* Allowed behaviors */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <span className="text-[0.8125rem] font-[400] text-gray-700">Allowed Behaviors</span>
              </div>
              <ul className="space-y-1.5">
                {template.allowed.map((item, i) => (
                  <li key={i} className="flex items-start pl-1 gap-3 text-[0.75rem] text-gray-600">
                    <span className="h-1 w-1 rounded-full bg-gray-400 mt-1.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Disallowed behaviors */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <span className="text-[0.8125rem] font-[400] text-gray-700">Disallowed Behaviors</span>
              </div>
              <ul className="space-y-1.5">
                {template.disallowed.map((item, i) => (
                  <li key={i} className="flex items-start pl-1 gap-3 text-[0.75rem] text-gray-600">
                    <span className="h-1 w-1 rounded-full bg-gray-400 mt-1.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
