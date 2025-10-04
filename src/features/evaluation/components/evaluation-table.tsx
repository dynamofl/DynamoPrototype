/**
 * Evaluation table component using the new table pattern
 */

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { TablePattern } from '@/components/patterns'
import { 
  evaluationStorageConfig,
  evaluationColumns,
  evaluationPaginationConfig,
  createDefaultEvaluationPrompt,
  validateEvaluationData
} from '../lib/evaluation-config'
import type { TableRow } from '@/types/table'

interface EvaluationTableProps {
  className?: string
  onDataChange?: (data: TableRow[]) => void
}

export function EvaluationTable({ className = '', onDataChange }: EvaluationTableProps) {
  const [data, setData] = useState<TableRow[]>([])

  // Handle cell actions
  const handleCellAction = (action: string, row: TableRow, index: number) => {
    switch (action) {
      case 'delete':
        // Handle delete action - prevent deleting if only one row left
        if (data.length > 1) {
          const newData = data.filter(item => item.id !== row.id)
          setData(newData)
          onDataChange?.(newData)
        }
        break
      default:
        console.log('Unknown action:', action)
    }
  }

  // Handle data changes
  const handleDataChange = (newData: TableRow[]) => {
    setData(newData)
    onDataChange?.(newData)
  }

  // Handle add new prompt
  const handleAddPrompt = () => {
    const newPrompt = createDefaultEvaluationPrompt()
    const newData = [...data, newPrompt]
    setData(newData)
    onDataChange?.(newData)
  }

  // Handle CSV import
  const handleCSVImport = (rows: any[], importType: 'valid' | 'invalid' | 'all') => {
    // Process CSV import logic here
    console.log('CSV import:', rows, importType)
  }

  // Validate data
  const validation = validateEvaluationData(data)
  const hasErrors = !validation.valid

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Evaluation Prompts</h2>
          <p className="text-[0.8125rem]  text-gray-600">
            Define prompts to test your AI models and guardrails
          </p>
          {hasErrors && (
            <div className="mt-2 text-[0.8125rem]  text-red-600">
              {validation.errors.map((error, index) => (
                <div key={index}>• {error}</div>
              ))}
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleCSVImport([], 'all')}>
            Import CSV
          </Button>
          <Button onClick={handleAddPrompt}>
            <Plus className="h-4 w-4 mr-2" />
            Add Prompt
          </Button>
        </div>
      </div>

      {/* Table */}
      <TablePattern
        mode="edit"
        columns={evaluationColumns}
        storageConfig={evaluationStorageConfig}
        pagination={evaluationPaginationConfig}
        onDataChange={handleDataChange}
        onCellAction={handleCellAction}
        className="border rounded-lg"
        emptyMessage="No evaluation prompts configured. Add your first prompt to get started."
      />

      {/* Summary */}
      <div className="flex items-center justify-between text-[0.8125rem]  text-gray-600">
        <div>
          Total prompts: {data.length}
        </div>
        <div>
          Complete prompts: {data.filter(p => p.prompt.trim() && p.userMarkedAdversarial).length}
        </div>
      </div>
    </div>
  )
}

