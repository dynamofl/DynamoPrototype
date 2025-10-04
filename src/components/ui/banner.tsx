import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Button } from "./button"
import { Info, X } from "lucide-react"

const infoIcon = "http://localhost:3845/assets/659c04e0f0d3d0424895a5b4a9468d6aa5f987d1.svg"
const closeIcon = "http://localhost:3845/assets/46d4f59dd8091d70c0c03d3a4cb48c4b3d0821e8.svg"

const bannerVariants = cva(
  "relative bg-white p-3 flex flex-col gap-2",
  {
    variants: {
      intent: {
        default: "bg-white text-gray-900 border border-gray-200",
        emphasis: "bg-gray-100 text-gray-900",
        success: "bg-green-100 text-green-800",
        warning: "bg-yellow-100 text-yellow-800",
        danger: "bg-red-100 text-red-800",
        primary: "bg-indigo-100 text-indigo-800",
      },
      width: {
        fit: "w-fit max-w-md",
        full: "w-full",
      },
    },
    defaultVariants: {
      intent: "default",
      width: "full",
    },
  }
)

export interface BannerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof bannerVariants> {
  message?: string
  description?: string
  showTitle?: boolean
  showDescription?: boolean
  showVisualIndicator?: boolean
  showModalControl?: boolean
  showAdditionalInfo?: boolean
  additionalInfoSlot?: React.ReactNode
  showCta?: "none" | "top" | "bottom"
  primaryAction?: {
    label: string
    onClick: () => void
  }
  secondaryAction?: {
    label: string
    onClick: () => void
  }
  onClose?: () => void
}

const Banner = React.forwardRef<HTMLDivElement, BannerProps>(
  (
    {
      className,
      intent = "default",
      width = "full",
      message = "Message",
      description = "Description",
      showTitle = true,
      showDescription = true,
      showVisualIndicator = true,
      showModalControl = true,
      showAdditionalInfo = false,
      additionalInfoSlot,
      showCta = "bottom",
      primaryAction,
      secondaryAction,
      onClose,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(bannerVariants({ intent, width }), className)}
        {...props}
      >
        <div className="flex gap-2 items-start w-full">
          {showVisualIndicator && (
            <div className="flex-shrink-0 w-5 h-5 mt-0.5">
              <Info className="w-4 h-4" />
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <div className="flex gap-1.5 items-start w-full">
              <div className="flex-1 flex flex-col gap-1 min-w-0">
                {showTitle && message && (
                  <p className="text-[0.8125rem]  font-450 leading-5 text-gray-900 tracking-[0.065px]">
                    {message}
                  </p>
                )}
                {showDescription && description && (
                  <p className="text-xs font-400 leading-5">
                    {description}
                  </p>
                )}
              </div>
              
              {showCta === "top" && (primaryAction || secondaryAction) && (
                <div className="flex gap-1 items-start flex-shrink-0">
                  {secondaryAction && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={secondaryAction.onClick}
                      className="h-6 px-2 py-1 text-xs font-medium bg-white border-gray-300 text-gray-800 hover:bg-gray-50"
                    >
                      {secondaryAction.label}
                    </Button>
                  )}
                  {primaryAction && (
                    <Button
                      size="sm"
                      onClick={primaryAction.onClick}
                      className="h-6 px-2 py-1 text-xs font-medium"
                    >
                      {primaryAction.label}
                    </Button>
                  )}
                </div>
              )}
            </div>

            {showCta === "bottom" && (primaryAction || secondaryAction) && (
              <div className="flex gap-1 items-start mt-2">
                {secondaryAction && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={secondaryAction.onClick}
                    className="h-6 px-2 py-1 text-xs font-medium bg-white border-gray-300 text-gray-800 hover:bg-gray-50"
                  >
                    {secondaryAction.label}
                  </Button>
                )}
                {primaryAction && (
                  <Button
                    size="sm"
                    onClick={primaryAction.onClick}
                    className="h-6 px-2 py-1 text-xs font-medium"
                  >
                    {primaryAction.label}
                  </Button>
                )}
              </div>
            )}

            {showAdditionalInfo && additionalInfoSlot && (
              <div className="mt-2">
                {additionalInfoSlot}
              </div>
            )}
          </div>

          {showModalControl && onClose && (
            <div className="flex items-center justify-end min-h-6 flex-shrink-0">
              <button
                onClick={onClose}
                className="w-5 h-5 flex items-center justify-center hover:bg-black/5 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

      </div>
    )
  }
)

Banner.displayName = "Banner"

export { Banner }