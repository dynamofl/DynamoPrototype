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
import { Badge } from '@/components/ui/badge'
import type { JailbreakEvaluationResult } from '../../../types/jailbreak-evaluation'
import BlockIcon from '@/assets/icons/Block.svg'
import StatusCompleteIcon from '@/assets/icons/StatusComplete.svg'

interface EvaluationDataTableProps {
  data: JailbreakEvaluationResult[]
  selectedRows: string[]
  onRowSelect: (id: string, selected: boolean) => void
  onSelectAll: (selected: boolean) => void
  onRowClick?: (record: JailbreakEvaluationResult) => void
  hasGuardrails?: boolean
}

export function EvaluationDataTable({
  data,
  selectedRows,
  onRowSelect,
  onSelectAll,
  onRowClick,
  hasGuardrails = true
}: EvaluationDataTableProps) {
  const allSelected = data.length > 0 && selectedRows.length === data.length
  const someSelected = selectedRows.length > 0 && selectedRows.length < data.length

  const renderGuardrailJudgment = (judgment: string) => (
    <div className="flex items-center gap-2">
      {judgment === 'Blocked' ?
        <img src={BlockIcon} alt="Blocked" className="w-4 h-4 text-red-600" style={{ filter: 'brightness(0) saturate(100%) invert(25%) sepia(85%) saturate(5963%) hue-rotate(346deg) brightness(93%) contrast(90%)' }} /> :
        <img src={StatusCompleteIcon} alt="Allowed" className="w-4 h-4 text-green-600" style={{ filter: 'brightness(0) saturate(100%) invert(39%) sepia(80%) saturate(1969%) hue-rotate(96deg) brightness(96%) contrast(95%)' }} />
      }
      <span className="">{judgment}</span>
    </div>
  )

  const renderModelJudgment = (judgment: string) => (
    <div className="flex items-center gap-2">
      {judgment === 'Blocked' ?
        <img src={BlockIcon} alt="Blocked" className="w-4 h-4 text-red-600" style={{ filter: 'brightness(0) saturate(100%) invert(25%) sepia(85%) saturate(5963%) hue-rotate(346deg) brightness(93%) contrast(90%)' }} /> :
        <img src={StatusCompleteIcon} alt="Answered" className="w-4 h-4 text-green-600" style={{ filter: 'brightness(0) saturate(100%) invert(39%) sepia(80%) saturate(1969%) hue-rotate(96deg) brightness(96%) contrast(95%)' }} />
      }
      <span className="">{judgment}</span>
    </div>
  )

  const renderAttackOutcome = (outcome: string) => (
    <Badge
      variant="secondary"
      className={`text-xs ${
        outcome === 'Attack Failure'
          ? 'bg-green-50 text-green-800'
          : 'bg-red-50 text-red-800'
      }`}
    >
      {outcome}
    </Badge>
  )

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
            <TableHead className="w-8 pr-[0px]"><MessagesSquare className="h-4 w-4 text-gray-500" strokeWidth="2" /></TableHead>
            <TableHead className="font-450">Test Conversations</TableHead>
            <TableHead className="font-450">Behavior Type</TableHead>
            <TableHead className="font-450">Attack Type</TableHead>
            {hasGuardrails && <TableHead className="font-450">Guardrail Judgement</TableHead>}
            <TableHead className="font-450">Model Judgement</TableHead>
            <TableHead className="font-450">Attack Outcome</TableHead>
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
                    {/* Row number - shown by default, hidden on hover unless selected */}
                    <span
                      className={` text-gray-500 transition-opacity ${
                        selectedRows.includes(recordWithId.id)
                          ? 'opacity-0'
                          : 'group-hover:opacity-0 opacity-100'
                      }`}
                    >
                      {index + 1}
                    </span>

                    {/* Checkbox - shown on hover or when selected, positioned to match header */}
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
                <TableCell className="font-450 text-gray-900">
                  <div className="truncate max-w-md group-hover:underline" title={record.basePrompt}>
                    {record.basePrompt}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {record.behaviorType}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="">{record.attackType}</span>
                </TableCell>
                {hasGuardrails && (
                  <TableCell>
                    {renderGuardrailJudgment(record.guardrailJudgement)}
                  </TableCell>
                )}
                <TableCell>
                  {renderModelJudgment(record.modelJudgement)}
                </TableCell>
                <TableCell>
                  {renderAttackOutcome(record.attackOutcome)}
                </TableCell>
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
