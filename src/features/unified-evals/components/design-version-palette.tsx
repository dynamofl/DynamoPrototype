import { Palette } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { DesignVersion } from '../hooks/useDesignVersion'

interface DesignVersionPaletteProps {
  version: DesignVersion
  onChange: (next: DesignVersion) => void
}

export function DesignVersionPalette({ version, onChange }: DesignVersionPaletteProps) {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="icon"
            variant="default"
            aria-label="Switch Design Version"
            className="h-12 w-12 rounded-full shadow-lg"
          >
            <Palette className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" side="top" className="w-48">
          <DropdownMenuLabel className="text-xs font-[450] text-gray-500">
            Design Version
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup
            value={version}
            onValueChange={(value) => onChange(value as DesignVersion)}
          >
            <DropdownMenuRadioItem value="v1">Version 1</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="v2">Version 2</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
