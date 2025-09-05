import type { EvaluationPrompt } from '@/types/evaluation';
import type { CSVParseResult, CSVValidationRule, CSVRowValidation } from '@/types/csv';

// Define validation rules based on table structure
const CSV_VALIDATION_RULES: CSVValidationRule[] = [
  {
    column: 'prompt',
    required: true,
    validator: (value: any) => typeof value === 'string' && value.trim().length > 0,
    errorMessage: 'Prompt text is required and cannot be empty'
  },
  {
    column: 'userMarkedAdversarial',
    required: true,
    validator: (value: any) => value === 'true' || value === 'false',
    errorMessage: 'Adversarial status must be either "true" or "false"'
  },
  {
    column: 'topic',
    required: false,
    validator: () => true, // Topic is optional and can be anything
    errorMessage: ''
  }
];

/**
 * Parse CSV content to array of objects
 */
function parseCSVContent(csvContent: string): any[] {
  const lines = csvContent.trim().split('\n');
  if (lines.length < 2) return []; // Need at least header + 1 data row
  
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const rows: any[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    const row: any = {};
    
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    
    rows.push(row);
  }
  
  return rows;
}

/**
 * Validate a single row against the validation rules
 */
function validateRow(row: any, rowIndex: number): CSVRowValidation {
  const errors: any[] = [];
  let isValid = true;
  
  CSV_VALIDATION_RULES.forEach(rule => {
    const value = row[rule.column];
    
    if (rule.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      errors.push({
        rowIndex,
        columnKey: rule.column,
        message: `Missing required field: ${rule.column}`
      });
      isValid = false;
    } else if (value && rule.validator && !rule.validator(value)) {
      errors.push({
        rowIndex,
        columnKey: rule.column,
        message: rule.errorMessage || `Invalid value for ${rule.column}`
      });
      isValid = false;
    }
  });
  
  return {
    row,
    rowIndex,
    isValid,
    errors
  };
}

/**
 * Convert validated row to EvaluationPrompt
 */
function rowToEvaluationPrompt(row: any): EvaluationPrompt {
  return {
    id: crypto.randomUUID(),
    prompt: row.prompt || '',
    topic: row.topic || '',
    userMarkedAdversarial: row.userMarkedAdversarial || ''
  };
}

/**
 * Main function to parse and validate CSV file
 */
export function parseCSVFile(file: File): Promise<CSVParseResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const csvContent = event.target?.result as string;
        const rows = parseCSVContent(csvContent);
        
        if (rows.length === 0) {
          resolve({
            validRows: [],
            invalidRows: [],
            totalRows: 0,
            validCount: 0,
            invalidCount: 0,
            headers: [],
            hasRequiredColumns: false,
            missingColumns: ['prompt', 'userMarkedAdversarial']
          });
          return;
        }
        
        // Check for required columns
        const headers = Object.keys(rows[0]);
        const requiredColumns = CSV_VALIDATION_RULES
          .filter(rule => rule.required)
          .map(rule => rule.column);
        
        const missingColumns = requiredColumns.filter(col => !headers.includes(col));
        const hasRequiredColumns = missingColumns.length === 0;
        
        // Validate each row
        const validatedRows = rows.map((row, index) => validateRow(row, index + 1));
        
        // Separate valid and invalid rows
        const validRows: EvaluationPrompt[] = [];
        const invalidRows: CSVRowValidation[] = [];
        
        validatedRows.forEach(validatedRow => {
          if (validatedRow.isValid && hasRequiredColumns) {
            validRows.push(rowToEvaluationPrompt(validatedRow.row));
          } else {
            // Add missing column errors if applicable
            if (!hasRequiredColumns) {
              missingColumns.forEach(col => {
                validatedRow.errors.push({
                  rowIndex: validatedRow.rowIndex,
                  columnKey: col,
                  message: `Missing required column: ${col}`
                });
              });
              validatedRow.isValid = false;
            }
            
            if (!validatedRow.isValid) {
              invalidRows.push(validatedRow);
            }
          }
        });
        
        resolve({
          validRows,
          invalidRows,
          totalRows: rows.length,
          validCount: validRows.length,
          invalidCount: invalidRows.length,
          headers,
          hasRequiredColumns,
          missingColumns
        });
        
      } catch (error) {
        reject(new Error(`Failed to parse CSV: ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
}

/**
 * Validate file before parsing
 */
export function validateCSVFile(file: File): { isValid: boolean; error?: string } {
  // Check file type
  if (!file.name.toLowerCase().endsWith('.csv')) {
    return { isValid: false, error: 'File must be a CSV file (.csv extension)' };
  }
  
  // Check file size (5MB limit)
  const maxSizeInBytes = 5 * 1024 * 1024;
  if (file.size > maxSizeInBytes) {
    return { isValid: false, error: 'File size must be less than 5MB' };
  }
  
  // Check if file is empty
  if (file.size === 0) {
    return { isValid: false, error: 'File cannot be empty' };
  }
  
  return { isValid: true };
}
