/**
 * Compliance Summary View Configuration
 * Defines the layout and components for the compliance evaluation summary page
 */

import type { SummarySectionConfig, SummaryViewContext } from '../base-strategy'
import type { ComplianceEvaluationSummary } from '../../types/compliance-evaluation'

/**
 * Get summary view configuration for compliance evaluations
 * This defines which components to render and in what order/layout
 */
export function getComplianceSummaryConfig(): SummarySectionConfig[] {
  return [
    // Section 0: Progress Checkpoints (shown only when evaluation is running)
    {
      key: 'progress-checkpoints',
      order: 0,
      label: 'Progress',
      componentKey: 'ProgressCheckpointsSection',
      layout: {
        container: 'constrained',
        className: 'max-w-4xl mx-auto',
        padding: ''
      },
      condition: (ctx: SummaryViewContext) =>
        ctx.evaluationStatus === 'running' || ctx.evaluationStatus === 'pending',
      props: {
        current: (ctx: SummaryViewContext) => ctx.evaluationProgress?.current ?? 0,
        total: (ctx: SummaryViewContext) => ctx.evaluationProgress?.total ?? 0,
        stage: (ctx: SummaryViewContext) => ctx.evaluationProgress?.stage ?? '',
        startedAt: (ctx: SummaryViewContext) => ctx.evaluationProgress?.startedAt
      }
    },

    // Section 1: Overview with gauge and description
    {
      key: 'overview',
      order: 1,
      label: 'Overview',
      componentKey: 'ComplianceOverviewSection',
      condition: (ctx: SummaryViewContext) =>
        ctx.evaluationStatus === 'completed' || ctx.evaluationStatus === 'failed',
      layout: {
        container: 'constrained',
        className: 'max-w-4xl mx-auto',
        padding: ''
      },
      props: {
        summary: (ctx: SummaryViewContext) => ctx.summary
      }
    },

    // Section 2: Generic Summary Cards (TP, TN, FP, FN, F1, Accuracy)
    {
      key: 'summaryCards',
      order: 2,
      componentKey: 'GenericSummaryCards',
      layout: {
        container: 'constrained',
        className: 'max-w-4xl mx-auto'
      },
      condition: (ctx: SummaryViewContext) =>
        ctx.evaluationStatus === 'completed' || ctx.evaluationStatus === 'failed'
    },

    // Section 3: By Policy Results (conditional)
    {
      key: 'byPolicy',
      order: 3,
      componentKey: 'PolicyResultsSection',
      layout: {
        container: 'constrained',
        className: 'max-w-4xl mx-auto'
      },
      condition: (ctx: SummaryViewContext) => {
        const complianceSummary = ctx.summary as ComplianceEvaluationSummary
        return (ctx.evaluationStatus === 'completed' || ctx.evaluationStatus === 'failed') &&
          !!complianceSummary.by_policy && Object.keys(complianceSummary.by_policy).length > 0
      },
      props: {
        byPolicy: (ctx: SummaryViewContext) => (ctx.summary as ComplianceEvaluationSummary).by_policy
      }
    },

    // Section 4: By Behavior Type Results (conditional)
    {
      key: 'byBehaviorType',
      order: 4,
      componentKey: 'BehaviorTypeResultsSection',
      layout: {
        container: 'constrained',
        className: 'max-w-4xl mx-auto'
      },
      condition: (ctx: SummaryViewContext) => {
        const complianceSummary = ctx.summary as ComplianceEvaluationSummary
        return (ctx.evaluationStatus === 'completed' || ctx.evaluationStatus === 'failed') &&
          !!complianceSummary.by_behavior_type && Object.keys(complianceSummary.by_behavior_type).length > 0
      },
      props: {
        byBehaviorType: (ctx: SummaryViewContext) => (ctx.summary as ComplianceEvaluationSummary).by_behavior_type
      }
    },

    // Section 5: Topic Analysis (conditional)
    {
      key: 'topicAnalysis',
      order: 5,
      label: 'Topic Analysis',
      componentKey: 'ComplianceTopicAnalysisSection',
      layout: {
        container: 'constrained',
        className: 'max-w-4xl mx-auto pb-2'
      },
      condition: (ctx: SummaryViewContext) =>
        (ctx.evaluationStatus === 'completed' || ctx.evaluationStatus === 'failed') &&
        !!ctx.topicAnalysis,
      props: {
        topicAnalysis: (ctx: SummaryViewContext) => ctx.topicAnalysis
      }
    }
  ]
}
