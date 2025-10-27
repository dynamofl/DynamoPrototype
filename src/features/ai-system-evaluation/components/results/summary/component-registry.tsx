/**
 * Component Registry for Summary View Renderer
 * Maps component keys to actual React components for config-driven rendering
 */

import type { ComponentType } from 'react'
import { OverviewSection } from './overview-section'
import { DualAttackScoreGauge } from './dual-attack-score-gauge'
import { SummaryStatsCards } from './summary-stats-cards'
import { GenericSummaryCards } from './generic-summary-cards'
import { PolicyResultsSection } from './policy-results-section'
import { AttackTypeResultsSection } from './attack-type-results-section'
import { BehaviorTypeResultsSection } from './behavior-type-results-section'
import { TopicAnalysisSection } from './topic-analysis-section'
import { ViolatingBehaviorsSection } from './violating-behaviors-section'
import { AttackTypePerformanceSection } from './attack-type-performance-section'
import { RiskCombinationsSection } from './risk-combinations-section'
import { RiskPredictionsSection } from './risk-predictions-section'

/**
 * Component registry mapping component keys to React components
 * Add new components here as they are created
 */
export const componentRegistry: Record<string, ComponentType<any>> = {
  // Jailbreak-specific components
  OverviewSection,
  DualAttackScoreGauge,
  SummaryStatsCards,
  HeroSection: ({ summary, hasGuardrails }: any) => (
    <div className={`grid ${hasGuardrails ? 'grid-cols-6' : 'grid-cols-4'} mx-3 align-center items-center py-2 border-t border-b border-dashed border-gray-200`}>
      {/* Left: Overview Description */}
      <div className={hasGuardrails ? 'col-span-3' : 'col-span-3'}>
        <OverviewSection summary={summary} hasGuardrails={hasGuardrails} />
      </div>

      {/* Right: Attack Score Gauge */}
      <div className={hasGuardrails ? 'col-span-3' : 'col-span-1'}>
        <DualAttackScoreGauge summary={summary} hasGuardrails={hasGuardrails} />
      </div>
    </div>
  ),

  // Generic/shared components
  GenericSummaryCards,
  PolicyResultsSection,
  AttackTypeResultsSection,
  BehaviorTypeResultsSection,
  TopicAnalysisSection,
  ViolatingBehaviorsSection,
  AttackTypePerformanceSection,
  RiskCombinationsSection,
  RiskPredictionsSection,
}

/**
 * Get a component from the registry by key
 * @param key Component key
 * @returns React component or null if not found
 */
export function getComponent(key: string): ComponentType<any> | null {
  return componentRegistry[key] || null
}

/**
 * Register a new component in the registry
 * Useful for plugins or dynamic component registration
 * @param key Component key
 * @param component React component
 */
export function registerComponent(key: string, component: ComponentType<any>) {
  componentRegistry[key] = component
}
