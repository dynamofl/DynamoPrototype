import * as React from "react"
import { cn } from "@/lib/utils"

const warningIcon = "http://localhost:3845/assets/2bda5d730f6f6ca70e1fc399eecaeabba7a01bbd.svg"
const successIcon = "http://localhost:3845/assets/cb24dd6738d460a058ab711ffdb111b906bab0c9.svg"
const arrowTopRightIcon = "http://localhost:3845/assets/1145ffc518980cbf434ccbd0317abc4524141919.svg"

export type JudgmentType = "compliant" | "non-compliant" | "warning" | "info"
export type JudgmentStatus = "ground-truth" | "evaluation" | "review"

export interface JudgmentProps {
  type: JudgmentType
  status: JudgmentStatus
  label: string
  showPreviewPolicy?: boolean
  onPreviewPolicy?: () => void
}

export interface ConversationFeedItemProps {
  title: string
  content: string
  judgment?: JudgmentProps
  className?: string
}

const getJudgmentStyles = (type: JudgmentType) => {
  switch (type) {
    case "non-compliant":
      return "text-[#c10007]"
    case "compliant":
      return "text-[#008236]"
    case "warning":
      return "text-orange-600"
    case "info":
      return "text-blue-600"
    default:
      return "text-[#192c4b]"
  }
}

const getJudgmentIcon = (type: JudgmentType) => {
  switch (type) {
    case "compliant":
      return successIcon
    case "non-compliant":
    case "warning":
    case "info":
    default:
      return warningIcon
  }
}

const ConversationFeedItem = React.forwardRef<
  HTMLDivElement,
  ConversationFeedItemProps
>(({ title, content, judgment, className }, ref) => {
  return (
    <div 
      ref={ref}
      className={cn("flex flex-col gap-2 w-full", className)}
    >
      <div className="flex items-center gap-2 h-4 w-full">
        <div className="flex flex-col justify-center">
          <p className="text-xs font-medium leading-4 text-[#4b5976] whitespace-nowrap">
            {title}
          </p>
        </div>
      </div>
      <div className="flex flex-col justify-center w-full">
        <p className="text-[13px] font-normal leading-5 text-[#192c4b]">
          {content}
        </p>
      </div>
      {judgment && (
        <div className="flex items-center justify-between px-2 py-0.5 border border-[#e9eaed] rounded-md w-full">
          <div className="flex items-center gap-1 py-1">
            <div className="relative w-4 h-4 shrink-0">
              <img 
                alt="" 
                className="block max-w-none w-full h-full" 
                src={getJudgmentIcon(judgment.type)} 
              />
            </div>
            <div className="flex items-center gap-0.5 text-xs leading-4 text-[#192c4b] whitespace-nowrap">
              <span className="font-normal">
                {judgment.status === "ground-truth" ? "Ground Truth:" : 
                 judgment.status === "evaluation" ? "Evaluation:" : "Review:"}
              </span>
              <span className={cn("font-medium", getJudgmentStyles(judgment.type))}>
                {judgment.label}
              </span>
            </div>
          </div>
          {judgment.showPreviewPolicy && (
            <div 
              className="flex items-center gap-0.5 px-2 py-1.5 rounded-md cursor-pointer opacity-0 hover:opacity-100 transition-opacity"
              onClick={judgment.onPreviewPolicy}
            >
              <p className="text-xs font-medium leading-4 text-[#4b5976] underline whitespace-nowrap">
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
      )}
    </div>
  )
})
ConversationFeedItem.displayName = "ConversationFeedItem"

export { ConversationFeedItem }