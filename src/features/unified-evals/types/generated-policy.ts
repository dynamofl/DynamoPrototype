export type { GeneratedPolicy } from '@/lib/agents/policy-generator-service'

export function createGeneratedPolicyId() {
  return `gen-${Date.now()}`
}
