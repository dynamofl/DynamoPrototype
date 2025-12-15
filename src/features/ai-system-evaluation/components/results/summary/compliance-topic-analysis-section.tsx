import { AlertTriangle } from "lucide-react";
import {
  GenericTopicAnalysisSection,
  type TopicBreakdownColumn,
  type StatisticalSummaryColumn
} from "./generic-topic-analysis-section";

interface ComplianceTopicAnalysisSectionProps {
  topicAnalysis: any;
}

export function ComplianceTopicAnalysisSection({ topicAnalysis }: ComplianceTopicAnalysisSectionProps) {
  // Configure columns for compliance topic breakdown
  const breakdownColumns: TopicBreakdownColumn[] = [
    {
      key: 'topic',
      header: 'Topic Area',
      align: 'left',
      render: (topic) => topic.topic_name
    },
    {
      key: 'accuracy',
      header: 'Accuracy',
      width: 'w-[120px]',
      align: 'right',
      render: (topic) => {
        const accuracy = topic.accuracy?.mean ?? 0;
        const isLowAccuracy = accuracy < 75;
        return (
          <>
            {isLowAccuracy && (
              <AlertTriangle className="inline-block mr-1 w-3 h-3 mb-0.5 text-red-600" strokeWidth={2} />
            )}
            <span className={isLowAccuracy ? 'text-red-600' : 'text-gray-600'}>
              {Math.round(accuracy)}%
            </span>
          </>
        );
      }
    },
    {
      key: 'precision',
      header: 'Precision',
      width: 'w-[120px]',
      align: 'right',
      render: (topic) => {
        const precision = topic.precision?.mean ?? 0;
        return `${Math.round(precision)}%`;
      }
    },
    {
      key: 'recall',
      header: 'Recall',
      width: 'w-[120px]',
      align: 'right',
      render: (topic) => {
        const recall = topic.recall?.mean ?? 0;
        return `${Math.round(recall)}%`;
      }
    },
    {
      key: 'f1',
      header: 'F1 Score',
      width: 'w-[120px]',
      align: 'right',
      render: (topic) => {
        const f1 = topic.f1_score?.mean ?? 0;
        return `${Math.round(f1)}%`;
      }
    },
    {
      key: 'runtime',
      header: 'Response Time (sec)',
      width: 'w-[140px]',
      align: 'right',
      render: (topic) => topic.runtime_seconds?.mean.toFixed(1) ?? '0.0'
    },
    {
      key: 'occurrence',
      header: 'Count',
      width: 'w-[80px]',
      align: 'right',
      render: (topic) => topic.occurrence
    }
  ];

  // Configure columns for statistical summary (show stats for accuracy)
  const statisticalColumns: StatisticalSummaryColumn[] = [
    {
      key: 'topic',
      header: 'Topic Area',
      align: 'left',
      render: (topic) => topic.topic_name
    },
    {
      key: 'std_dev',
      header: 'Std Dev (Accuracy)',
      width: 'w-[150px]',
      align: 'right',
      render: (topic) => (topic.accuracy?.std_dev ?? 0).toFixed(2)
    },
    {
      key: 'variance',
      header: 'Variance (Accuracy)',
      width: 'w-[150px]',
      align: 'right',
      render: (topic) => (topic.accuracy?.variance ?? 0).toFixed(2)
    },
    {
      key: 'iqr',
      header: 'IQR (Accuracy)',
      width: 'w-[130px]',
      align: 'right',
      render: (topic) => (topic.accuracy?.iqr ?? 0).toFixed(2)
    },
    {
      key: 'range',
      header: 'Range (Accuracy)',
      width: 'w-[150px]',
      align: 'right',
      render: (topic) => {
        const rangeMin = topic.accuracy?.range?.min ?? 0;
        const rangeMax = topic.accuracy?.range?.max ?? 0;
        return `${rangeMin.toFixed(2)} - ${rangeMax.toFixed(2)}`;
      }
    }
  ];

  return (
    <GenericTopicAnalysisSection
      topicAnalysis={topicAnalysis}
      evaluationType="compliance"
      breakdownColumns={breakdownColumns}
      statisticalColumns={statisticalColumns}
      comparisonMetricName="Accuracy"
      comparisonMetricKey="accuracy"
      showRiskAnalysis={true}
      title={(policies) =>
        policies.length > 1
          ? 'Topic Areas of Interest'
          : `Topic Area of Interest: ${policies[0].policy_name}`
      }
    />
  );
}
