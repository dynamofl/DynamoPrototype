import { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { parseCSVFile, validateCSVFile } from '@/lib/api/csv-parser';
import { FileItem } from './file-item';
import type { CSVUploadState, CSVParseResult, FileState } from '@/types/csv';

interface CSVUploadProps {
  onUploadComplete: (result: CSVParseResult) => void;
  onError: (error: string) => void;
  onFilesChange?: (files: FileState[]) => void;
  className?: string;
}

export function CSVUpload({ onUploadComplete, onError, onFilesChange, className }: CSVUploadProps) {
  const [uploadState, setUploadState] = useState<CSVUploadState>({
    files: [],
    showPreview: false,
    previewFilter: 'all'
  });

  // Notify parent component when files change
  useEffect(() => {
    if (onFilesChange) {
      onFilesChange(uploadState.files);
    }
  }, [uploadState.files, onFilesChange]);

  const processFile = useCallback(async (file: File) => {
    const fileId = crypto.randomUUID();
    const fileState: FileState = {
      id: fileId,
      file,
      parseResult: null,
      isUploading: true,
      isParsing: false,
      error: null,
      uploadProgress: 0
    };

    // Add file to state
    setUploadState(prev => ({
      ...prev,
      files: [...prev.files, fileState]
    }));

    // Validate file
    const validation = validateCSVFile(file);
    if (!validation.isValid) {
      setUploadState(prev => ({
        ...prev,
        files: prev.files.map(f => 
          f.id === fileId ? {
            ...f,
            isUploading: false,
            error: validation.error || 'Invalid file'
          } : f
        )
      }));
      return;
    }

    try {
      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadState(prev => ({
          ...prev,
          files: prev.files.map(f => 
            f.id === fileId ? {
              ...f,
              uploadProgress: Math.min(f.uploadProgress + 20, 90)
            } : f
          )
        }));
      }, 500);

      // Start parsing
      setUploadState(prev => ({
        ...prev,
        files: prev.files.map(f => 
          f.id === fileId ? {
            ...f,
            isParsing: true
          } : f
        )
      }));

      const parseResult = await parseCSVFile(file);
      clearInterval(interval);
      
      setUploadState(prev => ({
        ...prev,
        files: prev.files.map(f => 
          f.id === fileId ? {
            ...f,
            isUploading: false,
            isParsing: false,
            parseResult,
            uploadProgress: 100
          } : f
        )
      }));

      onUploadComplete(parseResult);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to parse CSV file';
      setUploadState(prev => ({
        ...prev,
        files: prev.files.map(f => 
          f.id === fileId ? {
            ...f,
            isUploading: false,
            isParsing: false,
            error: errorMessage,
            uploadProgress: 0
          } : f
        )
      }));
      onError(errorMessage);
    }
  }, [onUploadComplete, onError]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach(file => {
      processFile(file);
    });
  }, [processFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv']
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024 // 5MB
  });

  const removeFile = (fileId: string) => {
    setUploadState(prev => ({
      ...prev,
      files: prev.files.filter(f => f.id !== fileId)
    }));
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Area - Always visible */}
      <div className="bg-white h-[180px] relative rounded-lg">
        <div
          {...getRootProps()}
          className={cn(
            "h-full border border-dashed border-[rgba(9,28,66,0.14)] rounded-lg cursor-pointer transition-colors",
            isDragActive ? "bg-[rgba(9,28,66,0.04)]" : "hover:bg-[rgba(9,28,66,0.02)]"
          )}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center h-full p-2">
            <div className="bg-[#f1f2f4] rounded-full p-2 mb-2">
              <Upload className="h-5 w-5 text-[#404b64]" />
            </div>
            <p className="text-[13px] font-450 text-[#192c4b] mb-1">
              {isDragActive ? "Drop your .csv files here" : "Drag and drop your .csv files here"}
            </p>
            <div className="flex items-center gap-1">
              <span className="text-[13px] text-[#6b7894]">Or</span>
              <button className="text-[13px] font-450 text-blue-600 underline">Browse File</button>
            </div>
          </div>
        </div>
      </div>

      {/* File Groups */}
      {uploadState.files.length > 0 && (
        <div className="space-y-4">
          {/* In Progress Files */}
          {uploadState.files.some(f => f.isUploading || f.isParsing) && (
            <div className="space-y-2">
              {uploadState.files
                .filter(f => f.isUploading || f.isParsing)
                .map(file => (
                  <FileItem
                    key={file.id}
                    file={file}
                    variant="in-progress"
                    onRemove={removeFile}
                  />
                ))}
            </div>
          )}

          {/* Files with all invalid rows (no section title) */}
          {uploadState.files
            .filter(f => f.parseResult && f.parseResult.validCount === 0)
            .map(file => (
              <FileItem
                key={file.id}
                file={file}
                variant="invalid"
                onRemove={removeFile}
              />
            ))}

          {/* Validated Files (files with at least one valid row) */}
          {uploadState.files.some(f => f.parseResult && f.parseResult.validCount > 0) && (
            <div className="space-y-2">
              <h3 className="text-xs font-450 text-[#192c4b] leading-4">
                Validated Files ({uploadState.files.filter(f => f.parseResult && f.parseResult.validCount > 0).length})
              </h3>
              <div className="space-y-2">
                {uploadState.files
                  .filter(f => f.parseResult && f.parseResult.validCount > 0)
                  .map(file => (
                    <FileItem
                      key={file.id}
                      file={file}
                      variant="validated"
                      onRemove={removeFile}
                    />
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
