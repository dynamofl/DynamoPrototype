import { useState, useEffect } from 'react'
import { Eye, Loader2, CheckCircle2, XCircle, Trash2 } from 'lucide-react'
import { TestTubeIcon } from '@/assets/icons/test-tube-icon'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import type { EvaluationTest } from '../types/evaluation-test'

interface EvaluationHistoryTableDirectProps {
  data: EvaluationTest[]
  selectedRows?: string[]
  onRowSelect?: (id: string, selected: boolean) => void
  onSelectAll?: (selected: boolean) => void
  onViewReport: (test: EvaluationTest) => void
  onViewData: (test: EvaluationTest) => void
  onShowProgress: (test: EvaluationTest) => void
  onTestDetails: (test: EvaluationTest) => void
  onDelete?: (test: EvaluationTest) => void
}

export function EvaluationHistoryTableDirect({
  data,
  selectedRows = [],
  onRowSelect,
  onSelectAll,
  onViewReport,
  onShowProgress,
  onDelete
}: EvaluationHistoryTableDirectProps) {
  const [filteredData, setFilteredData] = useState<EvaluationTest[]>(data)

  // Apply filters when data changes
  useEffect(() => {
    setFilteredData(data)
  }, [data])

  const allSelected = filteredData.length > 0 && selectedRows.length === filteredData.length
  const someSelected = selectedRows.length > 0 && selectedRows.length < filteredData.length

  const renderStatus = (test: EvaluationTest) => {
    const statusConfig = {
      completed: {
        icon: CheckCircle2,
        color: 'text-green-600',
        label: 'Completed'
      },
      running: {
        icon: Loader2,
        color: 'text-amber-600',
        label: 'Running'
      },
      failed: {
        icon: XCircle,
        color: 'text-red-600',
        label: 'Failed'
      },
      pending: {
        icon: Loader2,
        color: 'text-gray-400',
        label: 'Pending'
      }
    }

    const config = statusConfig[test.status] || statusConfig.pending
    const Icon = config.icon

    return (
      <div className="flex items-center gap-2">
        <Icon className={`w-4 h-4 ${config.color} ${test.status === 'running' ? 'animate-spin' : ''}`} />
        <span>{config.label}</span>
      </div>
    )
  }

  const renderCategory = (test: EvaluationTest) => {
    // Extract category from config (candidateModel)
    const category = test.config?.candidateModel || 'gpt-4'

    return (
      <span className="text-gray-900">
        {category}
      </span>
    )
  }

  const renderDuration = (test: EvaluationTest) => {
    if (!test.createdAt || !test.completedAt) {
      return <span className="text-gray-500">-</span>
    }

    const start = new Date(test.createdAt).getTime()
    const end = new Date(test.completedAt).getTime()
    const durationMs = end - start
    const minutes = Math.floor(durationMs / 60000)
    const seconds = Math.floor((durationMs % 60000) / 1000)

    return (
      <span className="">
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </span>
    )
  }

  return (
    <div>
      <div className="px-4">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="w-12">
                {onSelectAll && (
                  <div className="flex items-center justify-center">
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={(checked) => onSelectAll(!!checked)}
                      className={someSelected ? 'data-[state=indeterminate]:bg-primary' : 'border-gray-400'}
                    />
                  </div>
                )}
              </TableHead>
              <TableHead className="w-8 pr-[0px]">
                <TestTubeIcon className="h-4 w-4 text-gray-500" />
              </TableHead>
              <TableHead className="font-450 text-gray-700">Name</TableHead>
              <TableHead className="font-450 text-gray-700">Category</TableHead>
              <TableHead className="font-450 text-gray-700">Status</TableHead>
              <TableHead className="font-450 text-gray-700">Duration</TableHead>
              <TableHead className="font-450 text-gray-700">Created At</TableHead>
              <TableHead className="w-[160px] font-450 text-gray-700">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((test, index) => (
              <TableRow
                key={test.id}
                className={`group transition-colors cursor-pointer ${
                  selectedRows.includes(test.id)
                    ? 'bg-blue-50 hover:bg-blue-100'
                    : 'hover:bg-gray-50'
                }`}
              >
                <TableCell>
                  {onRowSelect ? (
                    <div className="flex items-center justify-center relative">
                      {/* Row number - shown by default, hidden on hover unless selected */}
                      <span
                        className={`text-gray-500 transition-opacity ${
                          selectedRows.includes(test.id)
                            ? 'opacity-0'
                            : 'group-hover:opacity-0 opacity-100'
                        }`}
                      >
                        {index + 1}
                      </span>

                      {/* Checkbox - shown on hover or when selected */}
                      <div
                        className={`absolute flex items-center justify-center transition-opacity ${
                          selectedRows.includes(test.id)
                            ? 'opacity-100'
                            : 'group-hover:opacity-100 opacity-0'
                        }`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Checkbox
                          checked={selectedRows.includes(test.id)}
                          onCheckedChange={(checked) => onRowSelect(test.id, !!checked)}
                          className='border-gray-400'
                        />
                      </div>
                    </div>
                  ) : null}
                </TableCell>
                <TableCell className='pr-[0px]'>
                  <TestTubeIcon className="w-4 h-4 text-gray-500" />
                </TableCell>
                <TableCell className="font-450 text-gray-900">
                  <span className="truncate">{test.name}</span>
                </TableCell>
                <TableCell>
                  {renderCategory(test)}
                </TableCell>
                <TableCell>
                  {renderStatus(test)}
                </TableCell>
                <TableCell>
                  {renderDuration(test)}
                </TableCell>
                <TableCell>
                  <span className="">
                    {test.createdAt ? new Date(test.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    }) : '-'}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {test.status === 'completed' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          onViewReport(test)
                        }}
                        className="h-8 px-2 text-gray-700 hover:text-gray-900"
                      >
                        <Eye className="h-4 w-4 mr-1.5" />
                        View
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          onDelete(test)
                        }}
                        className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 mr-1.5" />
                        Delete
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filteredData.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No evaluation tests found. Run your first evaluation to get started.
          </div>
        )}
      </div>
    </div>
  )
}
