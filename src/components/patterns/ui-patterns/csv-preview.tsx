import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Eye,
  EyeOff
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CSVParseResult } from '@/types/csv';
import type { EvaluationPrompt } from '@/features/evaluation/types/evaluation';

interface CSVPreviewProps {
  parseResult: CSVParseResult;
  onImportRows: (rows: EvaluationPrompt[], type: 'valid' | 'invalid' | 'all') => void;
  className?: string;
}

export function CSVPreview({ parseResult, onImportRows, className }: CSVPreviewProps) {
  const [activeTab, setActiveTab] = React.useState<'all' | 'valid' | 'invalid'>('all');
  
  const getRowsToDisplay = () => {
    switch (activeTab) {
      case 'valid':
        return parseResult.validRows.map(row => ({ 
          ...row, 
          isValid: true, 
          errors: [] 
        }));
      case 'invalid':
        return parseResult.invalidRows;
      default:
        return [
          ...parseResult.validRows.map(row => ({ 
            ...row, 
            isValid: true, 
            errors: [] 
          })),
          ...parseResult.invalidRows.map(invalid => ({
            ...invalid.row,
            id: `invalid-${invalid.rowIndex}`,
            isValid: false,
            errors: invalid.errors,
            rowIndex: invalid.rowIndex
          }))
        ].sort((a, b) => {
          const aIndex = 'rowIndex' in a ? a.rowIndex : 0;
          const bIndex = 'rowIndex' in b ? b.rowIndex : 0;
          return aIndex - bIndex;
        });
    }
  };

  const rowsToDisplay = getRowsToDisplay();

  const handleImport = (type: 'valid' | 'invalid' | 'all') => {
    switch (type) {
      case 'valid':
        onImportRows(parseResult.validRows, 'valid');
        break;
      case 'invalid':
        // Convert invalid rows to EvaluationPrompt format for manual correction
        const invalidAsPrompts: EvaluationPrompt[] = parseResult.invalidRows.map(invalid => ({
          id: crypto.randomUUID(),
          prompt: invalid.row.prompt || '',
          topic: invalid.row.topic || '',
          userMarkedAdversarial: invalid.row.userMarkedAdversarial || ''
        }));
        onImportRows(invalidAsPrompts, 'invalid');
        break;
      case 'all':
        const allRows = [
          ...parseResult.validRows,
          ...parseResult.invalidRows.map(invalid => ({
            id: crypto.randomUUID(),
            prompt: invalid.row.prompt || '',
            topic: invalid.row.topic || '',
            userMarkedAdversarial: invalid.row.userMarkedAdversarial || ''
          }))
        ];
        onImportRows(allRows, 'all');
        break;
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Import Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Import Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6 mb-6">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-3xl font-450">{parseResult.totalRows}</p>
              <p className="text-[0.8125rem]  text-gray-600">Total Rows</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-3xl font-450 text-green-600">{parseResult.validCount}</p>
              <p className="text-[0.8125rem]  text-gray-600">Valid Rows</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-3xl font-450 text-red-600">{parseResult.invalidCount}</p>
              <p className="text-[0.8125rem]  text-gray-600">Invalid Rows</p>
            </div>
          </div>

          {/* Import Buttons */}
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={() => handleImport('valid')}
              disabled={parseResult.validCount === 0}
              className="flex-1 min-w-fit"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Import Valid Rows ({parseResult.validCount})
            </Button>
            <Button 
              variant="outline"
              onClick={() => handleImport('all')}
              disabled={parseResult.totalRows === 0}
              className="flex-1 min-w-fit"
            >
              Import All Rows ({parseResult.totalRows})
            </Button>
            {parseResult.invalidCount > 0 && (
              <Button 
                variant="outline"
                onClick={() => handleImport('invalid')}
                className="flex-1 min-w-fit"
              >
                <AlertTriangle className="mr-2 h-4 w-4" />
                Import Invalid Rows ({parseResult.invalidCount})
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Data Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Table className="h-5 w-5" />
            Data Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                All ({parseResult.totalRows})
              </TabsTrigger>
              <TabsTrigger value="valid" className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Valid ({parseResult.validCount})
              </TabsTrigger>
              <TabsTrigger value="invalid" className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-600" />
                Invalid ({parseResult.invalidCount})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-4">
              {rowsToDisplay.length > 0 ? (
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">Status</TableHead>
                        <TableHead>Prompt</TableHead>
                        <TableHead>Topic</TableHead>
                        <TableHead>Adversarial</TableHead>
                        <TableHead>Issues</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rowsToDisplay.map((row, index) => (
                        <TableRow 
                          key={row.id || index}
                          className={cn(
                            'isValid' in row && !row.isValid 
                              ? "bg-red-50 hover:bg-red-100" 
                              : "hover:bg-muted/50"
                          )}
                        >
                          <TableCell>
                            {'isValid' in row && row.isValid ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500" />
                            )}
                          </TableCell>
                          <TableCell className="max-w-xs">
                            <div className="truncate" title={row.prompt}>
                              {row.prompt || (
                                <span className="text-gray-600 italic">Empty</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {row.topic || (
                              <span className="text-gray-600 italic">Empty</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {row.userMarkedAdversarial ? (
                              <Badge variant={row.userMarkedAdversarial === 'true' ? 'destructive' : 'secondary'}>
                                {row.userMarkedAdversarial === 'true' ? 'Blocked' : 'Passed'}
                              </Badge>
                            ) : (
                              <span className="text-gray-600 italic">Not set</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {'errors' in row && row.errors && row.errors.length > 0 ? (
                              <div className="space-y-1">
                                {row.errors.slice(0, 2).map((error: any, errorIndex: number) => (
                                  <Badge 
                                    key={errorIndex} 
                                    variant="outline" 
                                    className="text-xs text-red-600 border-red-200"
                                  >
                                    {error.message}
                                  </Badge>
                                ))}
                                {row.errors.length > 2 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{row.errors.length - 2} more
                                  </Badge>
                                )}
                              </div>
                            ) : (
                              <span className="text-green-600 text-[0.8125rem] ">✓ Valid</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-600">
                  <EyeOff className="h-8 w-8 mx-auto mb-2" />
                  <p>No rows to display in this category</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Validation Warnings */}
      {parseResult.invalidCount > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Validation Issues Found:</strong>
            <ul className="mt-2 space-y-1 text-[0.8125rem] ">
              {!parseResult.hasRequiredColumns && (
                <li>• Missing required columns: {parseResult.missingColumns.join(', ')}</li>
              )}
              {parseResult.invalidRows.some(row => 
                row.errors.some(error => error.columnKey === 'prompt')
              ) && (
                <li>• Some rows have missing or empty prompt text</li>
              )}
              {parseResult.invalidRows.some(row => 
                row.errors.some(error => error.columnKey === 'userMarkedAdversarial')
              ) && (
                <li>• Some rows have invalid adversarial status (must be "true" or "false")</li>
              )}
            </ul>
            <p className="mt-2">
              You can import only valid rows, or import all rows and fix issues manually in the table.
            </p>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
