import { cn } from '@/lib/utils'

interface AILoaderProps {
  className?: string
  size?: number
}

export function AILoader({ className, size = 16 }: AILoaderProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      className={cn('animate-spin', className)}
      style={{ animationDuration: '0.8s' }}
    >
      {Array.from({ length: 8 }, (_, i) => {
        const angle = i * 45
        const opacity = 1 - i * 0.12
        const radians = (angle * Math.PI) / 180
        const x1 = 8 + Math.sin(radians) * 3
        const y1 = 8 - Math.cos(radians) * 3
        const x2 = 8 + Math.sin(radians) * 6.5
        const y2 = 8 - Math.cos(radians) * 6.5

        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            opacity={opacity}
          />
        )
      })}
    </svg>
  )
}
