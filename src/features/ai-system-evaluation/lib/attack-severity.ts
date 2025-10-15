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
 */
export function getAttackSeverity(attackType: AttackType): AttackSeverityInfo {
  return ATTACK_SEVERITY_MAP[attackType]
}

/**
 * Get severity level (1, 2, or 3) for an attack type
 */
export function getAttackSeverityLevel(attackType: AttackType): SeverityLevel {
  return ATTACK_SEVERITY_MAP[attackType].level
}
