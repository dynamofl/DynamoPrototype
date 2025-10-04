/**
 * Provider Selection Step component
 * Handles the selection of AI system providers
 */

import { ChevronRight } from "lucide-react";
import { AISystemIcon } from "@/components/patterns";
import type { ProviderOption } from "../types";

export interface ProviderSelectionStepProps {
  providers: ProviderOption[];
  onProviderSelect: (provider: ProviderOption) => void;
}

export function ProviderSelectionStep({
  providers,
  onProviderSelect,
}: ProviderSelectionStepProps) {
  return (
    <div className="space-y-3">
      <div className="border-gray-100">
        <p className="text-[0.8125rem]  text-gray-600">Select AI System Provider</p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1">
          {providers.map((provider) => (
            <div
              key={provider.id}
              onClick={() => onProviderSelect(provider)}
              className="p-2 border-b flex flex-row items-center justify-between cursor-pointer transition-all border-gray-200 hover:bg-gray-50 hover:shadow-sm"
            >
              <div className="flex flex-row items-center space-x-1 text-center align-middle">
                <AISystemIcon
                  type={provider.icon as any}
                  className="w-8 h-8"
                />
                <p className="font-450 text-gray-800 text-[0.8125rem] ">
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
            <div className="text-[0.8125rem]  text-gray-400">
              Please configure API keys in Settings first
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
