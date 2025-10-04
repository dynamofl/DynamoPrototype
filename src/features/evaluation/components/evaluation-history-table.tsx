import { useState, useEffect } from 'react';
import { TablePattern } from '@/components/patterns/ui-patterns/table-pattern';
import { EVALUATION_HISTORY_COLUMNS } from '../lib/evaluation-history-config';
import { EvaluationTestStorage } from '../lib/evaluation-test-storage';
import type { EvaluationTest, EvaluationTestSummary } from '../types/evaluation-test';

interface EvaluationHistoryTableProps {
  tests?: EvaluationTest[];
  onViewReport: (test: EvaluationTest) => void;
  onViewData: (test: EvaluationTest) => void;
  onShowProgress: (test: EvaluationTest) => void;
  onTestDetails: (test: EvaluationTest) => void;
}

export function EvaluationHistoryTable({
  tests: propTests,
  onViewReport,
  onViewData,
  onShowProgress,
  onTestDetails
}: EvaluationHistoryTableProps) {
  const [tests, setTests] = useState<EvaluationTest[]>([]);
  const [loading, setLoading] = useState(true);

  // Load tests from storage or use prop tests
  useEffect(() => {
    if (propTests) {
      setTests(propTests);
      setLoading(false);
    } else {
      loadTests();
    }
  }, [propTests]);

  const loadTests = () => {
    setLoading(true);
    const loadedTests = EvaluationTestStorage.loadTests();
    setTests(loadedTests);
    setLoading(false);
  };

  // Convert EvaluationTest to EvaluationTestSummary for table display
  const testSummaries: EvaluationTestSummary[] = tests.map(test => ({
    id: test.id,
    name: test.name,
    status: test.status,
    candidateModel: test.config.candidateModel,
    judgeModel: test.config.judgeModel,
    totalPrompts: test.input.prompts.length,
    completedPrompts: test.progress?.current,
    accuracyScore: test.result?.overallMetrics?.averageAccuracy,
    createdAt: test.createdAt,
    completedAt: test.completedAt
  }));

  const handleCellAction = (action: string, row: any, rowIndex: number) => {
    const test = tests[rowIndex];
    if (!test) return;

    // For button cells, the action is based on the status
    if (test.status === 'completed') {
      onViewReport(test);
    } else if (test.status === 'in_progress') {
      onShowProgress(test);
    } else {
      onTestDetails(test);
    }
  };

  return (
    <div className="w-full">
      <TablePattern
        key={tests.length} // Force re-render when tests change
        mode="view"
        columns={EVALUATION_HISTORY_COLUMNS}
        storageConfig={{
          type: 'static',
          data: testSummaries
        }}
        loading={loading}
        emptyMessage="No evaluation tests found. Run your first evaluation to get started."
        showHeader={true}
        stickyHeader={false}
        tableWidth="full"
        onCellAction={handleCellAction}
      />
    </div>
  );
}
