/**
 * AI System Edit Sheet component
 * Uses the exact same layout as create dialog but with specific editability rules
 */

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, KeyRound, Plus } from "lucide-react";
import { AISystemIcon } from "@/components/patterns";
import { ViewEditSheet } from "@/components/patterns";
import type {
  AISystem,
  ProviderOption,
} from "../types";
import {
  getProvidersWithAPIKeys,
  fetchModelsFromProvider,
  createAndStoreAPIKey,
} from "../lib";
import { validateProviderKeyFormat, getProviderKeyPlaceholder, type ProviderType } from "../lib/provider-validation";

export interface AISystemEditSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAISystemUpdated: (system: AISystem) => void;
  aiSystem: AISystem | null;
}

export function AISystemEditSheet({
  open,
  onOpenChange,
  onAISystemUpdated,
  aiSystem,
}: AISystemEditSheetProps) {
  const [selectedAPIKeys, setSelectedAPIKeys] = useState<string[]>([]);
  const [primaryAPIKey, setPrimaryAPIKey] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    name: "",
  });

  // New API key form (when creating a new API key)
  const [newAPIKey, setNewAPIKey] = useState({
    name: "",
    key: "",
    showKey: false,
  });
  
  // State to track if "Add Key" form is expanded
  const [showAddKeyForm, setShowAddKeyForm] = useState(false);

  // Field-specific error states
  const [fieldErrors, setFieldErrors] = useState({
    apiKeyName: "",
    apiKeyValue: "",
  });

  // Available providers with API keys
  const [currentProvider, setCurrentProvider] = useState<ProviderOption | null>(null);

  // Load providers and initialize data when dialog opens
  useEffect(() => {
    if (open && aiSystem) {
      loadProviders();
      initializeFormData();
    }
  }, [open, aiSystem]);

  const loadProviders = async () => {
    try {
      const providersWithKeys = await getProvidersWithAPIKeys();
      
      // Find the current provider
      const provider = providersWithKeys.find(p => p.id === aiSystem?.providerId);
      if (provider) {
        setCurrentProvider(provider);
        
        // Initialize API key selections
        if (aiSystem?.apiKeyId) {
          setSelectedAPIKeys([aiSystem.apiKeyId]);
          setPrimaryAPIKey(aiSystem.apiKeyId);
        }
      }
    } catch (error) {
      console.error("Failed to load providers:", error);
    }
  };

  const initializeFormData = () => {
    if (aiSystem) {
      setFormData({
        name: aiSystem.name || "",
      });
    }
  };

  const handleAPIKeyToggle = async (apiKeyId: string, checked: boolean) => {
    if (checked) {
      const newSelectedKeys = [...selectedAPIKeys, apiKeyId];
      setSelectedAPIKeys(newSelectedKeys);
      
      // If this is the first key selected, make it primary and fetch models
      if (selectedAPIKeys.length === 0) {
        setPrimaryAPIKey(apiKeyId);
        await fetchModelsWithKey(apiKeyId);
      }
    } else {
      const newSelectedKeys = selectedAPIKeys.filter(id => id !== apiKeyId);
      setSelectedAPIKeys(newSelectedKeys);
      
      // If the unchecked key was the primary key, handle primary key change
      if (primaryAPIKey === apiKeyId) {
        if (newSelectedKeys.length > 0) {
          // Set the first remaining key as primary and fetch models
          const newPrimaryKey = newSelectedKeys[0];
          setPrimaryAPIKey(newPrimaryKey);
          await fetchModelsWithKey(newPrimaryKey);
        } else {
          // No keys selected, clear everything
          setPrimaryAPIKey(null);
        }
      }
    }
  };

  const fetchModelsWithKey = async (apiKeyId: string, provider?: any) => {
    setIsFetchingModels(true);

    try {
      const currentProviderToUse = provider || currentProvider;
      const apiKey = currentProviderToUse?.apiKeys.find(ak => ak.id === apiKeyId);
      if (apiKey && currentProviderToUse) {
        const models = await fetchModelsFromProvider(currentProviderToUse.type, apiKey.key);
        setAvailableModels(models);
      }
    } catch (error) {
      console.error("Failed to fetch models:", error);
      setValidationError("Failed to fetch models. Please check your API key.");
    } finally {
      setIsFetchingModels(false);
    }
  };

  const handleSetPrimaryKey = async (apiKeyId: string) => {
    if (primaryAPIKey === apiKeyId) return; // Already primary
    
    setPrimaryAPIKey(apiKeyId);
    await fetchModelsWithKey(apiKeyId);
  };

  const handleCreateNewAPIKey = async () => {
    // Clear previous field errors
    setFieldErrors({ apiKeyName: "", apiKeyValue: "" });

    // Basic validation
    if (!newAPIKey.name.trim()) {
      setFieldErrors(prev => ({ ...prev, apiKeyName: "API key name is required" }));
      return;
    }

    if (!newAPIKey.key.trim()) {
      setFieldErrors(prev => ({ ...prev, apiKeyValue: "API key is required" }));
      return;
    }

    // Provider-specific format validation (now handled in createAndStoreAPIKey)
    // No need for manual validation here as it's centralized

    setIsValidating(true);

    try {
      const result = await createAndStoreAPIKey(
        currentProvider!.type,
        newAPIKey.name.trim(),
        newAPIKey.key.trim(),
        currentProvider!.apiKeys.length === 0 // Skip duplicate checks when no existing keys
      );

      if (result.success) {
        // Reload providers to get the new API key
        await loadProviders();

        // Find the newly created API key
        const updatedProviders = await getProvidersWithAPIKeys();
        const updatedProvider = updatedProviders.find(
          (p) => p.id === currentProvider!.id
        );
        const newAPIKeyOption = updatedProvider?.apiKeys.find(
          (ak) => ak.name === newAPIKey.name.trim()
        );

        if (newAPIKeyOption) {
          // Update the current provider to reflect the new API key
          setCurrentProvider(updatedProvider!);
          
          // Auto-select the newly created key
          setSelectedAPIKeys([newAPIKeyOption.id]);
          setPrimaryAPIKey(newAPIKeyOption.id);
          
          // Fetch models with the new primary key using the updated provider
          await fetchModelsWithKey(newAPIKeyOption.id, updatedProvider!);
        }

        // Reset new API key form
        setNewAPIKey({ name: "", key: "", showKey: false });
        setShowAddKeyForm(false);
        setFieldErrors({ apiKeyName: "", apiKeyValue: "" });
      } else {
        // Handle specific error types
        const error = result.error || "Failed to create API key";
        
        if (error.includes("already exists") && error.includes("name")) {
          setFieldErrors(prev => ({ ...prev, apiKeyName: error }));
        } else if (error.includes("already in use") || error.includes("Invalid API key")) {
          setFieldErrors(prev => ({ ...prev, apiKeyValue: error }));
        } else {
          // For other errors, show on the API key value field
          setFieldErrors(prev => ({ ...prev, apiKeyValue: error }));
        }
      }
    } catch (error) {
      setFieldErrors(prev => ({ ...prev, apiKeyValue: "Failed to create API key. Please try again." }));
    } finally {
      setIsValidating(false);
    }
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      setValidationError("Please fill in the system name");
      return;
    }

    if (!primaryAPIKey) {
      setValidationError("Please select at least one API key");
      return;
    }

    if (!aiSystem) {
      setValidationError("No AI system selected");
      return;
    }

    // Get the primary API key for the system
    const primaryKey = currentProvider!.apiKeys.find(ak => ak.id === primaryAPIKey);

    const updatedSystem: AISystem = {
      ...aiSystem,
      name: formData.name.trim(),
      apiKeyId: primaryKey?.id || "",
      apiKeyName: primaryKey?.name || "",
    };

    onAISystemUpdated(updatedSystem);
    onOpenChange(false);
  };

  const handleCancel = () => {
    // Reset form data to original values
    if (aiSystem) {
      setFormData({
        name: aiSystem.name || "",
      });
    }
    onOpenChange(false);
  };

  if (!aiSystem || !currentProvider) {
    return null;
  }

  return (
    <ViewEditSheet
      open={open}
      onOpenChange={onOpenChange}
      title={`Edit ${aiSystem.name}`}
      size="lg"
      footer={
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isValidating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={
              !primaryAPIKey || !formData.name.trim()
            }
          >
            Save Changes
          </Button>
        </div>
      }
    >
      {/* Configuration Screen - Same layout as create dialog */}
      <div className="flex-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        <div className="space-y-6">
          {/* Provider Configuration - Read Only */}
          <div className="space-y-2">
            <Label htmlFor="api-key-name">API Provider</Label>
            <div className="flex items-center space-x-1 p-1 bg-gray-50 rounded-lg border border-gray-200">
              <AISystemIcon
                type={currentProvider.icon as any}
                className="w-8 h-8"
              />
              <div className="flex-1">
                <p className="text-[0.8125rem]  font-450 text-gray-900">
                  {currentProvider.name}
                </p>
              </div>
              
            </div>
          </div>

          <div className="space-y-6">
            {/* System Details - Editable */}
            <div className="space-y-2">
              <Label htmlFor="system-name">System Name</Label>
              <Input
                id="system-name"
                placeholder="Enter Name (e.g., Production Chatbot, Dev Assistant)"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
              />
            </div>

            {/* API Key Selection - Editable */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Label>API Key</Label>
                {!currentProvider.hasApiKeys && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                    Required
                  </span>
                )}
              </div>
              {currentProvider.hasApiKeys ? (
                <div className="space-y-3">
                  {/* Available API Keys List */}
                  <div className="">
                    <div className="space-y-2">
                      {currentProvider.apiKeys.map((apiKey) => (
                        <div
                          key={apiKey.id}
                          className="flex space-x-3 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex space-x-3 flex-1">
                            <KeyRound className="w-4 h-4 text-gray-500 mt-1.5" />
                            <div className="flex-1">
                              <Label htmlFor={apiKey.id} className="font-450 text-[0.8125rem]  text-gray-900 cursor-pointer">
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
                                onClick={() => handleSetPrimaryKey(apiKey.id)}
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
                              onCheckedChange={(checked: boolean) => handleAPIKeyToggle(apiKey.id, checked)}
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
                        onClick={() => setShowAddKeyForm(true)}
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
                                setNewAPIKey((prev) => ({
                                  ...prev,
                                  name: e.target.value,
                                }));
                                // Clear error when user starts typing
                                if (fieldErrors.apiKeyName) {
                                  setFieldErrors(prev => ({ ...prev, apiKeyName: "" }));
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
                                    setNewAPIKey((prev) => ({
                                      ...prev,
                                      key: e.target.value,
                                    }));
                                    // Clear error when user starts typing
                                    if (fieldErrors.apiKeyValue) {
                                      setFieldErrors(prev => ({ ...prev, apiKeyValue: "" }));
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
                                  onClick={() =>
                                    setNewAPIKey((prev) => ({
                                      ...prev,
                                      showKey: !prev.showKey,
                                    }))
                                  }
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
                            onClick={handleCreateNewAPIKey}
                            disabled={
                              !newAPIKey.name.trim() ||
                              !newAPIKey.key.trim() ||
                              isValidating
                            }
                            size="sm"
                            className="w-fit"
                          >
                            {isValidating ? "Validating..." : "Validate and Save"}
                          </Button>
                          <Button
                            onClick={() => {
                              setShowAddKeyForm(false);
                              setNewAPIKey({ name: "", key: "", showKey: false });
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
                              setNewAPIKey((prev) => ({
                                ...prev,
                                name: e.target.value,
                              }));
                              // Clear error when user starts typing
                              if (fieldErrors.apiKeyName) {
                                setFieldErrors(prev => ({ ...prev, apiKeyName: "" }));
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
                                  setNewAPIKey((prev) => ({
                                    ...prev,
                                    key: e.target.value,
                                  }));
                                  // Clear error when user starts typing
                                  if (fieldErrors.apiKeyValue) {
                                    setFieldErrors(prev => ({ ...prev, apiKeyValue: "" }));
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
                                onClick={() =>
                                  setNewAPIKey((prev) => ({
                                    ...prev,
                                    showKey: !prev.showKey,
                                  }))
                                }
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
                          onClick={handleCreateNewAPIKey}
                          disabled={
                            !newAPIKey.name.trim() ||
                            !newAPIKey.key.trim() ||
                            isValidating
                          }
                          size="sm"
                          className="w-fit"
                        >
                          {isValidating ? "Validating..." : "Validate and Save"}
                        </Button>
                        <Button
                          onClick={() => {
                            setNewAPIKey({ name: "", key: "", showKey: false });
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

            {/* Model Selection - Read Only */}
            <div className="space-y-2">
              <Label>Model</Label>
              <div className="flex items-center space-x-3 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex-1">
                  <p className="text-[0.8125rem]  font-450 text-gray-900">
                    {aiSystem.selectedModel || "Unknown Model"}
                  </p>
                
                </div>
                
              </div>
              <p className="text-xs text-gray-500">
                Model selection cannot be changed after system creation
              </p>
            </div>

          </div>
        </div>
      </div>
    </ViewEditSheet>
  );
}