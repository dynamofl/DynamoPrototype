/**
 * Jailbreak Summary View Configuration
 * Defines the layout and components for the jailbreak evaluation summary page
 */

import type { SummarySectionConfig, SummaryViewContext } from '../base-strategy'
import type { JailbreakEvaluationSummary } from '../../types/jailbreak-evaluation'

/**
 * Get summary view configuration for jailbreak evaluations
 * This defines which components to render and in what order/layout
 */
export function getJailbreakSummaryConfig(): SummarySectionConfig[] {
  return [
    // Section 1: Hero section with Overview and Dual Attack Score Gauge
    {
      key: 'hero',
      order: 1,
      componentKey: 'HeroSection',
      layout: {
        container: 'constrained',
        className: 'max-w-4xl mx-auto',
        padding: 'py-2'
      },
      props: {
        // Props will be dynamically resolved by renderer
        hasGuardrails: (ctx: SummaryViewContext) => ctx.hasGuardrails
      }
    },

    // Section 2: Overall Stats Cards
    // {
    //   key: 'statsCards',
    //   order: 2,
    //   componentKey: 'SummaryStatsCards',
    //   layout: {
    //     container: 'constrained',
    //     className: 'max-w-4xl mx-auto'
    //   }
    // },

    // // Section 3: By Policy Results
    // {
    //   key: 'byPolicy',
    //   order: 3,
    //   componentKey: 'PolicyResultsSection',
    //   layout: {
    //     container: 'constrained',
    //     className: 'max-w-4xl mx-auto'
    //   },
    //   props: {
    //     byPolicy: (ctx: SummaryViewContext) => (ctx.summary as JailbreakEvaluationSummary).byPolicy
    //   }
    // },

    // // Section 4: By Attack Type Results
    // {
    //   key: 'byAttackType',
    //   order: 4,
    //   componentKey: 'AttackTypeResultsSection',
    //   layout: {
    //     container: 'constrained',
    //     className: 'max-w-4xl mx-auto'
    //   },
    //   props: {
    //     byAttackType: (ctx: SummaryViewContext) => (ctx.summary as JailbreakEvaluationSummary).byAttackType
    //   }
    // },

    // // Section 5: By Behavior Type Results
    // {
    //   key: 'byBehaviorType',
    //   order: 5,
    //   componentKey: 'BehaviorTypeResultsSection',
    //   layout: {
    //     container: 'constrained',
    //     className: 'max-w-4xl mx-auto'
    //   },
    //   props: {
    //     byBehaviorType: (ctx: SummaryViewContext) => (ctx.summary as JailbreakEvaluationSummary).byBehaviorType
    //   }
    // },

    // Section 6: Topic Analysis (conditional)
    {
      key: 'topicAnalysis',
      order: 6,
      componentKey: 'TopicAnalysisSection',
      layout: {
        container: 'constrained',
        className: 'max-w-4xl mx-auto'
      },
      condition: (ctx: SummaryViewContext) => !!ctx.topicAnalysis,
      props: {
        topicAnalysis: (ctx: SummaryViewContext) => ctx.topicAnalysis,
        evaluationResults: (ctx: SummaryViewContext) => ctx.evaluationResults,
        policies: (ctx: SummaryViewContext) => ctx.config?.policies
      }
    }
  ]
}
