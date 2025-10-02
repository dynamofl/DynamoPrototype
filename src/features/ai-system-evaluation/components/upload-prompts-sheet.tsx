import { useState, useEffect } from "react";
import { TriangleAlert, Upload, FileText, X, Lightbulb, Info, Download, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ViewEditSheet } from "@/components/patterns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Tips Section Component
interface TipsSectionProps {
  isExpanded: boolean;
  onToggle: () => void;
}

const TipsSection = ({ isExpanded, onToggle }: TipsSectionProps) => {
  return (
    <div className={` rounded-lg overflow-hidden border border-gray-200 `}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-3 px-3 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Lightbulb className="h-4 w-4 text-gray-600" />
          <h3 className="text-[13px] font-450 text-gray-900">Tips for preparing your CSV</h3>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-gray-600 transition-transform duration-200 ${
            isExpanded ? "transform rotate-180" : ""
          }`}
        />
      </button>

      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-2 pb-3 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600 px-2">•</span>
            <span className="text-xs text-gray-600">Required Columns:</span>
            <div className="flex gap-2">
              <div className="flex items-center gap-1 pl-1 pr-2 py-0.5 rounded bg-gray-50 border border-gray-300">
                <Info className="h-3.5 w-3.5 text-gray-600" />
                <span className="text-xs font-normal text-gray-900">Adversarial Prompt</span>
              </div>
              <div className="flex items-center gap-1 pl-1 pr-2 py-0.5 rounded bg-gray-50 border border-gray-300">
                <Info className="h-3.5 w-3.5 text-gray-600" />
                <span className="text-xs font-normal text-gray-900">Attack Area</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600 px-2">•</span>
            <span className="text-xs text-gray-600">Maximum Limit:</span>
            <div className="flex gap-2">
              <span className="text-xs text-gray-900 py-0.5">100 Rows • 5 MB size</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600 px-2">•</span>
            <span className="text-xs text-gray-600">Need Reference?</span>
            <div className="flex items-center gap-1">
              <button className="text-xs font-450 text-blue-600 underline">Download Sample CSV Template</button>
              <Download className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface UploadPromptsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  policyName: string;
  onUpload: (
    prompts: Array<{ prompt: string }>,
    fileName: string,
    csvData?: CSVData,
    mappedColumns?: { adversarialPrompt: string; attackArea: string },
    validationResult?: { validCount: number; invalidCount: number; totalCount: number }
  ) => void;
  existingPrompts?: Array<{ prompt: string }>;
  existingFileName?: string;
  existingCsvData?: {
    headers: string[];
    rows: string[][];
  };
  existingMappedColumns?: {
    adversarialPrompt: string;
    attackArea: string;
  };
  existingValidationResult?: {
    validCount: number;
    invalidCount: number;
    totalCount: number;
  };
}

interface ParsedCSVResult {
  validCount: number;
  invalidCount: number;
  totalCount: number;
  prompts: Array<{ prompt: string }>;
}

interface CSVData {
  headers: string[];
  rows: string[][];
}

export function UploadPromptsSheet({
  open,
  onOpenChange,
  policyName,
  onUpload,
  existingPrompts,
  existingFileName,
  existingCsvData,
  existingMappedColumns,
  existingValidationResult,
}: UploadPromptsSheetProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [csvData, setCSVData] = useState<CSVData | null>(null);
  const [parsedResult, setParsedResult] = useState<ParsedCSVResult | null>(null);
  const [error, setError] = useState("");
  const [showMapping, setShowMapping] = useState(false);
  const [tipsExpanded, setTipsExpanded] = useState(true);
  const [validationError, setValidationError] = useState("");
  const [isValidated, setIsValidated] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    validCount: number;
    invalidCount: number;
    totalCount: number;
  } | null>(null);
  const [mappedColumns, setMappedColumns] = useState<{
    adversarialPrompt: string;
    attackArea: string;
  }>({
    adversarialPrompt: "",
    attackArea: "",
  });
  const [hasModifications, setHasModifications] = useState(false);

  // Initialize with existing data when sheet opens with existing prompts
  useEffect(() => {
    if (open && existingPrompts && existingFileName) {
      // Create a mock file object for display
      const mockFile = new File([""], existingFileName, { type: "text/csv" });
      setSelectedFile(mockFile);

      // Set parsed result to show the uploaded state
      setParsedResult({
        validCount: existingValidationResult?.validCount || existingPrompts.length,
        invalidCount: existingValidationResult?.invalidCount || 0,
        totalCount: existingValidationResult?.totalCount || existingPrompts.length,
        prompts: existingPrompts,
      });

      // Set CSV data if available
      if (existingCsvData) {
        setCSVData(existingCsvData);
        setShowMapping(true);
      }

      // Set mapped columns if available
      if (existingMappedColumns) {
        setMappedColumns(existingMappedColumns);
      }

      // Set validation state if available
      if (existingValidationResult) {
        setValidationResult(existingValidationResult);
        setIsValidated(true);

        // Set validation error message if there were invalid rows
        if (existingValidationResult.invalidCount > 0) {
          setValidationError(
            `${existingValidationResult.invalidCount} out of ${existingValidationResult.totalCount} rows contain invalid data and will be skipped.`
          );
        }
      }

      // Collapse tips since file is already uploaded
      setTipsExpanded(false);

      // No modifications yet when viewing existing data
      setHasModifications(false);
    } else if (open && !existingPrompts) {
      // Opening fresh (not viewing existing data) - allow modifications
      setHasModifications(true);
    } else if (!open) {
      // Reset when sheet closes without existing data
      if (!existingPrompts) {
        setSelectedFile(null);
        setCSVData(null);
        setParsedResult(null);
        setShowMapping(false);
        setMappedColumns({ adversarialPrompt: "", attackArea: "" });
        setError("");
        setValidationError("");
        setIsValidated(false);
        setValidationResult(null);
        setTipsExpanded(true);
        setHasModifications(false);
      }
    }
  }, [open, existingPrompts, existingFileName, existingCsvData, existingMappedColumns, existingValidationResult]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setSelectedFile(file);
    setHasModifications(true); // Mark as modified when new file is uploaded

    try {
      const text = await file.text();
      const lines = text.split("\n").filter((line) => line.trim());

      if (lines.length === 0) {
        setError("The file is empty. Please upload a file with at least one prompt.");
        setParsedResult(null);
        return;
      }

      // Check if it's a CSV file
      const isCsv = file.name.endsWith('.csv');

      if (isCsv) {
        // Parse CSV
        const rows = lines.map(line => line.split(',').map(cell => cell.trim()));
        const headers = rows[0];
        const dataRows = rows.slice(1);

        // Store CSV data for mapping
        setCSVData({ headers, rows: dataRows });
        setShowMapping(true);
        setParsedResult(null);
        setTipsExpanded(false); // Collapse tips after successful upload
      } else {
        // Plain text file - each line is a prompt
        const prompts = lines.map((line) => ({
          prompt: line.trim(),
        }));

        setParsedResult({
          validCount: prompts.length,
          invalidCount: 0,
          totalCount: prompts.length,
          prompts
        });
        setTipsExpanded(false); // Collapse tips after successful upload
      }
    } catch (err) {
      setError("Failed to read the file. Please try again.");
      setParsedResult(null);
    }
  };

  const handleValidateAndAdd = () => {
    if (!csvData || !mappedColumns.adversarialPrompt || !mappedColumns.attackArea) {
      setValidationError("Please map both required columns.");
      return;
    }

    const adversarialPromptIndex = csvData.headers.indexOf(mappedColumns.adversarialPrompt);
    const attackAreaIndex = csvData.headers.indexOf(mappedColumns.attackArea);

    let validCount = 0;
    let invalidCount = 0;
    const validPrompts: Array<{ prompt: string }> = [];

    csvData.rows.forEach(row => {
      const adversarialPrompt = row[adversarialPromptIndex]?.trim();
      const attackArea = row[attackAreaIndex]?.trim();

      if (adversarialPrompt && attackArea) {
        validCount++;
        validPrompts.push({ prompt: adversarialPrompt });
      } else {
        invalidCount++;
      }
    });

    setValidationResult({
      validCount,
      invalidCount,
      totalCount: csvData.rows.length,
    });

    if (validCount === 0) {
      setValidationError("All rows contain invalid data. Please check your column mappings and ensure the data is correct.");
      setIsValidated(true);
      return;
    }

    // If all rows are valid, directly upload and close
    if (invalidCount === 0) {
      onUpload(
        validPrompts,
        selectedFile?.name || "",
        csvData,
        mappedColumns,
        { validCount, invalidCount, totalCount: csvData.rows.length }
      );
      onOpenChange(false);

      // Reset state
      setSelectedFile(null);
      setCSVData(null);
      setParsedResult(null);
      setShowMapping(false);
      setMappedColumns({ adversarialPrompt: "", attackArea: "" });
      setError("");
      setValidationError("");
      setIsValidated(false);
      setValidationResult(null);
      setTipsExpanded(true);
      return;
    }

    // If there are some invalid rows, show validation state
    if (invalidCount > 0) {
      setValidationError(`${invalidCount} out of ${csvData.rows.length} rows contain invalid data and will be skipped.`);
    }

    setParsedResult({
      validCount,
      invalidCount,
      totalCount: csvData.rows.length,
      prompts: validPrompts
    });
    setIsValidated(true);
  };

  const handleContinueAdding = () => {
    if (!parsedResult || !csvData) return;

    onUpload(
      parsedResult.prompts,
      selectedFile?.name || "",
      csvData,
      mappedColumns,
      validationResult || undefined
    );
    onOpenChange(false);

    // Reset state
    setSelectedFile(null);
    setCSVData(null);
    setParsedResult(null);
    setShowMapping(false);
    setMappedColumns({ adversarialPrompt: "", attackArea: "" });
    setError("");
    setValidationError("");
    setIsValidated(false);
    setValidationResult(null);
    setTipsExpanded(true);
  };

  const handleColumnChange = (field: 'adversarialPrompt' | 'attackArea', value: string) => {
    setMappedColumns((prev) => ({ ...prev, [field]: value }));
    // Reset validation when column mapping changes
    setIsValidated(false);
    setValidationError("");
    setValidationResult(null);
    setHasModifications(true); // Mark as modified when columns change
  };

  const handleUpload = () => {
    if (!parsedResult || parsedResult.validCount === 0) {
      setError("Please upload a file with at least one valid prompt.");
      return;
    }

    onUpload(
      parsedResult.prompts,
      selectedFile?.name || existingFileName || "",
      csvData || undefined,
      mappedColumns.adversarialPrompt ? mappedColumns : undefined,
      validationResult || undefined
    );
    onOpenChange(false);

    // Reset state
    setSelectedFile(null);
    setCSVData(null);
    setParsedResult(null);
    setShowMapping(false);
    setMappedColumns({ adversarialPrompt: "", attackArea: "" });
    setError("");
    setTipsExpanded(true);
  };

  const handleRemove = () => {
    // If we're removing existing uploaded data, clear it from parent
    if (existingPrompts && existingFileName) {
      onUpload([], "", undefined, undefined, undefined);
    }

    // Reset to initial upload state
    setSelectedFile(null);
    setCSVData(null);
    setParsedResult(null);
    setShowMapping(false);
    setMappedColumns({ adversarialPrompt: "", attackArea: "" });
    setError("");
    setValidationError("");
    setIsValidated(false);
    setValidationResult(null);
    setTipsExpanded(true); // Expand tips when file is removed
    setHasModifications(true); // Allow new upload
  };

  const handleCancel = () => {
    onOpenChange(false);
    setSelectedFile(null);
    setCSVData(null);
    setParsedResult(null);
    setShowMapping(false);
    setMappedColumns({ adversarialPrompt: "", attackArea: "" });
    setError("");
    setTipsExpanded(true);
  };

  // Get preview rows for the mapping table
  const getPreviewRows = () => {
    if (!csvData) return [];

    const adversarialPromptIndex = mappedColumns.adversarialPrompt
      ? csvData.headers.indexOf(mappedColumns.adversarialPrompt)
      : -1;
    const attackAreaIndex = mappedColumns.attackArea
      ? csvData.headers.indexOf(mappedColumns.attackArea)
      : -1;

    return csvData.rows.slice(0, 5).map((row, idx) => ({
      id: idx + 1,
      adversarialPrompt: adversarialPromptIndex >= 0 ? (row[adversarialPromptIndex] || "-") : "",
      attackArea: attackAreaIndex >= 0 ? (row[attackAreaIndex] || "-") : ""
    }));
  };

  const previewRows = getPreviewRows();

  return (
    <ViewEditSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Upload Additional Prompts"
      size="2xl"
      
    >
      <div className="space-y-4">
        {/* Tips Section */}
        <TipsSection
          isExpanded={tipsExpanded}
          onToggle={() => setTipsExpanded(!tipsExpanded)}
        />

        {/* File Upload Section */}
        <div className="space-y-3">
          {/* Drop Container - Only show when no file is selected */}
          {!selectedFile && !existingFileName && (
            <div className=" h-[480px] relative rounded-lg">
              <div className="h-full border border-dashed border-gray-300 rounded-lg cursor-pointer transition-colors hover:bg-gray-50">
                <input
                  id="file-upload"
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center justify-center h-full p-2"
                >
                  <div className="bg-gray-100 rounded-full p-2 mb-2">
                    <Upload className="h-5 w-5 text-gray-600" />
                  </div>
                  <p className="text-[13px] font-450 text-gray-900 mb-1">
                    Drag and drop your .csv files here
                  </p>
                  <div className="flex items-center gap-1">
                    <span className="text-[13px] text-gray-600">Or</span>
                    <span className="text-[13px] font-450 text-blue-600 underline">Browse File</span>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Selected File Display - Show when file is selected */}
          {(selectedFile || existingFileName) && (
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg ">
              <div className="flex items-top gap-3">
                <div className="pt-0.5">
                <FileText className="h-4 w-4 text-gray-600" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[13px] font-450 text-gray-900">
                    {selectedFile?.name || existingFileName}
                  </span>
                  {parsedResult && (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-green-600">
                        {parsedResult.validCount} Valid
                      </span>
                      {parsedResult.invalidCount > 0 && (
                        <>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-red-600">
                            {parsedResult.invalidCount} Invalid
                          </span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={handleRemove}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </div>

        {/* Column Mapping Section */}
        {showMapping && csvData && (
          <div className="pt-2 space-y-2">
            <div className="space-y-2">
              <p className="text-[13px] text-gray-600">
                Map your CSV columns to the expected fields.
              </p>
            </div>

            {/* Mapping Selects */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-900">
                  Adversarial Prompt
                </label>
                <Select
                  value={mappedColumns.adversarialPrompt}
                  onValueChange={(value) => handleColumnChange('adversarialPrompt', value)}
                >
                  <SelectTrigger className="text-[13px]">
                    <SelectValue placeholder="Select column from your csv..." />
                  </SelectTrigger>
                  <SelectContent>
                    {csvData.headers.map((header) => (
                      <SelectItem key={header} value={header} className="text-[13px]">
                        {header}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-900">
                  Attack Area
                </label>
                <Select
                  value={mappedColumns.attackArea}
                  onValueChange={(value) => handleColumnChange('attackArea', value)}
                >
                  <SelectTrigger className="text-[13px]">
                    <SelectValue placeholder="Select column from your csv..." />
                  </SelectTrigger>
                  <SelectContent>
                    {csvData.headers.map((header) => (
                      <SelectItem key={header} value={header} className="text-[13px]">
                        {header}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Preview Section */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full table-fixed ">
                <colgroup className="">
                  <col className="w-1/2 border-r" />
                  <col className="w-1/2 " />
                </colgroup>
                {/* <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-3 py-2 h-8 text-left text-xs font-medium text-gray-600">
                      {mappedColumns.adversarialPrompt || ''}
                    </th>
                    <th className="px-3 py-2 h-8 text-left text-xs font-medium text-gray-600">
                      {mappedColumns.attackArea || ''}
                    </th>
                  </tr>
                </thead> */}
                <tbody className="divide-y divide-gray-100">
                  {previewRows.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 text-xs text-gray-700 truncate">
                        {row.adversarialPrompt || <span className="text-gray-400">-</span>}
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-700 truncate">
                        {row.attackArea || <span className="text-gray-400">-</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs  text-gray-400"> Only 5 rows out of {csvData.rows.length} rows are shown for the preview</p>

            {/* Validation Error/Info */}
            {validationError && (
              
              <div className={`px-3 py-2 flex flex-row gap-2 rounded-lg ${
                validationResult?.validCount === 0
                  ? 'bg-red-100 '
                  : 'bg-amber-100 '
              }`}>
                <div className="mt-0.5">
                <TriangleAlert className={`w-4 h-4 ${
                validationResult?.validCount === 0
                  ? 'text-red-700 '
                  : 'text-amber-700 '
              }`} />
              </div>
                <p className={`text-[13px] ${
                  validationResult?.validCount === 0
                    ? 'text-gray-900'
                    : 'text-gray-900'
                }`}>
                  {validationError}
                </p>
              </div>
            )}

            {/* Action Button - Only show if there are modifications */}
            {hasModifications && (
              <>
                {!isValidated ? (
                  <div className="flex justify-start pt-2">
                    <Button
                      onClick={handleValidateAndAdd}
                      disabled={!mappedColumns.adversarialPrompt || !mappedColumns.attackArea}
                    >
                      Validate and Add
                    </Button>
                  </div>
                ) : validationResult && validationResult.validCount > 0 ? (
                  <div className="flex justify-start">
                    <Button onClick={handleContinueAdding}>
                      Continue Adding {validationResult.validCount} Rows
                    </Button>
                  </div>
                ) : null}
              </>
            )}
          </div>
        )}
      </div>
    </ViewEditSheet>
  );
}
