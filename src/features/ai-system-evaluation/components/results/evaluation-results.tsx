import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowDownToLine, ChevronsUpDown, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { BaseEvaluationOutput } from "../../types/base-evaluation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
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
  const [searchQuery, setSearchQuery] = useState("");

  // Get strategy based on test type
  const testType = results.test_type || 'jailbreak';
  const strategy = getEvaluationStrategy(testType);

  // Calculate total token utilization from all results
  const totalTokenUtilization = results.results.reduce((total, result) => {
    return total + (result.total_tokens || 0);
  }, 0);

  // Filter tests based on search query
  const filteredTests = availableTests.filter((test) =>
    test.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
    <div className="flex flex-col h-full" onWheel={(e) => e.stopPropagation()}>
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
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div className="flex items-center gap-1">
                  <span className="max-w-[200px] truncate text-sm font-450 text-gray-900">
                    {evaluationName || 'Select Test'}
                  </span>
                  <Badge variant="secondary" className="text-xs ml-1">
                    {evaluationType}
                  </Badge>
                  <button className="p-0.5 hover:bg-gray-100 rounded transition-colors">
                      <ChevronsUpDown className="h-3.5 w-3.5 text-gray-500" />
                    </button>
                </div>
                    
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="-ml-2 mt-1 w-[280px] p-0">
                    {/* Search Box */}
                    <div className="p-2 border-b border-gray-200">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                          type="text"
                          placeholder="Search evaluations..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-8 h-9 text-sm"
                        />
                      </div>
                    </div>

                    {/* Scrollable List */}
                    <div className="max-h-[312px] overflow-y-auto">
                      {filteredTests.length > 0 ? (
                        filteredTests.map((test) => (
                          <DropdownMenuItem
                            key={test.id}
                            onClick={() => {
                              onTestChange?.(test.id);
                              setSearchQuery("");
                            }}
                            className={`px-3 py-2.5 ${currentTestId === test.id ? 'bg-gray-100 font-medium' : ''}`}
                          >
                            <div className="flex flex-col gap-0.5 w-full">
                              <span className="text-sm font-450">{test.name}</span>
                              <span className="text-xs text-gray-500">
                                {test.type || 'jailbreak'} • {test.status} • {new Date(test.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </DropdownMenuItem>
                        ))
                      ) : (
                        <div className="px-3 py-6 text-center text-sm text-gray-500">
                          No evaluations found
                        </div>
                      )}
                    </div>
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
      <div className="flex-1 overflow-hidden" onWheel={(e) => e.stopPropagation()}>
        <AnimatePresence mode="wait">
          {selectedTab === 'summary' && (
            <motion.div
              key="summary"
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.99 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="h-full overflow-auto"
            >
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
                config={results.config}
              />
            </motion.div>
          )}

          {selectedTab === 'data' && (
            <motion.div
              key="data"
              initial={{ opacity: 0,scale: 0.99  }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.99  }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="h-full"
            >
              <EvaluationDataView
                results={results.results}
                strategy={strategy}
                testType={testType}
                aiSystemName={aiSystemName}
                hasGuardrails={results.config.guardrail_ids && results.config.guardrail_ids.length > 0}
                systemName={systemName}
                evaluationId={evaluationId}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
