import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const Dialog = DialogPrimitive.Root
const DialogTrigger = DialogPrimitive.Trigger
const DialogPortal = DialogPrimitive.Portal
const DialogClose = DialogPrimitive.Close

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-gray-200/40 dark:bg-gray-900/10 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const dialogContentVariants = cva(
  "fixed left-[50%] top-[50%] z-50 flex flex-col translate-x-[-50%] translate-y-[-50%] bg-gray-0 shadow-lg rounded-xl overflow-hidden pointer-events-auto data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] data-[state=open]:duration-200 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-98 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=closed]:duration-150 data-[state=closed]:[animation-timing-function:cubic-bezier(0.6,0.04,0.98,0.34)]",
  {
    variants: {
      size: {
        sm: "w-[400px]",
        md: "w-[600px]",
        lg: "w-[752px]",
        xl: "w-[968px]",
        xxl: "w-[80vw]"
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
)

export interface DialogContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
    VariantProps<typeof dialogContentVariants> {}

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(({ className, children, size, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(dialogContentVariants({ size }), className)}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </DialogPortal>
))
DialogContent.displayName = DialogPrimitive.Content.displayName

interface DialogHeaderPropsBase extends React.HTMLAttributes<HTMLDivElement> {
  showCloseButton?: boolean
  showIcon?: boolean
  icon?: React.ReactNode
  showSubtitle?: boolean
}

export interface DialogHeaderProps extends DialogHeaderPropsBase {}

const DialogHeader = React.forwardRef<
  HTMLDivElement,
  DialogHeaderProps
>(({ className, showCloseButton = true, showIcon = false, icon, showSubtitle = false, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center justify-between pl-4 pr-2 py-2 bg-gray-0 relative",
      className
    )}
    {...props}
  >
    <div className="flex items-center gap-2 flex-1">
      {showIcon && icon && (
        <div className="w-5 h-8 flex items-center justify-center">
          {icon}
        </div>
      )}
      <div className="flex flex-col gap-0.5 py-1.5">
        {children}
      </div>
    </div>
    {showCloseButton && (
      <div className="flex items-center gap-1">
        <DialogPrimitive.Close className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-black/5 transition-colors">
          <X className="h-4 w-4 text-gray-500" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </div>
    )}
  </div>
))
DialogHeader.displayName = "DialogHeader"

interface DialogBodyPropsBase extends React.HTMLAttributes<HTMLDivElement> {
  scrollable?: boolean
  size?: "sm" | "md" | "lg" | "xl" | "xxl"
}

export interface DialogBodyProps extends DialogBodyPropsBase {}

const dialogBodyVariants = cva(
  "flex-1 px-4 py-4 bg-gray-0",
  {
    variants: {
      scrollable: {
        true: "overflow-y-auto",
        false: "flex ",
      },
      size: {
        sm: "min-h-[120px] max-h-[180px]",
        md: "min-h-[200px] max-h-[300px]",
        lg: "min-h-[200px] max-h-[400px]",
        xl: "min-h-[200px] max-h-[500px]",
        xxl: "min-h-[200px] max-h-[80vh]"
      },
    },
    compoundVariants: [
      { scrollable: true, size: "sm", class: "max-h-[180px]" },
      { scrollable: true, size: "md", class: "max-h-[300px]" },
      { scrollable: true, size: "lg", class: "max-h-[400px]" },
      { scrollable: true, size: "xl", class: "max-h-[500px]" },
    ],
    defaultVariants: {
      scrollable: false,
      size: "md",
    },
  }
)

const DialogBody = React.forwardRef<
  HTMLDivElement,
  DialogBodyProps
>(({ className, scrollable = false, size = "md", children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(dialogBodyVariants({ scrollable, size }), className)}
    {...props}
  >
    {children}
  </div>
))
DialogBody.displayName = "DialogBody"

export interface DialogFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: "left" | "center" | "right"
}

const DialogFooter = React.forwardRef<
  HTMLDivElement,
  DialogFooterProps
>(({ className, align = "right", children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center gap-4 px-4 py-3 bg-gray-0 border-t border-gray-200 relative",
      align === "left" && "justify-start",
      align === "center" && "justify-center",
      align === "right" && "justify-end",
      className
    )}
    {...props}
  >
    {children}
  </div>
))
DialogFooter.displayName = "DialogFooter"

export interface DialogFooterButtonSetProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "danger" | "success"
  primaryText?: string
  secondaryText?: string
  onPrimaryClick?: () => void
  onSecondaryClick?: () => void
  primaryOnly?: boolean
  primaryDisabled?: boolean
}

const DialogFooterButtonSet = React.forwardRef<
  HTMLDivElement,
  DialogFooterButtonSetProps
>(({
  className,
  variant = "default",
  primaryText = "Accept",
  secondaryText = "Cancel",
  onPrimaryClick,
  onSecondaryClick,
  primaryOnly = false,
  primaryDisabled = false,
  ...props
}, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center gap-2", className)}
    {...props}
  >
    {!primaryOnly && (
      <button
        type="button"
        onClick={onSecondaryClick}
        className="px-3 py-2 text-[0.8125rem] font-medium text-gray-600 bg-transparent hover:bg-black/5 rounded-md transition-colors leading-4"
      >
        {secondaryText}
      </button>
    )}
    <button
      type="button"
      onClick={onPrimaryClick}
      disabled={primaryDisabled}
      className={cn(
        "px-3 py-2 text-[0.8125rem] font-medium text-blue-50 rounded-md transition-colors leading-4",
        variant === "default" && "bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed",
        variant === "danger" && "bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed",
        variant === "success" && "bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed"
      )}
    >
      {primaryText}
    </button>
  </div>
))
DialogFooterButtonSet.displayName = "DialogFooterButtonSet"

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-[0.875rem] font-[550] leading-5 tracking-[0.07px] text-gray-800",
      className
    )}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-[0.8125rem] text-muted-foreground", className)}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogFooterButtonSet,
  DialogTitle,
  DialogDescription,
}
