// Generic Evaluation Table Component
// Uses strategy pattern to render different test types (jailbreak, compliance, etc.)

import { MessagesSquare } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { EvaluationStrategy } from '../../../strategies/base-strategy'
import type { BaseEvaluationResult } from '../../../types/base-evaluation'

interface GenericEvaluationTableProps {
  data: BaseEvaluationResult[]
  strategy: EvaluationStrategy
  selectedRows: string[]
  onRowSelect: (id: string, selected: boolean) => void
  onSelectAll: (selected: boolean) => void
  onRowClick?: (record: BaseEvaluationResult) => void
  hasGuardrails?: boolean
}

export function GenericEvaluationTable({
  data,
  strategy,
  selectedRows,
  onRowSelect,
  onSelectAll,
  onRowClick,
  hasGuardrails = true
}: GenericEvaluationTableProps) {
  const allSelected = data.length > 0 && selectedRows.length === data.length
  const someSelected = selectedRows.length > 0 && selectedRows.length < data.length

  // Check if any records have input/output guardrail judgements or details
  const hasInputGuardrails = data.some(record => {
    const r = record as any
    const hasInput = (r.inputGuardrailJudgement !== null && r.inputGuardrailJudgement !== undefined) ||
           (r.input_guardrail_judgement !== null && r.input_guardrail_judgement !== undefined) ||
           (r.inputGuardrailDetails && r.inputGuardrailDetails.length > 0)
    return hasInput
  })
  const hasOutputGuardrails = data.some(record => {
    const r = record as any
    const hasOutput = (r.outputGuardrailJudgement !== null && r.outputGuardrailJudgement !== undefined) ||
           (r.output_guardrail_judgement !== null && r.output_guardrail_judgement !== undefined) ||
           (r.outputGuardrailDetails && r.outputGuardrailDetails.length > 0)
    return hasOutput
  })

  // Get column configuration from strategy
  const columns = strategy.getTableColumns({ hasInputGuardrails, hasOutputGuardrails })

  return (
    <div className="px-4">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50 border-0">
            <TableHead className="w-12">
              <div className="flex items-center justify-center">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={(checked) => onSelectAll(!!checked)}
                  className={someSelected ? 'data-[state=indeterminate]:bg-primary' : 'border-gray-400'}
                />
              </div>
            </TableHead>
            <TableHead className="w-8 pr-[0px]">
              <MessagesSquare className="h-4 w-4 text-gray-500" strokeWidth="2" />
            </TableHead>
            {columns.map((column) => (
              <TableHead key={column.key} className={`font-450 ${column.className || ''}`} style={{ width: column.width }}>
                {column.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((record, index) => {
            const recordWithId = record as any
            return (
              <TableRow
                key={recordWithId.id}
                onClick={() => onRowClick?.(record)}
                className={`group transition-colors cursor-pointer ${
                  selectedRows.includes(recordWithId.id)
                    ? 'bg-blue-50 hover:bg-blue-100'
                    : 'hover:bg-gray-50'
                }`}
              >
                <TableCell>
                  <div className="flex items-center justify-center relative">
                    <span
                      className={`text-gray-500 transition-opacity ${
                        selectedRows.includes(recordWithId.id)
                          ? 'opacity-0'
                          : 'group-hover:opacity-0 opacity-100'
                      }`}
                    >
                      {index + 1}
                    </span>

                    <div
                      className={`absolute flex items-center justify-center transition-opacity ${
                        selectedRows.includes(recordWithId.id)
                          ? 'opacity-100'
                          : 'group-hover:opacity-100 opacity-0'
                      }`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Checkbox
                        checked={selectedRows.includes(recordWithId.id)}
                        onCheckedChange={(checked) => onRowSelect(recordWithId.id, !!checked)}
                        className='border-gray-400'
                      />
                    </div>
                  </div>
                </TableCell>
                <TableCell className='pr-[0px]'>
                  <MessagesSquare className="h-4 w-4 text-gray-500" strokeWidth="2" />
                </TableCell>
                {columns.map((column) => (
                  <TableCell key={column.key} className={column.className || ''}>
                    {column.render(record)}
                  </TableCell>
                ))}
              </TableRow>
            )
          })}
        </TableBody>
      </Table>

      {data.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No evaluation results found
        </div>
      )}
    </div>
  )
}
