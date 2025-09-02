export interface AISystem {
  id: string;
  name: string;
  project: string;
  owner: string;
  createdAt: string;
  status: 'active' | 'inactive';
  icon: 'HuggingFace' | 'OpenAI' | 'Azure' | 'Mistral' | 'Anthropic' | 'Databricks' | 'Remote' | 'Local';
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
  content: string;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'inactive';
  category?: string;
}

export type { EvaluationInput, EvaluationConfig, EvaluationResult, Message } from './evaluation';