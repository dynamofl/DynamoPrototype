import { useState } from "react"
import { MoreHorizontal, Search, Filter, Download } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { AISystemIcon } from "./ai-system-icon"

interface AISystem {
  id: string;
  name: string;
  project: string;
  owner: string;
  createdAt: string;
  status: 'active' | 'inactive';
  icon: 'OpenAI' | 'Azure' | 'Mistral' | 'Databricks' | 'HuggingFace' | 'Anthropic' | 'Custom' | 'AWS' | 'DynamoAI' | 'Gemini';
  hasGuardrails: boolean;
  isEvaluated: boolean;
}

interface AISystemsTableProps {
  data: AISystem[]
  loading?: boolean
}

export function AISystemsTable({ data, loading = false }: AISystemsTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20
  const totalPages = Math.ceil(data.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = Math.min(startIndex + itemsPerPage, data.length)
  const currentData = data.slice(startIndex, endIndex)

  return (
    <div className="space-y-4">
      {/* Header Actions */}
      <div className="flex items-center justify-between px-6">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-600" />
            <Input
              placeholder="Search AI systems..."
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
      <div className="border-t border-b">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="pl-6">Name</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="pr-6"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              // Loading skeleton rows
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={`skeleton-${index}`}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-4 w-[200px]" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[80px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[120px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[100px]" />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Skeleton className="h-8 w-[120px]" />
                      <Skeleton className="h-8 w-[120px]" />
                      <Skeleton className="h-8 w-8" />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              currentData.map((system) => (
                <TableRow key={system.id}>
                <TableCell className="font-450 ">
                  <div className="flex items-center space-x-1">
                    <AISystemIcon type={system.icon} />
                    <span className="text-[0.8125rem]  font-450 hover:underline cursor-pointer">{system.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-[0.8125rem] ">
                  {system.project === "-" ? (
                    <span className="text-gray-600">-</span>
                  ) : (
                    <Badge variant="outline">{system.project}</Badge>
                  )}
                </TableCell>
                <TableCell className="text-[0.8125rem]  text-gray-600">{system.owner}</TableCell>
                <TableCell className="text-[0.8125rem]  text-gray-600">{system.createdAt}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end space-x-2">
                    {/* <div className="flex items-center space-x-1">
                      {system.isEvaluated && (
                        <Badge variant="secondary" className="text-xs">
                          Evaluated
                        </Badge>
                      )}
                      {system.hasGuardrails && (
                        <Badge variant="default" className="text-xs">
                          Guardrails
                        </Badge>
                      )}
                      {system.status === 'inactive' && (
                        <Badge variant="destructive" className="text-xs">
                          Inactive
                        </Badge>
                      )}
                    </div> */}
                    <Button variant="outline" size="sm">
                     View
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">More options</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem>Duplicate</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
                              </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-6">
        <p className="text-[0.8125rem]  text-gray-600">
          Rows per page: 20
        </p>
        <div className="flex items-center space-x-2">
          <p className="text-[0.8125rem]  text-gray-600">
            {startIndex + 1} - {endIndex} of {data.length}
          </p>
          <div className="flex items-center space-x-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
