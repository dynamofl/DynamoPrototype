import type { JailbreakEvaluationOutput } from "../../../types/jailbreak-evaluation";
import { AttackScoreGauge } from "./attack-score-gauge";

interface DualAttackScoreGaugeProps {
  summary: JailbreakEvaluationOutput['summary'];
  hasGuardrails: boolean;
}

export function DualAttackScoreGauge({ summary, hasGuardrails }: DualAttackScoreGaugeProps) {
  // Support both new nested structure and legacy flat structure
  const aiSystemOnlyRate = summary.aiSystem?.aiSystemOnlySuccessRate ?? summary.aiSystemOnlySuccessRate ?? summary.successRate ?? 0;
  const withGuardrailsRate = summary.aiSystem?.successRate ?? summary.successRate ?? 0;

  // If no guardrails, show single gauge using AI system-only rate
  if (!hasGuardrails) {
    return (
      <div className="flex justify-end pr-3">
        <AttackScoreGauge
          value={aiSystemOnlyRate}
          label=""
        />
      </div>
    );
  }

  // With guardrails, show dual gauges side-by-side
  return (
    <div className="flex gap-2 items-end justify-end">
       <AttackScoreGauge
        value={aiSystemOnlyRate}
        label="AI System ASR"
      />
      <AttackScoreGauge
        value={withGuardrailsRate}
        label="With Guardrails ASR"
      />

    </div>
  );
}
