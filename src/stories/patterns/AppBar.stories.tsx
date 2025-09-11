import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { MemoryRouter, NavLink } from 'react-router-dom';
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

// Mock AppBar component for Storybook
const MockAppBar = ({ experimentsEnabled = false }: { experimentsEnabled?: boolean }) => {
  const mockNavigate = () => console.log('Navigate called');
  const mockSetTheme = (theme: string) => console.log('Theme changed to:', theme);

  const experimentNavItems = [
    { name: "Evaluation Sandbox", path: "/evaluation-sandbox" },
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
            <DynamoLogoTypeface />
            <div className="hidden md:block ml-4 mr-2 w-px h-4 bg-gray-300"></div>

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

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2">
              <span className="text-[13px] font-450 text-gray-600">Experiments</span>
              <Switch
                checked={experimentsEnabled}
                onCheckedChange={(checked) => console.log('Experiments:', checked)}
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
                <DropdownMenuItem onClick={() => mockSetTheme("light")}>
                  <Sun className="mr-2 h-4 w-4" />
                  Light Theme
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => mockSetTheme("dark")}>
                  <Moon className="mr-2 h-4 w-4" />
                  Dark Theme
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => mockSetTheme("system")}>
                  <Monitor className="mr-2 h-4 w-4" />
                  System Theme
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={() => mockNavigate()}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>

                <DropdownMenuSeparator />

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

// Create a simple wrapper that provides the necessary context
const AppBarWrapper = ({ experimentsEnabled = false }: { experimentsEnabled?: boolean }) => {
  return (
    <MemoryRouter initialEntries={['/ai-systems']}>
      <MockAppBar experimentsEnabled={experimentsEnabled} />
    </MemoryRouter>
  );
};

// Theme wrapper for stories that need specific theme override
const ThemeOverrideWrapper = ({ theme, children }: { theme: string, children: React.ReactNode }) => {
  return (
    <div className={theme === 'dark' ? 'dark' : theme === 'light' ? 'light' : ''}>
      {children}
    </div>
  );
};

const meta: Meta<typeof MockAppBar> = {
  title: 'Patterns/AppBar',
  component: MockAppBar,
  parameters: {
    layout: 'fullscreen',
  },
  // Direct story without docs
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <AppBarWrapper experimentsEnabled={false} />,
};

export const WithExperiments: Story = {
  render: () => <AppBarWrapper experimentsEnabled={true} />,
};


