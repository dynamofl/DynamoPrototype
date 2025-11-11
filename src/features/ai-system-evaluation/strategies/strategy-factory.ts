// Strategy Factory - Central registry and factory for evaluation strategies
// Provides a single point to get the correct strategy for any test type

import type { EvaluationStrategy } from './base-strategy'
import { JailbreakStrategy } from './jailbreak-strategy.tsx'
import { ComplianceStrategy } from './compliance-strategy.tsx'
import type { BaseEvaluationResult } from '../types/base-evaluation'
import type { JailbreakEvaluationResult } from '../types/jailbreak-evaluation'
import type { ComplianceEvaluationResult } from '../types/compliance-evaluation'

/**
 * Registry of all available evaluation strategies
 * To add a new test type:
 * 1. Create a new strategy class implementing EvaluationStrategy
 * 2. Register it here
 * 3. That's it! All components will automatically work with the new type
 */
const STRATEGY_REGISTRY: Record<string, EvaluationStrategy> = {
  'jailbreak': new JailbreakStrategy() as EvaluationStrategy,
  'compliance': new ComplianceStrategy() as EvaluationStrategy
  // Future test types can be added here:
  // 'quality': new QualityStrategy(),
  // 'bias': new BiasStrategy(),
  // 'performance': new PerformanceStrategy(),
}

/**
 * Get the evaluation strategy for a given test type
 * @param testType - The test type identifier ('jailbreak', 'compliance', etc.)
 * @returns The strategy instance for the test type
 */
export function getEvaluationStrategy(testType: string): EvaluationStrategy {
  const strategy = STRATEGY_REGISTRY[testType]

  if (!strategy) {
    console.warn(`Unknown test type: "${testType}", falling back to jailbreak strategy`)
    return STRATEGY_REGISTRY['jailbreak']
  }

  return strategy
}

/**
 * Get all registered strategy test types
 * Useful for UI selectors, validation, etc.
 */
export function getRegisteredTestTypes(): string[] {
  return Object.keys(STRATEGY_REGISTRY)
}

/**
 * Get display names for all test types
 * Useful for UI dropdowns, tabs, etc.
 */
export function getTestTypeDisplayNames(): Record<string, string> {
  const displayNames: Record<string, string> = {}
  Object.entries(STRATEGY_REGISTRY).forEach(([key, strategy]) => {
    displayNames[key] = strategy.displayName
  })
  return displayNames
}

/**
 * Type guard to check if a result is a jailbreak result
 */
export function isJailbreakResult(result: any): result is JailbreakEvaluationResult {
  return result && 'attackType' in result &&
         'adversarialPrompt' in result &&
         'attackOutcome' in result
}

/**
 * Type guard to check if a result is a compliance result
 */
export function isComplianceResult(result: BaseEvaluationResult): result is ComplianceEvaluationResult {
  return 'groundTruth' in result &&
         'finalOutcome' in result &&
         'actualPrompt' in result
}

/**
 * Detect test type from a result record
 * Useful when test type is not explicitly available
 */
export function detectTestTypeFromResult(result: BaseEvaluationResult): string {
  if (isJailbreakResult(result)) return 'jailbreak'
  if (isComplianceResult(result)) return 'compliance'

  // Default to jailbreak for backward compatibility
  return 'jailbreak'
}

/**
 * Validate that a test type is supported
 */
export function isValidTestType(testType: string): boolean {
  return testType in STRATEGY_REGISTRY
}

/**
 * Get strategy safely with validation
 * Throws an error if test type is invalid (use for strict type checking)
 */
export function getEvaluationStrategyStrict(testType: string): EvaluationStrategy {
  if (!isValidTestType(testType)) {
    throw new Error(`Invalid test type: "${testType}". Supported types: ${getRegisteredTestTypes().join(', ')}`)
  }
  return STRATEGY_REGISTRY[testType]
}
