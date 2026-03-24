import { useState, useEffect } from 'react'
import { Edit, Trash2, Squircle, Database } from 'lucide-react'
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
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import type { Dataset, DatasetsFilterState } from '../types'

interface DatasetsTableDirectProps {
  data: Dataset[]
  selectedRows?: string[]
  onRowSelect?: (id: string, selected: boolean) => void
  onSelectAll?: (selected: boolean) => void
  onEdit: (dataset: Dataset) => void
  onDelete: (dataset: Dataset) => void
}

const formatColors: Record<string, string> = {
  CSV: 'bg-green-100 text-green-800 border-green-200',
  JSON: 'bg-amber-100 text-amber-800 border-amber-200',
  JSONL: 'bg-amber-100 text-amber-800 border-amber-200',
  Parquet: 'bg-gray-100 text-gray-800 border-gray-200',
  TSV: 'bg-red-100 text-red-800 border-red-200',
}

export function DatasetsTableDirect({
  data,
  selectedRows = [],
  onRowSelect,
  onSelectAll,
  onEdit,
  onDelete,
}: DatasetsTableDirectProps) {
  const [filters, setFilters] = useState<DatasetsFilterState>({
    status: [],
    format: [],
    searchTerm: '',
  })

  const [filteredData, setFilteredData] = useState<Dataset[]>(data)

  const filterDatasets = (datasets: Dataset[], filters: DatasetsFilterState) => {
    return datasets.filter((dataset) => {
      if (filters.status.length > 0 && !filters.status.includes(dataset.status)) {
        return false
      }
      if (filters.format.length > 0 && !filters.format.includes(dataset.format)) {
        return false
      }
      if (filters.searchTerm.trim() !== '') {
        const term = filters.searchTerm.toLowerCase()
        const text = [dataset.name, dataset.description, dataset.format]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
        if (!text.includes(term)) return false
      }
      return true
    })
  }

  useEffect(() => {
    setFilteredData(filterDatasets(data, filters))
  }, [data, filters])

  const allSelected =
    filteredData.length > 0 && selectedRows.length === filteredData.length
  const someSelected =
    selectedRows.length > 0 && selectedRows.length < filteredData.length

  const renderStatus = (dataset: Dataset) => {
    const isActive = dataset.status === 'active'
    return (
      <div className="flex items-center gap-2">
        <Squircle
          className={`w-2.5 h-2.5 ${
            isActive ? 'fill-green-600 text-green-600' : 'fill-gray-400 text-gray-400'
          }`}
        />
        <span>{isActive ? 'Active' : 'Archived'}</span>
      </div>
    )
  }

  const renderFormat = (format: string) => (
    <Badge variant="secondary">{format}</Badge>
  )

  const renderTags = (tags: string[]) => (
    <div className="flex flex-wrap gap-1">
      {tags.slice(0, 2).map((tag) => (
        <Badge key={tag} variant="outline" className="text-xs">
          {tag}
        </Badge>
      ))}
      {tags.length > 2 && (
        <Badge variant="outline" className="text-xs text-gray-500">
          +{tags.length - 2}
        </Badge>
      )}
    </div>
  )

  return (
    <div>
      {/* Search filter */}
      <div className="px-4 py-3 border-b border-gray-100">
        <Input
          placeholder="Search datasets..."
          value={filters.searchTerm}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, searchTerm: e.target.value }))
          }
          className="max-w-sm h-8 text-sm"
        />
      </div>

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
                      className={
                        someSelected
                          ? 'data-[state=indeterminate]:bg-primary'
                          : 'border-gray-400'
                      }
                    />
                  </div>
                )}
              </TableHead>
              <TableHead className="w-8 pr-0">
                <Database className="h-4 w-4 text-gray-500" />
              </TableHead>
              <TableHead className="font-450">Name</TableHead>
              <TableHead className="font-450">Format</TableHead>
              <TableHead className="font-450">Row Count</TableHead>
              <TableHead className="font-450">Size</TableHead>
              <TableHead className="font-450">Tags</TableHead>
              <TableHead className="font-450">Created At</TableHead>
              <TableHead className="font-450">Status</TableHead>
              <TableHead className="w-[100px] font-450">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((dataset, index) => (
              <TableRow
                key={dataset.id}
                className={`group transition-colors cursor-pointer ${
                  selectedRows.includes(dataset.id)
                    ? 'bg-amber-50 hover:bg-amber-100'
                    : 'hover:bg-gray-50'
                }`}
              >
                <TableCell>
                  {onRowSelect ? (
                    <div className="flex items-center justify-center relative">
                      <span
                        className={`text-gray-500 transition-opacity ${
                          selectedRows.includes(dataset.id)
                            ? 'opacity-0'
                            : 'group-hover:opacity-0 opacity-100'
                        }`}
                      >
                        {index + 1}
                      </span>
                      <div
                        className={`absolute flex items-center justify-center transition-opacity ${
                          selectedRows.includes(dataset.id)
                            ? 'opacity-100'
                            : 'group-hover:opacity-100 opacity-0'
                        }`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Checkbox
                          checked={selectedRows.includes(dataset.id)}
                          onCheckedChange={(checked) =>
                            onRowSelect(dataset.id, !!checked)
                          }
                          className="border-gray-400"
                        />
                      </div>
                    </div>
                  ) : null}
                </TableCell>
                <TableCell className="pr-0">
                  <Database className="h-4 w-4 text-gray-500" />
                </TableCell>
                <TableCell>
                  <div>
                    <span className="font-450 text-gray-900 truncate block">
                      {dataset.name}
                    </span>
                    <span className="text-xs text-gray-500 truncate block max-w-[220px]">
                      {dataset.description}
                    </span>
                  </div>
                </TableCell>
                <TableCell>{renderFormat(dataset.format)}</TableCell>
                <TableCell>
                  <span className="text-gray-700">
                    {dataset.rowCount.toLocaleString()}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-gray-700">{dataset.size}</span>
                </TableCell>
                <TableCell>{renderTags(dataset.tags)}</TableCell>
                <TableCell>
                  <span className="text-gray-700">
                    {new Date(dataset.createdAt).toLocaleDateString()}
                  </span>
                </TableCell>
                <TableCell>{renderStatus(dataset)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        onEdit(dataset)
                      }}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        onDelete(dataset)
                      }}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filteredData.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No datasets found matching the current filters.
          </div>
        )}
      </div>
    </div>
  )
}
