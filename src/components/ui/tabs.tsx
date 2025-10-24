import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { motion, LayoutGroup } from "framer-motion"

import { cn } from "@/lib/utils"

// Context to provide unique layout group ID for each tabs instance
const TabsLayoutIdContext = React.createContext<string>("")

// Generate unique ID for each tabs group
let tabsIdCounter = 0
const generateTabsId = () => `tabs-${++tabsIdCounter}`

const Tabs = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root>
>((props, ref) => {
  const layoutId = React.useMemo(() => generateTabsId(), [])

  return (
    <TabsLayoutIdContext.Provider value={layoutId}>
      <LayoutGroup id={layoutId}>
        <TabsPrimitive.Root ref={ref} {...props} />
      </LayoutGroup>
    </TabsLayoutIdContext.Provider>
  )
})
Tabs.displayName = TabsPrimitive.Root.displayName

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-9 items-center justify-center rounded-full bg-gray-100 p-1 text-muted-foreground",
      className
    )}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => {
  const layoutId = React.useContext(TabsLayoutIdContext)
  const triggerRef = React.useRef<HTMLButtonElement>(null)
  const [isActive, setIsActive] = React.useState(false)

  React.useImperativeHandle(ref, () => triggerRef.current!)

  // Observe data-state attribute changes to detect active state
  React.useEffect(() => {
    const element = triggerRef.current
    if (!element) return

    const updateActiveState = () => {
      setIsActive(element.getAttribute('data-state') === 'active')
    }

    // Check initial state
    updateActiveState()

    // Observe attribute changes
    const observer = new MutationObserver(updateActiveState)
    observer.observe(element, {
      attributes: true,
      attributeFilter: ['data-state']
    })

    return () => observer.disconnect()
  }, [])

  return (
    <TabsPrimitive.Trigger
      ref={triggerRef}
      className={cn(
        "relative inline-flex items-center justify-center whitespace-nowrap rounded-full px-3 py-1 text-[0.8125rem] font-450 ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:text-foreground",
        className
      )}
      {...props}
    >
      {isActive && (
        <motion.div
          layoutId={`bubble-${layoutId}`}
          className="absolute inset-0 bg-gray-0 shadow-md border border-gray-200 rounded-full z-0"
          initial={false}
           transition={{ duration: 0.2, ease: "easeInOut" }}
        />
      )}
      <span className="relative z-10">{props.children}</span>
    </TabsPrimitive.Trigger>
  )
})
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
