import React from 'react'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { JailbreakPaginationState } from '../../../types/evaluation-data-types'
import { PAGE_SIZE_OPTIONS } from '../../../constants/evaluation-data-constants'

interface EvaluationDataPaginationProps {
  pagination: JailbreakPaginationState
  onPaginationChange: (pagination: JailbreakPaginationState) => void
  showQuickNavigation?: boolean
}

export function EvaluationDataPagination({
  pagination,
  onPaginationChange,
  showQuickNavigation = true
}: EvaluationDataPaginationProps) {
  const { page, pageSize, total } = pagination
  const totalPages = Math.ceil(total / pageSize)
  const startItem = (page - 1) * pageSize + 1
  const endItem = Math.min(page * pageSize, total)

  const handlePageChange = (newPage: number) => {
    onPaginationChange({
      ...pagination,
      page: newPage
    })
  }

  const handlePageSizeChange = (newPageSize: string) => {
    onPaginationChange({
      ...pagination,
      pageSize: parseInt(newPageSize),
      page: 1 // Reset to first page when changing page size
    })
  }

  return (
    <div className="flex items-right justify-end px-4 py-3">
      {/* Right side - Pagination controls */}
      <div className={`flex items-center gap-4 ${!showQuickNavigation ? 'ml-auto' : ''}`}>
        {/* Rows per page */}
        <div className="flex items-center gap-2">
          <span className="text-[0.8125rem]  text-gray-600">Rows per page:</span>
          <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Page info */}
        <div className="text-[0.8125rem]  text-gray-600">
          {startItem} - {endItem} of {total}
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center gap-1">
          {showQuickNavigation && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handlePageChange(1)}
                disabled={page === 1}
              >
                <ChevronsLeft className="h-4 w-4" strokeWidth={2} />
              </Button>
            </>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={2} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
          >
            <ChevronRight className="h-4 w-4" strokeWidth={2} />
          </Button>
          {showQuickNavigation && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handlePageChange(totalPages)}
              disabled={page === totalPages}
            >
              <ChevronsRight className="h-4 w-4" strokeWidth={2} />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
