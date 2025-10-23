import type { Guardrail } from '@/types';
import type { Policy } from '../types/jailbreak-evaluation';
import { supabase } from '@/lib/supabase/client';

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
 * NOTE: This is now an async function that fetches from Supabase
 */
export async function loadPoliciesFromGuardrailIds(guardrailIds: string[]): Promise<Policy[]> {
  try {
    // Fetch guardrails from Supabase
    const { data, error } = await supabase
      .from('guardrails')
      .select('*')
      .in('id', guardrailIds);

    if (error) {
      console.error('Error fetching guardrails from Supabase:', error);
      return [];
    }

    // Transform Supabase data to match Guardrail type
    const allGuardrails: Guardrail[] = (data || []).map((item) => {
      const policyData = Array.isArray(item.policies) && item.policies.length > 0
        ? item.policies[0]
        : {};

      return {
        id: item.id,
        name: item.name,
        description: policyData.description || '',
        content: policyData.disallowedBehavior || '',
        allowedBehavior: policyData.allowedBehavior || '',
        disallowedBehavior: policyData.disallowedBehavior || '',
        category: item.category || 'Content',
        type: item.type || 'Input Policy',
        status: item.status || 'active',
        createdAt: item.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
        updatedAt: item.updated_at?.split('T')[0] || new Date().toISOString().split('T')[0]
      };
    });

    // Convert to policies
    const policies = guardrailsToPolicies(allGuardrails);
    return policies;
  } catch (err) {
    console.error('Failed to load guardrails from Supabase:', err);
    return [];
  }
}
