import { CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Command, CommandGroup, CommandInput, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, Plus, Info, X } from 'lucide-react';
interface AIModel {
  id: string;
  name: string;
  provider: string;
  object?: string;
  created?: number;
  owned_by?: string;
}

interface AIProvider {
  id: string;
  name: string;
  type: "OpenAI";
  apiKey: string;
  status: "active" | "inactive" | "testing";
  createdAt: string;
  lastUsed?: string;
  usageCount: number;
  models?: AIModel[];
  modelsLastFetched?: string;
  isExpanded?: boolean;
}
import type { Guardrail } from '@/types';

interface ConfigurationPanelProps {
  config: {
    candidateModel: string;
    judgeModel: string;
    temperature: number;
    maxLength: number;
    topP: number;
  };
  onConfigChange: (config: any) => void;
  availableModels: AIModel[];
  selectedGuardrails: Guardrail[];
  onAddGuardrail: (guardrail: Guardrail) => void;
  onRemoveGuardrail: (guardrailId: string) => void;
  availableGuardrails: Guardrail[];
  isAddingGuardrail: boolean;
  onIsAddingGuardrailChange: (isAdding: boolean) => void;
  metricsEnabled: {
    accuracy: boolean;
    precision: boolean;
    recall: boolean;
  };
  onMetricsChange: (metrics: any) => void;
}

export function ConfigurationPanel({
  config,
  onConfigChange,
  availableModels,
  selectedGuardrails,
  onAddGuardrail,
  onRemoveGuardrail,
  availableGuardrails,
  isAddingGuardrail,
  onIsAddingGuardrailChange,
  metricsEnabled,
  onMetricsChange,
}: ConfigurationPanelProps) {
  const getAvailableGuardrailsForSelection = () => {
    return availableGuardrails.filter((guardrail: Guardrail) => guardrail.status === "active");
  };

  return (
    <div className="lg:col-span-1 border-r border-gray-200">
      <div className="px-6 py-4 text-gray-900 border-b border-gray-200">
        Configuration
      </div>
      <div className="p-6 border-b space-y-6">
        <div>
          <div className="text-xs font-450 uppercase text-gray-400 flex items-center gap-2 tracking-wide">
            System Setup
          </div>
        </div>
        <div className="space-y-4">
          {/* Judge Model Selection */}
          <div className="space-y-2">
            <div>
              <Label htmlFor="judgeModel">Judge Model</Label>
            </div>

            <Select
              value={config.judgeModel}
              onValueChange={(value) =>
                onConfigChange({ ...config, judgeModel: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Judge Model" />
              </SelectTrigger>
              <SelectContent className="w-[calc(100vw/3-4rem)] mt-1">
                {availableModels.length === 1 &&
                availableModels[0].id === "no-models" ? (
                  <div className="px-2 py-1.5 text-xs text-muted-foreground">
                    {availableModels[0].name}
                  </div>
                ) : (
                  availableModels.map((model) => (
                    <SelectItem
                      key={model.id}
                      value={model.id}
                      disabled={model.id === "no-models"}
                    >
                      {model.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Candidate Model Selection */}
          <div className="space-y-2">
            <div>
              <Label htmlFor="candidateModel">AI System</Label>
            </div>

            <div className="flex items-center justify-center space-x-2">
              <Select
                value={config.candidateModel}
                onValueChange={(value) =>
                  onConfigChange({ ...config, candidateModel: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select AI System" />
                </SelectTrigger>
                <SelectContent className="w-[calc(100vw/3-4rem)] mt-1">
                  {availableModels.length === 1 &&
                  availableModels[0].id === "no-models" ? (
                    <div className="px-2 py-1.5 text-xs text-muted-foreground">
                      {availableModels[0].name}
                    </div>
                  ) : (
                    availableModels.map((model) => (
                      <SelectItem
                        key={model.id}
                        value={model.id}
                        disabled={model.id === "no-models"}
                      >
                        {model.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>

              <div className="flex-shrink-0">
                {/* Add Guardrail Button */}
                <Popover
                  open={isAddingGuardrail}
                  onOpenChange={onIsAddingGuardrailChange}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="new"
                      size="default"
                      className="w-fit space-x-1 rounded-full"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add Guardrails</span>
                      <div className="flex items-center space-x-1">
                        {selectedGuardrails.length > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {selectedGuardrails.length}
                          </Badge>
                        )}
                      </div>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="min-w-[calc(100vw/3-4rem)]   p-0 mt-2"
                    align="end"
                  >
                    <Command>
                      <CommandInput placeholder="Search guardrails..." />
                      <CommandList className="max-h-64">
                        <CommandGroup>
                          {getAvailableGuardrailsForSelection().length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                              <p>No guardrails available</p>
                            </div>
                          ) : (
                            getAvailableGuardrailsForSelection().map((guardrail: Guardrail) => {
                              const isSelected = selectedGuardrails.some(
                                (g) => g.id === guardrail.id
                              );
                              return (
                                <div
                                  key={guardrail.id}
                                  className={`flex items-start space-x-3 p-3 cursor-pointer rounded-md my-0.5 ${
                                    isSelected
                                      ? "bg-gray-100"
                                      : "hover:bg-gray-50"
                                  }`}
                                  onClick={() => {
                                    if (isSelected) {
                                      onRemoveGuardrail(guardrail.id);
                                    } else {
                                      onAddGuardrail(guardrail);
                                    }
                                  }}
                                >
                                  <div className="flex items-center space-x-2 py-0.5">
                                    {isSelected ? (
                                      <Check className="h-4 w-4 text-green-600" />
                                    ) : (
                                      <Plus className="h-4 w-4 text-muted-foreground" />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center space-x-2 mb-1">
                                      <span
                                        className={`text-[13px] font-400 ${
                                          isSelected ? "text-gray-900" : ""
                                        }`}
                                      >
                                        {guardrail.name}
                                      </span>
                                      {guardrail.category && (
                                        <Badge variant="outline" className="text-xs shrink-0">
                                          {guardrail.category}
                                        </Badge>
                                      )}
                                    </div>
                                    <p
                                      className={`text-xs line-clamp-2 ${
                                        isSelected ? "text-gray-600" : "text-muted-foreground"
                                      }`}
                                    >
                                      {guardrail.description}
                                    </p>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </CommandGroup>
                      </CommandList>
                      {selectedGuardrails.length > 0 && (
                        <div className="p-3 border-t bg-muted/30">
                          <div className="flex items-center justify-between text-[13px] text-muted-foreground">
                            <span>
                              {selectedGuardrails.length} Guardrail
                              {selectedGuardrails.length !== 1 ? "s" : ""} selected
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onIsAddingGuardrailChange(false)}
                              className="h-7 px-2"
                            >
                              Done
                            </Button>
                          </div>
                        </div>
                      )}
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {/* Selected Guardrails */}
            {selectedGuardrails.length > 0 && (
              <div className="space-y-2">
                {selectedGuardrails.map((guardrail) => (
                  <div
                    key={guardrail.id}
                    className="flex items-center justify-between p-2 px-3 bg-gray-100 rounded-md"
                  >
                    <div className="flex items-center space-x-2">
                      <Info className="h-4 w-4 text-gray-500" />
                      <span className="text-[13px] font-400">{guardrail.name}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      {guardrail.category && (
                        <Badge variant="outline" className="text-xs">
                          {guardrail.category}
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveGuardrail(guardrail.id)}
                        className="h-6 w-6 p-0 hover:bg-gray-200 hover:text-gray-600"
                      >
                        <X className="h-3 w-3 text-gray-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Metrics Configuration */}
      <div className="border-none bg-none shadow-none">
        <div className="p-6">
          <div className="text-xs font-450 uppercase text-gray-400 flex items-center gap-2 tracking-wide">
            Evaluation Metrics
          </div>
        </div>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between border border-gray-200 rounded-md p-2">
            <div className="flex items-center space-x-2">
              <Info className="h-4 w-4 text-gray-500" />
              <Label htmlFor="accuracy">Accuracy</Label>
            </div>
            <Switch
              id="accuracy"
              checked={metricsEnabled.accuracy}
              onCheckedChange={(checked) =>
                onMetricsChange({
                  ...metricsEnabled,
                  accuracy: checked,
                })
              }
            />
          </div>
          <div className="flex items-center justify-between border border-gray-200 rounded-md p-2">
            <div className="flex items-center space-x-2">
              <Info className="h-4 w-4 text-gray-500" />
              <Label htmlFor="precision">Precision</Label>
            </div>
            <Switch
              id="precision"
              checked={metricsEnabled.precision}
              onCheckedChange={(checked) =>
                onMetricsChange({
                  ...metricsEnabled,
                  precision: checked,
                })
              }
            />
          </div>
          <div className="flex items-center justify-between border border-gray-200 rounded-md p-2">
            <div className="flex items-center space-x-2">
              <Info className="h-4 w-4 text-gray-500" />
              <Label htmlFor="recall">Recall</Label>
            </div>
            <Switch
              id="recall"
              checked={metricsEnabled.recall}
              onCheckedChange={(checked) =>
                onMetricsChange({ ...metricsEnabled, recall: checked })
              }
            />
          </div>
        </CardContent>
      </div>
    </div>
  );
}
