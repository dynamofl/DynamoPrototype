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
import { RiskStatsSection } from './risk-stats-section'

// Template components
import {
  SummaryTextSection,
  SummaryTableSection,
  SummaryChartSection,
} from './templates'

/**
 * Component registry mapping component keys to React components
 * Add new components here as they are created
 */
export const componentRegistry: Record<string, ComponentType<any>> = {
  // Jailbreak-specific components
  OverviewSection,
  DualAttackScoreGauge,
  SummaryStatsCards,

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
  RiskStatsSection,

  // Template components
  SummaryTextSection,
  SummaryTableSection,
  SummaryChartSection,
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
