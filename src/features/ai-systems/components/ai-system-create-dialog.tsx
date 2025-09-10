/**
 * AI System Create Dialog component
 * Handles the creation of new AI systems with provider selection and model picking
 */

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronRight, Eye, EyeOff, KeyRound, Plus, RefreshCw, CheckCircle, FolderOpen, Shield, CircleGauge } from "lucide-react";
import { AISystemIcon } from "@/components/patterns";
import { ViewEditSheet } from "@/components/patterns";
import type {
  AISystemFormData,
  ProviderOption,
  AIModel,
} from "../types";
import {
  getProvidersWithAPIKeys,
  fetchModelsFromOpenAI,
  createAndStoreAPIKey,
} from "../lib";

export interface AISystemCreateSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAISystemCreated: (system: any) => void;
}

export function AISystemCreateSheet({
  open,
  onOpenChange,
  onAISystemCreated,
}: AISystemCreateSheetProps) {
  const [currentStep, setCurrentStep] = useState<"select" | "configure" | "success">(
    "select"
  );
  const [selectedProvider, setSelectedProvider] =
    useState<ProviderOption | null>(null);
  const [selectedAPIKeys, setSelectedAPIKeys] = useState<string[]>([]);
  const [primaryAPIKey, setPrimaryAPIKey] = useState<string | null>(null);
  const [availableModels, setAvailableModels] = useState<AIModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [isFetchingModels, setIsFetchingModels] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [createdSystem, setCreatedSystem] = useState<any>(null);

  // Form data
  const [formData, setFormData] = useState<AISystemFormData>({
    name: "",
    provider: { id: "", name: "", type: "" },
    apiKey: { id: "", name: "", key: "" },
    selectedModel: "",
    availableModels: [],
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

  // General validation error state
  const [validationError, setValidationError] = useState("");

  // Available providers with API keys
  const [providers, setProviders] = useState<ProviderOption[]>([]);

  // Load providers when dialog opens
  useEffect(() => {
    if (open) {
      loadProviders();
    }
  }, [open]);

  const loadProviders = async () => {
    try {
      const providersWithKeys = await getProvidersWithAPIKeys();
      setProviders(providersWithKeys);
    } catch (error) {
      console.error("Failed to load providers:", error);
    }
  };

  const handleProviderSelect = (provider: ProviderOption) => {
    setSelectedProvider(provider);
    setCurrentStep("configure");
    setSelectedAPIKeys([]);
    setPrimaryAPIKey(null);
    setAvailableModels([]);
    setSelectedModel("");

    setFormData((prev) => ({
      ...prev,
      provider: {
        id: provider.id,
        name: provider.name,
        type: provider.type,
      },
    }));
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
          setAvailableModels([]);
          setSelectedModel("");
        }
      }
    }
  };

  const fetchModelsWithKey = async (apiKeyId: string, provider?: ProviderOption) => {
    setIsFetchingModels(true);

    try {
      const currentProvider = provider || selectedProvider;
      const apiKey = currentProvider?.apiKeys.find(ak => ak.id === apiKeyId);
      if (apiKey) {
        const models = await fetchModelsFromOpenAI(apiKey.key);
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

    if (!newAPIKey.key.startsWith("sk-")) {
      setFieldErrors(prev => ({ ...prev, apiKeyValue: 'OpenAI API keys must start with "sk-"' }));
      return;
    }

    setIsValidating(true);

    try {
      const result = await createAndStoreAPIKey(
        selectedProvider!.type,
        newAPIKey.name.trim(),
        newAPIKey.key.trim(),
        selectedProvider!.apiKeys.length === 0 // Skip duplicate checks when no existing keys
      );

      if (result.success) {
        // Reload providers to get the new API key
        await loadProviders();

        // Find the newly created API key
        const updatedProviders = await getProvidersWithAPIKeys();
        const updatedProvider = updatedProviders.find(
          (p) => p.id === selectedProvider!.id
        );
        const newAPIKeyOption = updatedProvider?.apiKeys.find(
          (ak) => ak.name === newAPIKey.name.trim()
        );

        if (newAPIKeyOption) {
          // Update the selected provider to reflect the new API key
          setSelectedProvider(updatedProvider!);
          
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
          setValidationError(error);
        }
      }
    } catch (error) {
      setValidationError("Failed to create API key. Please try again.");
    } finally {
      setIsValidating(false);
    }
  };

  const handleBackToSelection = () => {
    setCurrentStep("select");
    setSelectedProvider(null);
    setSelectedAPIKeys([]);
    setPrimaryAPIKey(null);
    setAvailableModels([]);
    setSelectedModel("");
    setNewAPIKey({ name: "", key: "", showKey: false });
    setShowAddKeyForm(false);
  };

  const resetDialogState = () => {
    setCurrentStep("select");
    setSelectedProvider(null);
    setSelectedAPIKeys([]);
    setPrimaryAPIKey(null);
    setAvailableModels([]);
    setSelectedModel("");
    setNewAPIKey({ name: "", key: "", showKey: false });
    setShowAddKeyForm(false);
    setFieldErrors({ apiKeyName: "", apiKeyValue: "" });
    setValidationError("");
    setCreatedSystem(null);
    setFormData({
      name: "",
      provider: { id: "", name: "", type: "" },
      apiKey: { id: "", name: "", key: "" },
      selectedModel: "",
      availableModels: [],
    });
  };

  const handleDialogOpenChange = (open: boolean) => {
    onOpenChange(open);
    if (!open) {
      resetDialogState();
    }
  };

  const handleDismiss = () => {
    handleDialogOpenChange(false);
  };

  const handleCreateAISystem = () => {
    if (!formData.name.trim()) {
      setValidationError("Please fill in the system name");
      return;
    }

    if (!primaryAPIKey) {
      setValidationError("Please select at least one API key");
      return;
    }

    if (!selectedModel) {
      setValidationError("Please select a model");
      return;
    }

    const selectedModelDetails = availableModels.find(
      (m) => m.id === selectedModel
    );

    // Get the primary API key for the system
    const primaryKey = selectedProvider!.apiKeys.find(ak => ak.id === primaryAPIKey);

    const newSystem = {
      id: Date.now().toString(),
      name: formData.name.trim(),
      createdAt: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      status: "connected" as const,
      icon: selectedProvider!.type as any,
      hasGuardrails: false,
      isEvaluated: false,
      providerId: selectedProvider!.id,
      providerName: selectedProvider!.name,
      apiKeyId: primaryKey?.id || "",
      apiKeyName: primaryKey?.name || "",
      selectedAPIKeys: selectedAPIKeys, // Store all selected API keys
      selectedModel: selectedModel,
      modelDetails: selectedModelDetails,
      isExpanded: false,
    };

    // Store the created system and show success screen
    setCreatedSystem(newSystem);
    setCurrentStep("success");
    onAISystemCreated(newSystem);
  };

  return (
    <ViewEditSheet
      open={open}
      onOpenChange={handleDialogOpenChange}
      title={
        currentStep === "select"
          ? "Add AI System"
          : currentStep === "configure"
          ? `Configure ${selectedProvider?.name}`
          : "Connect AI System"
      }
      size="lg"
      footer={
        currentStep === "configure" ? (
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={handleBackToSelection}
              disabled={isValidating}
            >
              Back
            </Button>
             <Button
               onClick={handleCreateAISystem}
               disabled={
                 !primaryAPIKey || !selectedModel || !formData.name.trim()
               }
               className="bg-blue-600 text-white hover:bg-blue-700"
             >
               Create AI System
             </Button>
          </div>
        ) : currentStep === "success" ? (
          <div className="flex justify-start items-center">
            <Button
              variant="outline"
              onClick={handleDismiss}
              className="bg-gray-50 text-gray-700 hover:bg-gray-100"
            >
              Dismiss
            </Button>
          </div>
        ) : undefined
      }
    >
      {currentStep === "select" ? (
        // Provider Selection Screen
        <div className="space-y-3">
          <div className=" border-gray-100">
            <p className="text-[13px] text-[#4b5976]">Select AI System Provider</p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1">
              {providers.map((provider) => (
                <div
                  key={provider.id}
                  onClick={() => handleProviderSelect(provider)}
                  className="p-2 border-b flex flex-row items-center justify-between cursor-pointer transition-all border-gray-200 hover:bg-gray-50 hover:shadow-sm"
                >
                  <div className="flex flex-row items-center space-x-1 text-center align-middle">
                      <AISystemIcon
                        type={provider.icon as any}
                        className="w-8 h-8"
                      />
                      <p className="font-450 text-[#192c4b] text-[13px]">
                        {provider.name}
                      </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                </div>
              ))}
            </div>

            {providers.length === 0 && (
              <div className="text-center py-8">
                <div className="text-gray-500 mb-2">
                  No AI providers available
                </div>
                <div className="text-[13px] text-gray-400">
                  Please configure API keys in Settings first
                </div>
              </div>
            )}
          </div>
        </div>
      ) : currentStep === "configure" ? (
        // Configuration Screen
        <div className="flex-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <div className="space-y-6">

            {/* Validation Error Display */}
            {validationError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-[13px] text-red-600">{validationError}</p>
              </div>
            )}

            {/* Provider Configuration */}

            <div className="space-y-2">
          <Label htmlFor="api-key-name">API Provider</Label>

          <div className="flex items-center space-x-1 p-1 bg-gray-50 rounded-lg border border-gray-200">
            <AISystemIcon
              type={selectedProvider!.icon as any}
              className="w-8 h-8"
            />
            <div className="flex-1">
              <p className="text-[13px] font-450 text-gray-900">
                {selectedProvider!.name}
              </p>
            </div>
            <Button
                  variant="link"
                  size="sm"
                  onClick={handleBackToSelection}
                  className="underline"
                >
                  Change
                </Button>
          </div>
        </div>


            <div className="space-y-6">
              {/* System Details */}
              <div className="space-y-2">
                    <Label
                      htmlFor="system-name"
                    >
                      System Name
                    </Label>
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

              {/* API Key Selection */}
              <div className="space-y-2">
                <Label>
                  API Key
                </Label>
                {selectedProvider!.hasApiKeys ? (
                  <div className="space-y-3">
                      {/* Available API Keys List */}
                      <div className="">
                        <div className="space-y-2">
                          {selectedProvider!.apiKeys.map((apiKey) => (
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
                        
                        {/* {isFetchingModels && (
                          <div className="mt-4 pt-3 border-t border-gray-200">
                            <div className="flex items-center justify-center space-x-2 text-[13px] text-gray-600">
                              <RefreshCw className="h-4 w-4 animate-spin" />
                              <span>Fetching models...</span>
                            </div>
                          </div>
                        )} */}
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
                                 className="text-xs font-450 text-gray-700"
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
                                 className="text-xs font-450 text-gray-700"
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
                                     <Eye className="h-4 w-4" />
                                   ) : (
                                     <EyeOff className="h-4 w-4" />
                                   )}
                                 </Button>
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
                              className="text-xs font-450 text-gray-700"
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
                              className="text-xs font-450 text-gray-700"
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

              {/* Model Selection */}
              <div className="space-y-2">
                <Label>
                  Model
                </Label>
                <Select
                  value={selectedModel}
                  onValueChange={setSelectedModel}
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
      ) : (
        // Success Screen
        <div className="flex-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <div className="space-y-6 p-1">
            {/* Success Header */}
            <div className="space-y-3 py-2">
              <div className="flex items-center justify-center w-12 h-12 bg-white border border-gray-200 rounded-xl">
                <AISystemIcon
                  type={createdSystem?.icon as any}
                  className="w-12 h-12"
                />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-450 text-gray-900">
                  AI System Connection Successful
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-[13px] text-gray-700">
                    {createdSystem?.name}
                  </span>
                  <div className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 border border-green-200 rounded-full">
                    <CheckCircle className="w-3 h-3 text-green-600" />
                    <span className="text-xs font-450 text-green-700">
                      Connected
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="space-y-3">
              <p className="text-[13px] font-400 text-gray-600">
                You can start doing following tasks with your AI System
              </p>
              <div className="bg-white border border-gray-200 rounded-lg">
                {/* Add to Project */}
                <div className="flex items-start gap-3 p-4 border-b border-gray-200">
                  <div className="flex items-center justify-center w-5 h-5">
                    <FolderOpen className="w-4 h-4 text-gray-500" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <h4 className="text-[13px] font-450 text-gray-900">
                      Add Your AI System to a Project
                    </h4>
                    <p className="text-[13px] text-gray-500">
                      Integrate the connected AI system into your project
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>

                {/* Run Evaluation */}
                <div className="flex items-start gap-3 p-4 border-b border-gray-200">
                  <div className="flex items-center justify-center w-5 h-5">
                    <CircleGauge className="w-4 h-4 text-gray-500" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <h4 className="text-[13px] font-450 text-gray-900">
                      Evaluate Your AI System
                    </h4>
                    <p className="text-[13px] text-gray-500">
                      Run evaluations to check compliance, uncover vulnerabilities, and autogenerates documentation needed for regulatory and risk audits
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>

                {/* Add Guardrails */}
                <div className="flex items-start gap-3 p-4">
                  <div className="flex items-center justify-center w-5 h-5">
                    <Shield className="w-4 h-4 text-gray-500" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <h4 className="text-[13px] font-450 text-gray-900">
                      Add Guardrails to Your AI System
                    </h4>
                    <p className="text-[13px] text-gray-500">
                      Set up rules and safeguards to keep your AI System safe, controlled, and aligned with your goals.
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </ViewEditSheet>
  );
}

