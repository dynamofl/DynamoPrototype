import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { DynamoTable } from '@/components/ui/dynamo-table';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@/components/ui/pagination';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Code, Eye, Clock, Check, XCircle, Plus } from 'lucide-react';
import type { EvaluationResult, EvaluationPrompt } from '../types/evaluation';
import type { Guardrail } from '@/features/guardrails/types';
import { getTableColumns } from '../lib/table';
import { Trash2 } from 'lucide-react';
import { getPageNumbers } from '../lib/pagination';

interface ResultsSectionProps {
  result: EvaluationResult;
  prompts: EvaluationPrompt[];
  currentPagePrompts: EvaluationPrompt[];
  totalPages: number;
  currentPage: number;
  startIndex: number;
  onAddPrompt: () => void;
  onTableDataChange: (newData: any[]) => void;
  onCellAction: (action: string, rowIndex: number, columnKey: string) => void;
  onGoToPage: (page: number) => void;
  onGoToPrevious: () => void;
  onGoToNext: () => void;
}

export function ResultsSection({
  result,
  prompts,
  currentPagePrompts,
  totalPages,
  currentPage,
  startIndex,
  onAddPrompt,
  onTableDataChange,
  onCellAction,
  onGoToPage,
  onGoToPrevious,
  onGoToNext,
}: ResultsSectionProps) {
  const tableColumns = getTableColumns(prompts.length).map(col => ({
    ...col,
    buttonIcon: col.key === 'actions' ? <Trash2 className="h-4 w-4" /> : col.buttonIcon,
  }));

  return (
    <div className="space-y-6">
      {/* Input Data Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Test Data
          </CardTitle>
          <CardDescription>
            Input prompts used for evaluation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Multiple Prompts Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Evaluation Prompts</Label>
              {totalPages > 1 && (
                <div className="text-sm text-muted-foreground">
                  Showing {startIndex + 1}-{Math.min(startIndex + 20, prompts.length)} of {prompts.length} entries
                </div>
              )}
            </div>

            <DynamoTable
              data={currentPagePrompts}
              columns={tableColumns}
              onDataChange={onTableDataChange}
              onCellAction={onCellAction}
              editable={true}
              rowKey="id"
            />

            <div className="flex justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onAddPrompt}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add New Row
              </Button>
            </div>

            {/* Pagination for Results View */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-4">
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
        </CardContent>
      </Card>

      {/* Results Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Test Results
          </CardTitle>
          <CardDescription>
            Analysis and metrics from the evaluation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Overall Metrics Summary */}
          <div className="space-y-3">
            <h3 className="font-450 text-lg">
              Overall Evaluation Summary
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-3 bg-muted rounded-md">
                <p className="text-sm text-muted-foreground">
                  Total Prompts
                </p>
                <p className="text-2xl font-450">
                  {result.overallMetrics.totalPrompts}
                </p>
              </div>
              <div className="p-3 bg-muted rounded-md">
                <p className="text-sm text-muted-foreground">Blocked</p>
                <p className="text-2xl font-450 text-red-600">
                  {result.overallMetrics.totalBlocked}
                </p>
              </div>
              <div className="p-3 bg-muted rounded-md">
                <p className="text-sm text-muted-foreground">Passed</p>
                <p className="text-2xl font-450 text-green-600">
                  {result.overallMetrics.totalPassed}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-3 bg-muted rounded-md">
                <p className="text-sm text-muted-foreground">
                  Avg Accuracy
                </p>
                <p className="text-2xl font-450">
                  {(
                    result.overallMetrics.averageAccuracy * 100
                  ).toFixed(1)}
                  %
                </p>
              </div>
              <div className="p-3 bg-muted rounded-md">
                <p className="text-sm text-muted-foreground">
                  Avg Precision
                </p>
                <p className="text-2xl font-450">
                  {(
                    result.overallMetrics.averagePrecision * 100
                  ).toFixed(1)}
                  %
                </p>
              </div>
              <div className="p-3 bg-muted rounded-md">
                <p className="text-sm text-muted-foreground">
                  Avg Recall
                </p>
                <p className="text-2xl font-450">
                  {(
                    result.overallMetrics.averageRecall * 100
                  ).toFixed(1)}
                  %
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Individual Prompt Results */}
          <div className="space-y-3">
            <h3 className="font-450 text-lg">
              Individual Prompt Results
            </h3>
            <div className="space-y-2">
              {result.promptResults.map((promptResult) => (
                <div
                  key={promptResult.promptId}
                  className="p-4 border rounded-md space-y-2"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-450 text-muted-foreground">
                        Prompt:
                      </p>
                      <p className="text-sm line-clamp-2">
                        {promptResult.prompt}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-450 text-muted-foreground">
                        Topic:
                      </p>
                      <p className="text-sm">
                        {promptResult.topic || "any"}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm font-450 text-muted-foreground">
                        Expected:
                      </p>
                      <Badge
                        variant={
                          promptResult.userMarkedAdversarial ===
                          "true"
                            ? "destructive"
                            : "default"
                        }
                      >
                        {promptResult.userMarkedAdversarial === "true"
                          ? "Blocked"
                          : "Passed"}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm font-450 text-muted-foreground">
                        Result:
                      </p>
                      <Badge
                        variant={
                          promptResult.judgeDetectedAdversarial
                            ? "destructive"
                            : "default"
                        }
                      >
                        {promptResult.judgeDetectedAdversarial
                          ? "Blocked"
                          : "Passed"}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm font-450 text-muted-foreground">
                        Accuracy:
                      </p>
                      <span className="text-sm">
                        {promptResult.localScores.accuracy !==
                        undefined
                          ? `${(
                              promptResult.localScores.accuracy * 100
                            ).toFixed(1)}%`
                          : "N/A"}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-450 text-muted-foreground">
                        Precision:
                      </p>
                      <span className="text-sm">
                        {promptResult.localScores.precision !==
                        undefined
                          ? `${(
                              promptResult.localScores.precision * 100
                            ).toFixed(1)}%`
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                  {promptResult.guardrailResults &&
                    promptResult.guardrailResults.length > 0 && (
                      <div>
                        <p className="text-sm font-450 text-muted-foreground mb-2">
                          Guardrails:
                        </p>
                        <div className="space-y-1">
                          {promptResult.guardrailResults.map(
                            (guardrail, idx) => (
                              <div
                                key={idx}
                                className="flex items-center gap-2"
                              >
                                <Badge
                                  variant={
                                    guardrail.status === "blocked"
                                      ? "destructive"
                                      : "default"
                                  }
                                  className="text-xs"
                                >
                                  {guardrail.status === "blocked"
                                    ? "BLOCKED"
                                    : "PASSED"}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {guardrail.guardrailName}
                                </span>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Guardrail Results */}
          {result.promptResults.some(
            (pr) =>
              pr.guardrailResults && pr.guardrailResults.length > 0
          ) && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="font-450 text-lg">
                  Detailed Guardrail Results
                </h3>
                {result.promptResults.map(
                  (promptResult) =>
                    promptResult.guardrailResults &&
                    promptResult.guardrailResults.length > 0 && (
                      <div
                        key={promptResult.promptId}
                        className="space-y-3"
                      >
                        <h4 className="font-450 text-md text-muted-foreground">
                          Prompt:{" "}
                          {promptResult.prompt.substring(0, 50)}
                          ...
                        </h4>
                        <div className="grid grid-cols-1 gap-3">
                          {promptResult.guardrailResults.map(
                            (guardrail, idx) => (
                              <div
                                key={idx}
                                className={`p-4 rounded-md border ${
                                  guardrail.status === "blocked"
                                    ? "bg-red-50 border-red-200"
                                    : "bg-green-50 border-green-200"
                                }`}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="space-y-2 flex-1">
                                    <div className="flex items-center space-x-2">
                                      <span className="font-450 text-sm">
                                        {guardrail.guardrailName}
                                      </span>
                                      <Badge
                                        variant={
                                          guardrail.status ===
                                          "blocked"
                                            ? "destructive"
                                            : "default"
                                        }
                                        className="text-xs"
                                      >
                                        {guardrail.status ===
                                        "blocked"
                                          ? "BLOCKED"
                                          : "PASSED"}
                                      </Badge>
                                    </div>
                                    <div className="space-y-1">
                                      <p className="text-xs font-450 text-muted-foreground">
                                        Guardrail:
                                      </p>
                                      <p className="text-xs bg-white/50 p-2 rounded border">
                                        {guardrail.policyDescription}
                                      </p>
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      Evaluated at:{" "}
                                      {new Date(
                                        guardrail.timestamp
                                      ).toLocaleTimeString()}
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2 ml-4">
                                    {guardrail.status ===
                                    "blocked" ? (
                                      <XCircle className="h-5 w-5 text-gray-600" />
                                    ) : (
                                      <Check className="h-5 w-5 text-green-600" />
                                    )}
                                  </div>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )
                )}
              </div>
            </>
          )}

          {/* Candidate Responses */}
          <Separator />
          <div className="space-y-3">
            <h3 className="font-450 text-lg">
              Candidate Responses
            </h3>
            {result.promptResults.map((promptResult) => (
              <div key={promptResult.promptId} className="space-y-2">
                <h4 className="font-450 text-md text-muted-foreground">
                  Prompt: {promptResult.prompt.substring(0, 50)}...
                </h4>
                <div className="p-4 bg-muted rounded-md border">
                  <pre className="whitespace-pre-wrap text-sm">
                    {promptResult.candidateResponse}
                  </pre>
                </div>
              </div>
            ))}
          </div>

          {/* Timestamp */}
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Evaluated at {new Date(result.timestamp).toLocaleString()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
