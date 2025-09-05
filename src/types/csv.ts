import type { EvaluationPrompt } from './evaluation';

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
}

export interface CSVValidationRule {
  column: string;
  required: boolean;
  validator?: (value: any) => boolean;
  errorMessage?: string;
}

export interface CSVUploadState {
  file: File | null;
  parseResult: CSVParseResult | null;
  isUploading: boolean;
  isParsing: boolean;
  error: string | null;
  showPreview: boolean;
  previewFilter: 'all' | 'valid' | 'invalid';
}
