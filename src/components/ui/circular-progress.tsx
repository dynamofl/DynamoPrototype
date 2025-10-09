import * as React from "react"

interface CircularProgressProps {
  value: number // 0-100
  size?: number // diameter in pixels
  strokeWidth?: number
  className?: string
  showPercentage?: boolean
  color?: string
}

export function CircularProgress({
  value,
  size = 20,
  strokeWidth = 2,
  className = "",
  showPercentage = false,
  color = "text-amber-600"
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (value / 100) * circumference

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-gray-200"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={`transition-all duration-300 ${color}`}
        />
      </svg>
      {showPercentage && (
        <span className="absolute text-[10px] font-medium text-gray-700">
          {Math.round(value)}%
        </span>
      )}
    </div>
  )
}
