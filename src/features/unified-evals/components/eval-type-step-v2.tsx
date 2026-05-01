import { useState, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { InfoTooltip } from '@/components/ui/info-tooltip'
import { cn } from '@/lib/utils'
import type { PolicyTemplate } from '@/v2/features/projects/components/policies/types'
import { PolicyListViewV2 } from './policy-list-view-v2'
import { EvalCriteriaPreview, type EvalCriteriaItem } from './eval-criteria-preview'
import { EvalCriteriaPreviewEmpty } from './eval-criteria-preview-empty'
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

const POLICY_COMPLIANCE_ITEM: EvalCriteriaItem = {
  id: 'policy-compliance',
  name: 'Policy Compliance Check',
  category: 'Default',
  description:
    'Evaluates model performance in identifying policy adherence by using key metrics to ensure reliable and policy-aligned behavior.',
  metrics: DEFAULT_EVAL_METRICS,
  kind: 'policy-compliance',
}

const JAILBREAK_ITEMS: EvalCriteriaItem[] = ATTACK_OPTIONS.map((attack) => ({
  id: attack.id,
  name: attack.name,
  category: attack.meta,
  description: attack.description,
  kind: 'jailbreak',
}))

const ALL_ITEMS_BY_ID: Record<string, EvalCriteriaItem> = {
  [POLICY_COMPLIANCE_ITEM.id]: POLICY_COMPLIANCE_ITEM,
  ...Object.fromEntries(JAILBREAK_ITEMS.map((item) => [item.id, item])),
}

const ATTACK_TEMPLATES: PolicyTemplate[] = JAILBREAK_ITEMS.map((item) => ({
  id: item.id,
  name: item.name,
  category: item.category,
  description: item.description,
  detail: '',
  allowed: [],
  disallowed: [],
}))

interface EvalTypeStepV2Props {
  selectedAttackIds: Set<string>
  onToggleAttack: (id: string) => void
  animateOnMount?: boolean
  footer?: ReactNode
  currentStep?: number
  totalSteps?: number
}

export function EvalTypeStepV2({
  selectedAttackIds,
  onToggleAttack,
  animateOnMount = true,
  footer,
  currentStep,
  totalSteps,
}: EvalTypeStepV2Props) {
  const [hoveredAttackId, setHoveredAttackId] = useState<string | null>(null)
  const [hoveredCompliance, setHoveredCompliance] = useState(false)
  const [previewId, setPreviewId] = useState<string | null>(null)

  const handleTogglePreview = (id: string) => {
    setPreviewId((current) => (current === id ? null : id))
  }

  const previewItem = previewId ? ALL_ITEMS_BY_ID[previewId] : null
  const isCompliancePreviewing = previewId === POLICY_COMPLIANCE_ITEM.id
  const showComplianceAction = isCompliancePreviewing || hoveredCompliance

  return (
    <div className="flex h-full w-full">
      <div className="flex w-full max-w-xl flex-col">
        <div className="flex-1 overflow-y-auto">
          <motion.div
            className="flex flex-col gap-6 px-3 py-4"
            variants={containerVariants}
            initial={animateOnMount ? 'hidden' : false}
            animate="visible"
          >
            <motion.div className="flex flex-col px-2" variants={sectionVariants}>
              {totalSteps && totalSteps > 0 ? (
                <div className="flex items-center gap-1.5 py-4">
                  {Array.from({ length: totalSteps }).map((_, index) => (
                    <div
                      key={index}
                      className={cn(
                        'h-1.5 rounded-full transition-all',
                        index === currentStep
                          ? 'w-5 bg-gray-900'
                          : 'w-1.5 bg-gray-900/30'
                      )}
                    />
                  ))}
                </div>
              ) : null}
              <h2 className="text-base font-[450] tracking-tight text-gray-900">
                Confirm Your Type of Evaluation
              </h2>
              <p className="pt-1 text-xs text-gray-500">
                Configure your evaluation to measure how reliably your model
                evaluates policies under default conditions and adversarial
                attacks.
              </p>
              <div className="flex items-center gap-3 pt-3">
                <div className="py-1.5">
                  <InfoTooltip
                    label="How It Works?"
                    side="bottom"
                    align="start"
                  >
                    Each evaluation type runs your selected policies against a
                    different surface — default checks measure baseline
                    compliance, while jailbreak attacks stress-test how the
                    model holds up under adversarial pressure.
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
                item={POLICY_COMPLIANCE_ITEM}
                isPreviewing={isCompliancePreviewing}
                showActionButton={showComplianceAction}
                onMouseEnter={() => setHoveredCompliance(true)}
                onMouseLeave={() => setHoveredCompliance(false)}
                onTogglePreview={() =>
                  handleTogglePreview(POLICY_COMPLIANCE_ITEM.id)
                }
              />
            </motion.div>

            <motion.div className="flex flex-col gap-2" variants={sectionVariants}>
              <p className="px-3 text-sm text-gray-900">
                Would You Also Like to Add Jailbreak Attacks?
              </p>
              <PolicyListViewV2
                templates={ATTACK_TEMPLATES}
                selectedIds={selectedAttackIds}
                hoveredTemplateId={hoveredAttackId}
                previewTemplateId={
                  previewId && previewId !== POLICY_COMPLIANCE_ITEM.id
                    ? previewId
                    : null
                }
                onToggle={onToggleAttack}
                onHover={(template) =>
                  setHoveredAttackId(template?.id ?? null)
                }
                onTogglePreview={(template) => handleTogglePreview(template.id)}
                animateOnMount={animateOnMount}
              />
            </motion.div>
          </motion.div>
        </div>
        {footer}
      </div>

      <div className="flex flex-1 border-l border-gray-200">
        {previewItem ? (
          <EvalCriteriaPreview item={previewItem} />
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <EvalCriteriaPreviewEmpty />
          </div>
        )}
      </div>
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
        isPreviewing ? 'bg-gray-50' : 'bg-gray-0'
      )}
    >
      <div className="py-1">
        <span className="flex h-4 w-4 items-center justify-center rounded border-[1.5px] border-gray-900 bg-gray-900">
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
          <span className="text-sm font-[450] text-gray-900">{item.name}</span>
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
                className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[0.75rem] text-gray-600"
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
