import { DynamoLogoTypeface } from '@/assets/icons/dynamo-logo-typeface'
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import {
  Settings,
  LogOut,
  Sun,
  Moon,
  Monitor,
} from "lucide-react"
import { useTheme } from '@/components/patterns/theme-provider'
import { NavLink, useNavigate } from 'react-router-dom'
import { useExperimentsToggle } from '@/hooks/useExperimentsToggle'

export function AppBar() {
  const { setTheme } = useTheme()
  const navigate = useNavigate()
  const { experimentsEnabled, setExperiments } = useExperimentsToggle()

  // Navigation items based on experiments toggle
  const experimentNavItems = [
    { name: "Evaluation Sandbox", path: "/evaluation-sandbox" },
    { name: "Evaluation Results", path: "/evaluation-results" },
    { name: "AI Providers", path: "/ai-providers" },
    { name: "Policies", path: "/guardrails" },
  ]

  const standardNavItems = [
    { name: "AI Systems", path: "/ai-systems" },
    { name: "Policies", path: "/guardrails" },
  ]

  const currentNavItems = experimentsEnabled ? experimentNavItems : standardNavItems

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className=" mx-auto px-6 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {/* Logo */}
            
            <DynamoLogoTypeface />
            {/* Vertical Separator */}
            <div className="hidden md:block ml-4 mr-2 w-px h-4 bg-gray-300"></div>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {currentNavItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) => cn(
                    "inline-flex items-center px-2 py-1 rounded-md text-[13px] font-450 transition-colors hover:text-foreground relative",
                    isActive
                      ? "text-gray-800 bg-gray-100"
                      : "text-gray-600 hover:bg-gray-50"
                  )}
                >
                  {item.name}
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Right side - Experiments Toggle and Profile Dropdown */}
          <div className="flex items-center gap-4">
            {/* Experiments Toggle */}
            <div className="hidden md:flex items-center gap-2">
              <span className="text-[13px] font-450 text-gray-600">Experiments</span>
              <Switch
                checked={experimentsEnabled}
                onCheckedChange={setExperiments}
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
                  <Sun className="mr-2 h-4 w-4" />
                  Light Theme
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  <Moon className="mr-2 h-4 w-4" />
                  Dark Theme
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                  <Monitor className="mr-2 h-4 w-4" />
                  System Theme
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {/* Settings */}
                <DropdownMenuItem onClick={() => navigate('/settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {/* Sign Out */}
                <DropdownMenuItem className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
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
