import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

const STATUS_MESSAGES = [
  'Analyzing your objective…',
  'Drafting allowed and disallowed behaviors…',
  'Finalizing the policy…',
]

interface SkeletonLine {
  kind: 'label' | 'item'
  width: string
  gapBefore?: number
}

const SKELETON_LINES: SkeletonLine[] = [
  { kind: 'label', width: '22%' },
  { kind: 'item', width: '88%', gapBefore: 22 },
  { kind: 'item', width: '76%', gapBefore: 18 },
  { kind: 'item', width: '92%', gapBefore: 18 },
  { kind: 'label', width: '26%', gapBefore: 40 },
  { kind: 'item', width: '84%', gapBefore: 22 },
  { kind: 'item', width: '70%', gapBefore: 18 },
  { kind: 'item', width: '90%', gapBefore: 18 },
]

const STAGGER = 0.07
const BAR_REVEAL_DURATION = 0.35
const SKELETON_INITIAL = 0.05
const HOLD_MS = 900
const EXIT_DURATION = 0.4

const lastBarEndSec =
  SKELETON_INITIAL + (SKELETON_LINES.length - 1) * STAGGER + BAR_REVEAL_DURATION
const CYCLE_MS = lastBarEndSec * 1000 + HOLD_MS

interface CreatePolicyProcessingStepProps {
  state: 'pending' | 'error'
  errorMessage?: string
  onRetry: () => void
  onBack: () => void
  animateOnMount?: boolean
}

export function CreatePolicyProcessingStep({
  state,
  errorMessage,
  onRetry,
  onBack,
  animateOnMount = true,
}: CreatePolicyProcessingStepProps) {
  const [statusIndex, setStatusIndex] = useState(0)

  useEffect(() => {
    if (state !== 'pending') return
    const timer = window.setInterval(() => {
      setStatusIndex((i) => (i + 1) % STATUS_MESSAGES.length)
    }, 2200)
    return () => window.clearInterval(timer)
  }, [state])

  if (state === 'error') {
    return (
      <motion.div
        className="mx-auto flex w-full max-w-md flex-col items-center gap-3 px-3 py-12"
        initial={animateOnMount ? { opacity: 0, y: 8 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-500">
          <AlertCircle className="h-5 w-5" />
        </div>
        <h2 className="text-base font-medium tracking-tight text-gray-900">
          Something Went Wrong
        </h2>
        <p className="text-center text-xs text-gray-500">
          {errorMessage || 'We could not generate the policy. Please try again.'}
        </p>
        <div className="flex items-center gap-2 pt-2">
          <Button variant="ghost" onClick={onBack}>
            Back
          </Button>
          <Button onClick={onRetry}>Try Again</Button>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-3 py-12"
      initial={animateOnMount ? { opacity: 0, y: 8 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <div className="flex flex-col gap-3">
        <h2 className="px-4 py-1 text-2xl font-[450] tracking-tight">
          <ShimmerText>Creating Policy</ShimmerText>
        </h2>
        <div className="min-h-[28px] px-4 py-3 text-sm leading-6">
          <AnimatePresence mode="wait">
            <motion.p
              key={statusIndex}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="text-gray-500"
            >
              {STATUS_MESSAGES[statusIndex]}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      <LoopingSkeleton />
    </motion.div>
  )
}

function LoopingSkeleton() {
  const [iteration, setIteration] = useState(0)

  useEffect(() => {
    const timer = window.setTimeout(
      () => setIteration((i) => i + 1),
      CYCLE_MS,
    )
    return () => window.clearTimeout(timer)
  }, [iteration])

  return (
    <AnimatePresence mode="wait">
      <SkeletonGroup key={iteration} />
    </AnimatePresence>
  )
}

function SkeletonGroup() {
  return (
    <motion.div
      className="flex flex-col"
      initial={false}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: EXIT_DURATION, ease: 'easeOut' }}
    >
      {SKELETON_LINES.map((line, i) => {
        const delay = SKELETON_INITIAL + i * STAGGER
        const marginTop = i === 0 ? 0 : line.gapBefore ?? 8

        if (line.kind === 'label') {
          return (
            <div key={i} style={{ marginTop }}>
              <motion.div
                className="ml-4 h-2.5 rounded-full bg-gray-300"
                initial={{ width: 0 }}
                animate={{ width: line.width }}
                transition={{
                  delay,
                  duration: BAR_REVEAL_DURATION,
                  ease: 'easeOut',
                }}
              />
            </div>
          )
        }

        return (
          <div key={i} style={{ marginTop }}>
            <div className="flex items-center gap-3.5 pr-2">
              <div className="w-0.5 self-stretch shrink-0 rounded-full bg-gray-200" />
              <motion.div
                className="h-3 rounded-full bg-gray-200"
                initial={{ width: 0 }}
                animate={{ width: line.width }}
                transition={{
                  delay,
                  duration: BAR_REVEAL_DURATION,
                  ease: 'easeOut',
                }}
              />
            </div>
          </div>
        )
      })}
    </motion.div>
  )
}

function ShimmerText({ children }: { children: React.ReactNode }) {
  return (
    <motion.span
      className="inline-block bg-clip-text text-transparent"
      style={{
        backgroundImage:
          'linear-gradient(90deg, rgb(156 163 175) 0%, rgb(17 24 39) 50%, rgb(156 163 175) 100%)',
        backgroundSize: '200% 100%',
      }}
      animate={{ backgroundPosition: ['100% 0%', '-100% 0%'] }}
      transition={{ duration: 2.4, ease: 'linear', repeat: Infinity }}
    >
      {children}
    </motion.span>
  )
}
