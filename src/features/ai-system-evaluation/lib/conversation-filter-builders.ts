/**
 * Conversation Filter Builders
 *
 * Pre-built filter constructors for common filtering scenarios.
 * Provides fluent builder API for creating complex filters.
 */

import type { JailbreakEvaluationResult, AttackType } from '../types/jailbreak-evaluation'
import type { ConversationFilter, FilterCondition, FilterPredicate } from './conversation-filters'
import { hasBehaviorViolation } from './conversation-filters'

/**
 * Build filter for behavior violations
 * Filters results that have a specific disallowed behavior
 *
 * @param policyName - Policy name to filter by
 * @param behavior - Specific behavior to match
 * @param topic - Optional topic to filter by
 */
export function buildBehaviorViolationFilter(
  policyName: string,
  behavior: string,
  topic?: string
): ConversationFilter {
  const conditions: FilterCondition[] = [
    {
      field: 'policyName',
      value: policyName
    },
    {
      predicate: (result) => hasBehaviorViolation(result, behavior)
    }
  ]

  // Add topic filter if provided
  if (topic) {
    conditions.push({
      field: 'topic',
      value: topic
    })
  }

  return {
    conditions,
    mode: 'AND'
  }
}

/**
 * Build filter for attack type performance
 * Filters results by attack type, optionally filtering only successes
 *
 * @param attackType - Attack type to filter by
 * @param successOnly - If true, only include successful attacks
 */
export function buildAttackTypeFilter(
  attackType: AttackType,
  successOnly?: boolean
): ConversationFilter {
  const conditions: FilterCondition[] = [
    {
      field: 'attackType',
      value: attackType
    }
  ]

  if (successOnly) {
    conditions.push({
      field: 'attackOutcome',
      value: 'Attack Success'
    })
  }

  return {
    conditions,
    mode: 'AND'
  }
}

/**
 * Build filter for multiple attack types
 *
 * @param attackTypes - Array of attack types to include
 * @param successOnly - If true, only include successful attacks
 */
export function buildAttackTypesFilter(
  attackTypes: AttackType[],
  successOnly?: boolean
): ConversationFilter {
  const conditions: FilterCondition[] = [
    {
      predicate: (result) => attackTypes.includes(result.attackType)
    }
  ]

  if (successOnly) {
    conditions.push({
      field: 'attackOutcome',
      value: 'Attack Success'
    })
  }

  return {
    conditions,
    mode: 'AND'
  }
}

/**
 * Build filter for topic analysis
 * Filters by policy and topic, with optional success rate threshold
 *
 * @param policyName - Policy name to filter by
 * @param topic - Topic to filter by
 * @param options - Additional filter options
 */
export function buildTopicFilter(
  policyName: string,
  topic: string,
  options?: {
    minSuccessRate?: number
    attackTypes?: AttackType[]
  }
): ConversationFilter {
  const conditions: FilterCondition[] = [
    {
      field: 'policyName',
      value: policyName
    },
    {
      field: 'topic',
      value: topic
    }
  ]

  // Add attack success filter if success rate threshold specified
  if (options?.minSuccessRate !== undefined && options.minSuccessRate > 0) {
    conditions.push({
      field: 'attackOutcome',
      value: 'Attack Success'
    })
  }

  // Add attack type filter if specified
  if (options?.attackTypes && options.attackTypes.length > 0) {
    conditions.push({
      predicate: (result) => options.attackTypes!.includes(result.attackType)
    })
  }

  return {
    conditions,
    mode: 'AND'
  }
}

/**
 * Build filter for policy-level analysis
 *
 * @param policyName - Policy name to filter by
 * @param options - Additional filter options
 */
export function buildPolicyFilter(
  policyName: string,
  options?: {
    successOnly?: boolean
    attackTypes?: AttackType[]
  }
): ConversationFilter {
  const conditions: FilterCondition[] = [
    {
      field: 'policyName',
      value: policyName
    }
  ]

  if (options?.successOnly) {
    conditions.push({
      field: 'attackOutcome',
      value: 'Attack Success'
    })
  }

  if (options?.attackTypes && options.attackTypes.length > 0) {
    conditions.push({
      predicate: (result) => options.attackTypes!.includes(result.attackType)
    })
  }

  return {
    conditions,
    mode: 'AND'
  }
}

/**
 * Fluent builder for composing complex filters
 *
 * @example
 * const filter = new FilterBuilder()
 *   .withPolicy('Healthcare Policy')
 *   .withBehavior('Provide medical advice')
 *   .withAttackType('TAP')
 *   .withSuccessOnly()
 *   .build()
 */
export class FilterBuilder {
  private conditions: FilterCondition[] = []

  /**
   * Add policy name filter
   */
  withPolicy(policyName: string): this {
    this.conditions.push({
      field: 'policyName',
      value: policyName
    })
    return this
  }

  /**
   * Add behavior violation filter
   */
  withBehavior(behavior: string): this {
    this.conditions.push({
      predicate: (result) => hasBehaviorViolation(result, behavior)
    })
    return this
  }

  /**
   * Add topic filter
   */
  withTopic(topic: string): this {
    this.conditions.push({
      field: 'topic',
      value: topic
    })
    return this
  }

  /**
   * Add single attack type filter
   */
  withAttackType(attackType: AttackType): this {
    this.conditions.push({
      field: 'attackType',
      value: attackType
    })
    return this
  }

  /**
   * Add multiple attack types filter (OR)
   */
  withAttackTypes(attackTypes: AttackType[]): this {
    this.conditions.push({
      predicate: (result) => attackTypes.includes(result.attackType)
    })
    return this
  }

  /**
   * Filter only successful attacks
   */
  withSuccessOnly(): this {
    this.conditions.push({
      field: 'attackOutcome',
      value: 'Attack Success'
    })
    return this
  }

  /**
   * Filter only failed attacks
   */
  withFailureOnly(): this {
    this.conditions.push({
      field: 'attackOutcome',
      value: 'Attack Failure'
    })
    return this
  }

  /**
   * Add behavior type filter
   */
  withBehaviorType(behaviorType: 'Allowed' | 'Disallowed'): this {
    this.conditions.push({
      field: 'behaviorType',
      value: behaviorType
    })
    return this
  }

  /**
   * Add custom predicate
   */
  withCustomPredicate(predicate: FilterPredicate<JailbreakEvaluationResult>): this {
    this.conditions.push({ predicate })
    return this
  }

  /**
   * Add field equals value condition
   */
  withField(field: keyof JailbreakEvaluationResult, value: any): this {
    this.conditions.push({ field, value })
    return this
  }

  /**
   * Add range filter (for numeric fields)
   */
  withRange(field: keyof JailbreakEvaluationResult, min?: number, max?: number): this {
    this.conditions.push({
      field,
      range: { min, max }
    })
    return this
  }

  /**
   * Add nested path filter
   */
  withPath(path: string | string[], value?: any): this {
    this.conditions.push({ path, value })
    return this
  }

  /**
   * Add array contains filter
   */
  withArrayContains(path: string | string[], value: any): this {
    this.conditions.push({ path, arrayContains: value })
    return this
  }

  /**
   * Build the final filter
   *
   * @param mode - How to combine conditions (default: AND)
   */
  build(mode: 'AND' | 'OR' = 'AND'): ConversationFilter {
    return {
      conditions: [...this.conditions],
      mode
    }
  }

  /**
   * Reset the builder to start fresh
   */
  reset(): this {
    this.conditions = []
    return this
  }

  /**
   * Get current number of conditions
   */
  get conditionCount(): number {
    return this.conditions.length
  }
}

/**
 * Create a new filter builder instance
 */
export function createFilterBuilder(): FilterBuilder {
  return new FilterBuilder()
}
