/**
 * Conversation Filters - Deep filtering system for evaluation results
 *
 * Supports:
 * - Direct property matching
 * - Deep nested property access (e.g., policyContext.disallowedBehaviors)
 * - Array contains checks
 * - Range filtering
 * - Custom predicates for complex logic
 * - Composable filters with AND/OR modes
 */

import type { JailbreakEvaluationResult, AttackType } from '../types/jailbreak-evaluation'

// Base filter predicate type
export type FilterPredicate<T> = (item: T) => boolean

// Path-based accessor for nested properties
export type PropertyPath = string | string[]

/**
 * Individual filter condition
 */
export interface FilterCondition {
  // Direct property match
  field?: keyof JailbreakEvaluationResult
  value?: any

  // Nested property access (e.g., "policyContext.disallowedBehaviors")
  path?: PropertyPath

  // Array contains check (when path points to an array)
  arrayContains?: any

  // Range check (for numeric values)
  range?: { min?: number; max?: number }

  // Custom predicate for complex logic
  predicate?: FilterPredicate<JailbreakEvaluationResult>
}

/**
 * Complete filter specification
 */
export interface ConversationFilter {
  conditions: FilterCondition[]
  mode: 'AND' | 'OR'  // How to combine conditions
}

/**
 * Get nested property value from object using path
 * Supports both dot notation strings and array paths
 *
 * @example
 * getNestedValue(obj, 'policyContext.disallowedBehaviors')
 * getNestedValue(obj, ['policyContext', 'disallowedBehaviors'])
 */
export function getNestedValue(obj: any, path: PropertyPath): any {
  if (!obj) return undefined

  const pathArray = typeof path === 'string' ? path.split('.') : path

  let current = obj
  for (const key of pathArray) {
    if (current === null || current === undefined) {
      return undefined
    }
    current = current[key]
  }

  return current
}

/**
 * Extract all disallowed behaviors from a result
 * Checks multiple possible locations in the nested structure
 */
function extractDisallowedBehaviors(result: JailbreakEvaluationResult): string[] {
  const behaviors = new Set<string>()

  // Check policyContext for behaviors
  if (result.policyContext) {
    const context = result.policyContext

    // Try different property names (snake_case and camelCase)
    const disallowedArrays = [
      context.disallowedBehaviors,
      context.disallowed,
      context.behaviors?.disallowed
    ]

    disallowedArrays.forEach(arr => {
      if (Array.isArray(arr)) {
        arr.forEach(b => behaviors.add(String(b)))
      }
    })
  }

  return Array.from(behaviors)
}

/**
 * Check if result has a specific behavior violation
 * Searches in:
 * - policyContext.disallowedBehaviors
 * - inputGuardrailViolations
 * - outputGuardrailViolations
 */
export function hasBehaviorViolation(
  result: JailbreakEvaluationResult,
  behavior: string
): boolean {
  const behaviorLower = behavior.toLowerCase()

  // Check in policy context
  const disallowedBehaviors = extractDisallowedBehaviors(result)
  if (disallowedBehaviors.some(b => b.toLowerCase() === behaviorLower)) {
    return true
  }

  // Check in guardrail violations
  const checkViolations = (violations: any) => {
    if (!Array.isArray(violations)) return false
    return violations.some(v =>
      Array.isArray(v.violatedBehaviors) &&
      v.violatedBehaviors.some((b: string) => b.toLowerCase() === behaviorLower)
    )
  }

  if (checkViolations(result.inputGuardrailViolations)) return true
  if (checkViolations(result.outputGuardrailViolations)) return true

  return false
}

/**
 * Evaluate a single filter condition against a result
 */
function evaluateCondition(
  result: JailbreakEvaluationResult,
  condition: FilterCondition
): boolean {
  // Custom predicate has highest priority
  if (condition.predicate) {
    return condition.predicate(result)
  }

  // Direct field match
  if (condition.field !== undefined) {
    const fieldValue = result[condition.field]

    // Range check for numeric values
    if (condition.range && typeof fieldValue === 'number') {
      const { min, max } = condition.range
      if (min !== undefined && fieldValue < min) return false
      if (max !== undefined && fieldValue > max) return false
      return true
    }

    // Direct equality
    if (condition.value !== undefined) {
      return fieldValue === condition.value
    }

    return true
  }

  // Nested path access
  if (condition.path !== undefined) {
    const value = getNestedValue(result, condition.path)

    // Array contains check
    if (condition.arrayContains !== undefined && Array.isArray(value)) {
      return value.includes(condition.arrayContains)
    }

    // Direct equality on nested value
    if (condition.value !== undefined) {
      return value === condition.value
    }

    // Range check on nested value
    if (condition.range && typeof value === 'number') {
      const { min, max } = condition.range
      if (min !== undefined && value < min) return false
      if (max !== undefined && value > max) return false
      return true
    }

    return true
  }

  // No valid condition specified
  return true
}

/**
 * Main filtering function
 * Applies all conditions in the filter according to the mode (AND/OR)
 */
export function filterConversations(
  results: JailbreakEvaluationResult[],
  filter: ConversationFilter
): JailbreakEvaluationResult[] {
  if (!filter.conditions || filter.conditions.length === 0) {
    return results
  }

  return results.filter(result => {
    if (filter.mode === 'AND') {
      // All conditions must be true
      return filter.conditions.every(condition =>
        evaluateCondition(result, condition)
      )
    } else {
      // At least one condition must be true
      return filter.conditions.some(condition =>
        evaluateCondition(result, condition)
      )
    }
  })
}

/**
 * Pre-computed indexes for faster filtering
 */
export interface ConversationIndexes {
  byPolicy: Map<string, JailbreakEvaluationResult[]>
  byTopic: Map<string, JailbreakEvaluationResult[]>
  byBehavior: Map<string, JailbreakEvaluationResult[]>
  byAttackType: Map<AttackType, JailbreakEvaluationResult[]>
}

/**
 * Build indexes for common filter patterns
 * Call this once when results load, then use for faster filtering
 */
export function buildConversationIndexes(
  results: JailbreakEvaluationResult[]
): ConversationIndexes {
  const byPolicy = new Map<string, JailbreakEvaluationResult[]>()
  const byTopic = new Map<string, JailbreakEvaluationResult[]>()
  const byBehavior = new Map<string, JailbreakEvaluationResult[]>()
  const byAttackType = new Map<AttackType, JailbreakEvaluationResult[]>()

  results.forEach(result => {
    // Index by policy
    if (result.policyName) {
      if (!byPolicy.has(result.policyName)) {
        byPolicy.set(result.policyName, [])
      }
      byPolicy.get(result.policyName)!.push(result)
    }

    // Index by topic
    if (result.topic) {
      if (!byTopic.has(result.topic)) {
        byTopic.set(result.topic, [])
      }
      byTopic.get(result.topic)!.push(result)
    }

    // Index by behaviors
    const behaviors = extractDisallowedBehaviors(result)
    behaviors.forEach(behavior => {
      const key = behavior.toLowerCase()
      if (!byBehavior.has(key)) {
        byBehavior.set(key, [])
      }
      byBehavior.get(key)!.push(result)
    })

    // Index by attack type
    if (result.attackType) {
      if (!byAttackType.has(result.attackType)) {
        byAttackType.set(result.attackType, [])
      }
      byAttackType.get(result.attackType)!.push(result)
    }
  })

  return { byPolicy, byTopic, byBehavior, byAttackType }
}

/**
 * Filter conversations using pre-built indexes for performance
 * Falls back to regular filtering if indexes don't match
 */
export function filterConversationsWithIndexes(
  results: JailbreakEvaluationResult[],
  filter: ConversationFilter,
  indexes?: ConversationIndexes
): JailbreakEvaluationResult[] {
  // If no indexes, use regular filtering
  if (!indexes || filter.conditions.length === 0) {
    return filterConversations(results, filter)
  }

  // Try to use indexes for simple filters
  if (filter.mode === 'AND' && filter.conditions.length === 1) {
    const condition = filter.conditions[0]

    // Direct policy match
    if (condition.field === 'policyName' && condition.value) {
      const indexed = indexes.byPolicy.get(condition.value)
      if (indexed) return indexed
    }

    // Direct topic match
    if (condition.field === 'topic' && condition.value) {
      const indexed = indexes.byTopic.get(condition.value)
      if (indexed) return indexed
    }

    // Direct attack type match
    if (condition.field === 'attackType' && condition.value) {
      const indexed = indexes.byAttackType.get(condition.value)
      if (indexed) return indexed
    }
  }

  // For complex filters, fall back to regular filtering
  return filterConversations(results, filter)
}
