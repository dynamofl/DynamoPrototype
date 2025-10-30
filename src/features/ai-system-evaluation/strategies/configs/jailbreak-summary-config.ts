/**
 * Jailbreak Summary View Configuration
 * Defines the layout and components for the jailbreak evaluation summary page
 */

import type { SummarySectionConfig, SummaryViewContext } from '../base-strategy'
import type { JailbreakEvaluationSummary } from '../../types/jailbreak-evaluation'
import type { ChartConfig } from '@/components/ui/chart'

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

    // Section 10: Template Example - Text Section
    {
      key: 'templateExampleText',
      order: 10,
      label: 'Example: Text Section',
      componentKey: 'SummaryTextSection',
      layout: {
        container: 'constrained',
        className: 'max-w-4xl mx-auto pb-2'
      },
      props: {
        title: () => 'Key Findings',
        topDescription: () => 'The following analysis provides critical insights into system behavior patterns observed during the evaluation period.',
        description: () => 'The evaluation identified several critical patterns in system behavior, including consistent performance across common attack vectors and areas requiring enhanced monitoring. Overall system resilience demonstrates maturity with opportunities for continued refinement.',
      }
    },

    // Section 11: Template Example - Table Section
    {
      key: 'templateExampleTable',
      order: 11,
      label: 'Example: Table Section',
      componentKey: 'SummaryTableSection',
      layout: {
        container: 'constrained',
        className: 'max-w-4xl mx-auto pb-2'
      },
      props: {
        title: () => 'Performance Metrics',
        columns: () => [
          { key: 'metric', header: 'Metric', align: 'left' as const },
          { key: 'value', header: 'Value', align: 'right' as const, width: '100px' },
          { key: 'status', header: 'Status', align: 'center' as const, width: '120px' },
        ],
        data: () => [
          { metric: 'Total Tests', value: '1,247', status: 'Completed' },
          { metric: 'Success Rate', value: '94.3%', status: 'Good' },
          { metric: 'Average Response Time', value: '234ms', status: 'Excellent' },
          { metric: 'Error Rate', value: '5.7%', status: 'Acceptable' },
          { metric: 'Coverage', value: '98.2%', status: 'Excellent' },
        ],
        bottomDescription: () => 'All metrics measured over 30-day evaluation period.',
      }
    },

    // Section 12: Template Example - Bar Chart
    {
      key: 'templateExampleBarChart',
      order: 12,
      label: 'Example: Bar Chart',
      componentKey: 'SummaryChartSection',
      layout: {
        container: 'constrained',
        className: 'max-w-4xl mx-auto pb-2'
      },
      props: {
        title: () => 'Attack Type Performance',
        chartType: () => 'bar' as const,
        data: () => [
          { category: 'Direct Attacks', value: 87 },
          { category: 'Obfuscation', value: 92 },
          { category: 'Context Manipulation', value: 78 },
          { category: 'Role Play', value: 85 },
          { category: 'Payload Splitting', value: 91 },
        ],
        chartConfig: () => ({
          value: {
            label: 'Success Rate (%)',
            color: 'var(--chart-1)',
          },
        } satisfies ChartConfig),
        bottomDescription: () => 'Success rates by attack type over evaluation period.',
      }
    },

    // Section 13: Template Example - Line Chart
    {
      key: 'templateExampleLineChart',
      order: 13,
      label: 'Example: Line Chart',
      componentKey: 'SummaryChartSection',
      layout: {
        container: 'constrained',
        className: 'max-w-4xl mx-auto pb-2'
      },
      props: {
        title: () => 'Performance Trend Analysis',
        chartType: () => 'line' as const,
        data: () => [
          { x: 'Week 1', score: 78 },
          { x: 'Week 2', score: 82 },
          { x: 'Week 3', score: 85 },
          { x: 'Week 4', score: 88 },
          { x: 'Week 5', score: 87 },
          { x: 'Week 6', score: 91 },
        ],
        chartConfig: () => ({
          score: {
            label: 'Performance Score',
            color: 'var(--chart-2)',
          },
        } satisfies ChartConfig),
        bottomDescription: () => 'Weekly performance trends showing steady improvement over time.',
      }
    },

    // Section 14: Template Example - Area Chart
    {
      key: 'templateExampleAreaChart',
      order: 14,
      label: 'Example: Area Chart',
      componentKey: 'SummaryChartSection',
      layout: {
        container: 'constrained',
        className: 'max-w-4xl mx-auto pb-2'
      },
      props: {
        title: () => 'Test Volume Over Time',
        chartType: () => 'area' as const,
        data: () => [
          { x: 'Jan', volume: 245 },
          { x: 'Feb', volume: 312 },
          { x: 'Mar', volume: 389 },
          { x: 'Apr', volume: 421 },
          { x: 'May', volume: 398 },
          { x: 'Jun', volume: 467 },
        ],
        chartConfig: () => ({
          volume: {
            label: 'Test Volume',
            color: 'var(--chart-3)',
          },
        } satisfies ChartConfig),
        topDescription: () => 'Monthly test execution volume demonstrating evaluation activity.',
        bottomDescription: () => 'Test volume increased significantly in Q2, reflecting expanded coverage.',
      }
    },

    // Section 15: Template Example - Pie Chart
    {
      key: 'templateExamplePieChart',
      order: 15,
      label: 'Example: Pie Chart',
      componentKey: 'SummaryChartSection',
      layout: {
        container: 'constrained',
        className: 'max-w-4xl mx-auto pb-2'
      },
      props: {
        title: () => 'Result Distribution',
        chartType: () => 'pie' as const,
        data: () => [
          { name: 'Passed', value: 847 },
          { name: 'Failed', value: 156 },
          { name: 'Uncertain', value: 244 },
        ],
        chartConfig: () => ({
          Passed: { label: 'Passed', color: 'var(--chart-1)' },
          Failed: { label: 'Failed', color: 'var(--chart-3)' },
          Uncertain: { label: 'Uncertain', color: 'var(--chart-4)' },
        } satisfies ChartConfig),
        bottomDescription: () => 'Overall test result distribution showing strong pass rate of 68%.',
      }
    },

    // Section 16: Template Example - Radial Chart
    {
      key: 'templateExampleRadialChart',
      order: 16,
      label: 'Example: Radial Chart',
      componentKey: 'SummaryChartSection',
      layout: {
        container: 'constrained',
        className: 'max-w-4xl mx-auto pb-2'
      },
      props: {
        title: () => 'Category Coverage Metrics',
        chartType: () => 'radial' as const,
        data: () => [
          { name: 'Security', value: 92 },
          { name: 'Privacy', value: 87 },
          { name: 'Compliance', value: 94 },
          { name: 'Performance', value: 78 },
        ],
        chartConfig: () => ({
          Security: { label: 'Security', color: 'var(--chart-1)' },
          Privacy: { label: 'Privacy', color: 'var(--chart-2)' },
          Compliance: { label: 'Compliance', color: 'var(--chart-3)' },
          Performance: { label: 'Performance', color: 'var(--chart-4)' },
        } satisfies ChartConfig),
        bottomDescription: () => 'Coverage metrics across evaluation categories.',
      }
    },

    // Section 17: Template Example - Radar Chart
    {
      key: 'templateExampleRadarChart',
      order: 17,
      label: 'Example: Radar Chart',
      componentKey: 'SummaryChartSection',
      layout: {
        container: 'constrained',
        className: 'max-w-4xl mx-auto pb-2'
      },
      props: {
        title: () => 'Multi-Dimensional Performance Analysis',
        chartType: () => 'radar' as const,
        data: () => [
          { metric: 'Accuracy', system: 88, baseline: 75 },
          { metric: 'Speed', system: 92, baseline: 80 },
          { metric: 'Reliability', system: 85, baseline: 78 },
          { metric: 'Coverage', system: 91, baseline: 82 },
          { metric: 'Robustness', system: 87, baseline: 76 },
        ],
        chartConfig: () => ({
          system: {
            label: 'System Performance',
            color: 'var(--chart-1)',
          },
          baseline: {
            label: 'Industry Baseline',
            color: 'var(--chart-2)',
          },
        } satisfies ChartConfig),
        topDescription: () => 'Comparison of system performance against industry baselines.',
        bottomDescription: () => 'System exceeds baseline across all dimensions, with strongest performance in speed and coverage.',
      }
    },

  ]
}
