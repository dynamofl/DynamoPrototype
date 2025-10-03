import type { Guardrail } from '@/types';
import type { Policy } from '../types/jailbreak-evaluation';

/**
 * Convert Guardrail to Policy format for jailbreak evaluation
 */
export function guardrailToPolicy(guardrail: Guardrail): Policy {
  // Parse allowed and disallowed behaviors
  // They might be stored as strings with line breaks or comma-separated
  const parseArrayFromString = (str: string | undefined): string[] => {
    if (!str) return [];

    // Try splitting by newlines first
    const byNewlines = str.split('\n').map(s => s.trim()).filter(s => s.length > 0);
    if (byNewlines.length > 1) return byNewlines;

    // Try splitting by commas
    const byCommas = str.split(',').map(s => s.trim()).filter(s => s.length > 0);
    if (byCommas.length > 1) return byCommas;

    // Return as single item array if not empty
    return str.trim() ? [str.trim()] : [];
  };

  return {
    id: guardrail.id,
    name: guardrail.name,
    allowed: parseArrayFromString(guardrail.allowedBehavior),
    disallowed: parseArrayFromString(guardrail.disallowedBehavior),
  };
}

/**
 * Convert multiple Guardrails to Policies
 */
export function guardrailsToPolicies(guardrails: Guardrail[]): Policy[] {
  return guardrails.map(guardrailToPolicy);
}

/**
 * Load guardrails from storage by IDs and convert to policies
 */
export function loadPoliciesFromGuardrailIds(guardrailIds: string[]): Policy[] {
  // Load all guardrails from localStorage
  const guardrailsData = localStorage.getItem('guardrails');
  const allGuardrails: Guardrail[] = guardrailsData ? JSON.parse(guardrailsData) : [];

  // Filter by IDs
  const selectedGuardrails = allGuardrails.filter(g => guardrailIds.includes(g.id));

  // Convert to policies
  return guardrailsToPolicies(selectedGuardrails);
}
