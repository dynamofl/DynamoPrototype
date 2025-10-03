import { ChevronRight } from "lucide-react";
import { AISystemIcon } from "@/components/patterns";

export interface EvaluationProviderOption {
  id: string;
  name: string;
  icon: string;
  models: string[];
}

export interface EvaluationProviderSelectionStepProps {
  onProviderSelect: (provider: EvaluationProviderOption) => void;
}

const EVALUATION_PROVIDERS: EvaluationProviderOption[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    icon: 'OpenAI',
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo'],
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    icon: 'Anthropic',
    models: ['claude-3-5-sonnet-20241022', 'claude-3-opus-20240229', 'claude-3-sonnet-20240229'],
  },
  {
    id: 'custom',
    name: 'Custom',
    icon: 'Custom',
    models: [],
  },
];

export function EvaluationProviderSelectionStep({
  onProviderSelect,
}: EvaluationProviderSelectionStepProps) {
  return (
    <div className="space-y-3">
      <div className="border-gray-100">
        <p className="text-[13px] text-gray-600">Select Evaluation Provider</p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1">
          {EVALUATION_PROVIDERS.map((provider) => (
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
                <p className="font-450 text-gray-800 text-[13px]">
                  {provider.name}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-500" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
