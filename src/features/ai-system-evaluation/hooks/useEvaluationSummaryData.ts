// Hook to fetch and aggregate evaluation summary data

import { useState, useEffect } from 'react';
import type { EvaluationTest } from '@/features/evaluation/types/evaluation-test';
import type { EvaluationSummaryData } from '../types/evaluation-summary';
import { aggregateEvaluationMetrics } from '../lib/evaluation-aggregation';
import { EvaluationService } from '@/lib/supabase/evaluation-service';

interface UseEvaluationSummaryDataResult {
  data: EvaluationSummaryData | null;
  loading: boolean;
  error: string | null;
}

export function useEvaluationSummaryData(
  evaluations: EvaluationTest[],
  aiSystemName?: string
): UseEvaluationSummaryDataResult {
  const [data, setData] = useState<EvaluationSummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSummaryData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Filter completed evaluations only
        const completedEvaluations = evaluations.filter(
          (evaluation) => evaluation.status === 'completed'
        );

        if (completedEvaluations.length === 0) {
          setData({ hasData: false });
          setLoading(false);
          return;
        }

        // Fetch globally unique topics and attack areas across ALL evaluations
        // Separated by test type (jailbreak/compliance)
        let uniqueMetrics = {
          jailbreak: { uniqueTopics: 0, uniqueAttackAreas: 0 },
          compliance: { uniqueTopics: 0, uniqueAttackAreas: 0 }
        };
        if (aiSystemName) {
          uniqueMetrics = await EvaluationService.getUniqueTopicsAndAttackAreas(aiSystemName);
        }

        // OPTIMIZED: Aggregate metrics directly from evaluation objects
        // Pass the type-specific unique counts
        const summaryData = aggregateEvaluationMetrics(
          completedEvaluations,
          uniqueMetrics
        );

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
  }, [evaluations.length, JSON.stringify(evaluations.map(e => ({ id: e.id, status: e.status }))), aiSystemName]);

  return { data, loading, error };
}
