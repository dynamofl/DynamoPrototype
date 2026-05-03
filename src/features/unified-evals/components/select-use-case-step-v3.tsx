import { useState, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, MessagesSquare, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { UsecaseOption } from '../types'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
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

interface SelectUseCaseStepV3Props {
  options: UsecaseOption[]
  selectedValue: string | null
  previewValue: string | null
  onSelect: (value: string) => void
  onTogglePreview: (value: string) => void
  onAddNewCase: () => void
  animateOnMount?: boolean
  footer?: ReactNode
  currentStep?: number
  totalSteps?: number
}

export function SelectUseCaseStepV3({
  options,
  selectedValue,
  previewValue,
  onSelect,
  onTogglePreview,
  onAddNewCase,
  animateOnMount = true,
  footer,
  currentStep,
  totalSteps,
}: SelectUseCaseStepV3Props) {
  const [hoveredValue, setHoveredValue] = useState<string | null>(null)
  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex-1 overflow-y-auto">
        <motion.div
          className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-6"
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
                        : 'w-1.5 bg-gray-300'
                    )}
                  />
                ))}
              </div>
            ) : null}
            <div className="flex flex-col gap-1">
              <h2 className="text-base font-medium tracking-tight text-gray-900">
                Select Use Case for this AI System
              </h2>
              <p className="text-xs text-gray-500">
                Choosing a use case tailors the evaluation, focusing on relevant
                risks and ensuring alignment with industry-specific ethical
                guidelines.
              </p>
            </div>
          </motion.div>

          <motion.div
            className="grid grid-cols-2 gap-3"
            variants={sectionVariants}
          >
            {options.map((option) => (
              <UseCaseCard
                key={option.value}
                option={option}
                selected={selectedValue === option.value}
                isPreviewing={previewValue === option.value}
                isHovered={hoveredValue === option.value}
                onMouseEnter={() => setHoveredValue(option.value)}
                onMouseLeave={() => setHoveredValue(null)}
                onSelect={() => onSelect(option.value)}
                onTogglePreview={() => onTogglePreview(option.value)}
              />
            ))}
          </motion.div>

          <motion.button
            type="button"
            onClick={onAddNewCase}
            variants={sectionVariants}
            className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 bg-gray-0 px-4 py-8 text-center transition-colors hover:border-gray-400 hover:bg-gray-50"
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
  )
}

interface UseCaseCardProps {
  option: UsecaseOption
  selected: boolean
  isPreviewing: boolean
  isHovered: boolean
  onMouseEnter: () => void
  onMouseLeave: () => void
  onSelect: () => void
  onTogglePreview: () => void
}

function UseCaseCard({
  option,
  selected,
  isPreviewing,
  isHovered,
  onMouseEnter,
  onMouseLeave,
  onSelect,
  onTogglePreview,
}: UseCaseCardProps) {
  const showActionButton = isPreviewing || isHovered
  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={cn(
        'group relative flex flex-col items-start gap-3 rounded-xl border bg-gray-0 px-4 py-4 text-left transition-colors',
        selected
          ? 'border-gray-900 ring-1 ring-gray-900'
          : isPreviewing
            ? 'border-gray-300 bg-gray-50'
            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50',
      )}
    >
      <button
        type="button"
        onClick={onSelect}
        className="absolute inset-0 rounded-xl"
        aria-label={`Select ${option.label}`}
      />

      <span className="pointer-events-none flex h-9 w-9 items-center justify-center rounded-full bg-gray-100">
        <MessagesSquare className="h-4 w-4 text-gray-700" />
      </span>
      <div className="pointer-events-none flex flex-col gap-1">
        <span className="text-sm font-medium text-gray-900">
          {option.label}
        </span>
        <span className="text-xs leading-5 text-gray-500">
          {option.description}
        </span>
      </div>

      {showActionButton ? (
        <div className="absolute right-3 top-3">
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
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
        </div>
      ) : null}
    </div>
  )
}
