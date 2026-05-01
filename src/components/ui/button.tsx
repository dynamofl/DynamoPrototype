import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  " inline-flex items-center justify-center whitespace-nowrap text-[0.8125rem]  font-450 ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-3.5 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-gray-50 hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border bg-gray-0 border-input bg-gray-0 hover:bg-gray-100/50 hover:text-accent-foreground",
        secondary:
          "bg-gray-100 text-gray-950 hover:bg-gray-100/80",
        ghost: "hover:bg-gray-100 hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        subtle: "bg-gray-200 text-gray-950 hover:text-gray-800",
        new: "outline-dashed outline-1 outline-gray-400 text-gray-600 hover:shadow-md transition-all duration-150",
      },
      size: {
        default: "h-8 px-3 py-0.5 rounded-[.6rem]",
        sm: "min-h-6 px-2.5 py-0.5 rounded-[.5rem]",
        lg: "h-10 px-8 rounded-[.75rem]",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
