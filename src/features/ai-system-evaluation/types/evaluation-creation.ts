export type EvaluationType = 'compliance' | 'jailbreak';

export interface EvaluationCreationData {
  name: string;
  type: EvaluationType;
  guardrailIds: string[];
}

export interface EvaluationCreationStepProps {
  data: Partial<EvaluationCreationData>;
  onDataChange: (data: Partial<EvaluationCreationData>) => void;
  onNext?: () => void;
  onBack?: () => void;
  onCancel?: () => void;
  variant?: "overlay" | "onboarding";
}
