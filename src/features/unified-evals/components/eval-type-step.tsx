import { useState } from 'react'
import { motion } from 'framer-motion'
import { Checkbox } from '@/components/ui/checkbox'
import { PolicyListView } from '@/v2/features/projects/components/policies/policy-list-view'
import type { PolicyTemplate } from '@/v2/features/projects/components/policies/types'
import { ATTACK_OPTIONS, DEFAULT_EVAL_METRICS } from '../constants'

interface EvalTypeStepProps {
  selectedAttackIds: Set<string>
  onToggleAttack: (id: string) => void
  animateOnMount?: boolean
}

const ATTACK_TEMPLATES: PolicyTemplate[] = ATTACK_OPTIONS.map((attack) => ({
  id: attack.id,
  name: attack.name,
  category: attack.meta,
  description: attack.description,
  detail: '',
  allowed: [],
  disallowed: [],
}))

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

export function EvalTypeStep({
  selectedAttackIds,
  onToggleAttack,
  animateOnMount = true,
}: EvalTypeStepProps) {
  const [hoveredTemplate, setHoveredTemplate] = useState<PolicyTemplate | null>(null)

  return (
    <motion.div
      className="mx-auto flex w-full max-w-xl flex-col gap-6 px-3 py-16"
      variants={containerVariants}
      initial={animateOnMount ? 'hidden' : false}
      animate="visible"
    >
      <motion.div className="flex flex-col gap-1 px-3" variants={sectionVariants}>
        <h2 className="text-base font-[450] tracking-tight text-gray-900">
          Confirm your type of evaluation
        </h2>
        <p className="text-xs text-gray-500">
          Configure your evaluation to measure how reliably your model evaluate policies under default conditions and adversarial attacks.
        </p>
      </motion.div>

      <motion.div
        className="flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-0 px-3 py-4"
        variants={sectionVariants}
      >
        <Checkbox checked disabled className="mt-0.5" />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <p className="text-[0.8125rem] font-[450] text-gray-900">
                Policy Compliance Check
              </p>
              <span className="rounded-md bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600">
                Default
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Evaluates model performance in identifying policy adherence by using key metrics to ensure reliable and policy-aligned behavior.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {DEFAULT_EVAL_METRICS.map((metric) => (
              <span
                key={metric}
                className="rounded bg-gray-100 px-1 font-mono text-[0.75rem] text-gray-600"
              >
                {metric}
              </span>
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div className="flex flex-col gap-2" variants={sectionVariants}>
        <p className="px-3 text-sm text-gray-900">
          Would you also like to add Jailbreak Attacks?
        </p>
        <PolicyListView
          templates={ATTACK_TEMPLATES}
          selectedIds={selectedAttackIds}
          hoveredTemplateId={hoveredTemplate?.id ?? null}
          onToggle={onToggleAttack}
          onHover={setHoveredTemplate}
          animateOnMount={animateOnMount}
        />
      </motion.div>
    </motion.div>
  )
}
