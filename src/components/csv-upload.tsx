import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Upload, 
  FileUp, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  File
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { parseCSVFile, validateCSVFile } from '@/lib/csv-parser';
import type { CSVUploadState, CSVParseResult } from '@/types/csv';

interface CSVUploadProps {
  onUploadComplete: (result: CSVParseResult) => void;
  onError: (error: string) => void;
  className?: string;
}

export function CSVUpload({ onUploadComplete, onError, className }: CSVUploadProps) {
  const [uploadState, setUploadState] = useState<CSVUploadState>({
    file: null,
    parseResult: null,
    isUploading: false,
    isParsing: false,
    error: null,
    showPreview: false,
    previewFilter: 'all'
  });

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    
    // Reset state
    setUploadState(prev => ({
      ...prev,
      file,
      parseResult: null,
      error: null,
      isUploading: true,
      isParsing: false
    }));

    // Validate file
    const validation = validateCSVFile(file);
    if (!validation.isValid) {
      setUploadState(prev => ({
        ...prev,
        isUploading: false,
        error: validation.error || 'Invalid file'
      }));
      onError(validation.error || 'Invalid file');
      return;
    }

    try {
      // Start parsing
      setUploadState(prev => ({
        ...prev,
        isParsing: true
      }));

      const parseResult = await parseCSVFile(file);
      
      setUploadState(prev => ({
        ...prev,
        isUploading: false,
        isParsing: false,
        parseResult,
        showPreview: true
      }));

      onUploadComplete(parseResult);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to parse CSV file';
      setUploadState(prev => ({
        ...prev,
        isUploading: false,
        isParsing: false,
        error: errorMessage
      }));
      onError(errorMessage);
    }
  }, [onUploadComplete, onError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv']
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024 // 5MB
  });

  const resetUpload = () => {
    setUploadState({
      file: null,
      parseResult: null,
      isUploading: false,
      isParsing: false,
      error: null,
      showPreview: false,
      previewFilter: 'all'
    });
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Area */}
      {!uploadState.file && (
        <Card>
          <CardContent className="p-6">
            <div
              {...getRootProps()}
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                isDragActive 
                  ? "border-primary bg-primary/5" 
                  : "border-muted-foreground/25 hover:border-primary/50"
              )}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center gap-4">
                <div className={cn(
                  "rounded-full p-3",
                  isDragActive ? "bg-primary text-primary-foreground" : "bg-muted"
                )}>
                  <Upload className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-lg font-medium">
                    {isDragActive ? "Drop your CSV file here" : "Drag & drop your CSV file here"}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Or click to browse (max 5MB)
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  <FileUp className="mr-2 h-4 w-4" />
                  Browse Files
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* File Processing State */}
      {uploadState.file && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* File Info */}
              <div className="flex items-center gap-3">
                <File className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="font-medium">{uploadState.file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(uploadState.file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                {uploadState.parseResult && (
                  <Button variant="ghost" size="sm" onClick={resetUpload}>
                    Remove
                  </Button>
                )}
              </div>

              {/* Processing States */}
              {uploadState.isUploading && !uploadState.isParsing && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    <span className="text-sm">Uploading file...</span>
                  </div>
                  <Progress value={50} className="h-2" />
                </div>
              )}

              {uploadState.isParsing && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    <span className="text-sm">Parsing and validating CSV...</span>
                  </div>
                  <Progress value={75} className="h-2" />
                </div>
              )}

              {/* Validation Results */}
              {uploadState.parseResult && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="font-medium">File processed successfully</span>
                  </div>
                  
                  {/* Validation Summary */}
                  <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                    <div className="text-center">
                      <p className="text-2xl font-bold">{uploadState.parseResult.totalRows}</p>
                      <p className="text-sm text-muted-foreground">Total Rows</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{uploadState.parseResult.validCount}</p>
                      <p className="text-sm text-muted-foreground">Valid Rows</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-600">{uploadState.parseResult.invalidCount}</p>
                      <p className="text-sm text-muted-foreground">Invalid Rows</p>
                    </div>
                  </div>

                  {/* Validation Status */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {uploadState.parseResult.hasRequiredColumns ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span className="text-sm">Required columns present</span>
                      {!uploadState.parseResult.hasRequiredColumns && (
                        <Badge variant="destructive" className="text-xs">
                          Missing: {uploadState.parseResult.missingColumns.join(', ')}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">File format valid (.csv)</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">File size within limits</span>
                    </div>
                  </div>

                  {/* Validation Warnings */}
                  {uploadState.parseResult.invalidCount > 0 && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        {uploadState.parseResult.invalidCount} row{uploadState.parseResult.invalidCount > 1 ? 's' : ''} failed validation. 
                        You can choose to import only valid rows or review invalid rows for correction.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}

              {/* Error State */}
              {uploadState.error && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>{uploadState.error}</AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
