import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Settings, LogOut, Sun, Moon, Monitor, ArrowLeftRight } from 'lucide-react'
import { useTheme } from '@/components/patterns/theme-provider'
import { useVersionToggle } from '@/v2/hooks/useVersionToggle'
import { useNavigate } from 'react-router-dom'

export function ProfileDropdown() {
  const { setTheme } = useTheme()
  const { switchToV1 } = useVersionToggle()
  const navigate = useNavigate()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="w-8 h-8 bg-gray-200 hover:bg-gray-300 text-primary-foreground rounded-full p-0"
        >
          <span className="text-gray-800 font-450 text-[0.8125rem]">PK</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
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
        <DropdownMenuItem onClick={() => navigate('/settings')}>
          <Settings className="mr-2 h-4 w-4" strokeWidth={2} />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={switchToV1}>
          <ArrowLeftRight className="mr-2 h-4 w-4" strokeWidth={2} />
          Switch to Classic View
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive focus:text-destructive">
          <LogOut className="mr-2 h-4 w-4" strokeWidth={2} />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
