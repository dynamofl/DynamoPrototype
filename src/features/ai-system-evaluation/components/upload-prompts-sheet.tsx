import { useState } from "react";
import { Upload, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ViewEditSheet } from "@/components/patterns";

interface UploadPromptsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  policyName: string;
  onUpload: (prompts: Array<{ prompt: string }>, fileName: string) => void;
  existingPrompts?: Array<{ prompt: string }>;
  existingFileName?: string;
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
  const [parsedPrompts, setParsedPrompts] = useState<Array<{ prompt: string }>>(
    existingPrompts || []
  );
  const [error, setError] = useState("");

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
        setParsedPrompts([]);
        return;
      }

      const prompts = lines.map((line) => ({
        prompt: line.trim(),
      }));

      setParsedPrompts(prompts);
    } catch (err) {
      setError("Failed to read the file. Please try again.");
      setParsedPrompts([]);
    }
  };

  const handleUpload = () => {
    if (parsedPrompts.length === 0) {
      setError("Please upload a file with at least one prompt.");
      return;
    }

    onUpload(parsedPrompts, selectedFile?.name || existingFileName || "");
    onOpenChange(false);

    // Reset state
    setSelectedFile(null);
    setParsedPrompts([]);
    setError("");
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setParsedPrompts([]);
    setError("");
  };

  const handleCancel = () => {
    onOpenChange(false);
    setSelectedFile(null);
    setParsedPrompts(existingPrompts || []);
    setError("");
  };

  return (
    <ViewEditSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Upload Additional Prompts"
      description={`Add more test prompts for the ${policyName} policy`}
      size="lg"
    >
      <div className="space-y-6 mt-6">
        {/* File Upload Section */}
        <div className="space-y-3">
          <Label>Dataset File</Label>
          <p className="text-xs text-gray-600">
            Upload a CSV or text file with additional test prompts (one per line)
          </p>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
            <input
              id="file-upload"
              type="file"
              accept=".csv,.txt"
              onChange={handleFileChange}
              className="hidden"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer flex flex-col items-center gap-2"
            >
              <Upload className="h-8 w-8 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">
                Choose a file or drag and drop
              </span>
              <span className="text-xs text-gray-500">CSV or TXT (one prompt per line)</span>
            </label>
          </div>

          {/* Selected File Display */}
          {(selectedFile || existingFileName) && (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-gray-600" />
                <span className="text-sm text-gray-900">
                  {selectedFile?.name || existingFileName}
                </span>
                <span className="text-xs text-gray-500">
                  ({parsedPrompts.length} prompts)
                </span>
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

        {/* Preview Section */}
        {parsedPrompts.length > 0 && (
          <div className="space-y-3">
            <Label>Preview ({parsedPrompts.length} prompts)</Label>
            <div className="border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
              <div className="divide-y divide-gray-100">
                {parsedPrompts.slice(0, 5).map((prompt, index) => (
                  <div key={index} className="p-3 text-sm text-gray-700">
                    {prompt.prompt}
                  </div>
                ))}
                {parsedPrompts.length > 5 && (
                  <div className="p-3 text-sm text-gray-500 text-center">
                    + {parsedPrompts.length - 5} more prompts
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-4">
          <Button variant="outline" onClick={handleCancel} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={parsedPrompts.length === 0}
            className="flex-1"
          >
            Upload Prompts
          </Button>
        </div>
      </div>
    </ViewEditSheet>
  );
}
