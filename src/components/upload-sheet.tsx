import React, { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileUp, Upload } from 'lucide-react';
import { CSVUpload } from './csv-upload';
import { CSVPreview } from './csv-preview';
import type { CSVParseResult } from '@/types/csv';
import type { EvaluationPrompt } from '@/types/evaluation';

interface UploadSheetProps {
  onImportComplete: (rows: EvaluationPrompt[], importType: 'valid' | 'invalid' | 'all') => void;
  trigger?: React.ReactNode;
  children?: React.ReactNode;
}

export function UploadSheet({ onImportComplete, trigger, children }: UploadSheetProps) {
  const [open, setOpen] = useState(false);
  const [parseResult, setParseResult] = useState<CSVParseResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUploadComplete = (result: CSVParseResult) => {
    setParseResult(result);
    setError(null);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setParseResult(null);
  };

  const handleImportRows = (rows: EvaluationPrompt[], importType: 'valid' | 'invalid' | 'all') => {
    onImportComplete(rows, importType);
    setOpen(false);
    // Reset state after import
    setParseResult(null);
    setError(null);
  };

  const resetState = () => {
    setParseResult(null);
    setError(null);
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      // Reset state when closing
      resetState();
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        {trigger || (
          <Button variant="ghost" className="w-fit">
            <FileUp className="mr-2 h-4 w-4" />
            Upload from File
          </Button>
        )}
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-4xl">
        <SheetHeader className="space-y-3">
          <SheetTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload CSV File
          </SheetTitle>
          <SheetDescription>
            Upload a CSV file containing prompts to add to your evaluation. 
            Required columns: <strong>prompt</strong>, <strong>userMarkedAdversarial</strong> (true/false). 
            Optional: <strong>topic</strong>.
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-120px)] mt-6">
          <div className="space-y-6 pr-6">
            {/* CSV Upload Component */}
            <CSVUpload
              onUploadComplete={handleUploadComplete}
              onError={handleError}
            />

            {/* CSV Preview Component */}
            {parseResult && (
              <CSVPreview
                parseResult={parseResult}
                onImportRows={handleImportRows}
              />
            )}

            {/* Additional Help Section */}
            {!parseResult && !error && (
              <div className="mt-8 p-6 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-3">CSV Format Requirements</h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p><strong>Required Columns:</strong></p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li><code>prompt</code> - The prompt text (cannot be empty)</li>
                    <li><code>userMarkedAdversarial</code> - Either "true" or "false"</li>
                  </ul>
                  <p className="mt-3"><strong>Optional Columns:</strong></p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li><code>topic</code> - Category or topic for the prompt</li>
                  </ul>
                  <p className="mt-3"><strong>Example CSV:</strong></p>
                  <div className="bg-background p-3 rounded border text-xs font-mono">
                    prompt,topic,userMarkedAdversarial<br/>
                    "What is the weather today?","General","false"<br/>
                    "How to hack a system?","Security","true"<br/>
                    "Tell me a joke","Entertainment","false"
                  </div>
                </div>
              </div>
            )}

            {children}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
