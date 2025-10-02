/**
 * Reusable table actions component for search, filter, column management, and export
 */

import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Filter, Download } from 'lucide-react'

interface TableActionsProps {
  searchPlaceholder?: string
  onSearch?: (value: string) => void
  onFilter?: () => void
  onEditColumns?: () => void
  onExport?: () => void
  className?: string
}

export function TableActions({
  searchPlaceholder = "Search...",
  onSearch,
  onFilter,
  onEditColumns,
  onExport,
  className = ""
}: TableActionsProps) {
  const [searchValue, setSearchValue] = React.useState('')

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchValue(value)
    onSearch?.(value)
  }

  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className="flex items-center space-x-2">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-600" />
          <Input
            placeholder={searchPlaceholder}
            className="pl-8 w-[300px]"
            value={searchValue}
            onChange={handleSearchChange}
          />
        </div>
        <Button variant="outline" size="sm" onClick={onFilter}>
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
      </div>
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="sm" onClick={onEditColumns}>
          Edit Columns
        </Button>
        <Button variant="outline" size="sm" onClick={onExport}>
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>
    </div>
  )
}
