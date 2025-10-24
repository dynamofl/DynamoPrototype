/**
 * Summary View Renderer - Config-Driven Summary View Component
 *
 * This component renders summary sections based on configuration from evaluation strategies.
 * It enables scalable, declarative definition of summary layouts for different test types.
 */

import type { EvaluationStrategy } from '../../../strategies/base-strategy'
import type { BaseEvaluationSummary, BaseEvaluationResult } from '../../../types/base-evaluation'
import type { SummaryViewContext } from '../../../strategies/base-strategy'
import { getComponent } from './component-registry'

interface SummaryViewRendererProps {
  strategy: EvaluationStrategy
  summary: BaseEvaluationSummary
  testType: string
  hasGuardrails?: boolean
  topicAnalysis?: any
  evaluationResults?: BaseEvaluationResult[]
  // Allow additional context properties
  [key: string]: any
}

/**
 * Resolve prop value - can be static value or function that takes context
 */
function resolveProp(propValue: any, context: SummaryViewContext): any {
  if (typeof propValue === 'function') {
    return propValue(context)
  }
  return propValue
}

/**
 * Render a single summary section based on configuration
 */
function renderSection(
  config: any,
  context: SummaryViewContext,
  strategy: EvaluationStrategy
) {
  // Check condition if present
  if (config.condition && !config.condition(context)) {
    return null
  }

  // Get component from registry
  const Component = getComponent(config.componentKey)
  if (!Component) {
    console.warn(`Component not found in registry: ${config.componentKey}`)
    return null
  }

  // Resolve props
  const resolvedProps: Record<string, any> = {
    summary: context.summary,
    strategy,
    testType: context.testType
  }

  // Add configured props
  if (config.props) {
    Object.keys(config.props).forEach((key) => {
      resolvedProps[key] = resolveProp(config.props[key], context)
    })
  }

  // Build container classes
  const containerClasses = [
    config.layout?.className || '',
    config.layout?.padding || '',
  ].filter(Boolean).join(' ')

  return (
    <div key={config.key} className={containerClasses}>
      <Component {...resolvedProps} />
    </div>
  )
}

/**
 * Main Summary View Renderer Component
 */
export function SummaryViewRenderer({
  strategy,
  summary,
  testType,
  hasGuardrails = false,
  topicAnalysis,
  evaluationResults,
  ...additionalContext
}: SummaryViewRendererProps) {
  // Build context object
  const context: SummaryViewContext = {
    summary,
    testType,
    hasGuardrails,
    topicAnalysis,
    evaluationResults,
    ...additionalContext
  }

  // Get summary view configuration from strategy
  const viewConfig = strategy.getSummaryViewConfig()

  // Sort sections by order
  const sortedSections = [...viewConfig].sort((a, b) => a.order - b.order)

  return (
    <>
      {sortedSections.map((sectionConfig) =>
        renderSection(sectionConfig, context, strategy)
      )}
    </>
  )
}
