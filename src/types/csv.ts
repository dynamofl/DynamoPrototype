import type { EvaluationPrompt } from '@/features/evaluation/types/evaluation';

export interface CSVValidationError {
  rowIndex: number;
  columnKey: string;
  message: string;
}

export interface CSVRowValidation {
  row: any;
  rowIndex: number;
  isValid: boolean;
  errors: CSVValidationError[];
}

export interface CSVParseResult {
  validRows: EvaluationPrompt[];
  invalidRows: CSVRowValidation[];
  totalRows: number;
  validCount: number;
  invalidCount: number;
  headers: string[];
  hasRequiredColumns: boolean;
  missingColumns: string[];
  fileName: string;
  fileSize: number;
  rows: EvaluationPrompt[];
}

export interface CSVValidationRule {
  column: string;
  required: boolean;
  validator?: (value: any) => boolean;
  errorMessage?: string;
}

export interface FileState {
  id: string;
  file: File;
  parseResult: CSVParseResult | null;
  isUploading: boolean;
  isParsing: boolean;
  error: string | null;
  uploadProgress: number;
}

export interface CSVUploadState {
  files: FileState[];
  showPreview: boolean;
  previewFilter: 'all' | 'valid' | 'invalid';
}
