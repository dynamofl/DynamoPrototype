/**
 * AI System View Sheet component
 * Displays AI system information in read-only mode with option to edit
 */

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { KeyRound } from "lucide-react";
import { AISystemIcon } from "@/components/patterns";
import { ViewEditSheet } from "@/components/patterns";
import type {
  AISystem,
  ProviderOption,
} from "../types";
import {
  getProvidersWithAPIKeys,
} from "../lib";

export interface AISystemViewSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  aiSystem: AISystem | null;
  onEditClick: () => void;
}

export function AISystemViewSheet({
  open,
  onOpenChange,
  aiSystem,
  onEditClick,
}: AISystemViewSheetProps) {
  // Available providers with API keys
  const [currentProvider, setCurrentProvider] = useState<ProviderOption | null>(null);
  const [currentAPIKey, setCurrentAPIKey] = useState<{ id: string; name: string; key: string } | null>(null);

  // Load providers and initialize data when dialog opens
  useEffect(() => {
    if (open && aiSystem) {
      loadProviders();
    }
  }, [open, aiSystem]);

  const loadProviders = async () => {
    try {
      const providersWithKeys = await getProvidersWithAPIKeys();

      // Find the current provider
      const provider = providersWithKeys.find(p => p.id === aiSystem?.providerId);
      if (provider) {
        setCurrentProvider(provider);

        // Find the current API key
        const apiKey = provider.apiKeys.find(ak => ak.id === aiSystem?.apiKeyId);
        if (apiKey) {
          setCurrentAPIKey(apiKey);
        }
      }
    } catch (error) {
      console.error("Failed to load providers:", error);
    }
  };

  const handleEditInfo = () => {
    onOpenChange(false);
    onEditClick();
  };

  if (!aiSystem || !currentProvider) {
    return null;
  }

  return (
    <ViewEditSheet
      open={open}
      onOpenChange={onOpenChange}
      title={aiSystem.name}
      size="lg"
      footer={
        <div className="flex justify-end items-center">
          <Button
            onClick={handleEditInfo}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            Edit Info
          </Button>
        </div>
      }
    >
      {/* View Screen - Read Only */}
      <div className="flex-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        <div className="space-y-6">
          {/* Provider Information - Read Only */}
          <div className="space-y-2">
            <Label>API Provider</Label>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <AISystemIcon
                type={currentProvider.icon as any}
                className="w-8 h-8"
              />
              <div className="flex-1">
                <p className="text-[13px] font-450 text-gray-900">
                  {currentProvider.name}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {currentProvider.type}
                </p>
              </div>
            </div>
          </div>

          {/* System Details - Read Only */}
          <div className="space-y-2">
            <Label>System Name</Label>
            <div className="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-[13px] text-gray-900">
                {aiSystem.name}
              </p>
            </div>
          </div>

          {/* API Key Information - Read Only */}
          <div className="space-y-2">
            <Label>API Key</Label>
            {currentAPIKey ? (
              <div className="flex space-x-3 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                <KeyRound className="w-4 h-4 text-gray-500 mt-1" />
                <div className="flex-1">
                  <p className="text-[13px] font-450 text-gray-900">
                    {currentAPIKey.name}
                  </p>
                  <div className="text-xs text-gray-500 mt-1">
                    {currentAPIKey.key.substring(0, 4)}•••••••{currentAPIKey.key.substring(currentAPIKey.key.length - 2)}
                  </div>
                </div>
                <div className="flex items-start pt-0.5">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                    Primary
                  </span>
                </div>
              </div>
            ) : (
              <div className="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-500">No API key assigned</p>
              </div>
            )}
          </div>

          {/* Model Information - Read Only */}
          <div className="space-y-2">
            <Label>Model</Label>
            <div className="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-[13px] font-450 text-gray-900">
                {aiSystem.selectedModel || "Unknown Model"}
              </p>
              {aiSystem.modelDetails?.name && aiSystem.modelDetails.name !== aiSystem.selectedModel && (
                <p className="text-xs text-gray-500 mt-1">
                  {aiSystem.modelDetails.name}
                </p>
              )}
            </div>
          </div>

          {/* Status Information - Read Only */}
          <div className="space-y-2">
            <Label>Status</Label>
            <div className="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  aiSystem.hasValidAPIKey ? 'bg-green-600' : 'bg-gray-400'
                }`} />
                <p className="text-[13px] text-gray-900">
                  {aiSystem.hasValidAPIKey ? 'Connected' : 'Disconnected'}
                </p>
              </div>
            </div>
          </div>

          {/* Created At - Read Only */}
          <div className="space-y-2">
            <Label>Created At</Label>
            <div className="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-[13px] text-gray-900">
                {aiSystem.createdAt}
              </p>
            </div>
          </div>

          {/* Guardrails Information - Read Only */}
          {aiSystem.hasGuardrails !== undefined && (
            <div className="space-y-2">
              <Label>Guardrails</Label>
              <div className="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-[13px] text-gray-900">
                  {aiSystem.hasGuardrails ? 'Enabled' : 'Disabled'}
                </p>
              </div>
            </div>
          )}

          {/* Evaluation Status - Read Only */}
          {aiSystem.isEvaluated !== undefined && (
            <div className="space-y-2">
              <Label>Evaluation Status</Label>
              <div className="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-[13px] text-gray-900">
                  {aiSystem.isEvaluated ? 'Evaluated' : 'Not Evaluated'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </ViewEditSheet>
  );
}
