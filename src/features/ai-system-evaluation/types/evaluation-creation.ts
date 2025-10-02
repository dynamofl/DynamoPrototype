export type EvaluationType = 'compliance' | 'jailbreak';

export interface PolicyDataset {
  policyId: string;
  estimatedPrompts: number;
  additionalPrompts?: Array<{ prompt: string }>;
  uploadedFileName?: string;
}

export interface EvaluationCreationData {
  name: string;
  type: EvaluationType;
  policyIds: string[];
  policyDatasets?: PolicyDataset[];
  guardrailIds?: string[];
}

export interface EvaluationCreationStepProps {
  data: Partial<EvaluationCreationData>;
  onDataChange: (data: Partial<EvaluationCreationData>) => void;
  onNext?: () => void;
  onBack?: () => void;
  onCancel?: () => void;
  variant?: "overlay" | "onboarding";
}
