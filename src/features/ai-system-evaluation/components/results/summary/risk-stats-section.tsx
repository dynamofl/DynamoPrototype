import { AlertTriangle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { JailbreakEvaluationResult, JailbreakEvaluationSummary } from "../../../types/jailbreak-evaluation";

interface RiskStatsSectionProps {
  summary: JailbreakEvaluationSummary;
  evaluationResults?: JailbreakEvaluationResult[];
}

export function RiskStatsSection({ summary, evaluationResults }: RiskStatsSectionProps) {
  // Get unique policies from summary
  const policies = summary.byPolicy ? Object.entries(summary.byPolicy) : [];

  if (policies.length === 0) return null;

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
    <div className="max-w-4xl mx-auto space-y-4 my-8">
      {/* Header */}
      <div className="space-y-3 pt-4 pb-2 rounded-xl px-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <p className="text-sm font-550 leading-4 text-gray-900">
              Risk Stats
            </p>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <p className="text-sm font-[425] leading-5 text-gray-600 leading-relaxed">
            Attack success rates broken down by policy and attack level. High-risk combinations (&gt;75% success rate) are highlighted with warning indicators.
          </p>
        </div>
      </div>

      {/* Risk Stats Table */}
      <div className="px-3">
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-100 border-0 hover:bg-gray-50">
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
      </div>
    </div>
  );
}
