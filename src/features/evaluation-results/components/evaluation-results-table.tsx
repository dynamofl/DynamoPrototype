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
import type { EvaluationRecord } from '../types'
import Severity1Icon from '@/assets/icons/Severity1.svg'
import Severity2Icon from '@/assets/icons/Severity2.svg'
import Severity3Icon from '@/assets/icons/Severity3.svg'
import BlockIcon from '@/assets/icons/Block.svg'
import StatusCompleteIcon from '@/assets/icons/StatusComplete.svg'

interface EvaluationResultsTableProps {
  data: EvaluationRecord[]
  selectedRows: string[]
  onRowSelect: (id: string, selected: boolean) => void
  onSelectAll: (selected: boolean) => void
  onRowClick?: (record: EvaluationRecord) => void
}

export function EvaluationResultsTable({
  data,
  selectedRows,
  onRowSelect,
  onSelectAll,
  onRowClick
}: EvaluationResultsTableProps) {
  const allSelected = data.length > 0 && selectedRows.length === data.length
  const someSelected = selectedRows.length > 0 && selectedRows.length < data.length

  const renderGuardrailJudgment = (_: EvaluationRecord['inputGuardrails'], aggregate: string) => (
    <div className="flex items-center gap-2">
      {aggregate === 'Blocked' ? 
        <img src={BlockIcon} alt="Blocked" className="w-4 h-4 text-red-600" style={{ filter: 'brightness(0) saturate(100%) invert(25%) sepia(85%) saturate(5963%) hue-rotate(346deg) brightness(93%) contrast(90%)' }} /> :
        <img src={StatusCompleteIcon} alt="Allowed" className="w-4 h-4 text-green-600" style={{ filter: 'brightness(0) saturate(100%) invert(39%) sepia(80%) saturate(1969%) hue-rotate(96deg) brightness(96%) contrast(95%)' }} />
      }
      <span className="text-sm">{aggregate}</span>
    </div>
  )

  const renderAISystemJudgment = (responseType: string) => (
    <div className="flex items-center gap-2">
      {responseType === 'Blocked' ? 
        <img src={BlockIcon} alt="Blocked" className="w-4 h-4 text-red-600" style={{ filter: 'brightness(0) saturate(100%) invert(25%) sepia(85%) saturate(5963%) hue-rotate(346deg) brightness(93%) contrast(90%)' }} /> :
        <img src={StatusCompleteIcon} alt="Answer" className="w-4 h-4 text-green-600" style={{ filter: 'brightness(0) saturate(100%) invert(39%) sepia(80%) saturate(1969%) hue-rotate(96deg) brightness(96%) contrast(95%)' }} />
      }
      <span className="text-sm">{responseType}</span>
    </div>
  )

  const renderAttackOutcome = (outcome: string) => (
    <Badge 
      variant="secondary" 
      className={`text-xs ${
        outcome === 'Attack Failed' 
          ? 'bg-green-100 text-green-800 border-green-200' 
          : 'bg-red-100 text-red-800 border-red-200'
      }`}
    >
      {outcome}
    </Badge>
  )

  const getSeverityIcon = (severity: number) => {
    // Use only severity-based icons for attack type column with red color variations
    switch (severity) {
      case 1:
        return <img src={Severity1Icon} alt="Severity 1" className="w-4 h-4" style={{ filter: 'brightness(0) saturate(100%) invert(44%) sepia(91%) saturate(2372%) hue-rotate(338deg) brightness(95%) contrast(93%)' }} />
      case 2:
        return <img src={Severity2Icon} alt="Severity 2" className="w-4 h-4" style={{ filter: 'brightness(0) saturate(100%) invert(25%) sepia(85%) saturate(5963%) hue-rotate(346deg) brightness(93%) contrast(90%)' }} />
      case 3:
        return <img src={Severity3Icon} alt="Severity 3" className="w-4 h-4" style={{ filter: 'brightness(0) saturate(100%) invert(11%) sepia(95%) saturate(7496%) hue-rotate(349deg) brightness(93%) contrast(104%)' }} />
      default:
        // Default to severity 1 if no severity or invalid severity
        return <img src={Severity1Icon} alt="Severity 1" className="w-4 h-4" style={{ filter: 'brightness(0) saturate(100%) invert(44%) sepia(91%) saturate(2372%) hue-rotate(338deg) brightness(95%) contrast(93%)' }} />
    }
  }

  return (
    <div className="px-4">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
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
            <TableHead className="font-450">Attack Area</TableHead>
            <TableHead className="font-450">Attack Type</TableHead>
            <TableHead className="font-450">Guardrail Judgement</TableHead>
            <TableHead className="font-450">AI System Judgement</TableHead>
            <TableHead className="font-450">Attack Outcome</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((record, index) => (
            <TableRow 
              key={record.id} 
              onClick={() => onRowClick?.(record)}
              className={`group transition-colors cursor-pointer ${
                selectedRows.includes(record.id) 
                  ? 'bg-blue-50 hover:bg-blue-100' 
                  : 'hover:bg-gray-50'
              }`}
            >
              <TableCell>
                <div className="flex items-center justify-center relative">
                  {/* Row number - shown by default, hidden on hover unless selected */}
                  <span 
                    className={`text-sm text-gray-500 transition-opacity ${
                      selectedRows.includes(record.id) 
                        ? 'opacity-0' 
                        : 'group-hover:opacity-0 opacity-100'
                    }`}
                  >
                    {index + 1}
                  </span>
                  
                  {/* Checkbox - shown on hover or when selected, positioned to match header */}
                  <div 
                    className={`absolute flex items-center justify-center transition-opacity ${
                      selectedRows.includes(record.id) 
                        ? 'opacity-100' 
                        : 'group-hover:opacity-100 opacity-0'
                    }`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Checkbox
                      checked={selectedRows.includes(record.id)}
                      onCheckedChange={(checked) => onRowSelect(record.id, !!checked)}
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
                <Badge variant="secondary" className="text-xs">
                  {record.attackArea}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {getSeverityIcon(record.severity)}
                  <span className="text-sm">{record.attackType}</span>
                </div>
              </TableCell>
              <TableCell>
                {renderGuardrailJudgment(record.inputGuardrails, record.inputGuardrailResultAggregate)}
              </TableCell>
              <TableCell>
                {renderAISystemJudgment(record.aiSystemResponseType)}
              </TableCell>
              <TableCell>
                {renderAttackOutcome(record.attackOutcome)}
              </TableCell>
            </TableRow>
          ))}
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