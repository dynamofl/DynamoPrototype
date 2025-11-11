export interface AISystem {
  id: string;
  name: string;
  project: string;
  owner: string;
  createdAt: string;
  status: 'active' | 'inactive';
  icon: 'HuggingFace' | 'OpenAI' | 'Azure' | 'Mistral' | 'Anthropic' | 'Databricks' | 'Custom' | 'AWS' | 'DynamoAI' | 'Gemini';
  hasGuardrails: boolean;
  isEvaluated: boolean;
}

export interface StatsCard {
  title: string;
  value: number;
  icon?: string;
}

export interface IconProps {
  /** CSS classes to apply to the icon */
  className?: string
  /** Size of the icon in pixels (both width and height) */
  size?: number
  /** Color of the icon (can be CSS color value or Tailwind class) */
  color?: string
  /** Whether the icon should be clickable */
  clickable?: boolean
  /** Additional props to pass to the underlying element */
  [key: string]: any
}

/**
 * Extended icon props for icons that need additional configuration
 */
export interface ExtendedIconProps extends IconProps {
  /** Variant of the icon (e.g., 'outline', 'filled', 'duotone') */
  variant?: 'outline' | 'filled' | 'duotone'
  /** Weight of the icon stroke */
  strokeWidth?: number
  /** Whether to show a loading state */
  loading?: boolean
}

/**
 * Icon size presets for consistent sizing across the application
 */
export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'

/**
 * Icon size mapping for easy conversion
 */
export const ICON_SIZES: Record<IconSize, number> = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  '2xl': 48,
}

export interface Guardrail {
  id: string;
  name: string;
  description: string;
  content?: string;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'inactive';
  category: string;
  type?: string;
  guardrailType?: 'input' | 'output'; // Input (evaluates prompts) or Output (evaluates responses)
  allowedBehavior?: string;
  disallowedBehavior?: string;
}

// Guardrail evaluation types (consolidated structure)
export interface GuardrailDetail {
  guardrailId: string;
  guardrailName: string;
  judgement: string;
  reason: string;
  violations?: Array<{phrase: string, violatedBehaviors: string[]}>;
}

export interface GuardrailEvaluation {
  judgement: string;  // 'Blocked' | 'Allowed'
  reason: string;
  details: GuardrailDetail[];
}

// AI system response with judge evaluation (consolidated structure)
export interface AISystemResponseData {
  content: string;
  judgement: string | null;  // 'Answered' | 'Refused'
  reason: string | null;
  outputTokens: number | null;
}

// Internal model configuration types
export interface InternalModelConfig {
  id: string;
  configType: 'input_guardrail' | 'output_guardrail' | 'judge_model';
  provider: string;
  model: string;
  apiKeyEncrypted: string;
  config?: Record<string, any>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type { EvaluationInput, EvaluationConfig, EvaluationResult, Message } from '@/features/evaluation/types/evaluation';