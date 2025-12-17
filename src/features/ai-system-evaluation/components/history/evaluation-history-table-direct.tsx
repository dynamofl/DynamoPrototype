import { useState, useEffect } from 'react'
import { Loader2, CheckCircle2, XCircle, Trash2, MoreHorizontal } from 'lucide-react'
import { TestTubeIcon } from '@/assets/icons/test-tube-icon'
import { Checkbox } from '@/components/ui/checkbox'
import { CircularProgress } from '@/components/ui/circular-progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { EvaluationTest } from '@/features/evaluation/types/evaluation-test'
import { EvaluationHistoryFilters } from './evaluation-history-filters'
import type { EvaluationHistoryFilterState } from './evaluation-history-filters'

// Separate component for duration display to handle hooks properly
function TestDuration({ test }: { test: EvaluationTest }) {
  const [currentTime, setCurrentTime] = useState(Date.now())

  // Update time every second for pending and running tests
  useEffect(() => {
    if ((test.status === 'running' || test.status === 'pending') && test.startedAt) {
      const interval = setInterval(() => {
        setCurrentTime(Date.now())
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [test.status, test.startedAt])

  // For completed tests, show final duration
  if (test.status === 'completed' && test.startedAt && test.completedAt) {
    const start = new Date(test.startedAt).getTime()
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

  // For pending tests (generating prompts), show live duration
  if (test.status === 'pending' && test.startedAt) {
    const start = new Date(test.startedAt).getTime()
    const durationMs = currentTime - start
    const minutes = Math.floor(durationMs / 60000)
    const seconds = Math.floor((durationMs % 60000) / 1000)

    return (
      <span className="text-gray-600">
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </span>
    )
  }

  // For running tests, show live duration
  if (test.status === 'running' && test.startedAt) {
    const start = new Date(test.startedAt).getTime()
    const durationMs = currentTime - start
    const minutes = Math.floor(durationMs / 60000)
    const seconds = Math.floor((durationMs % 60000) / 1000)

    return (
      <span className="text-gray-900">
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </span>
    )
  }

  return <span className="text-gray-500">-</span>
}

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
  onTestDetails,
  onDelete
}: EvaluationHistoryTableDirectProps) {
  // Filter state
  const [filters, setFilters] = useState<EvaluationHistoryFilterState>({
    status: [],
    category: [],
    searchTerm: ''
  })

  const [filteredData, setFilteredData] = useState<EvaluationTest[]>(data)

  // Filter function for Evaluation Tests
  const filterEvaluationTests = (tests: EvaluationTest[], filters: EvaluationHistoryFilterState) => {
    return tests.filter(test => {
      // Status filter
      if (filters.status.length > 0) {
        if (!filters.status.includes(test.status)) {
          return false
        }
      }

      // Category filter
      if (filters.category.length > 0) {
        // Only match if test has a type and it's in the filter
        if (!test.type || !filters.category.includes(test.type)) {
          return false
        }
      }

      // Search term filter
      if (filters.searchTerm && filters.searchTerm.trim() !== '') {
        const searchTerm = filters.searchTerm.toLowerCase()
        const searchableText = [
          test.name,
          test.type,
          test.status
        ].filter(Boolean).join(' ').toLowerCase()

        if (!searchableText.includes(searchTerm)) {
          return false
        }
      }

      return true
    })
  }

  // Apply filters when data or filters change
  useEffect(() => {
    const filtered = filterEvaluationTests(data, filters)
    setFilteredData(filtered)
  }, [data, filters])

  // Handle filters change
  const handleFiltersChange = (newFilters: EvaluationHistoryFilterState) => {
    setFilters(newFilters)
  }

  const allSelected = filteredData.length > 0 && selectedRows.length === filteredData.length
  const someSelected = selectedRows.length > 0 && selectedRows.length < filteredData.length

  const renderStatus = (test: EvaluationTest) => {
    // For running status, show circular progress if progress data is available
    if (test.status === 'running' && test.progress) {
      // Use checkpoint-aware percentage if available, otherwise calculate from current/total
      const progressValue = test.progress.percentage !== undefined
        ? test.progress.percentage
        : (test.progress.total > 0 ? (test.progress.current / test.progress.total) * 100 : 0)

      return (
        <div className="flex items-center gap-2">
          <CircularProgress
            value={progressValue}
            size={16}
            strokeWidth={2}
            color="text-blue-600"
          />
          <span>Running ({test.progress.current}/{test.progress.total})</span>
        </div>
      )
    }

    const statusConfig = {
      completed: {
        icon: CheckCircle2,
        color: 'text-green-600',
        label: 'Completed'
      },
      running: {
        icon: Loader2,
        color: 'text-blue-600',
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
        label: 'Preparing'
      },
      cancelled: {
        icon: XCircle,
        color: 'text-amber-600',
        label: 'Stopped'
      }
    }

    const config = statusConfig[test.status] || statusConfig.pending
    const Icon = config.icon

    return (
      <div className="flex items-center gap-2">
        <Icon className={`w-4 h-4 ${config.color} ${test.status === 'running' || test.status === 'pending' ? 'animate-spin' : ''}`} />
        <span>{config.label}</span>
      </div>
    )
  }

  const renderCategory = (test: EvaluationTest) => {
    if (!test.type) {
      return (
        <Badge variant="secondary" className="bg-gray-200 text-gray-600">
          Unknown
        </Badge>
      )
    }

    const categoryLabel = test.type === 'compliance' ? 'Compliance' : 'Jailbreak'

    return (
      <Badge variant="secondary">
        {categoryLabel}
      </Badge>
    )
  }


  return (
    <div>
      {/* Filters */}
      <EvaluationHistoryFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
      />

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

              <TableHead className="font-450 text-gray-700">Name</TableHead>
              <TableHead className="font-450 text-gray-700">Category</TableHead>
              <TableHead className="min-w-[180px] font-450 text-gray-700">Status</TableHead>
              <TableHead className="font-450 text-gray-700">Test Runtime</TableHead>
              <TableHead className="font-450 text-gray-700">Created At</TableHead>
              <TableHead className="w-[180px] font-450 text-gray-700 text-right"></TableHead>
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
               
                <TableCell
                  className="font-450 text-gray-900 cursor-pointer group/name"
                  onClick={(e) => {
                    e.stopPropagation()
                    // Trigger appropriate action based on status
                    if (test.status === 'completed') {
                      onViewReport(test)
                    } else if (test.status === 'pending' || test.status === 'running' || test.status === 'cancelled') {
                      onShowProgress(test)
                    } else if (test.status === 'failed') {
                      onTestDetails(test)
                    }
                  }}
                >
                  <span className="truncate group-hover/name:underline">{test.name}</span>
                </TableCell>
                <TableCell>
                  {renderCategory(test)}
                </TableCell>
                <TableCell>
                  {renderStatus(test)}
                </TableCell>
                <TableCell>
                  <TestDuration test={test} />
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
                <TableCell className="text-right">
                  <div className="flex items-center gap-1 justify-end">
                    {/* Action button based on status */}
                    {test.status === 'completed' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          onViewReport(test)
                        }}
                        className=""
                      >
                        View Result
                      </Button>
                    )}
                    {test.status === 'pending' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          onShowProgress(test)
                        }}
                        className=""
                      >
                        View Progress
                      </Button>
                    )}
                    {test.status === 'running' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          onShowProgress(test)
                        }}
                        className=""
                      >
                        View Progress
                      </Button>
                    )}
                    {test.status === 'cancelled' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          onShowProgress(test)
                        }}
                        className=""
                      >
                        View Progress
                      </Button>
                    )}
                    {test.status === 'failed' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          onTestDetails(test)
                        }}
                        className=""
                      >
                        View Details
                      </Button>
                    )}
                    {/* More menu with delete option */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className=""
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[160px]">
                        {onDelete && (
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              onDelete(test)
                            }}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="mr-3 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
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
