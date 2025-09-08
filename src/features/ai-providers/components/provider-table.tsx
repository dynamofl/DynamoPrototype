/**
 * ProviderTable component for displaying AI providers in a table
 */

import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Filter, Download } from 'lucide-react'
import { TablePattern } from '@/components/patterns'
import { ModelsListSlot } from '@/components/patterns/slot'
import { 
  aiProvidersStorageConfig,
  aiProvidersColumns,
  aiProvidersExpandableConfig,
  aiProvidersPaginationConfig,
  AIProvidersTableStorage
} from '../lib'
import type { TableRow } from '@/types/table'

export interface ProviderTableProps {
  onCellAction: (action: string, row: TableRow) => void
  onRowExpand: (rowId: string, expanded: boolean) => void
  onDataChange: (data: TableRow[]) => void
}

export function ProviderTable({ 
  onCellAction, 
  onRowExpand, 
  onDataChange 
}: ProviderTableProps) {
  // Custom expandable content renderer using Slot component
  const renderExpandableContent = (row: TableRow) => {
    const models = row.models || []
    
    return (
      <ModelsListSlot
        models={models}
        lastFetched={row.modelsLastFetched}
        emptyMessage="No text models fetched yet"
      />
    )
  }

  return (
    <div className="space-y-4">
      {/* Header Actions */}
      <div className="flex items-center justify-between px-6">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search AI providers..."
              className="pl-8 w-[300px]"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            Edit Columns
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Table */}
      <TablePattern
        mode="view"
        columns={aiProvidersColumns}
        storageConfig={aiProvidersStorageConfig}
        pagination={aiProvidersPaginationConfig}
        expandable={{
          ...aiProvidersExpandableConfig,
          renderContent: renderExpandableContent
        }}
        onDataChange={onDataChange}
        onCellAction={onCellAction}
        onRowExpand={onRowExpand}
        className="border rounded-lg"
        emptyMessage="No AI providers configured. Add your first provider to get started."
      />
    </div>
  )
}
