import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileUp, X, Lightbulb, Info, Download } from 'lucide-react';
import { CSVUpload } from './csv-upload';
import type { CSVParseResult, FileState } from '@/types/csv';
import type { EvaluationPrompt } from '@/types/evaluation';

// Tips Section Component
const TipsSection = () => (
  <div className="bg-[#f7f8f9] rounded-lg py-3 px-0.5 space-y-3">
    <div className="flex items-center px-1 gap-2">
      <Lightbulb className="h-4 w-4 text-[#404b64]" />
      <h3 className="text-[13px] font-450 text-[#192c4b]">Tips for preparing your CSV</h3>
    </div>
    
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-xs text-[#4b5976] px-2">•</span>
        <span className="text-xs text-[#4b5976]">Required Columns:</span>
        <div className="flex gap-2">
          <div className="flex items-center gap-1 pl-1 pr-2 py-0.5 rounded bg-[rgba(9,28,66,0.04)] border border-[rgba(9,28,66,0.14)]">
            <Info className="h-3.5 w-3.5 text-[#404b64]" />
            <span className="text-xs font-normal text-[#192c4b]">Adversarial Prompt</span>
          </div>
          <div className="flex items-center gap-1 pl-1 pr-2 py-0.5 rounded bg-[rgba(9,28,66,0.04)] border border-[rgba(9,28,66,0.14)]">
            <Info className="h-3.5 w-3.5 text-[#404b64]" />
            <span className="text-xs font-normal text-[#192c4b]">Attack Area</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-[#4b5976] px-2">•</span>
        <span className="text-xs text-[#4b5976]">Maximum Limit:</span>
        <div className="flex gap-2">
            <span className="text-xs text-[#192c4b] py-0.5">100 Rows • 5 MB size</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-[#4b5976] px-2">•</span>
        <span className="text-xs text-[#4b5976]">Need Reference?</span>
        <div className="flex items-center gap-1">
          <button className="text-xs font-450 text-blue-600 underline">Download Sample CSV Template</button>
          <Download className="h-4 w-4 text-blue-600" />
        </div>
      </div>
    </div>
  </div>
);

// Action Footer Component
interface ActionFooterProps {
  uploadedFiles: FileState[];
  onImportAllValidFiles: () => void;
}

const ActionFooter = ({ uploadedFiles, onImportAllValidFiles }: ActionFooterProps) => {
  const hasValidFiles = uploadedFiles.some(f => f.parseResult && f.parseResult.validCount > 0);
  
  if (!hasValidFiles) return null;

  const totalValidRows = uploadedFiles.reduce((total, file) => total + (file.parseResult?.validCount || 0), 0);

  return (
    <div className="border-t border-[rgba(9,28,66,0.1)] p-4 flex justify-between items-center">
      <div className="flex-1" />
      <button
        onClick={onImportAllValidFiles}
        className="bg-blue-600 text-[#ebf1fd] text-sm font-450 px-3 py-2 rounded"
      >
        Add {totalValidRows} Dataset Files
      </button>
    </div>
  );
};

// Type definitions for customizable dimensions
type DialogDimension = string | number;

interface DialogDimensions {
  width?: DialogDimension;
  height?: DialogDimension;
  maxWidth?: DialogDimension;
  maxHeight?: DialogDimension;
}

interface UploadSheetProps {
  onImportComplete: (rows: EvaluationPrompt[], importType: 'valid' | 'invalid' | 'all') => void;
  trigger?: React.ReactNode;
  children?: React.ReactNode;
  dimensions?: DialogDimensions;
  title?: string;
  description?: string;
}

// Default dimensions for the dialog
const DEFAULT_DIMENSIONS: DialogDimensions = {
  width: '90vw',
  height: '80vh',
  maxWidth: '1200px',
  maxHeight: '800px'
};

// Utility function to format dimensions for CSS
const formatDimension = (dimension: DialogDimension): string => {
  if (typeof dimension === 'number') {
    return `${dimension}px`;
  }
  return dimension;
};

// Generate CSS styles for dialog dimensions
const getDialogStyles = (dimensions: DialogDimensions): React.CSSProperties => {
  const styles: React.CSSProperties = {};
  
  if (dimensions.width) {
    styles.width = formatDimension(dimensions.width);
  }
  if (dimensions.height) {
    styles.height = formatDimension(dimensions.height);
  }
  if (dimensions.maxWidth) {
    styles.maxWidth = formatDimension(dimensions.maxWidth);
  }
  if (dimensions.maxHeight) {
    styles.maxHeight = formatDimension(dimensions.maxHeight);
  }
  
  return styles;
};

export function UploadSheet({ 
  onImportComplete, 
  trigger, 
  children, 
  dimensions = DEFAULT_DIMENSIONS,
  title = "Upload Your Dataset File",
  description = "Upload and validate your CSV files for evaluation"
}: UploadSheetProps) {
  const [open, setOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<FileState[]>([]);

  const handleUploadComplete = (_result: CSVParseResult) => {
    // This is called for each individual file upload
    // The CSVUpload component now manages multiple files internally
  };

  const handleError = (_errorMessage: string) => {
    // Error handling is now managed by CSVUpload component
  };

  const handleImportAllValidFiles = () => {
    // Collect all valid rows from all uploaded files
    const allValidRows: EvaluationPrompt[] = [];
    
    uploadedFiles.forEach(file => {
      if (file.parseResult && file.parseResult.validCount > 0) {
        allValidRows.push(...file.parseResult.rows);
      }
    });

    if (allValidRows.length > 0) {
      onImportComplete(allValidRows, 'valid');
      setOpen(false);
      setUploadedFiles([]);
    }
  };

  const resetState = () => {
    setUploadedFiles([]);
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      // Reset state when closing
      resetState();
    }
  };

  const dialogStyles = getDialogStyles(dimensions);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" className="w-fit">
            <FileUp className="mr-2 h-4 w-4" />
            Upload from File
          </Button>
        )}
      </DialogTrigger>
      <DialogContent 
        className="p-0 flex flex-col overflow-hidden "
        style={dialogStyles}
      >
        <DialogHeader className="bg-gray-100 p-3 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
          <button onClick={() => setOpen(false)} className="text-[#404b64] hover:text-[#192c4b] transition-colors">
            <X className="h-4 w-4" />
          </button>
            <DialogTitle className="text-sm font-450 text-[#192c4b] leading-5">
              {title}
            </DialogTitle>
          </div>
         
        </DialogHeader>
        
        {description && (
          <DialogDescription className="sr-only">
            {description}
          </DialogDescription>
        )}

        <ScrollArea className="flex-1">
          <div className="px-1.5 py-1.5 space-y-3">
            <TipsSection />

            <CSVUpload
              onUploadComplete={handleUploadComplete}
              onError={handleError}
              onFilesChange={setUploadedFiles}
            />

            {children}
          </div>
        </ScrollArea>

        <ActionFooter 
          uploadedFiles={uploadedFiles}
          onImportAllValidFiles={handleImportAllValidFiles}
        />
      </DialogContent>
    </Dialog>
  );
}
