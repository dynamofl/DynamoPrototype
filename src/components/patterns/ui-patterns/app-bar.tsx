import { DynamoLogoTypeface } from '@/assets/icons/dynamo-logo-typeface'
import { ProjectsIcon } from '@/assets/icons/projects-icon'
import { AISystemsIcon } from '@/assets/icons/ai-systems-icon'
import { PoliciesIcon } from '@/assets/icons/policies-icon'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
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
  Play,
  UserPlus,
  ChevronsUpDown,
} from "lucide-react"
import { useTheme } from '@/components/patterns/theme-provider'
import { NavLink, useNavigate, Link } from 'react-router-dom'

export interface BreadcrumbItem {
  name: string
  path: string
  current?: boolean
}

export interface AppBarActionButton {
  label: string
  onClick: () => void
  variant?: 'primary' | 'secondary'
  icon?: React.ReactNode
  disabled?: boolean
  loading?: boolean
}

export interface AppBarProps {
  variant?: 'default' | 'breadcrumb'
  // Breadcrumb mode props
  breadcrumbs?: BreadcrumbItem[]
  currentSection?: {
    name: string
    badge?: string
    dropdownOptions?: {
      id: string
      name: string
      isActive?: boolean
    }[]
    onDropdownSelect?: (id: string) => void
  }
  actionButtons?: AppBarActionButton[]
}

export function AppBar({
  variant = 'default',
  breadcrumbs = [],
  currentSection,
  actionButtons = [],
}: AppBarProps) {
  const { setTheme } = useTheme()
  const navigate = useNavigate()

  // Main navigation items (for default variant)
  const mainNavItems = [
    { name: "Projects", path: "/projects", icon: ProjectsIcon },
    { name: "AI Systems", path: "/ai-systems", icon: AISystemsIcon },
    { name: "Policies", path: "/guardrails", icon: PoliciesIcon },
  ]

  // Render left section based on variant
  const renderLeftSection = () => {
    if (variant === 'breadcrumb') {
      return (
        <div className="flex items-center gap-1  animate-in fade-in slide-in-from-right-2 duration-150">
          {/* Logo */}
          <Link to="/ai-systems" className="flex items-center pr-2 rounded-full hover:bg-gray-100">
            <DynamoLogoTypeface className="h-4" />
          </Link>

          {/* Separator */}
          <span className="text-gray-500 text-[0.8125rem]  font-450">/</span>

          {/* Breadcrumb Items */}
          {breadcrumbs.map((item, index) => (
            <div key={item.path} className="flex items-center gap-3 animate-in fade-in slide-in-from-right-2 duration-150" style={{ animationDelay: `${index * 50}ms` }}>
              {item.current ? (
                <span className="text-gray-600 text-[0.8125rem]  font-450">
                  {item.name}
                </span>
              ) : (
                <Link
                  to={item.path}
                  className="text-gray-600 text-[0.8125rem]  font-450 px-2 py-1.5 rounded-full hover:bg-gray-100"
                >
                  {item.name}
                </Link>
              )}
              {index < breadcrumbs.length - 1 && (
                <span className="text-gray-500 text-[0.8125rem]  font-450">/</span>
              )}
            </div>
          ))}

          {/* Current Section with Badge and Dropdown */}
          {currentSection && (
            <>
              <span className="text-gray-500 text-[0.8125rem]  font-450">/</span>
              {currentSection.dropdownOptions && currentSection.dropdownOptions.length > 0 ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div className="pl-2 flex items-center gap-1 animate-in fade-in slide-in-from-right-2 duration-150" style={{ animationDelay: `${breadcrumbs.length * 50}ms` }}>
                      <span className="text-gray-800 text-[0.8125rem] font-450 max-w-[200px] truncate">
                        {currentSection.name}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        Evaluation
                      </Badge>
                      {currentSection.badge && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[12px] font-[425] bg-gray-100 text-gray-800">
                          {currentSection.badge}
                        </span>
                      )}
                      <button className="p-0.5 hover:bg-gray-100 rounded transition-colors">
                        <ChevronsUpDown className="h-3.5 w-3.5 text-gray-500" />
                      </button>
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-64">
                    {currentSection.dropdownOptions.map((option) => (
                      <DropdownMenuItem
                        key={option.id}
                        onClick={() => currentSection.onDropdownSelect?.(option.id)}
                        className={option.isActive ? "bg-gray-100 font-medium" : ""}
                      >
                        {option.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center gap-1 animate-in fade-in slide-in-from-right-2 duration-150" style={{ animationDelay: `${breadcrumbs.length * 50}ms` }}>
                  <span className="text-gray-800 text-[0.8125rem] font-450 max-w-[200px] truncate">
                    {currentSection.name}
                  </span>
                  {currentSection.badge && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[12px] font-[425] bg-gray-100 text-gray-800">
                      {currentSection.badge}
                    </span>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )
    }

    // Default variant
    return (
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
                      "h-8 px-3 text-[0.8125rem]  font-450 flex items-center gap-2 rounded-full transition-colors hover:bg-gray-200",
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
    )
  }

  return (
    <header className={cn(
      "backdrop-blur relative z-40",
    )}>
      <div className="mx-auto px-6 py-2">
        <div className="flex items-center justify-between">
          {/* Left Section - Dynamic based on variant */}
          {renderLeftSection()}

          {/* Right side - Action Buttons, Beta Features and Profile Dropdown */}
          <div className="flex items-center gap-2">
            {/* Custom Action Buttons (for breadcrumb variant) */}
            {actionButtons.length > 0 && (
              <div className="flex items-center gap-2 pr-1">
                {actionButtons.map((button, index) => (
                  <Button
                    key={index}
                    onClick={button.onClick}
                    disabled={button.disabled || button.loading}
                    variant={button.variant === 'secondary' ? 'outline' : 'default'}
                    className={cn(
                      "h-7 px-2 text-[12px] font-450 flex items-center gap-2 animate-in fade-in duration-150 ",
                      button.variant === 'primary',
                      button.variant === 'secondary'
                    )}
                    style={{ animationDelay: `${index * 75}ms` }}
                  >
                    {button.icon}
                    {button.loading ? <Skeleton className="h-3 w-16" /> : button.label}
                  </Button>
                ))}
              </div>
            )}

            {/* Separator (if action buttons exist) */}
            {actionButtons.length > 0 && (
              <div className="h-4 w-px bg-gray-200" />
            )}

            {/* Beta Features Button - Same styling for both variants */}
            <NavLink
              to="/beta-features"
              className={({ isActive }) => cn(
                "h-8 px-3 text-[0.8125rem]  font-450 flex items-center gap-2 rounded-full transition-colors hover:bg-gray-200",
                isActive
                  ? "text-gray-800"
                  : "text-gray-600"
              )}
            >
              <FlaskConical className="h-4 w-4" />
              Beta Features
            </NavLink>

            {/* Profile Dropdown - Same styling for both variants */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-8 h-8 bg-gray-200 hover:bg-gray-300 text-primary-foreground rounded-full p-0"
                >
                  <span className="text-gray-800 font-450 text-[0.8125rem] ">
                    PK
                  </span>
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
