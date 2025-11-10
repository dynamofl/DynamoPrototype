/**
 * AI System Create Dialog component
 * Handles the creation of new AI systems with provider selection and model picking
 */

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ViewEditSheet } from "@/components/patterns";
import { Loader2 } from "lucide-react";
import { ProviderSelectionStep } from "./provider-selection-step";
import { ConfigurationStep } from "./configuration-step";
import { SuccessStep } from "./success-step";
import type {
  AISystemFormData,
  ProviderOption,
  AIModel,
} from "../types";
import {
  getProvidersWithAPIKeys,
  fetchModelsFromProvider,
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
  const [isConnecting, setIsConnecting] = useState(false);
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
      if (apiKey && currentProvider) {
        const models = await fetchModelsFromProvider(currentProvider.type, apiKey.key);
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

    // Provider-specific validation is now handled in createAndStoreAPIKey
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
    setIsConnecting(false);
    setFormData({
      name: "",
      provider: { id: "", name: "", type: "" },
      apiKey: { id: "", name: "", key: "" },
      selectedModel: "",
      availableModels: [],
    });
  };

  const handleDialogOpenChange = (open: boolean, isExplicitDismiss: boolean = false) => {
    // Prevent closing the dialog on success step except via explicit dismiss
    if (!open && currentStep === "success" && !isExplicitDismiss) {
      // Keep dialog open by explicitly telling parent to stay open
      onOpenChange(true);
      return;
    }
    onOpenChange(open);
    if (!open) {
      resetDialogState();
    }
  };

  const handleDismiss = () => {
    // Trigger parent callback to save the system and reload
    if (createdSystem) {
      onAISystemCreated(createdSystem);
    }
    // Close the dialog
    handleDialogOpenChange(false, true);
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

    // Set connecting state and start timeout
    setIsConnecting(true);

    // Simulate connection process with 2-second timeout
    setTimeout(() => {
      const selectedModelDetails = availableModels.find(
        (m) => m.id === selectedModel
      );

      // Get the primary API key for the system
      const primaryKey = selectedProvider!.apiKeys.find(ak => ak.id === primaryAPIKey);

      const newSystem: any = {
        id: crypto.randomUUID(),
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
        hasValidAPIKey: true, // API key was just validated
        lastValidated: Date.now(), // Timestamp of validation
        isExpanded: false,
      };

      // Store the created system and show success screen
      setCreatedSystem(newSystem);
      setCurrentStep("success");
      setIsConnecting(false);
    }, 2000);
  };

  const shouldDisableClose = currentStep === "success";

  return (
    <ViewEditSheet
      open={open}
      onOpenChange={(isOpen) => handleDialogOpenChange(isOpen, false)}
      disableClose={shouldDisableClose}
      title="Connect AI System"
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
                 !primaryAPIKey || !selectedModel || !formData.name.trim() || isConnecting || isValidating
               }
             >
               {isValidating || isConnecting ? (
                 <>
                   <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                   {isValidating ? "Validating..." : "Connecting..."}
                 </>
               ) : (
                 "Validate & Connect"
               )}
             </Button>
          </div>
        ) : currentStep === "success" ? (
          <div className="flex justify-start items-center">
            <Button
              variant="outline"
              onClick={handleDismiss}
              className="bg-gray-50 text-gray-600 hover:bg-gray-100"
            >
              Dismiss
             </Button>
          </div>
        ) : undefined
      }
    >
      {currentStep === "select" ? (
        <ProviderSelectionStep
          providers={providers}
          onProviderSelect={handleProviderSelect}
        />
      ) : currentStep === "configure" ? (
        <ConfigurationStep
          selectedProvider={selectedProvider!}
          formData={formData}
          onFormDataChange={setFormData}
          selectedAPIKeys={selectedAPIKeys}
          onAPIKeyToggle={handleAPIKeyToggle}
          primaryAPIKey={primaryAPIKey}
          onSetPrimaryKey={handleSetPrimaryKey}
          availableModels={availableModels}
          selectedModel={selectedModel}
          onModelSelect={setSelectedModel}
          isFetchingModels={isFetchingModels}
          onBackToSelection={handleBackToSelection}
          validationError={validationError}
          onCreateNewAPIKey={handleCreateNewAPIKey}
          newAPIKey={newAPIKey}
          onNewAPIKeyChange={(key, value) => {
            if (key === "name" || key === "key") {
              setNewAPIKey(prev => ({ ...prev, [key]: value as string }));
            } else if (key === "showKey") {
              setNewAPIKey(prev => ({ ...prev, [key]: value as boolean }));
            }
          }}
          showAddKeyForm={showAddKeyForm}
          onShowAddKeyFormChange={setShowAddKeyForm}
          fieldErrors={fieldErrors}
          isValidating={isValidating}
          isConnecting={isConnecting}
        />
      ) : (
        <SuccessStep createdSystem={createdSystem} />
      )}
    </ViewEditSheet>
  );
}
