import { AlertTriangle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DualAttackScoreGauge } from "./dual-attack-score-gauge";
import type { JailbreakEvaluationOutput, JailbreakEvaluationResult } from "../../../types/jailbreak-evaluation";

interface OverviewSectionProps {
  summary: JailbreakEvaluationOutput['summary'];
  hasGuardrails?: boolean;
  evaluationResults?: JailbreakEvaluationResult[];
}

function GaugeChart({ value }: { value: number }) {
  // Calculate the angle for the gauge (0-180 degrees)
  const angle = (value / 100) * 180;

  // Create the arc path for the background gauge (0-100%)
  const createArc = (startAngle: number, endAngle: number, radius: number) => {
    const start = polarToCartesian(101, 101, radius, endAngle);
    const end = polarToCartesian(101, 101, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
  };

  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 180) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  };

  return (
    <div className="relative inline-grid place-items-start shrink-0">
      <svg width="202" height="119" viewBox="0 0 202 119" fill="none" className="relative">
        {/* Background gauge (gray) */}
        <path
          d={createArc(0, 180, 86)}
          stroke="#E5E7EB"
          strokeWidth="12"
          strokeLinecap="round"
          fill="none"
        />
        {/* Active gauge (green) */}
        <path
          d={createArc(0, angle, 86)}
          stroke="#22A06B"
          strokeWidth="12"
          strokeLinecap="round"
          fill="none"
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 mt-8">
        <div className="flex items-end gap-1">
          <span className="text-[32px] font-bold leading-[40px] text-gray-900 tracking-[-0.32px]">
            {value}
          </span>
          <span className="text-[0.9375rem] font-medium leading-6 text-gray-600 pb-[2px]">%</span>
        </div>
        <p className="text-xs font-semibold leading-4 text-gray-600 text-center w-[122px]">
          Attack Success Rate
        </p>
      </div>

      {/* Labels */}
      <span className="absolute bottom-0 left-0 text-[10px] font-semibold leading-4 text-gray-600 px-1">0</span>
      <span className="absolute bottom-0 right-0 text-[10px] font-semibold leading-4 text-gray-600 px-1">100</span>
      <span className="absolute top-0 left-1/2 -translate-x-1/2 text-[10px] font-semibold leading-4 text-gray-600 px-1">50</span>
      <span className="absolute top-[38px] left-4 text-[10px] font-semibold leading-4 text-gray-600 px-1">25</span>
      <span className="absolute top-[38px] right-4 text-[10px] font-semibold leading-4 text-gray-600 px-1">75</span>
    </div>
  );
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

  return (
    <div>
    <div className={`grid ${hasGuardrails ? 'grid-cols-6' : 'grid-cols-4'} mx-3 align-center items-center py-2 border-t border-dashed border-gray-200`}>
      {/* Left: Overview Description and Table */}
      <div className={hasGuardrails ? 'col-span-3' : 'col-span-3'}>
        <div className="text-base text-gray-900 leading-relaxed space-y-6 py-4">
          {/* Description */}
          {hasGuardrails ? (
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
          )}

          
        </div>
      </div>

      {/* Right: Attack Score Gauge */}
      <div className={hasGuardrails ? 'col-span-3' : 'col-span-1'}>
        <DualAttackScoreGauge summary={summary} hasGuardrails={hasGuardrails} />
      </div>
    </div>
    {/* Risk Stats - Table for multiple policies, Cards for single policy */}
          {policies.length > 0 && evaluationResults && (
            <div className="px-3 py-3">
              {policies.length === 1 ? (
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
              )}
            </div>
          )}
    </div>
  );
}
