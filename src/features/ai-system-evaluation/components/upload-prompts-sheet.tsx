import { useState } from "react";
import { Upload, FileText, X, Lightbulb, Info, Download, ChevronDown } from "lucide-react";
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
    <div className="bg-gray-50 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-3 px-2 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2">
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
  onUpload: (prompts: Array<{ prompt: string }>, fileName: string) => void;
  existingPrompts?: Array<{ prompt: string }>;
  existingFileName?: string;
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
}: UploadPromptsSheetProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [csvData, setCSVData] = useState<CSVData | null>(null);
  const [parsedResult, setParsedResult] = useState<ParsedCSVResult | null>(null);
  const [error, setError] = useState("");
  const [showMapping, setShowMapping] = useState(false);
  const [tipsExpanded, setTipsExpanded] = useState(true);
  const [mappedColumns, setMappedColumns] = useState<{
    adversarialPrompt: string;
    attackArea: string;
  }>({
    adversarialPrompt: "",
    attackArea: "",
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setSelectedFile(file);

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

  const handleMapColumns = () => {
    if (!csvData || !mappedColumns.adversarialPrompt || !mappedColumns.attackArea) {
      setError("Please map both required columns.");
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

    setParsedResult({
      validCount,
      invalidCount,
      totalCount: csvData.rows.length,
      prompts: validPrompts
    });
    setShowMapping(false);
    setError("");
  };

  const handleUpload = () => {
    if (!parsedResult || parsedResult.validCount === 0) {
      setError("Please upload a file with at least one valid prompt.");
      return;
    }

    onUpload(parsedResult.prompts, selectedFile?.name || existingFileName || "");
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
    setSelectedFile(null);
    setCSVData(null);
    setParsedResult(null);
    setShowMapping(false);
    setMappedColumns({ adversarialPrompt: "", attackArea: "" });
    setError("");
    setTipsExpanded(true); // Expand tips when file is removed
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
    if (!csvData || !mappedColumns.adversarialPrompt || !mappedColumns.attackArea) return [];

    const adversarialPromptIndex = csvData.headers.indexOf(mappedColumns.adversarialPrompt);
    const attackAreaIndex = csvData.headers.indexOf(mappedColumns.attackArea);

    return csvData.rows.slice(0, 5).map((row, idx) => ({
      id: idx + 1,
      adversarialPrompt: row[adversarialPromptIndex] || "-",
      attackArea: row[attackAreaIndex] || "-"
    }));
  };

  const previewRows = getPreviewRows();

  return (
    <ViewEditSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Upload Additional Prompts"
      size="2xl"
      footer={
        <div className="flex justify-between items-center">
          <Button variant="outline" onClick={handleCancel} className="flex-1 mr-2">
            Cancel
          </Button>
          {!showMapping && (
            <Button
              onClick={handleUpload}
              disabled={!parsedResult || parsedResult.validCount === 0}
              className="flex-1"
            >
              Upload Prompts
            </Button>
          )}
        </div>
      }
    >
      <div className="space-y-6">
        {/* Tips Section */}
        <TipsSection
          isExpanded={tipsExpanded}
          onToggle={() => setTipsExpanded(!tipsExpanded)}
        />

        {/* File Upload Section */}
        <div className="space-y-3">
          {/* Drop Container - Only show when no file is selected */}
          {!selectedFile && !existingFileName && (
            <div className="bg-white h-[180px] relative rounded-lg">
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
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4 text-gray-600" />
                <div className="flex flex-col">
                  <span className="text-sm text-gray-900">
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
                className="text-gray-400 hover:text-gray-600 transition-colors"
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
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-[13px] font-450 text-gray-900">Configure Import Data</h3>
              <p className="text-xs text-gray-600">
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
                  onValueChange={(value) =>
                    setMappedColumns((prev) => ({ ...prev, adversarialPrompt: value }))
                  }
                >
                  <SelectTrigger className="text-[13px]">
                    <SelectValue placeholder="Select column..." />
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
                  onValueChange={(value) =>
                    setMappedColumns((prev) => ({ ...prev, attackArea: value }))
                  }
                >
                  <SelectTrigger className="text-[13px]">
                    <SelectValue placeholder="Select column..." />
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
            {mappedColumns.adversarialPrompt && mappedColumns.attackArea && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <h4 className="text-[13px] font-450 text-gray-900">
                    Preview Data to be Imported
                  </h4>
                  <p className="text-xs text-gray-600">
                    A total of {csvData.rows.length} rows will be added to the table "{policyName}"
                  </p>
                  <p className="text-xs text-gray-500">
                    Here is a preview of the data that will be added (up to the first 20 columns and first 20 rows).
                  </p>
                </div>

                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">
                          id
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">
                          adversarial_prompt
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">
                          attack_area
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {previewRows.map((row) => (
                        <tr key={row.id} className="hover:bg-gray-50">
                          <td className="px-3 py-2 text-xs text-gray-900">{row.id}</td>
                          <td className="px-3 py-2 text-xs text-gray-700 max-w-xs truncate">
                            {row.adversarialPrompt}
                          </td>
                          <td className="px-3 py-2 text-xs text-gray-700">{row.attackArea}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Map Columns Button */}
            <div className="flex justify-end">
              <Button
                onClick={handleMapColumns}
                disabled={!mappedColumns.adversarialPrompt || !mappedColumns.attackArea}
              >
                Import Data
              </Button>
            </div>
          </div>
        )}
      </div>
    </ViewEditSheet>
  );
}
