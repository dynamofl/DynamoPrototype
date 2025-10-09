import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
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
  onDelete?: (test: EvaluationTest) => void;
}

const EvaluationHistoryTableComponent: React.FC<EvaluationHistoryTableProps> = ({
  tests: propTests,
  onViewReport,
  onViewData,
  onShowProgress,
  onTestDetails,
  onDelete
}) => {
  const [tests, setTests] = useState<EvaluationTest[]>([]);
  const [loading, setLoading] = useState(true);
  const renderCount = useRef(0);

  // Track renders
  renderCount.current += 1;
  console.log('🔄 EvaluationHistoryTable render #', renderCount.current, {
    testsLength: tests.length,
    propTestsLength: propTests?.length,
    testIds: tests.map(t => t.id)
  });

  // Load tests from storage or use prop tests
  useEffect(() => {
    if (propTests) {
      // Only update if reference actually changed or content differs
      setTests(prev => {
        // Quick reference check
        if (prev === propTests) {
          console.log('✅ Same reference, no update');
          return prev;
        }

        // Check if content is same to avoid unnecessary updates
        if (prev.length === propTests.length) {
          const hasChanges = propTests.some((test, idx) => {
            const prevTest = prev[idx];
            return !prevTest ||
              prevTest.id !== test.id ||
              prevTest.status !== test.status ||
              prevTest.progress?.current !== test.progress?.current ||
              prevTest.progress?.total !== test.progress?.total;
          });

          if (!hasChanges) {
            console.log('✅ Same content, no update needed');
            return prev;
          }

          console.log('🔄 Content changed, updating tests');
        }

        return propTests;
      });
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
  // Memoize to prevent recreation on every render
  const testSummaries: EvaluationTestSummary[] = useMemo(() => {
    console.log('📊 Recalculating testSummaries');
    return tests.map(test => ({
      id: test.id,
      name: test.name,
      status: test.status,
      candidateModel: test.config?.candidateModel || 'Unknown',
      judgeModel: test.config?.judgeModel || 'Unknown',
      totalPrompts: test.input?.prompts?.length || test.progress?.total || 0,
      completedPrompts: test.progress?.current,
      accuracyScore: test.result?.overallMetrics?.averageAccuracy,
      createdAt: test.createdAt,
      completedAt: test.completedAt
    }));
  }, [tests]);

  const handleCellAction = useCallback((action: string, row: any, rowIndex: number) => {
    const test = tests[rowIndex];
    console.log('🖱️ Cell action clicked:', {
      action,
      rowIndex,
      testId: test?.id,
      testName: test?.name,
      testStatus: test?.status,
      timestamp: new Date().toISOString()
    });

    if (!test) {
      console.warn('⚠️ Test not found at rowIndex:', rowIndex);
      return;
    }

    // Handle delete action
    if (action === 'delete') {
      console.log('🗑️ Delete button clicked for test:', test.id);
      if (onDelete) {
        onDelete(test);
      }
      return;
    }

    // Handle view/progress/details actions
    if (action === 'view' || test.status === 'completed') {
      console.log('📊 Navigating to view report for completed test:', test.id);
      onViewReport(test);
    } else if (action === 'progress' || test.status === 'running') {
      console.log('⏳ Navigating to show progress for running test:', test.id);
      onShowProgress(test);
    } else if (action === 'details') {
      console.log('📝 Navigating to test details:', test.id, 'status:', test.status);
      onTestDetails(test);
    }
  }, [tests, onViewReport, onViewData, onShowProgress, onTestDetails, onDelete]);

  // Memoize storage config to prevent recreation
  const storageConfig = useMemo(() => ({
    type: 'static' as const,
    data: testSummaries
  }), [testSummaries]);

  return (
    <div className="w-full">
      <TablePattern
        mode="view"
        columns={EVALUATION_HISTORY_COLUMNS}
        storageConfig={storageConfig}
        loading={loading}
        emptyMessage="No evaluation tests found. Run your first evaluation to get started."
        showHeader={true}
        stickyHeader={false}
        tableWidth="full"
        onCellAction={handleCellAction}
      />
    </div>
  );
};

// Wrap with memo and custom comparison to prevent unnecessary re-renders
export const EvaluationHistoryTable = React.memo(EvaluationHistoryTableComponent, (prevProps, nextProps) => {
  // Only re-render if tests array reference changed AND content actually differs
  if (prevProps.tests === nextProps.tests) {
    console.log('🚫 Memo: Same tests reference, preventing re-render');
    return true; // true = props are equal, don't re-render
  }

  // Check if callback functions changed (they shouldn't if memoized properly)
  if (
    prevProps.onViewReport !== nextProps.onViewReport ||
    prevProps.onViewData !== nextProps.onViewData ||
    prevProps.onShowProgress !== nextProps.onShowProgress ||
    prevProps.onTestDetails !== nextProps.onTestDetails ||
    prevProps.onDelete !== nextProps.onDelete
  ) {
    console.log('🔄 Memo: Callback functions changed, allowing re-render');
    return false; // false = props changed, re-render
  }

  // Deep check tests array content
  if (!prevProps.tests || !nextProps.tests) {
    console.log('🔄 Memo: Tests array null/undefined changed');
    return false;
  }

  if (prevProps.tests.length !== nextProps.tests.length) {
    console.log('🔄 Memo: Tests array length changed');
    return false;
  }

  // Check if any test content changed
  const hasChanges = nextProps.tests.some((test, idx) => {
    const prevTest = prevProps.tests![idx];
    return !prevTest ||
      prevTest.id !== test.id ||
      prevTest.status !== test.status ||
      prevTest.progress?.current !== test.progress?.current ||
      prevTest.progress?.total !== test.progress?.total;
  });

  if (hasChanges) {
    console.log('🔄 Memo: Test content changed, allowing re-render');
    return false;
  }

  console.log('🚫 Memo: Same content, preventing re-render');
  return true; // true = props are equal, don't re-render
});
