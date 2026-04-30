import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PolicyListView } from '@/v2/features/projects/components/policies/policy-list-view'
import type { PolicyTemplate } from '@/v2/features/projects/components/policies/types'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
}

const sectionVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: 'easeOut' as const },
  },
}

interface PolicySelectionStepProps {
  templates: PolicyTemplate[]
  selectedIds: Set<string>
  onToggle: (templateId: string) => void
  onCreateNewPolicy: () => void
  animateOnMount?: boolean
}

export function PolicySelectionStep({
  templates,
  selectedIds,
  onToggle,
  onCreateNewPolicy,
  animateOnMount = true,
}: PolicySelectionStepProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [hoveredTemplate, setHoveredTemplate] = useState<PolicyTemplate | null>(null)

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) return templates
    return templates.filter(
      (t) =>
        t.name.toLowerCase().includes(term) ||
        t.category.toLowerCase().includes(term) ||
        t.description.toLowerCase().includes(term)
    )
  }, [templates, searchTerm])

  return (
    <motion.div
      className="mx-auto flex w-full max-w-xl flex-col gap-6 px-3 py-16"
      variants={containerVariants}
      initial={animateOnMount ? 'hidden' : false}
      animate="visible"
    >
      <motion.div className="flex flex-col gap-1 px-3" variants={sectionVariants}>
        <h2 className="text-base font-[450] tracking-tight text-gray-900">
          Select policies you would like to evaluate your system against
        </h2>
        <div className="flex items-center gap-3 pt-1">
          <button
            type="button"
            className="border-b border-dashed border-gray-300 text-xs text-gray-500 hover:text-gray-900"
          >
            Why Select Policies?
          </button>
          <button
            type="button"
            className="flex items-center gap-1 border-b border-dashed border-gray-300 text-xs text-gray-500 hover:text-gray-900"
          >
            Read Docs
            <ArrowUpRight className="h-3 w-3" />
          </button>
        </div>
      </motion.div>

      <motion.div className="flex items-center gap-3 px-2" variants={sectionVariants}>
        <Input
          placeholder="Search Policies..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="h-8 flex-1"
        />
        <Button variant="outline" className="gap-1" onClick={onCreateNewPolicy}>
          <Plus className="h-3 w-3" />
          Create New Policy
        </Button>
      </motion.div>

      <motion.div variants={sectionVariants}>
        <PolicyListView
          templates={filtered}
          selectedIds={selectedIds}
          hoveredTemplateId={hoveredTemplate?.id ?? null}
          onToggle={onToggle}
          onHover={setHoveredTemplate}
          animateOnMount={animateOnMount}
        />
      </motion.div>
    </motion.div>
  )
}
