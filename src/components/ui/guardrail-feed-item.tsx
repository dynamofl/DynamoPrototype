import * as React from "react"
import { cn } from "@/lib/utils"

const warningIcon = "http://localhost:3845/assets/2bda5d730f6f6ca70e1fc399eecaeabba7a01bbd.svg"
const successIcon = "http://localhost:3845/assets/cb24dd6738d460a058ab711ffdb111b906bab0c9.svg"
const arrowTopRightIcon = "http://localhost:3845/assets/1145ffc518980cbf434ccbd0317abc4524141919.svg"

export type GuardrailJudgmentType = "compliant" | "blocked" | "warning" | "info"

export interface GuardrailJudgment {
  name: string
  type: GuardrailJudgmentType
  label: string
  showPreviewPolicy?: boolean
  onPreviewPolicy?: () => void
}

export interface GuardrailFeedItemProps {
  title?: string
  guardrailJudgments: GuardrailJudgment[]
  className?: string
}

const getJudgmentStyles = (type: GuardrailJudgmentType) => {
  switch (type) {
    case "blocked":
      return "text-red-700"
    case "compliant":
      return "text-green-700"
    case "warning":
      return "text-orange-600"
    case "info":
      return "text-blue-600"
    default:
      return "text-gray-800"
  }
}

const getJudgmentIcon = (type: GuardrailJudgmentType) => {
  switch (type) {
    case "compliant":
      return successIcon
    case "blocked":
    case "warning":
    case "info":
    default:
      return warningIcon
  }
}

const GuardrailFeedItem = React.forwardRef<
  HTMLDivElement,
  GuardrailFeedItemProps
>(({ title = "Input Guardrails", guardrailJudgments, className }, ref) => {
  return (
    <div 
      ref={ref}
      className={cn("flex flex-col gap-3 w-full", className)}
    >
      <div className="px-1 py-1">
        <p className="text-xs font-medium leading-4 text-gray-600">
          {title}
        </p>
      </div>
      <div className="bg-white border border-gray-300 rounded-[4px] w-full">
        <div className="flex flex-col p-1 gap-2">
          {guardrailJudgments.map((guardrail, index) => (
            <div 
              key={index}
              className="flex items-center justify-between px-2 py-0 rounded-md w-full"
            >
              <div className="flex items-center gap-1 py-1">
                <div className="relative w-4 h-4 shrink-0">
                  <img 
                    alt="" 
                    className="block max-w-none w-full h-full" 
                    src={getJudgmentIcon(guardrail.type)} 
                  />
                </div>
                <div className="flex items-center gap-0.5 text-xs leading-4 text-gray-800 whitespace-nowrap">
                  <span className="font-normal">
                    {guardrail.name}:
                  </span>
                  <span className={cn("font-medium", getJudgmentStyles(guardrail.type))}>
                    {guardrail.label}
                  </span>
                </div>
              </div>
              {guardrail.showPreviewPolicy && (
                <div 
                  className="flex items-center gap-0.5 px-2 py-1.5 rounded-md cursor-pointer opacity-0 hover:opacity-100 transition-opacity"
                  onClick={guardrail.onPreviewPolicy}
                >
                  <p className="text-xs font-medium leading-4 text-gray-600 underline whitespace-nowrap">
                    Preview Policy
                  </p>
                  <div className="relative w-5 h-5 shrink-0">
                    <div className="absolute inset-[28%]">
                      <img 
                        alt="" 
                        className="block max-w-none w-full h-full" 
                        src={arrowTopRightIcon} 
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
})
GuardrailFeedItem.displayName = "GuardrailFeedItem"

export { GuardrailFeedItem }