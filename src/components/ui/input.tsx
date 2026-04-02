import * as React from "react"

import { cn } from "@/lib/utils"

interface InputProps extends React.ComponentProps<"input"> {
  error?: string
  errorClassName?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, errorClassName, ...props }, ref) => {
    const hasError = !!error

    return (
      <div className="w-full">
        <input
          type={type}
          className={cn(
            "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h- w-full min-w-0 rounded-lg border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-[0.8125rem]  file:font-450 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-[0.8125rem] ",
            "focus-visible:border-ring focus-visible:border-gray-300 focus-visible:ring-gray-200 focus-visible:ring-[3px]",
            hasError && "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-200",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className={cn(
            "mt-1 text-[0.8125rem]  text-red-600",
            errorClassName
          )}>
            {error}
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
