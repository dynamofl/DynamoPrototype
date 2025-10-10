import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowDownToLine } from "lucide-react";
import type { JailbreakEvaluationOutput } from "../../types/jailbreak-evaluation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { OverlayHeader, type BreadcrumbSegment } from "@/components/patterns";
import { toUrlSlug } from "@/lib/utils";
import { EvaluationDataView } from "./evaluation-data-view";
import { EvaluationSummaryView } from "./evaluation-summary-view";

interface EvaluationResultsProps {
  results: JailbreakEvaluationOutput;
  evaluationName?: string;
  aiSystemName?: string; // AI system name for breadcrumb
  aiSystemIcon?: 'OpenAI' | 'Azure' | 'Mistral' | 'Databricks' | 'HuggingFace' | 'Anthropic' | 'Remote' | 'Local' | 'AWS' | 'DynamoAI';
  startedAt?: string;
  completedAt?: string;
  onExport?: (format: 'json' | 'csv') => void;
  onClose?: () => void;
  currentTab?: string;
  onTabChange?: (tab: 'summary' | 'data') => void;
}

export function EvaluationResults({
  results,
  evaluationName,
  aiSystemName,
  aiSystemIcon,
  startedAt,
  completedAt,
  onExport,
  onClose,
  currentTab: propTab,
  onTabChange
}: EvaluationResultsProps) {
  const navigate = useNavigate();
  const { systemName, evaluationId } = useParams<{ systemName: string; evaluationId?: string }>();
  const [selectedTab, setSelectedTab] = useState<'summary' | 'data'>((propTab as 'summary' | 'data') || 'summary');

  // Calculate total token utilization from all results
  const totalTokenUtilization = results.results.reduce((total, result) => {
    return total + (result.totalTokens || 0);
  }, 0);

  // Prepare breadcrumbs if AI system name is provided
  const breadcrumbs: BreadcrumbSegment[] | undefined = aiSystemName
    ? [{ label: aiSystemName }]
    : undefined;

  // Update selectedTab when propTab changes
  useEffect(() => {
    if (propTab === 'summary' || propTab === 'data') {
      setSelectedTab(propTab);
    }
  }, [propTab]);

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
            <span>{evaluationName || 'Evaluation Results'}</span>
            {/* View Switch */}
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
        breadcrumbs={breadcrumbs}
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
      <div className="flex-1 overflow-auto">
        {selectedTab === 'summary' && (
          <EvaluationSummaryView
            summary={results.summary}
            aiSystemName={aiSystemName}
            aiSystemIcon={aiSystemIcon}
            timestamp={results.timestamp}
            startedAt={startedAt}
            completedAt={completedAt}
            evaluationName={evaluationName}
            tokenUtilization={totalTokenUtilization}
          />
        )}

        {selectedTab === 'data' && (
          <EvaluationDataView
            results={results.results}
            hasGuardrails={results.config.guardrailIds && results.config.guardrailIds.length > 0}
          />
        )}
      </div>

    </div>
  );
}
