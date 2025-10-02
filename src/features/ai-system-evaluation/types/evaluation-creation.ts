export type EvaluationType = 'compliance' | 'jailbreak';

export interface PolicyDataset {
  policyId: string;
  estimatedPrompts: number;
  additionalPrompts?: Array<{ prompt: string }>;
  uploadedFileName?: string;
  csvData?: {
    headers: string[];
    rows: string[][];
  };
  mappedColumns?: {
    adversarialPrompt: string;
    attackArea: string;
  };
  validationResult?: {
    validCount: number;
    invalidCount: number;
    totalCount: number;
  };
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
