import type { Guardrail } from "@/features/guardrails/types";

export type EvaluationType = 'compliance' | 'jailbreak';

export type PerturbationType = "rewording" | "misspelling" | "leet" | "random-upper";

export interface PerturbationConfig {
  type: PerturbationType;
  enabled: boolean;
  combinations: number;
}

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
  perturbations?: PerturbationConfig[]; // For compliance evaluations
  guardrailIds?: string[];
  aiSystemIds?: string[]; // For jailbreak evaluations
}

export interface EvaluationCreationStepProps {
  data: Partial<EvaluationCreationData>;
  onDataChange: (data: Partial<EvaluationCreationData>) => void;
  onNext?: () => void;
  onBack?: () => void;
  onCancel?: () => void;
  variant?: "overlay" | "onboarding";
  guardrails?: Guardrail[]; // Pre-loaded guardrails to avoid fetching
}
