import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ViewEditSheet } from '@/components/patterns';
import { EvaluationProviderSelectionStep, type EvaluationProviderOption } from './evaluation-provider-selection-step';
import { EvaluationConfigurationStep } from './evaluation-configuration-step';
import type { EvaluationModelFormData } from '../types/evaluation-model';

interface AddEvaluationModelSidepaneProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: EvaluationModelFormData) => void;
}

export function AddEvaluationModelSidepane({ open, onOpenChange, onSave }: AddEvaluationModelSidepaneProps) {
  const [currentStep, setCurrentStep] = useState<'select' | 'configure'>('select');
  const [selectedProvider, setSelectedProvider] = useState<EvaluationProviderOption | null>(null);

  const [name, setName] = useState('');
  const [apiKey, setAPIKey] = useState('');
  const [showAPIKey, setShowAPIKey] = useState(false);
  const [modelId, setModelId] = useState('');
  const [customEndpoint, setCustomEndpoint] = useState('');

  const handleProviderSelect = (provider: EvaluationProviderOption) => {
    setSelectedProvider(provider);
    setCurrentStep('configure');

    // Set default model for non-custom providers
    if (provider.id !== 'custom' && provider.models.length > 0) {
      setModelId(provider.models[0]);
    } else {
      setModelId('');
    }
  };

  const handleBackToSelection = () => {
    setCurrentStep('select');
    setSelectedProvider(null);
    setName('');
    setAPIKey('');
    setModelId('');
    setCustomEndpoint('');
    setShowAPIKey(false);
  };

  const handleSubmit = () => {
    if (!selectedProvider) return;

    // Map provider ID to the type expected by EvaluationModel
    const providerType = selectedProvider.id === 'openai' ? 'OpenAI'
      : selectedProvider.id === 'anthropic' ? 'Anthropic'
      : 'OpenAI'; // Custom uses OpenAI type for compatibility

    const formData: EvaluationModelFormData = {
      name: name.trim(),
      provider: providerType,
      apiKey: apiKey.trim(),
      modelId: modelId.trim(),
    };

    onSave(formData);

    // Reset form
    resetForm();
  };

  const resetForm = () => {
    setCurrentStep('select');
    setSelectedProvider(null);
    setName('');
    setAPIKey('');
    setModelId('');
    setCustomEndpoint('');
    setShowAPIKey(false);
  };

  const handleDialogOpenChange = (open: boolean) => {
    onOpenChange(open);
    if (!open) {
      resetForm();
    }
  };

  const isFormValid = name.trim() && apiKey.trim() && modelId.trim();

  return (
    <ViewEditSheet
      open={open}
      onOpenChange={handleDialogOpenChange}
      title="Add Evaluation Model"
      size="md"
      footer={
        currentStep === 'configure' ? (
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={handleBackToSelection}
            >
              Back
            </Button>
            <Button onClick={handleSubmit} disabled={!isFormValid}>
              Add Model
            </Button>
          </div>
        ) : undefined
      }
    >
      {currentStep === 'select' ? (
        <EvaluationProviderSelectionStep onProviderSelect={handleProviderSelect} />
      ) : (
        <EvaluationConfigurationStep
          provider={selectedProvider!}
          name={name}
          onNameChange={setName}
          apiKey={apiKey}
          onAPIKeyChange={setAPIKey}
          showAPIKey={showAPIKey}
          onToggleAPIKey={() => setShowAPIKey(!showAPIKey)}
          modelId={modelId}
          onModelChange={setModelId}
          customEndpoint={customEndpoint}
          onCustomEndpointChange={setCustomEndpoint}
          onBackToSelection={handleBackToSelection}
        />
      )}
    </ViewEditSheet>
  );
}
