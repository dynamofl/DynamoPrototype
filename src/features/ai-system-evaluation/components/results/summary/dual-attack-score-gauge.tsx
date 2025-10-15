import type { JailbreakEvaluationOutput } from "../../../types/jailbreak-evaluation";
import { AttackScoreGauge } from "./attack-score-gauge";

interface DualAttackScoreGaugeProps {
  summary: JailbreakEvaluationOutput['summary'];
  hasGuardrails: boolean;
}

export function DualAttackScoreGauge({ summary, hasGuardrails }: DualAttackScoreGaugeProps) {
  // If no guardrails, show single gauge using AI system-only rate
  if (!hasGuardrails) {
    return (
      <div className="flex justify-end pr-3">
        <AttackScoreGauge
          value={summary.aiSystemOnlySuccessRate ?? summary.successRate}
          label=""
        />
      </div>
    );
  }

  // With guardrails, show dual gauges side-by-side
  return (
    <div className="flex gap-2 items-end justify-end">
       <AttackScoreGauge
        value={summary.aiSystemOnlySuccessRate ?? summary.successRate}
        label="AI System ASR"
      />
      <AttackScoreGauge
        value={summary.successRate}
        label="With Guardrails ASR"
      />
     
    </div>
  );
}
