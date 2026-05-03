import { useState, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { InfoTooltip } from '@/components/ui/info-tooltip'
import { cn } from '@/lib/utils'
import type { PolicyTemplate } from '@/v2/features/projects/components/policies/types'
import { PolicyListViewV2 } from './policy-list-view-v2'
import type { EvalCriteriaItem } from './eval-criteria-preview'
import { ATTACK_OPTIONS, DEFAULT_EVAL_METRICS } from '../constants'

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

export const POLICY_COMPLIANCE_ITEM_V3: EvalCriteriaItem = {
  id: 'policy-compliance',
  name: 'Policy Compliance Check',
  category: 'Default',
  description:
    'Evaluates model performance in identifying policy adherence by using key metrics to ensure reliable and policy-aligned behavior.',
  metrics: DEFAULT_EVAL_METRICS,
  kind: 'policy-compliance',
}

export const JAILBREAK_ITEMS_V3: EvalCriteriaItem[] = ATTACK_OPTIONS.map(
  (attack) => ({
    id: attack.id,
    name: attack.name,
    category: attack.meta,
    description: attack.description,
    kind: 'jailbreak',
  }),
)

export const ALL_EVAL_ITEMS_BY_ID_V3: Record<string, EvalCriteriaItem> = {
  [POLICY_COMPLIANCE_ITEM_V3.id]: POLICY_COMPLIANCE_ITEM_V3,
  ...Object.fromEntries(JAILBREAK_ITEMS_V3.map((item) => [item.id, item])),
}

const ATTACK_TEMPLATES: PolicyTemplate[] = JAILBREAK_ITEMS_V3.map((item) => ({
  id: item.id,
  name: item.name,
  category: item.category,
  description: item.description,
  detail: '',
  allowed: [],
  disallowed: [],
}))

interface EvalTypeStepV3Props {
  selectedAttackIds: Set<string>
  previewItemId: string | null
  onToggleAttack: (id: string) => void
  onTogglePreview: (id: string) => void
  animateOnMount?: boolean
  footer?: ReactNode
  currentStep?: number
  totalSteps?: number
}

export function EvalTypeStepV3({
  selectedAttackIds,
  previewItemId,
  onToggleAttack,
  onTogglePreview,
  animateOnMount = true,
  footer,
  currentStep,
  totalSteps,
}: EvalTypeStepV3Props) {
  const [hoveredAttackId, setHoveredAttackId] = useState<string | null>(null)
  const [hoveredCompliance, setHoveredCompliance] = useState(false)

  const isCompliancePreviewing =
    previewItemId === POLICY_COMPLIANCE_ITEM_V3.id
  const showComplianceAction = isCompliancePreviewing || hoveredCompliance

  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex-1 overflow-y-auto">
        <motion.div
          className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-3 py-6"
          variants={containerVariants}
          initial={animateOnMount ? 'hidden' : false}
          animate="visible"
        >
          <motion.div className="flex flex-col gap-3" variants={sectionVariants}>
            {totalSteps && totalSteps > 0 ? (
              <div className="flex items-center gap-1.5">
                {Array.from({ length: totalSteps }).map((_, index) => (
                  <div
                    key={index}
                    className={cn(
                      'h-1.5 rounded-full transition-all',
                      index === currentStep
                        ? 'w-5 bg-gray-900'
                        : 'w-1.5 bg-gray-300',
                    )}
                  />
                ))}
              </div>
            ) : null}
            <div className="flex flex-col gap-1">
              <h2 className="text-base font-medium tracking-tight text-gray-900">
                Confirm Your Type of Evaluation
              </h2>
              <p className="text-xs text-gray-500">
                Configure your evaluation to measure how reliably your model
                evaluates policies under default conditions and adversarial
                attacks.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="py-0.5">
                <InfoTooltip
                  label="How It Works?"
                  side="bottom"
                  align="start"
                >
                  Each evaluation type runs your selected policies against a
                  different surface — default checks measure baseline
                  compliance, while jailbreak attacks stress-test how the model
                  holds up under adversarial pressure.
                </InfoTooltip>
              </div>
              <Button
                variant="link"
                size="sm"
                className="gap-1 px-0 text-gray-500"
              >
                Read Docs
                <ArrowUpRight className="h-3 w-3" />
              </Button>
            </div>
          </motion.div>

          <motion.div variants={sectionVariants}>
            <ComplianceCheckRow
              item={POLICY_COMPLIANCE_ITEM_V3}
              isPreviewing={isCompliancePreviewing}
              showActionButton={showComplianceAction}
              onMouseEnter={() => setHoveredCompliance(true)}
              onMouseLeave={() => setHoveredCompliance(false)}
              onTogglePreview={() =>
                onTogglePreview(POLICY_COMPLIANCE_ITEM_V3.id)
              }
            />
          </motion.div>

          <motion.div className="flex flex-col gap-2" variants={sectionVariants}>
            <p className="text-sm text-gray-900">
              Would You Also Like to Add Jailbreak Attacks?
            </p>
            <PolicyListViewV2
              templates={ATTACK_TEMPLATES}
              selectedIds={selectedAttackIds}
              hoveredTemplateId={hoveredAttackId}
              previewTemplateId={
                previewItemId &&
                previewItemId !== POLICY_COMPLIANCE_ITEM_V3.id
                  ? previewItemId
                  : null
              }
              onToggle={onToggleAttack}
              onHover={(template) =>
                setHoveredAttackId(template?.id ?? null)
              }
              onTogglePreview={(template) => onTogglePreview(template.id)}
              animateOnMount={animateOnMount}
            />
          </motion.div>
        </motion.div>
      </div>
      {footer}
    </div>
  )
}

interface ComplianceCheckRowProps {
  item: EvalCriteriaItem
  isPreviewing: boolean
  showActionButton: boolean
  onMouseEnter: () => void
  onMouseLeave: () => void
  onTogglePreview: () => void
}

function ComplianceCheckRow({
  item,
  isPreviewing,
  showActionButton,
  onMouseEnter,
  onMouseLeave,
  onTogglePreview,
}: ComplianceCheckRowProps) {
  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={cn(
        'flex items-start gap-2.5 rounded-xl border border-gray-200 px-3 py-3 transition-colors',
        isPreviewing ? 'bg-gray-50' : 'bg-gray-0',
      )}
    >
      <div className="py-1">
        <span className="flex h-4 w-4 items-center justify-center rounded border-2 border-gray-900 bg-gray-900">
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path
              d="M1 4L3.5 6.5L9 1"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-900">{item.name}</span>
          <span className="rounded-md bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600">
            {item.category}
          </span>
        </div>
        <p className="text-xs text-gray-500">{item.description}</p>
        {item.metrics && item.metrics.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {item.metrics.map((metric) => (
              <span
                key={metric}
                className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs text-gray-600"
              >
                {metric}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      {showActionButton ? (
        <Button
          variant="outline"
          size="sm"
          className="gap-1 shrink-0"
          onClick={(e) => {
            e.stopPropagation()
            onTogglePreview()
          }}
        >
          {isPreviewing ? (
            <>
              Hide Preview
              <ChevronLeft className="h-3 w-3" />
            </>
          ) : (
            <>
              Preview
              <ChevronRight className="h-3 w-3" />
            </>
          )}
        </Button>
      ) : null}
    </div>
  )
}
