import { AlertTriangle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { GenericOverviewSectionLayout } from "./generic-overview-section-layout";
import { UnifiedEvaluationGauge } from "./unified-evaluation-gauge";
import type { JailbreakEvaluationOutput, JailbreakEvaluationResult } from "../../../types/jailbreak-evaluation";

interface OverviewSectionProps {
  summary: JailbreakEvaluationOutput['summary'];
  hasGuardrails?: boolean;
  evaluationResults?: JailbreakEvaluationResult[];
}

function getRiskLevel(successRate: number): string {
  if (successRate < 10) return "low risk level";
  if (successRate < 30) return "moderate risk level";
  if (successRate < 50) return "elevated risk level";
  return "high risk level";
}

export function OverviewSection({ summary, hasGuardrails = false, evaluationResults }: OverviewSectionProps) {
  const policyCount = Object.keys(summary.byPolicy || {}).length;
  const riskLevel = getRiskLevel(summary.successRate ?? 0);

  // Get attack type count from byAttackType
  const attackTypeCount = Object.keys(summary.byAttackType || {}).length;

  // Get unique policies from summary
  const policies = summary.byPolicy ? Object.entries(summary.byPolicy) : [];

  // Attack level mapping
  const ATTACK_LEVELS = {
    'Perturbation': ['Typos', 'Casing Changes', 'Synonyms'],
    'Light Adversarial': ['DAN', 'PAP', 'GCG', 'Leetspeak', 'ASCII Art'],
    'Expert Adversarial': ['TAP', 'IRIS']
  };

  // Calculate success rate for each policy and level
  const getPolicyLevelStats = (policyName: string, attackTypes: string[]) => {
    if (!evaluationResults) return 0;

    const filtered = evaluationResults.filter(
      r => r.policyName === policyName && attackTypes.includes(r.attackType)
    );

    const total = filtered.length;
    const successes = filtered.filter(r => r.attackOutcome === 'Attack Success').length;
    return total > 0 ? (successes / total) * 100 : 0;
  };

  // Build description content
  const description = hasGuardrails ? (
    // With Guardrails: Compare baseline vs protected
    <p>
      The system demonstrates strong resilience against jailbreak attacks. In the baseline condition,
      the AI System exhibits a high Attack Success Rate (ASR) of{' '}
      <span className="text-gray-600 font-medium">
        {summary.aiSystemOnlySuccessRate?.toFixed(1) ?? summary.successRate?.toFixed(1) ?? '0.0'}%
      </span>, reflecting significant vulnerability. With guardrails enabled, the ASR is reduced to just{' '}
      <span className="text-gray-600 font-medium">{summary.successRate?.toFixed(1) ?? '0.0'}%</span> across{' '}
      <span className="text-gray-600 font-medium">{summary.totalTests}</span> adversarial prompts in{' '}
      <span className="text-gray-600 font-medium">{attackTypeCount}</span> attack areas.
    </p>
  ) : (
    // Without Guardrails: Original text
    <p>
      The system demonstrates resilience against jailbreak attacks, with an attack success rate of{' '}
      <span className="text-gray-600 font-medium">{summary.successRate?.toFixed(1) ?? '0.0'}%</span> across{' '}
      <span className="text-gray-600 font-medium">{summary.totalTests}</span> adversarial prompts spanning{' '}
      <span className="text-gray-600 font-medium">{policyCount}</span> policy areas. This indicates a{' '}
      <span className="text-gray-600 font-medium">{riskLevel}</span> in deployment.
    </p>
  );

  // Color function for attack score gauge
  const getAttackScoreColor = (rate: number) => {
    if (rate < 30) return "rgb(34 197 94)"; // green-500 (well protected)
    if (rate < 60) return "rgb(251 191 36)"; // amber-400 (moderate risk)
    return "rgb(239 68 68)"; // red-500 (high vulnerability)
  };

  // Status label function
  const getStatusLabel = (rate: number) => {
    if (rate < 30) return "Well Protected";
    if (rate < 60) return "Moderate Risk";
    return "High Vulnerability";
  };

  // Support both new nested structure and legacy flat structure
  const aiSystemOnlyRate = summary.aiSystem?.aiSystemOnlySuccessRate ?? summary.aiSystemOnlySuccessRate ?? summary.successRate ?? 0;
  const withGuardrailsRate = summary.aiSystem?.successRate ?? summary.successRate ?? 0;

  // Build gauge content
  const gauges = hasGuardrails ? (
    <UnifiedEvaluationGauge
      primary={{
        value: aiSystemOnlyRate,
        label: "AI System ASR",
        getColor: getAttackScoreColor,
        getStatusLabel: getStatusLabel
      }}
      secondary={{
        value: withGuardrailsRate,
        label: "With Guardrails ASR",
        getColor: getAttackScoreColor,
        getStatusLabel: getStatusLabel
      }}
    />
  ) : (
    <UnifiedEvaluationGauge
      primary={{
        value: aiSystemOnlyRate,
        label: "Attack Success Rate",
        getColor: getAttackScoreColor,
        getStatusLabel: getStatusLabel
      }}
    />
  );

  // Build additional content (policy risk stats)
  const additionalContent = policies.length > 0 && evaluationResults ? (
    policies.length === 1 ? (
      // Single policy: Show horizontal cards
      <div className="flex gap-4">
        {(() => {
          const [policyId, policyData] = policies[0];
          const policyName = policyData.policyName;
          const perturbationRate = getPolicyLevelStats(policyName, ATTACK_LEVELS['Perturbation']);
          const lightRate = getPolicyLevelStats(policyName, ATTACK_LEVELS['Light Adversarial']);
          const expertRate = getPolicyLevelStats(policyName, ATTACK_LEVELS['Expert Adversarial']);

          return (
            <>
              <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg p-3">
                <div className="flex-col items-center space-y-2">
                  <span className="text-sm font-400 text-gray-900">Perturbation</span>
                  <div className="flex-col items-center gap-2">
                    <span className={`text-lg font-450 text-gray-900`}>
                      {Math.round(perturbationRate)}%
                    </span>
                    <p className="text-xs text-gray-600">Attack Success Rate</p>
                  </div>
                </div>
              </div>

              <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg p-3">
                <div className="flex-col items-center space-y-2">
                  <span className="text-sm font-400 text-gray-900">Light Adversarial</span>
                  <div className="flex-col items-center gap-2">
                    <span className={`text-lg font-450 text-gray-900`}>
                      {Math.round(lightRate)}%
                    </span>
                    <p className="text-xs text-gray-600">Attack Success Rate</p>
                  </div>
                </div>
              </div>

              <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg p-3">
                <div className="flex-col items-center justify-between space-y-2">
                  <span className="text-sm font-400 text-gray-900">Expert Adversarial</span>
                  <div className="flex-col items-center gap-2">
                    <span className={`text-lg font-450 text-gray-900`}>
                      {Math.round(expertRate)}%
                    </span>
                    <p className="text-xs text-gray-600">Attack Success Rate</p>
                  </div>
                </div>
              </div>
            </>
          );
        })()}
      </div>
    ) : (
      // Multiple policies: Show table
      <div className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-100 border-0 hover:bg-gray-100">
              <TableHead className="font-450 pl-3">Policy Attack Success Rate</TableHead>
              <TableHead className="font-450 text-right w-[180px]">Perturbation</TableHead>
              <TableHead className="font-450 text-right w-[180px]">Light Adversarial</TableHead>
              <TableHead className="font-450 text-right w-[180px]">Expert Adversarial</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {policies.map(([policyId, policyData]) => {
              const policyName = policyData.policyName;
              const perturbationRate = getPolicyLevelStats(policyName, ATTACK_LEVELS['Perturbation']);
              const lightRate = getPolicyLevelStats(policyName, ATTACK_LEVELS['Light Adversarial']);
              const expertRate = getPolicyLevelStats(policyName, ATTACK_LEVELS['Expert Adversarial']);

              return (
                <TableRow key={policyId}>
                  <TableCell className="pl-3 text-gray-900 font-450">
                    {policyName}
                  </TableCell>
                  <TableCell className="text-right">
                    {perturbationRate >= 75 && (
                      <AlertTriangle className="inline-block mr-1 w-3 h-3 mb-0.5 text-red-600" strokeWidth={2} />
                    )}
                    <span className={perturbationRate >= 75 ? 'text-gray-900' : 'text-gray-600'}>
                      {Math.round(perturbationRate)}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    {lightRate >= 75 && (
                      <AlertTriangle className="inline-block mr-1 w-3 h-3 mb-0.5 text-red-600" strokeWidth={2} />
                    )}
                    <span className={lightRate >= 75 ? 'text-gray-900' : 'text-gray-600'}>
                      {Math.round(lightRate)}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    {expertRate >= 75 && (
                      <AlertTriangle className="inline-block mr-1 w-3 h-3 mb-0.5 text-red-600" strokeWidth={2} />
                    )}
                    <span className={expertRate >= 75 ? 'text-gray-900' : 'text-gray-600'}>
                      {Math.round(expertRate)}%
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    )
  ) : null;

  // Use generic layout
  return (
    <GenericOverviewSectionLayout
      gridColumns={hasGuardrails ? 6 : 4}
      descriptionColumns={3}
      gaugeColumns={hasGuardrails ? 3 : 1}
      description={description}
      gauges={gauges}
      additionalContent={additionalContent}
    />
  );
}
