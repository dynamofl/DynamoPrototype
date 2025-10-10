import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowDownToLine } from "lucide-react";
import type { JailbreakEvaluationOutput } from "../../types/jailbreak-evaluation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { OverlayHeader, type BreadcrumbSegment, type TitleDropdownOption } from "@/components/patterns";
import { toUrlSlug } from "@/lib/utils";
import { EvaluationDataView } from "./evaluation-data-view";

interface EvaluationResultsProps {
  results: JailbreakEvaluationOutput;
  evaluationName?: string;
  aiSystemName?: string; // AI system name for breadcrumb
  evaluations?: Array<{ id: string; name: string }>; // List of evaluations for dropdown
  onEvaluationSwitch?: (evaluationId: string) => void; // Callback when switching evaluation
  onExport?: (format: 'json' | 'csv') => void;
  onClose?: () => void;
  currentTab?: string;
  onTabChange?: (tab: 'summary' | 'data') => void;
}

export function EvaluationResults({
  results,
  evaluationName,
  aiSystemName,
  evaluations,
  onEvaluationSwitch,
  onExport,
  onClose,
  currentTab: propTab,
  onTabChange
}: EvaluationResultsProps) {
  const navigate = useNavigate();
  const { systemName, evaluationId } = useParams<{ systemName: string; evaluationId?: string }>();
  const [selectedTab, setSelectedTab] = useState<'summary' | 'data'>((propTab as 'summary' | 'data') || 'summary');

  // Prepare breadcrumbs if AI system name is provided
  const breadcrumbs: BreadcrumbSegment[] | undefined = aiSystemName
    ? [{ label: aiSystemName }]
    : undefined;

  // Prepare dropdown options if evaluations list is provided
  const titleDropdownOptions: TitleDropdownOption[] | undefined = evaluations && evaluations.length > 1
    ? evaluations.map(evaluation => ({
        id: evaluation.id,
        label: evaluation.name,
        isActive: evaluation.id === evaluationId || evaluation.name === evaluationName,
      }))
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
        title={evaluationName || 'Evaluation Results'}
        breadcrumbs={breadcrumbs}
        titleDropdownOptions={titleDropdownOptions}
        onTitleDropdownSelect={onEvaluationSwitch}
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

      {/* Tabs */}
      <div className="border-b border-gray-200 px-6">
        <nav className="flex gap-6">
          {[
            { id: 'summary', label: 'Summary' },
            { id: 'data', label: 'Data View' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id as 'summary' | 'data')}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                selectedTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto">
        {selectedTab === 'summary' && (
          <div className="p-6 space-y-6">
            {/* Overall Stats Cards */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-gray-0 border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-600">Total Tests</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">{results.summary.totalTests}</p>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-700">Attack Successes</p>
                <p className="text-2xl font-semibold text-red-900 mt-1">{results.summary.attackSuccesses}</p>
                <p className="text-xs text-red-600 mt-1">{results.summary.successRate.toFixed(1)}% success rate</p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-700">Attack Failures</p>
                <p className="text-2xl font-semibold text-green-900 mt-1">{results.summary.attackFailures}</p>
                <p className="text-xs text-green-600 mt-1">{(100 - results.summary.successRate).toFixed(1)}% blocked</p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-700">Policies Tested</p>
                <p className="text-2xl font-semibold text-blue-900 mt-1">{Object.keys(results.summary.byPolicy).length}</p>
              </div>
            </div>

            {/* By Policy */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Results by Policy</h3>
              <div className="space-y-3">
                {Object.entries(results.summary.byPolicy).map(([policyId, stats]) => (
                  <div key={policyId} className="bg-gray-0 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{stats.policyName}</h4>
                        <p className="text-sm text-gray-600 mt-1">{stats.total} tests</p>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Success Rate</p>
                          <p className={`text-lg font-semibold ${stats.successRate > 50 ? 'text-red-600' : 'text-green-600'}`}>
                            {stats.successRate.toFixed(1)}%
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Successes</p>
                          <p className="text-lg font-semibold text-red-600">{stats.successes}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Failures</p>
                          <p className="text-lg font-semibold text-green-600">{stats.failures}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* By Attack Type */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Results by Attack Type</h3>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(results.summary.byAttackType).map(([attackType, stats]) => (
                  <div key={attackType} className="bg-gray-0 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{attackType}</h4>
                      <span className={`text-xs px-2 py-1 rounded ${
                        stats.successRate > 50 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {stats.successRate.toFixed(1)}% success
                      </span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>{stats.total} tests</span>
                      <div className="flex gap-3">
                        <span className="text-red-600">{stats.successes} successes</span>
                        <span className="text-green-600">{stats.failures} failures</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* By Behavior Type */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Results by Behavior Type</h3>
              <div className="bg-gray-0 border border-gray-200 rounded-lg p-4">
                <div className="space-y-2">
                  {Object.entries(results.summary.byBehaviorType).map(([type, stats]) => (
                    <div key={type} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <span className="font-medium text-gray-700">{type}</span>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-gray-600">{stats.total} tests</span>
                        <span className="text-red-600">{stats.successes} successes</span>
                        <span className="text-green-600">{stats.failures} failures</span>
                        <span className="font-medium">{stats.successRate.toFixed(1)}% attack rate</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'data' && (
          <EvaluationDataView results={results.results} />
        )}
      </div>

    </div>
  );
}
