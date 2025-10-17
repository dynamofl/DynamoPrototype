// Attack severity utility for mapping attack types to severity levels
import type { AttackType } from '../types/jailbreak-evaluation'

export type SeverityLevel = 1 | 2 | 3

export interface AttackSeverityInfo {
  level: SeverityLevel
  label: string
  description: string
}

// Map attack types to severity levels based on the ATTACK_TYPES structure
export const ATTACK_SEVERITY_MAP: Record<AttackType, AttackSeverityInfo> = {
  // Level 1 - Perturbations
  'Typos': {
    level: 1,
    label: 'Level 1',
    description: 'Perturbations - Basic text modifications'
  },
  'Casing Changes': {
    level: 1,
    label: 'Level 1',
    description: 'Perturbations - Basic text modifications'
  },
  'Synonyms': {
    level: 1,
    label: 'Level 1',
    description: 'Perturbations - Basic text modifications'
  },

  // Level 2 - Light Adversarial
  'DAN': {
    level: 2,
    label: 'Level 2',
    description: 'Light Adversarial - Single-turn jailbreak techniques'
  },
  'PAP': {
    level: 2,
    label: 'Level 2',
    description: 'Light Adversarial - Single-turn jailbreak techniques'
  },
  'GCG': {
    level: 2,
    label: 'Level 2',
    description: 'Light Adversarial - Single-turn jailbreak techniques'
  },
  'Leetspeak': {
    level: 2,
    label: 'Level 2',
    description: 'Light Adversarial - Single-turn jailbreak techniques'
  },
  'ASCII Art': {
    level: 2,
    label: 'Level 2',
    description: 'Light Adversarial - Single-turn jailbreak techniques'
  },

  // Level 3 - Expert Adversarial
  'TAP': {
    level: 3,
    label: 'Level 3',
    description: 'Expert Adversarial - Multi-turn sophisticated attacks'
  },
  'IRIS': {
    level: 3,
    label: 'Level 3',
    description: 'Expert Adversarial - Multi-turn sophisticated attacks'
  }
}

/**
 * Get severity information for an attack type
 * Returns a default Level 1 info if attack type is not found
 */
export function getAttackSeverity(attackType: AttackType | undefined | null): AttackSeverityInfo {
  if (!attackType) {
    return {
      level: 1,
      label: 'Level 1',
      description: 'Unknown attack type'
    }
  }
  const severity = ATTACK_SEVERITY_MAP[attackType]
  if (!severity) {
    // Return default Level 1 severity for unknown attack types
    return {
      level: 1,
      label: 'Level 1',
      description: 'Unknown attack type'
    }
  }
  return severity
}

/**
 * Get severity level (1, 2, or 3) for an attack type
 * Returns 1 (lowest severity) if attack type is not found
 */
export function getAttackSeverityLevel(attackType: AttackType | undefined | null): SeverityLevel {
  if (!attackType) {
    return 1 // Default to Level 1 for undefined/null attack types
  }
  const severity = ATTACK_SEVERITY_MAP[attackType]
  return severity?.level || 1 // Default to Level 1 if attack type not in map
}
