import type { EvaluationType } from "../types/evaluation-creation";

/**
 * Step identifiers for evaluation creation flow
 */
export type StepId =
  | "setup"
  | "dataset-selection"
  | "dataset-augmentation"
  | "guardrail-selection"
  | "ai-system-selection"
  | "review";

/**
 * Step configuration interface
 */
export interface StepConfig {
  id: StepId;
  title: string;
  description?: string;
}

/**
 * Step flow configuration for different evaluation types
 */
export interface EvaluationStepFlow {
  steps: StepConfig[];
}

/**
 * Step configurations for Compliance evaluation
 * Flow: Setup → Dataset Selection → Dataset Augmentation → Guardrail Selection → Review
 */
const COMPLIANCE_STEPS: StepConfig[] = [
  {
    id: "setup",
    title: "Evaluation Setup",
    description: "Basic evaluation information and type selection",
  },
  {
    id: "dataset-selection",
    title: "Select Test Dataset",
    description: "Choose policies to generate test datasets",
  },
  {
    id: "dataset-augmentation",
    title: "Augment Dataset",
    description: "Apply perturbations to enhance test coverage (optional)",
  },
  {
    id: "guardrail-selection",
    title: "Add Guardrails",
    description: "Add guardrails for moderation (optional)",
  },
  {
    id: "review",
    title: "Review and Finish",
    description: "Review your evaluation configuration",
  },
];

/**
 * Step configurations for Jailbreak evaluation
 * Flow: Setup → Dataset Selection → AI System Selection → Review
 */
const JAILBREAK_STEPS: StepConfig[] = [
  {
    id: "setup",
    title: "Evaluation Setup",
    description: "Basic evaluation information and type selection",
  },
  {
    id: "dataset-selection",
    title: "Select Test Dataset",
    description: "Choose policies to generate adversarial prompts",
  },
  {
    id: "ai-system-selection",
    title: "Select AI Systems",
    description: "Choose AI systems to test against",
  },
  {
    id: "review",
    title: "Review and Finish",
    description: "Review your evaluation configuration",
  },
];

/**
 * Map of evaluation types to their step flows
 */
export const EVALUATION_STEP_FLOWS: Record<EvaluationType, EvaluationStepFlow> = {
  compliance: {
    steps: COMPLIANCE_STEPS,
  },
  jailbreak: {
    steps: JAILBREAK_STEPS,
  },
};

/**
 * Get step flow configuration for a given evaluation type
 */
export function getStepFlow(evaluationType?: EvaluationType): EvaluationStepFlow {
  if (!evaluationType) {
    // Return default flow (compliance) if no type is selected yet
    return EVALUATION_STEP_FLOWS.compliance;
  }
  return EVALUATION_STEP_FLOWS[evaluationType];
}

/**
 * Get step index by step ID within a flow
 */
export function getStepIndex(stepId: StepId, evaluationType?: EvaluationType): number {
  const flow = getStepFlow(evaluationType);
  return flow.steps.findIndex((step) => step.id === stepId);
}

/**
 * Get next step ID in the flow
 */
export function getNextStepId(
  currentStepId: StepId,
  evaluationType?: EvaluationType
): StepId | null {
  const flow = getStepFlow(evaluationType);
  const currentIndex = getStepIndex(currentStepId, evaluationType);

  if (currentIndex === -1 || currentIndex >= flow.steps.length - 1) {
    return null;
  }

  return flow.steps[currentIndex + 1].id;
}

/**
 * Get previous step ID in the flow
 */
export function getPreviousStepId(
  currentStepId: StepId,
  evaluationType?: EvaluationType
): StepId | null {
  const currentIndex = getStepIndex(currentStepId, evaluationType);

  if (currentIndex <= 0) {
    return null;
  }

  const flow = getStepFlow(evaluationType);
  return flow.steps[currentIndex - 1].id;
}
