// Hook to fetch and aggregate evaluation summary data

import { useState, useEffect } from 'react';
import type { EvaluationTest } from '@/features/evaluation/types/evaluation-test';
import type { EvaluationSummaryData } from '../types/evaluation-summary';
import { aggregateEvaluationMetrics } from '../lib/evaluation-aggregation';

interface UseEvaluationSummaryDataResult {
  data: EvaluationSummaryData | null;
  loading: boolean;
  error: string | null;
}

export function useEvaluationSummaryData(
  evaluations: EvaluationTest[]
): UseEvaluationSummaryDataResult {
  const [data, setData] = useState<EvaluationSummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSummaryData = async () => {
      console.log('🔄 [SummaryData] Fetching summary data, evaluations:', evaluations.length);
      setLoading(true);
      setError(null);

      try {
        // Filter completed evaluations only
        const completedEvaluations = evaluations.filter(
          (evaluation) => evaluation.status === 'completed'
        );

        console.log('📊 [SummaryData] Completed evaluations:', completedEvaluations.length,
          completedEvaluations.map(e => ({ id: e.id, name: e.name, type: e.type })));

        if (completedEvaluations.length === 0) {
          setData({ hasData: false });
          setLoading(false);
          return;
        }

        // OPTIMIZED: Aggregate metrics directly from evaluation objects
        // No need to fetch from database - metrics are already in EvaluationTest objects
        const summaryData = aggregateEvaluationMetrics(completedEvaluations);

        console.log('✅ [SummaryData] Summary data computed:', summaryData);
        setData(summaryData);
        setLoading(false);
      } catch (err) {
        console.error('❌ [SummaryData] Error fetching evaluation summary data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load summary data');
        setData({ hasData: false });
        setLoading(false);
      }
    };

    fetchSummaryData();
  }, [evaluations.length, JSON.stringify(evaluations.map(e => ({ id: e.id, status: e.status })))]);

  return { data, loading, error };
}
