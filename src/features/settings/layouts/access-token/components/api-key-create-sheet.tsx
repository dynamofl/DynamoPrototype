/**
 * APIKeyCreateSheet component for adding new API keys
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ViewEditSheet } from "@/components/patterns";
import { AISystemIcon } from "@/components/patterns/ai-system-icon";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import type { TableRow } from "@/types/table";

export interface APIKeyCreateSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  provider: TableRow | null;
  onAPIKeyCreated: (provider: TableRow, name: string, apiKey: string) => void;
}

// API validation functions for different providers
const validateAPIKey = async (
  provider: string,
  apiKey: string
): Promise<boolean> => {
  // Simulate API validation - in real implementation, you would make actual API calls
  return new Promise((resolve) => {
    setTimeout(() => {
      // Mock validation logic
      if (provider === "OpenAI" && apiKey.startsWith("sk-")) {
        resolve(true);
      } else if (provider === "Azure OpenAI" && apiKey.length > 20) {
        resolve(true);
      } else if (provider === "Anthropic" && apiKey.startsWith("sk-ant-")) {
        resolve(true);
      } else if (provider === "Mistral" && apiKey.length > 30) {
        resolve(true);
      } else if (provider === "AWS Bedrock" && apiKey.length > 20) {
        resolve(true);
      } else if (provider === "Databricks" && apiKey.length > 20) {
        resolve(true);
      } else {
        resolve(false);
      }
    }, 2000); // Simulate network delay
  });
};

export function APIKeyCreateSheet({
  open,
  onOpenChange,
  provider,
  onAPIKeyCreated,
}: APIKeyCreateSheetProps) {
  const [formData, setFormData] = useState({
    name: "",
    apiKey: "",
  });
  const [validationError, setValidationError] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [validationStatus, setValidationStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  const resetForm = () => {
    setFormData({
      name: "",
      apiKey: "",
    });
    setValidationError("");
    setValidationStatus("idle");
    setIsValidating(false);
  };

  const handleDialogOpenChange = (open: boolean) => {
    onOpenChange(open);
    if (!open) {
      resetForm();
    }
  };

  const handleValidateAndSave = async () => {
    if (!provider) return;

    // Validation
    if (!formData.name.trim()) {
      setValidationError("API key name is required");
      return;
    }

    if (!formData.apiKey.trim()) {
      setValidationError("API key is required");
      return;
    }

    setValidationError("");
    setIsValidating(true);
    setValidationStatus("idle");

    try {
      const isValid = await validateAPIKey(
        provider.provider,
        formData.apiKey.trim()
      );

      if (isValid) {
        setValidationStatus("success");
        // Save the API key
        onAPIKeyCreated(provider, formData.name.trim(), formData.apiKey.trim());
        handleDialogOpenChange(false);
      } else {
        setValidationStatus("error");
        setValidationError(
          "Invalid API key. Please check your key and try again."
        );
      }
    } catch (error) {
      setValidationStatus("error");
      setValidationError("Failed to validate API key. Please try again.");
    } finally {
      setIsValidating(false);
    }
  };

  if (!provider) return null;

  const getProviderIconType = (providerName: string) => {
    const iconMap: Record<string, any> = {
      OpenAI: "OpenAI",
      "Azure OpenAI": "Azure",
      Databricks: "Databricks",
      Mistral: "Mistral",
      "AWS Bedrock": "AWS",
      Anthropic: "Anthropic",
    };
    return iconMap[providerName] || "Remote";
  };

  return (
    <ViewEditSheet
      open={open}
      onOpenChange={handleDialogOpenChange}
      title="Add API Key"
      size="md"
      footer={
        <div className="flex gap-2">
          <Button
            onClick={handleValidateAndSave}
            disabled={isValidating}
            className="flex w-fit bg-blue-600 text-white hover:bg-blue-700"
          >
            {isValidating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Validating...
              </>
            ) : (
              "Validate & Save"
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => handleDialogOpenChange(false)}
            disabled={isValidating}
          >
            Cancel
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Provider Info */}
        <div className="space-y-2">
          <Label htmlFor="api-key-name">API Provider</Label>

          <div className="flex items-center space-x-1 p-1 bg-gray-50 rounded-lg border border-gray-200">
            <AISystemIcon
              type={getProviderIconType(provider.provider)}
              className="w-8 h-8"
            />
            <div>
              <p className="text-sm font-450 text-gray-900">
                {provider.provider}
              </p>
            </div>
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="api-key-name">API Key Name</Label>
            <Input
              id="api-key-name"
              placeholder="Enter a nickname for this API key"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="api-key">API Key</Label>
            <Input
              id="api-key"
              type="password"
              placeholder="Enter your API key"
              value={formData.apiKey}
              onChange={(e) =>
                setFormData({ ...formData, apiKey: e.target.value })
              }
              required
            />
            <p className="text-xs text-gray-500">
              Your API key will be encrypted and stored securely.
            </p>
          </div>
        </div>

        {/* Validation Status */}
        {validationStatus === "success" && (
          <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-md">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-800">
              API key validated successfully!
            </span>
          </div>
        )}

        {validationStatus === "error" && (
          <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
            <XCircle className="h-4 w-4 text-red-600" />
            <span className="text-sm text-red-800">
              API key validation failed
            </span>
          </div>
        )}

        {validationError && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
            {validationError}
          </div>
        )}
      </div>
    </ViewEditSheet>
  );
}
