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
      <div className="border-gray-100 px-2">
        <p className="text-[0.8125rem]  text-gray-600">Select AI System Provider</p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1">
          {providers.map((provider) => (
            <button
              key={provider.id}
              onClick={() => onProviderSelect(provider)}
              autoFocus={false}
              className="w-full p-2 pl-1 pr-3 flex flex-row items-center justify-between cursor-pointer bg-transparent transition-all border-gray-200 hover:border-none hover:rounded-md hover:bg-gray-100 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 text-left"
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
            </button>
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
