/**
 * Hallucination Summary View Configuration
 * Defines the layout and components for the hallucination evaluation summary page
 */

import type { SummarySectionConfig, SummaryViewContext } from '../base-strategy'
import type { HallucinationEvaluationSummary } from '../../types/hallucination-evaluation'

/**
 * Get summary view configuration for hallucination evaluations
 * This defines which components to render and in what order/layout
 */
export function getHallucinationSummaryConfig(): SummarySectionConfig[] {
  return [
    // Section 1: Overview with gauge and description
    {
      key: 'overview',
      order: 1,
      label: 'Overview',
      componentKey: 'HallucinationOverviewSection',
      layout: {
        container: 'constrained',
        className: 'max-w-4xl mx-auto',
        padding: ''
      },
      props: {
        summary: (ctx: SummaryViewContext) => ctx.summary
      }
    },

    // Section 2: Category Breakdown Table
    {
      key: 'categoryBreakdownTable',
      order: 2,
      label: 'Hallucination Breakdown by Category',
      componentKey: 'CategoryBreakdownTableSection',
      layout: {
        container: 'constrained',
        className: 'max-w-4xl mx-auto',
        padding: ''
      },
      condition: (ctx: SummaryViewContext) => {
        const hallucinationSummary = ctx.summary as HallucinationEvaluationSummary
        const categories = hallucinationSummary.by_category
          ? Object.entries(hallucinationSummary.by_category).filter(([cat]) => cat !== 'N/A')
          : []
        return categories.length > 0
      },
      props: {
        summary: (ctx: SummaryViewContext) => ctx.summary
      }
    },

    // Section 3: By Category Cards (Hallucination Types)
    {
      key: 'byCategory',
      order: 3,
      label: 'By Category',
      componentKey: 'CategoryResultsSection',
      layout: {
        container: 'constrained',
        className: 'max-w-4xl mx-auto'
      },
      condition: (ctx: SummaryViewContext) => {
        const hallucinationSummary = ctx.summary as HallucinationEvaluationSummary
        return !!hallucinationSummary.by_category && Object.keys(hallucinationSummary.by_category).length > 0
      },
      props: {
        byCategory: (ctx: SummaryViewContext) => (ctx.summary as HallucinationEvaluationSummary).by_category
      }
    },

    // Section 4: By Policy Results (conditional)
    {
      key: 'byPolicy',
      order: 4,
      componentKey: 'PolicyResultsSection',
      layout: {
        container: 'constrained',
        className: 'max-w-4xl mx-auto'
      },
      condition: (ctx: SummaryViewContext) => {
        const hallucinationSummary = ctx.summary as HallucinationEvaluationSummary
        return !!hallucinationSummary.by_policy && Object.keys(hallucinationSummary.by_policy).length > 0
      },
      props: {
        byPolicy: (ctx: SummaryViewContext) => (ctx.summary as HallucinationEvaluationSummary).by_policy
      }
    },

    // Section 5: By Behavior Type Results (conditional)
    {
      key: 'byBehaviorType',
      order: 5,
      componentKey: 'BehaviorTypeResultsSection',
      layout: {
        container: 'constrained',
        className: 'max-w-4xl mx-auto'
      },
      condition: (ctx: SummaryViewContext) => {
        const hallucinationSummary = ctx.summary as HallucinationEvaluationSummary
        return !!hallucinationSummary.by_behavior_type && Object.keys(hallucinationSummary.by_behavior_type).length > 0
      },
      props: {
        byBehaviorType: (ctx: SummaryViewContext) => (ctx.summary as HallucinationEvaluationSummary).by_behavior_type
      }
    }
  ]
}
