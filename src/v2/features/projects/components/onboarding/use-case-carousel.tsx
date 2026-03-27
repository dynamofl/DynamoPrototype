import { useRef, useEffect, useState, useCallback } from 'react'
import { CircleHelp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { USE_CASES } from './onboarding-constants'

const CARD_W = 360
const CARD_GAP = 12

export function UseCaseCarousel({ selectedId, customName, customDescription }: {
  selectedId: string | null
  customName?: string
  customDescription?: string
}) {
  const builtIn = USE_CASES.filter(uc => uc.id !== 'other')
  const isOther = selectedId === 'other'
  const hasSelection = selectedId !== null

  const baseCards = isOther
    ? [...builtIn, { id: 'other' as const, name: customName || 'Custom', description: customDescription || 'Your custom use case', icon: CircleHelp }]
    : builtIn
  const cards = [...baseCards, ...baseCards, ...baseCards]

  const setWidth = baseCards.length * (CARD_W + CARD_GAP)

  // Target: first instance in the SECOND set (middle) for centering
  const selectedIdx = hasSelection
    ? baseCards.length + baseCards.findIndex(uc => uc.id === selectedId)
    : -1

  const trackRef = useRef<HTMLDivElement>(null)
  const [offset, setOffset] = useState<number | null>(null)
  const [animate, setAnimate] = useState(false)

  // Capture current marquee position and transition to selected card
  const freezeAndCenter = useCallback(() => {
    const el = trackRef.current
    if (!el || selectedIdx < 0) return

    // Get current computed transform from the running animation
    const computed = window.getComputedStyle(el)
    const matrix = new DOMMatrix(computed.transform)
    const currentX = matrix.m41

    // Freeze at current position (no transition)
    setAnimate(false)
    setOffset(currentX)

    // Next frame: transition to the target position
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setAnimate(true)
        const containerWidth = el.parentElement?.clientWidth ?? 0
        const targetX = (containerWidth / 2) - (selectedIdx * (CARD_W + CARD_GAP)) - (CARD_W / 2)
        setOffset(targetX)
      })
    })
  }, [selectedIdx])

  // Resume marquee when deselected
  const resumeMarquee = useCallback(() => {
    setAnimate(false)
    setOffset(null)
  }, [])

  useEffect(() => {
    if (hasSelection) {
      freezeAndCenter()
    } else {
      resumeMarquee()
    }
  }, [hasSelection, selectedId, freezeAndCenter, resumeMarquee])

  const isPaused = offset !== null

  return (
    <div className="flex items-center overflow-hidden h-full">
      <div
        ref={trackRef}
        className="flex"
        style={{
          gap: `${CARD_GAP}px`,
          animation: isPaused ? 'none' : `marquee-x ${baseCards.length * 6}s linear infinite`,
          transform: isPaused ? `translateX(${offset}px)` : undefined,
          transition: animate ? 'transform 0.6s cubic-bezier(0.32, 0.72, 0, 1)' : 'none',
        }}
      >
        {cards.map((uc, i) => {
          const Icon = uc.icon
          const isActive = hasSelection && uc.id === selectedId && i === selectedIdx
          const isDimmed = hasSelection && !isActive

          return (
            <div
              key={`${uc.id}-${i}`}
              className={cn(
                'shrink-0 rounded-xl border p-5 flex flex-col justify-between transition-all duration-300',
                uc.id === 'other' && 'border-dashed',
                isActive
                  ? uc.id === 'other' ? 'bg-gray-0 border-gray-200 scale-[1.02]' : 'bg-gray-0 border-gray-200 shadow-md scale-[1.02]'
                  : isDimmed
                    ? 'bg-gray-0/50 border-gray-100 opacity-40 scale-[0.97]'
                    : 'bg-gray-0 border-gray-200'
              )}
              style={{ width: CARD_W, height: 280 }}
            >
              <div className={cn(
                'h-10 w-10 rounded-lg flex items-center justify-center',
                isActive || !isDimmed ? 'bg-gray-100' : 'bg-gray-50'
              )}>
                <Icon className={cn('h-5 w-5', isActive || !isDimmed ? 'text-gray-700' : 'text-gray-400')} strokeWidth={1.5} />
              </div>
              <div>
                <p className={cn('text-[0.8125rem] font-[550] mb-1', isActive || !isDimmed ? 'text-gray-900' : 'text-gray-500')}>
                  {uc.id === 'other' && isOther ? (customName || 'Custom') : uc.name}
                </p>
                <p className={cn('text-[0.75rem] leading-relaxed', isActive || !isDimmed ? 'text-gray-500' : 'text-gray-400')}>
                  {uc.id === 'other' && isOther ? (customDescription || 'Your custom use case') : uc.description}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      <style>{`
        @keyframes marquee-x {
          0% { transform: translateX(0); }
          100% { transform: translateX(-${setWidth}px); }
        }
      `}</style>
    </div>
  )
}
