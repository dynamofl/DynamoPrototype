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
    // Section 1: Overview section with Description, Risk Stats Table, and Attack Score Gauge
    {
      key: 'overview',
      order: 1,
      label: 'Overview',
      componentKey: 'OverviewSection',
      layout: {
        container: 'constrained',
        className: 'max-w-4xl mx-auto',
        padding: ''
      },
      props: {
        // Props will be dynamically resolved by renderer
        hasGuardrails: (ctx: SummaryViewContext) => ctx.hasGuardrails,
        evaluationResults: (ctx: SummaryViewContext) => ctx.evaluationResults
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
      key: 'attackAreaOfInterest',
      order: 6,
      label: 'Attack Area of Interest',
      componentKey: 'TopicAnalysisSection',
      layout: {
        container: 'constrained',
        className: 'max-w-4xl mx-auto pb-2'
      },
      condition: (ctx: SummaryViewContext) => !!ctx.topicAnalysis,
      props: {
        topicAnalysis: (ctx: SummaryViewContext) => ctx.topicAnalysis,
        policies: (ctx: SummaryViewContext) => ctx.config?.policies,
        riskPredictions: (ctx: SummaryViewContext) => (ctx.summary as any).riskPredictions,
        evaluationResults: (ctx: SummaryViewContext) => ctx.evaluationResults
      }
    },

    // Section 7: Violating Behaviors (conditional)
    {
      key: 'violatingBehaviors',
      order: 7,
      label: 'High Violating Behaviors',
      componentKey: 'ViolatingBehaviorsSection',
      layout: {
        container: 'constrained',
        className: 'max-w-4xl mx-auto pb-2'
      },
      condition: (ctx: SummaryViewContext) => !!ctx.topicAnalysis,
      props: {
        topicAnalysis: (ctx: SummaryViewContext) => ctx.topicAnalysis,
        evaluationResults: (ctx: SummaryViewContext) => ctx.evaluationResults,
        policies: (ctx: SummaryViewContext) => ctx.config?.policies
      }
    },

    // Section 8: Attack Type Performance
    {
      key: 'attackTypePerformance',
      order: 8,
      label: 'Attack Type Performance',
      componentKey: 'AttackTypePerformanceSection',
      layout: {
        container: 'constrained',
        className: 'max-w-4xl mx-auto pb-2'
      },
      props: {
        summary: (ctx: SummaryViewContext) => ctx.summary,
        hasGuardrails: (ctx: SummaryViewContext) => ctx.hasGuardrails,
        riskPredictions: (ctx: SummaryViewContext) => (ctx.summary as any).riskPredictions,
        evaluationResults: (ctx: SummaryViewContext) => ctx.evaluationResults
      }
    },

    // Section 9: Risk Combinations
    {
      key: 'riskCombinations',
      order: 9,
      label: 'High Risk Scenarios',
      componentKey: 'RiskCombinationsSection',
      layout: {
        container: 'constrained',
        className: 'max-w-4xl mx-auto pb-2'
      },
      condition: (ctx: SummaryViewContext) => !!(ctx.summary as JailbreakEvaluationSummary).riskCombinations,
      props: {
        riskCombinations: (ctx: SummaryViewContext) => (ctx.summary as JailbreakEvaluationSummary).riskCombinations
      }
    },

    // Section 10: Risk Predictions
   
  ]
}
