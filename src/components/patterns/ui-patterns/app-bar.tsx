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
import { cn } from "@/lib/utils"
import {
  Settings,
  LogOut,
  Sun,
  Moon,
  Monitor,
  FlaskConical,
} from "lucide-react"
import { useTheme } from '@/components/patterns/theme-provider'
import { NavLink, useNavigate } from 'react-router-dom'

export function AppBar() {
  const { setTheme } = useTheme()
  const navigate = useNavigate()

  // Main navigation items (always visible)
  const mainNavItems = [
    { name: "Projects", path: "/projects", icon: ProjectsIcon },
    { name: "AI Systems", path: "/ai-systems", icon: AISystemsIcon },
    { name: "Policies", path: "/guardrails", icon: PoliciesIcon },
  ]

  return (
    <header className="  backdrop-blur relative z-40">
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
                          "h-8 px-3 text-[13px] font-450 flex items-center gap-2 rounded-md transition-colors hover:bg-gray-200",
                          isActive
                            ? "text-gray-800"
                            : "text-gray-600"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        {item.name}
                      </NavLink>
                    </NavigationMenuItem>
                  )
                })}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Right side - Beta Features and Profile Dropdown */}
          <div className="flex items-center gap-4">
            {/* Beta Features Button */}
            <NavLink
              to="/beta-features"
              className={({ isActive }) => cn(
                "h-8 px-3 text-[13px] font-450 flex items-center gap-2 rounded-md transition-colors hover:bg-gray-200",
                isActive
                  ? "text-gray-800"
                  : "text-gray-600"
              )}
            >
              <FlaskConical className="h-4 w-4" />
              Beta Features
            </NavLink>

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
