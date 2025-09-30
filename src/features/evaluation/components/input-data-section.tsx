import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  DynamoTable,
  type DynamoColumnConfig,
} from "@/components/ui/dynamo-table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { UploadSheet } from "@/components/patterns/ui-patterns/upload-sheet";
import { Plus, Notebook, Sparkles, AlertTriangle } from "lucide-react";
import type { EvaluationPrompt } from "../types/evaluation";
import { getTableColumns } from "../lib/table";
import { Trash2 } from "lucide-react";
import { getPageNumbers } from "../lib/pagination";

interface InputDataSectionProps {
  prompts: EvaluationPrompt[];
  currentPagePrompts: EvaluationPrompt[];
  totalPages: number;
  currentPage: number;
  startIndex: number;
  onAddPrompt: () => void;
  onCSVImport: (rows: any[], importType: "valid" | "invalid" | "all") => void;
  onTableDataChange: (newData: any[]) => void;
  onCellAction: (action: string, rowIndex: number, columnKey: string) => void;
  onGoToPage: (page: number) => void;
  onGoToPrevious: () => void;
  onGoToNext: () => void;
  error?: string | null;
}

export function InputDataSection({
  prompts,
  currentPagePrompts,
  totalPages,
  currentPage,
  startIndex,
  onAddPrompt,
  onCSVImport,
  onTableDataChange,
  onCellAction,
  onGoToPage,
  onGoToPrevious,
  onGoToNext,
  error,
}: InputDataSectionProps) {
  const tableColumns = getTableColumns(prompts.length).map((col) => ({
    ...col,
    buttonIcon:
      col.key === "actions" ? <Trash2 className="h-4 w-4" /> : col.buttonIcon,
  }));

  return (
    <div>
      <div className="px-4 py-3 text-gray-900 border-b border-gray-200  text-sm font-450">
        Test Data
      </div>
      <div className="space-y-4 px-6 py-4">
        {/* Multiple Prompts Table */}
        <div className="space-y-3">
          <div className="flex justify-between align-center">
            <div className="flex justify-between align-center">
              <div className="flex justify-start gap-2">
                <UploadSheet onImportComplete={onCSVImport} />
                <Button variant="ghost" className="w-fit">
                  <Notebook className="mr-2 h-4 w-4" />
                  Select from Policy
                </Button>
                <Button variant="ghost" className="w-fit">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Rows
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              {totalPages > 1 && (
                <div className="text-xs text-gray-500">
                 Total Input Rows: {prompts.length}
                </div>
              )}
            </div>
          </div>

          <DynamoTable
            data={currentPagePrompts}
            columns={tableColumns}
            onDataChange={onTableDataChange}
            onCellAction={onCellAction}
            editable={true}
            rowKey="id"
          />

          <div className="flex justify-between align-center border-b pb-3">
          {currentPage == totalPages ? 
              <div className="flex justify-start gap-2">
               
              <Button
                type="button"
                variant="ghost"
                size="default"
                onClick={onAddPrompt}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add New Row
              </Button>
              </div>
              : <div> </div>}
               {/* Pagination for Input Form */}
          {totalPages > 1 && (
            <div className="flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={onGoToPrevious}
                      className={
                        currentPage === 1
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>

                  {/* Page numbers */}
                  {getPageNumbers(currentPage, totalPages).map((pageNum) => (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        onClick={() => onGoToPage(pageNum)}
                        isActive={currentPage === pageNum}
                        className="cursor-pointer"
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}

                  <PaginationItem>
                    <PaginationNext
                      onClick={onGoToNext}
                      className={
                        currentPage === totalPages
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}


          </div>

          <p className="text-xs text-muted-foreground">
            Add multiple prompts to evaluate them together. Each prompt will be
            processed individually and results will be shown collectively.
          </p>

         
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <p className="text-[13px] text-destructive flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              {error}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
