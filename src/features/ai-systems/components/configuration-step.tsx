/**
 * Configuration Step component
 * Handles the configuration of AI system details, API keys, and model selection
 */

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, EyeOff, KeyRound, Plus, RefreshCw } from "lucide-react";
import { AISystemIcon } from "@/components/patterns";
import type {
  AISystemFormData,
  ProviderOption,
  AIModel,
} from "../types";

export interface ConfigurationStepProps {
  selectedProvider: ProviderOption;
  formData: AISystemFormData;
  onFormDataChange: (data: AISystemFormData) => void;
  selectedAPIKeys: string[];
  onAPIKeyToggle: (apiKeyId: string, checked: boolean) => Promise<void>;
  primaryAPIKey: string | null;
  onSetPrimaryKey: (apiKeyId: string) => Promise<void>;
  availableModels: AIModel[];
  selectedModel: string;
  onModelSelect: (modelId: string) => void;
  isFetchingModels: boolean;
  onBackToSelection: () => void;
  validationError: string;
  onCreateNewAPIKey: () => Promise<void>;
  newAPIKey: {
    name: string;
    key: string;
    showKey: boolean;
  };
  onNewAPIKeyChange: (key: keyof ConfigurationStepProps['newAPIKey'], value: string | boolean) => void;
  showAddKeyForm: boolean;
  onShowAddKeyFormChange: (show: boolean) => void;
  fieldErrors: {
    apiKeyName: string;
    apiKeyValue: string;
  };
  isValidating: boolean;
  isConnecting: boolean;
}

export function ConfigurationStep({
  selectedProvider,
  formData,
  onFormDataChange,
  selectedAPIKeys,
  onAPIKeyToggle,
  primaryAPIKey,
  onSetPrimaryKey,
  availableModels,
  selectedModel,
  onModelSelect,
  isFetchingModels,
  onBackToSelection,
  validationError,
  onCreateNewAPIKey,
  newAPIKey,
  onNewAPIKeyChange,
  showAddKeyForm,
  onShowAddKeyFormChange,
  fieldErrors,
  isValidating,
  isConnecting,
}: ConfigurationStepProps) {
  return (
    <div className="flex-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
      <div className="space-y-6">
        {/* Validation Error Display */}
        {validationError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-[13px] text-red-600">{validationError}</p>
          </div>
        )}

        {/* Connecting State Display */}
        {/* {isConnecting && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
              <p className="text-[13px] text-blue-600">Connecting to AI system...</p>
            </div>
          </div>
        )} */}

        {/* Provider Configuration */}
        <div className="space-y-2">
          <Label htmlFor="api-key-name">API Provider</Label>
          <div className="flex items-center space-x-1 p-1 bg-gray-50 rounded-lg border border-gray-200">
            <AISystemIcon
              type={selectedProvider.icon as any}
              className="w-8 h-8"
            />
            <div className="flex-1">
              <p className="text-[13px] font-450 text-gray-900">
                {selectedProvider.name}
              </p>
            </div>
            <Button
              variant="link"
              size="sm"
              onClick={onBackToSelection}
              className="underline"
            >
              Change
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {/* System Details */}
          <div className="space-y-2">
            <Label htmlFor="system-name">System Name</Label>
            <Input
              id="system-name"
              placeholder="Enter Name (e.g., Production Chatbot, Dev Assistant)"
              value={formData.name}
              onChange={(e) =>
                onFormDataChange({
                  ...formData,
                  name: e.target.value,
                })
              }
            />
          </div>

          {/* API Key Selection */}
          <div className="space-y-2">
            <Label>API Key</Label>
            {selectedProvider.hasApiKeys ? (
              <div className="space-y-3">
                {/* Available API Keys List */}
                <div className="">
                  <div className="space-y-2">
                    {selectedProvider.apiKeys.map((apiKey) => (
                      <div
                        key={apiKey.id}
                        className="flex space-x-3 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex space-x-3 flex-1">
                          <KeyRound className="w-4 h-4 text-gray-500 mt-1.5" />
                          <div className="flex-1">
                            <Label htmlFor={apiKey.id} className="font-450 text-[13px] text-gray-900 cursor-pointer">
                              {apiKey.name}
                            </Label>
                            <div className="text-xs text-gray-500 mt-1">
                              {apiKey.key.substring(0,4)}•••••••{apiKey.key.substring(apiKey.key.length - 2)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-start pt-0.5 space-x-3">
                          {selectedAPIKeys.includes(apiKey.id) && (
                            <Button
                              onClick={() => onSetPrimaryKey(apiKey.id)}
                              variant={primaryAPIKey === apiKey.id ? "subtle" : "outline"}
                              size="sm"
                              className="text-xs"
                            >
                              {primaryAPIKey === apiKey.id ? "Primary Key" : "Mark as Primary Key"}
                            </Button>
                          )}
                          <Checkbox
                            id={apiKey.id}
                            checked={selectedAPIKeys.includes(apiKey.id)}
                            onCheckedChange={(checked: boolean) => onAPIKeyToggle(apiKey.id, checked)}
                            className="mt-1"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Create New API Key Section */}
                {!showAddKeyForm ? (
                  <div>
                    <Button
                      onClick={() => onShowAddKeyFormChange(true)}
                      variant="secondary"
                      size="default"
                      className="w-fit"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add New Key
                    </Button>
                  </div>
                ) : (
                  <div className="">
                    <div className="flex space-x-3 px-3 py-2 border border-gray-200 rounded-lg">
                      <KeyRound className="w-4 h-4 text-gray-500 mt-1.5" />
                      <div className="grid grid-cols-1 gap-3 flex-1 pb-3">
                        <div>
                          <Label
                            htmlFor="new-api-key-name"
                            className="text-xs font-450 text-gray-600"
                          >
                            API Key Name
                          </Label>
                          <Input
                            id="new-api-key-name"
                            placeholder="e.g., Production Key, Dev Key"
                            value={newAPIKey.name}
                            onChange={(e) => {
                              onNewAPIKeyChange("name", e.target.value);
                              // Clear error when user starts typing
                              if (fieldErrors.apiKeyName) {
                                // This would need to be handled by parent component
                              }
                            }}
                            error={fieldErrors.apiKeyName}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label
                            htmlFor="new-api-key-value"
                            className="text-xs font-450 text-gray-600"
                          >
                            API Key
                          </Label>
                          <div className="relative mt-1">
                            <Input
                              id="new-api-key-value"
                              type={newAPIKey.showKey ? "text" : "password"}
                              placeholder="sk-..."
                              value={newAPIKey.key}
                              onChange={(e) => {
                                onNewAPIKeyChange("key", e.target.value);
                                // Clear error when user starts typing
                                if (fieldErrors.apiKeyValue) {
                                  // This would need to be handled by parent component
                                }
                              }}
                              error={fieldErrors.apiKeyValue}
                              className="pr-10"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                              onClick={() => onNewAPIKeyChange("showKey", !newAPIKey.showKey)}
                            >
                              {newAPIKey.showKey ? (
                                <Eye className="h-4 w-4" />
                              ) : (
                                <EyeOff className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                        <div className="flex space-x-2 pt-2">
                          <Button
                            onClick={onCreateNewAPIKey}
                            disabled={
                              !newAPIKey.name.trim() ||
                              !newAPIKey.key.trim() ||
                              isValidating
                            }
                            size="sm"
                            className="w-fit"
                          >
                            {isValidating ? "Validating..." : isConnecting ? "Connecting..." : "Validate and Save"}
                          </Button>
                          <Button
                            onClick={() => {
                              onShowAddKeyFormChange(false);
                              onNewAPIKeyChange("name", "");
                              onNewAPIKeyChange("key", "");
                              onNewAPIKeyChange("showKey", false);
                            }}
                            variant="outline"
                            size="sm"
                            className="w-fit"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="">
                <div className="flex space-x-3 px-3 py-2 border border-gray-200 rounded-lg">
                  <KeyRound className="w-4 h-4 text-gray-500 mt-1.5" />
                  <div className="grid grid-cols-1 gap-3 flex-1 pb-3">
                    <div>
                      <Label
                        htmlFor="new-api-key-name"
                        className="text-xs font-450 text-gray-600"
                      >
                        API Key Name
                      </Label>
                      <Input
                        id="new-api-key-name"
                        placeholder="e.g., Production Key, Dev Key"
                        value={newAPIKey.name}
                        onChange={(e) => {
                          onNewAPIKeyChange("name", e.target.value);
                          // Clear error when user starts typing
                          if (fieldErrors.apiKeyName) {
                            // This would need to be handled by parent component
                          }
                        }}
                        error={fieldErrors.apiKeyName}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="new-api-key-value"
                        className="text-xs font-450 text-gray-600"
                      >
                        API Key
                      </Label>
                      <div className="mt-1">
                        <div className="relative">
                          <Input
                            id="new-api-key-value"
                            type={newAPIKey.showKey ? "text" : "password"}
                            placeholder="sk-..."
                            value={newAPIKey.key}
                            onChange={(e) => {
                              onNewAPIKeyChange("key", e.target.value);
                              // Clear error when user starts typing
                              if (fieldErrors.apiKeyValue) {
                                // This would need to be handled by parent component
                              }
                            }}
                            error={fieldErrors.apiKeyValue}
                            className="pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                            onClick={() => onNewAPIKeyChange("showKey", !newAPIKey.showKey)}
                          >
                            {newAPIKey.showKey ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2 pt-2">
                      <Button
                        onClick={onCreateNewAPIKey}
                        disabled={
                          !newAPIKey.name.trim() ||
                          !newAPIKey.key.trim() ||
                          isValidating
                        }
                        size="sm"
                        className="w-fit"
                      >
                        {isValidating ? "Validating..." : isConnecting ? "Connecting..." : "Validate and Save"}
                      </Button>
                      <Button
                        onClick={() => {
                          onNewAPIKeyChange("name", "");
                          onNewAPIKeyChange("key", "");
                          onNewAPIKeyChange("showKey", false);
                        }}
                        variant="outline"
                        size="sm"
                        className="w-fit"
                      >
                        Reset
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Model Selection */}
          <div className="space-y-2">
            <Label>Model</Label>
            <Select
              value={selectedModel}
              onValueChange={onModelSelect}
              disabled={availableModels.length === 0 || isFetchingModels}
            >
              <SelectTrigger className="w-full">
                <SelectValue 
                  placeholder={
                    isFetchingModels
                      ? "Fetching models..."
                      : availableModels.length === 0 
                        ? "Select API key first to fetch models" 
                        : "Select a model"
                  } 
                />
              </SelectTrigger>
              <SelectContent>
                {isFetchingModels ? (
                  <div className="flex items-center justify-center py-4">
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    <span className="text-[13px] text-gray-600">Loading models...</span>
                  </div>
                ) : (
                  availableModels.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      {model.id}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {availableModels.length === 0 && !primaryAPIKey && !isFetchingModels && (
              <p className="text-xs text-gray-500">
                Select an API key to automatically fetch available models
              </p>
            )}
            {availableModels.length === 0 && primaryAPIKey && !isFetchingModels && (
              <p className="text-xs text-gray-500">
                No models available for the selected primary key
              </p>
            )}
            {isFetchingModels && (
              <p className="text-xs text-gray-500">
                Fetching models from the primary API key...
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
