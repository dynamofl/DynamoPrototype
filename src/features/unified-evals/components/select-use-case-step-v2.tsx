import { type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight, MessagesSquare, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { InfoTooltip } from '@/components/ui/info-tooltip'
import { cn } from '@/lib/utils'
import type { UsecaseOption } from '../types'
import { UseCasePreview } from './use-case-preview'
import { UseCasePreviewEmpty } from './use-case-preview-empty'

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

interface SelectUseCaseStepV2Props {
  options: UsecaseOption[]
  selectedValue: string | null
  onSelect: (value: string) => void
  onAddNewCase: () => void
  animateOnMount?: boolean
  footer?: ReactNode
  currentStep?: number
  totalSteps?: number
}

export function SelectUseCaseStepV2({
  options,
  selectedValue,
  onSelect,
  onAddNewCase,
  animateOnMount = true,
  footer,
  currentStep,
  totalSteps,
}: SelectUseCaseStepV2Props) {
  const selectedOption =
    options.find((o) => o.value === selectedValue) ?? null

  return (
    <div className="flex h-full w-full">
      <div className="flex w-full max-w-xl flex-col">
        <div className="flex-1 overflow-y-auto">
          <motion.div
            className="flex flex-col gap-4 px-3 py-4"
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
              <h2 className="text-base font-medium tracking-tight text-gray-900">
                Select Use Case for this AI System
              </h2>
              <p className="pt-1 text-xs text-gray-500">
                Choosing a use case tailors the evaluation, focusing on relevant
                risks and ensuring alignment with industry-specific ethical
                guidelines.
              </p>
              <div className="flex items-center gap-3 pt-3">
                <div className="py-0.5">
                  <InfoTooltip
                    label="Why Select a Use Case?"
                    side="bottom"
                    align="start"
                  >
                    Use cases anchor the evaluation in a specific domain so that
                    risks, metrics, and benchmarks reflect the surface where
                    your system actually operates.
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

            <motion.div
              className="grid grid-cols-2 gap-3 px-2"
              variants={sectionVariants}
            >
              {options.map((option) => (
                <UseCaseCardV2
                  key={option.value}
                  option={option}
                  selected={selectedValue === option.value}
                  onSelect={() => onSelect(option.value)}
                />
              ))}
            </motion.div>

            <motion.button
              type="button"
              onClick={onAddNewCase}
              variants={sectionVariants}
              className="mx-2 flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 bg-gray-0 px-4 py-8 text-center transition-colors hover:border-gray-400 hover:bg-gray-50"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100">
                <Plus className="h-4 w-4 text-gray-700" />
              </span>
              <span className="text-sm font-medium text-gray-900">
                Add New Case
              </span>
              <span className="text-xs text-gray-500">
                Couldn&apos;t Find your use case?
                <br />
                Create one and add it for you
              </span>
            </motion.button>
          </motion.div>
        </div>
        {footer}
      </div>

      <div className="flex flex-1 border-l border-gray-200">
        {selectedOption ? (
          <UseCasePreview option={selectedOption} />
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <UseCasePreviewEmpty />
          </div>
        )}
      </div>
    </div>
  )
}

interface UseCaseCardV2Props {
  option: UsecaseOption
  selected: boolean
  onSelect: () => void
}

function UseCaseCardV2({ option, selected, onSelect }: UseCaseCardV2Props) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'flex flex-col items-start gap-3 rounded-xl border bg-gray-0 px-4 py-4 text-left transition-colors',
        selected
          ? 'border-gray-900 ring-1 ring-gray-900'
          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
      )}
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100">
        <MessagesSquare className="h-4 w-4 text-gray-700" />
      </span>
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium text-gray-900">{option.label}</span>
        <span className="text-xs leading-5 text-gray-500">
          {option.description}
        </span>
      </div>
    </button>
  )
}
