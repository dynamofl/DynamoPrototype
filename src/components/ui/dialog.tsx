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
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const dialogContentVariants = cva(
  "fixed left-[50%] top-[50%] z-50 flex flex-col translate-x-[-50%] translate-y-[-50%] border bg-background shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-lg overflow-hidden",
  {
    variants: {
      size: {
        sm: "w-[400px]",
        md: "w-[600px]",
        lg: "w-[752px]",
        xl: "w-[968px]",
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
  /** Show close button in header */
  showCloseButton?: boolean
  /** Show icon indicator */
  showIcon?: boolean
  /** Icon element to display */
  icon?: React.ReactNode
  /** Show subtitle below title */
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
      "flex items-center justify-between px-4 py-1.5 bg-[#f7f8f9] border-b border-[rgba(9,28,66,0.14)] relative",
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
          <X className="h-4 w-4 text-[#6b7894]" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </div>
    )}
  </div>
))
DialogHeader.displayName = "DialogHeader"

interface DialogBodyPropsBase extends React.HTMLAttributes<HTMLDivElement> {
  /** Enable scrolling for long content */
  scrollable?: boolean
  /** Dialog size to determine max height */
  size?: "sm" | "md" | "lg" | "xl"
}

export interface DialogBodyProps extends DialogBodyPropsBase {}

const dialogBodyVariants = cva(
  "flex-1 px-4 py-4 bg-white",
  {
    variants: {
      scrollable: {
        true: "overflow-y-auto",
        false: "flex items-center justify-center",
      },
      size: {
        sm: "min-h-[120px] max-h-[180px]",
        md: "min-h-[200px] max-h-[300px]",
        lg: "min-h-[200px] max-h-[400px]",
        xl: "min-h-[200px] max-h-[500px]",
      },
    },
    compoundVariants: [
      {
        scrollable: true,
        size: "sm",
        class: "max-h-[180px]",
      },
      {
        scrollable: true,
        size: "md",
        class: "max-h-[300px]",
      },
      {
        scrollable: true,
        size: "lg",
        class: "max-h-[400px]",
      },
      {
        scrollable: true,
        size: "xl",
        class: "max-h-[500px]",
      },
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
  /** Alignment of footer content */
  align?: "left" | "center" | "right"
}

const DialogFooter = React.forwardRef<
  HTMLDivElement,
  DialogFooterProps
>(({ className, align = "right", children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center gap-4 px-4 py-3 bg-white border-t border-[rgba(9,28,66,0.1)] relative",
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
  /** Button type variant */
  variant?: "default" | "danger" | "success"
  /** Primary button text */
  primaryText?: string
  /** Secondary button text */
  secondaryText?: string
  /** Primary button click handler */
  onPrimaryClick?: () => void
  /** Secondary button click handler */
  onSecondaryClick?: () => void
  /** Show only primary button */
  primaryOnly?: boolean
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
        className="px-3 py-2 text-[13px] font-medium text-[#4b5976] bg-transparent hover:bg-black/5 rounded-md transition-colors leading-4"
      >
        {secondaryText}
      </button>
    )}
    <button
      type="button"
      onClick={onPrimaryClick}
      className={cn(
        "px-3 py-2 text-[13px] font-medium text-[#ebf1fd] rounded-md transition-colors leading-4",
        variant === "default" && "bg-[#2563eb] hover:bg-blue-700",
        variant === "danger" && "bg-red-600 hover:bg-red-700",
        variant === "success" && "bg-green-600 hover:bg-green-700"
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
      "text-sm font-[550] leading-5 tracking-[0.07px] text-[#192c4b]",
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
    className={cn("text-sm text-muted-foreground", className)}
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

export type {
  DialogContentProps,
  DialogHeaderProps,
  DialogBodyProps,
  DialogFooterProps,
  DialogFooterButtonSetProps,
}

