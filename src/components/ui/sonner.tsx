import {
  CircleCheck,
  Info,
  LoaderCircle,
  OctagonX,
  TriangleAlert,
} from "lucide-react"
import { useTheme } from "@/components/patterns/theme-provider"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CircleCheck className="h-4 w-4 text-white" />,
        info: <Info className="h-5 w-5" />,
        warning: <TriangleAlert className="h-5 w-5" />,
        error: <OctagonX className="h-5 w-5" />,
        loading: <LoaderCircle className="h-5 w-5 animate-spin" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-gray-0 group-[.toaster]:text-foreground group-[.toaster]:border group-[.toaster]:border-gray-200 group-[.toaster]:shadow-lg rounded-lg",
          description: "group-[.toast]:text-gray-500 group-[.toast]:text-sm",
          actionButton:
            "group-[.toast]:bg-gray-0 group-[.toast]:text-gray-900 group-[.toast]:border group-[.toast]:border-gray-200 group-[.toast]:hover:bg-gray-50 group-[.toast]:font-medium group-[.toast]:rounded-md group-[.toast]:px-3 group-[.toast]:py-1.5",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          closeButton:
            "group-[.toast]:bg-transparent group-[.toast]:text-gray-400 group-[.toast]:border-0 group-[.toast]:hover:text-white",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
