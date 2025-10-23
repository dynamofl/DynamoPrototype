import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowDownToLine, ChevronsUpDown } from "lucide-react";
import type { BaseEvaluationOutput } from "../../types/base-evaluation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { OverlayHeader } from "@/components/patterns";
import { toUrlSlug } from "@/lib/utils";
import { EvaluationDataView } from "./evaluation-data-view";
import { EvaluationSummaryView } from "./evaluation-summary-view";
import type { EvaluationTest } from "@/features/evaluation/types/evaluation-test";
import type { AISystem } from "@/features/ai-systems/types/types";
import { getEvaluationStrategy } from "../../strategies/strategy-factory";

interface EvaluationResultsProps {
  results: BaseEvaluationOutput;
  evaluationName?: string;
  evaluationType?: string; // Type of evaluation (Jailbreak, Compliance, etc.)
  aiSystemName?: string; // AI system name for breadcrumb
  aiSystemIcon?: 'OpenAI' | 'Azure' | 'Mistral' | 'Databricks' | 'HuggingFace' | 'Anthropic' | 'Remote' | 'Local' | 'AWS' | 'DynamoAI';
  startedAt?: string;
  completedAt?: string;
  onExport?: (format: 'json' | 'csv') => void;
  onClose?: () => void;
  currentTab?: string;
  onTabChange?: (tab: 'summary' | 'data') => void;
  // New props for test and system selection
  availableTests?: EvaluationTest[];
  availableAISystems?: AISystem[];
  currentTestId?: string;
  currentAISystemId?: string;
  onTestChange?: (testId: string) => void;
  onAISystemChange?: (systemId: string) => void;
}

export function EvaluationResults({
  results,
  evaluationName,
  evaluationType = 'Jailbreak',
  aiSystemName,
  aiSystemIcon,
  startedAt,
  completedAt,
  onExport,
  onClose,
  currentTab: propTab,
  onTabChange,
  availableTests = [],
  availableAISystems = [],
  currentTestId,
  currentAISystemId,
  onTestChange,
  onAISystemChange
}: EvaluationResultsProps) {
  const navigate = useNavigate();
  const { systemName, evaluationId, view } = useParams<{ systemName: string; evaluationId?: string; view?: string }>();
  const [selectedTab, setSelectedTab] = useState<'summary' | 'data'>((view as 'summary' | 'data') || (propTab as 'summary' | 'data') || 'summary');

  // Get strategy based on test type
  const testType = results.test_type || 'jailbreak';
  const strategy = getEvaluationStrategy(testType);

  // Calculate total token utilization from all results
  const totalTokenUtilization = results.results.reduce((total, result) => {
    return total + (result.total_tokens || 0);
  }, 0);

  // Update selectedTab when view or propTab changes
  useEffect(() => {
    const effectiveTab = (view as 'summary' | 'data') || (propTab as 'summary' | 'data');
    if (effectiveTab === 'summary' || effectiveTab === 'data') {
      setSelectedTab(effectiveTab);
    }
  }, [view, propTab]);

  const handleTabChange = (tab: 'summary' | 'data') => {
    if (onTabChange) {
      onTabChange(tab);
    } else if (systemName && evaluationId) {
      // Update URL with new tab
      navigate(`/ai-systems/${toUrlSlug(systemName)}/evaluation/${evaluationId}/${tab}`);
    } else {
      // Fallback to local state
      setSelectedTab(tab);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header with Export */}
      <OverlayHeader
        title={
          <div className="flex items-center gap-3 text-sm font-450">
            {/* AI System Display (Dropdown commented out) */}
            {aiSystemName && (
              <div className="flex items-center gap-1">
                <span className="max-w-[200px] truncate text-sm font-450 text-gray-900">
                  {aiSystemName}
                </span>
                {/* Dropdown for AI System switching - commented out for now */}
                {/* <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-0.5 hover:bg-gray-100 rounded transition-colors">
                      <ChevronsUpDown className="h-3.5 w-3.5 text-gray-500" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-[280px]">
                    {availableAISystems.map((system) => (
                      <DropdownMenuItem
                        key={system.id}
                        onClick={() => onAISystemChange?.(system.id)}
                        className={`${currentAISystemId === system.id ? 'bg-gray-100 font-medium' : ''}`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{system.name}</span>
                          <span className="text-xs text-gray-500">
                            {system.providerId} • {system.selectedModel}
                          </span>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu> */}
              </div>
            )}

            {/* Separator */}
            {aiSystemName && availableTests.length > 0 && (
              <span className="text-gray-400">/</span>
            )}

            {/* Test/Evaluation Selection Dropdown */}
            {availableTests.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <span className="max-w-[200px] truncate text-sm font-450 text-gray-900">
                    {evaluationName || 'Select Test'}
                  </span>
                  <Badge variant="secondary" className="text-xs ml-1">
                    {evaluationType}
                  </Badge>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-0.5 hover:bg-gray-100 rounded transition-colors">
                      <ChevronsUpDown className="h-3.5 w-3.5 text-gray-500" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="center" className="w-[280px]">
                    {availableTests.map((test) => (
                      <DropdownMenuItem
                        key={test.id}
                        onClick={() => onTestChange?.(test.id)}
                        className={`${currentTestId === test.id ? 'bg-gray-100 font-medium' : ''}`}
                      >
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm">{test.name}</span>
                          <span className="text-xs text-gray-500">
                            {test.status} • {new Date(test.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}

            {/* Separator */}
            {(availableTests.length > 0 || aiSystemName) && (
              <span className="text-gray-400">/</span>
            )}

            {/* If no dropdowns, show simple title */}
            {availableTests.length === 0 && !aiSystemName && (
              <>
                <span>{evaluationName || 'Evaluation Results'}</span>
                <span className="text-gray-400">/</span>
              </>
            )}

            {/* View Switch Tabs */}
            <Tabs value={selectedTab} onValueChange={(value) => handleTabChange(value as 'summary' | 'data')}>
              <TabsList className="h-8 px-0.5 rounded-full">
                <TabsTrigger value="summary" className="text-[0.8125rem] py-1 px-3 rounded-full">
                  Summary
                </TabsTrigger>
                <TabsTrigger value="data" className="text-[0.8125rem] py-1 px-3 rounded-full">
                  Data
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        }
        onClose={onClose}
        actions={
          <div className="flex gap-2 align-center items-center">
            <Button variant="secondary" size="default" className="gap-1">
              <ArrowDownToLine className="w-4 h-4"/>
               Download Report</Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="default" className="">
                Export Result
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onExport?.('json')}>
                Export as JSON
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExport?.('csv')}>
                Export as CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          </div>

        }
      />

      {/* Tab Content */}
      <div className="flex-1 overflow-auto" onWheel={(e) => e.stopPropagation()}>
        {selectedTab === 'summary' && (
          <EvaluationSummaryView
            summary={results.summary}
            strategy={strategy}
            testType={testType}
            hasGuardrails={results.config.guardrail_ids && results.config.guardrail_ids.length > 0}
            aiSystemName={aiSystemName}
            aiSystemIcon={aiSystemIcon}
            timestamp={results.timestamp}
            startedAt={startedAt}
            completedAt={completedAt}
            evaluationName={evaluationName}
            tokenUtilization={totalTokenUtilization}
            topicAnalysis={results.topic_analysis}
            evaluationResults={results.results}
          />
        )}

        {selectedTab === 'data' && (
          <EvaluationDataView
            results={results.results}
            strategy={strategy}
            testType={testType}
            aiSystemName={aiSystemName}
            hasGuardrails={results.config.guardrail_ids && results.config.guardrail_ids.length > 0}
            systemName={systemName}
            evaluationId={evaluationId}
          />
        )}
      </div>

    </div>
  );
}
