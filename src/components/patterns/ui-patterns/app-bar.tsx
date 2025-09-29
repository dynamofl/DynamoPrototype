import { DynamoLogoTypeface } from '@/assets/icons/dynamo-logo-typeface'
import { ProjectsIcon } from '@/assets/icons/projects-icon'
import { AISystemsIcon } from '@/assets/icons/ai-systems-icon'
import { PoliciesIcon } from '@/assets/icons/policies-icon'
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import {
  Settings,
  LogOut,
  Sun,
  Moon,
  Monitor,
  ChevronDown,
  FlaskConical,
} from "lucide-react"
import { useTheme } from '@/components/patterns/theme-provider'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useExperimentsToggle } from '@/hooks/useExperimentsToggle'

export function AppBar() {
  const { setTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const { experimentsEnabled, setExperiments } = useExperimentsToggle()

  // Routes that are only available when experiments are enabled
  const experimentOnlyRoutes = [
    '/evaluation-sandbox',
    '/evaluation-results', 
    '/ai-providers'
  ]

  // Handle experiments toggle with redirection logic
  const handleExperimentsToggle = (enabled: boolean) => {
    setExperiments(enabled)
    
    // If turning experiments off and user is on an experiment-only route, redirect to AI Systems
    if (!enabled) {
      const isOnExperimentRoute = experimentOnlyRoutes.some(route => 
        location.pathname.startsWith(route)
      )
      
      if (isOnExperimentRoute) {
        navigate('/ai-systems', { replace: true })
      }
    }
  }

  // Main navigation items (always visible)
  const mainNavItems = [
    { name: "Projects", path: "/projects", icon: ProjectsIcon },
    { name: "AI Systems", path: "/ai-systems", icon: AISystemsIcon },
    { name: "Policies", path: "/guardrails", icon: PoliciesIcon },
  ]

  // Beta features navigation item (only when experiments enabled)
  const betaFeaturesNavItem = { name: "Beta Features", path: "/beta-features", icon: FlaskConical }

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 relative z-40">
      <div className=" mx-auto px-6 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {/* Logo */}
            
            <DynamoLogoTypeface />
            {/* Vertical Separator */}
            <div className="hidden md:block ml-4 mr-2 w-px h-4 bg-gray-300"></div>

            {/* Navigation Links */}
            <NavigationMenu className="hidden md:flex">
              <NavigationMenuList>
                {/* Main navigation items */}
                {mainNavItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <NavigationMenuItem key={item.name}>
                      <NavLink
                        to={item.path}
                        className={({ isActive }) => cn(
                          navigationMenuTriggerStyle(),
                          "h-8 px-3 text-[13px] font-450 flex items-center gap-2",
                          isActive
                            ? "text-gray-800 bg-gray-100"
                            : "text-gray-600 hover:bg-gray-50"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        {item.name}
                      </NavLink>
                    </NavigationMenuItem>
                  )
                })}

                {/* Beta Features navigation item (only when experiments enabled) */}
                {experimentsEnabled && (
                  <NavigationMenuItem>
                    <NavLink
                      to={betaFeaturesNavItem.path}
                      className={({ isActive }) => cn(
                        navigationMenuTriggerStyle(),
                        "h-8 px-3 text-[13px] font-450 flex items-center gap-2",
                        isActive
                          ? "text-gray-800 bg-gray-100"
                          : "text-gray-600 hover:bg-gray-50"
                      )}
                    >
                      <FlaskConical className="h-4 w-4" />
                      {betaFeaturesNavItem.name}
                    </NavLink>
                  </NavigationMenuItem>
                )}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Right side - Experiments Toggle and Profile Dropdown */}
          <div className="flex items-center gap-4">
            {/* Experiments Toggle */}
            <div className="hidden md:flex items-center gap-2">
              <span className="text-[13px] font-450 text-gray-600">Experiments</span>
              <Switch
                checked={experimentsEnabled}
                onCheckedChange={handleExperimentsToggle}
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-8 h-8  bg-gray-200 hover:bg-gray-300 text-primary-foreground rounded-full p-0"
                >
                  <span className="text-gray-800 font-450 text-[13px]">PK</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {/* Theme Options */}
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  <Sun className="mr-2 h-4 w-4" strokeWidth={2} />
                  Light Theme
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  <Moon className="mr-2 h-4 w-4" strokeWidth={2} />
                  Dark Theme
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                  <Monitor className="mr-2 h-4 w-4" strokeWidth={2} />
                  System Theme
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {/* Settings */}
                <DropdownMenuItem onClick={() => navigate('/settings')}>
                  <Settings className="mr-2 h-4 w-4" strokeWidth={2} />
                  Settings
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {/* Sign Out */}
                <DropdownMenuItem className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" strokeWidth={2} />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}
