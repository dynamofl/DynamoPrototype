import { useState, useEffect, useRef, useCallback } from 'react';
import { EvaluationService } from '@/lib/supabase/evaluation-service';
import { supabase } from '@/lib/supabase/client';
import { throttle } from '@/lib/utils';
import type { EvaluationTest } from '@/features/evaluation/types/evaluation-test';
import type { AISystem } from '@/features/ai-systems/types/types';
import type { EvaluationSummary } from '@/lib/supabase/evaluation-service';
import type { RealtimeChannel } from '@supabase/supabase-js';

// Helper function to map Supabase evaluation format to EvaluationTest format
export function mapSupabaseToEvaluationTests(
  supabaseHistory: EvaluationSummary[],
  aiSystem: AISystem
): EvaluationTest[] {
  return supabaseHistory.map(evaluation => ({
    id: evaluation.id,
    name: evaluation.name,
    status: evaluation.status as 'pending' | 'running' | 'completed' | 'failed' | 'cancelled',
    aiSystemId: evaluation.aiSystemId,
    aiSystemName: aiSystem.name,
    createdAt: evaluation.createdAt,
    startedAt: evaluation.startedAt,
    completedAt: evaluation.completedAt,
    config: {
      candidateModel: aiSystem.selectedModel || 'Unknown',
      judgeModel: 'GPT-4o', // Default judge model
      temperature: 0.7,
      maxLength: 2000,
      topP: 1.0
    } as any,
    input: {
      prompts: [] // Prompts stored in Supabase evaluation_prompts table
    },
    result: evaluation.summaryMetrics ? {
      overallMetrics: evaluation.summaryMetrics,
      promptResults: []
    } : undefined,
    progress: {
      current: evaluation.completedPrompts,
      total: evaluation.totalPrompts,
      currentPrompt: ''
    }
  }));
}

export function useEvaluationHistory(aiSystem: AISystem | null) {
  const [evaluationHistory, setEvaluationHistory] = useState<EvaluationTest[]>([]);
  const [hasEvaluations, setHasEvaluations] = useState(false);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const aiSystemIdRef = useRef<string | null>(null);

  // Memoized function to update a single evaluation in the list
  const updateEvaluationInList = useCallback((updatedEvaluation: any) => {
    setEvaluationHistory(prev => {
      const index = prev.findIndex(e => e.id === updatedEvaluation.id);
      if (index === -1) {
        console.log('⚠️ Evaluation not in list:', updatedEvaluation.id);
        return prev; // Not in list, no update needed
      }

      const existing = prev[index];

      // Check if values actually changed to prevent unnecessary re-renders
      const statusChanged = existing.status !== updatedEvaluation.status;
      const progressCurrentChanged = existing.progress?.current !== updatedEvaluation.completed_prompts;
      const progressTotalChanged = existing.progress?.total !== updatedEvaluation.total_prompts;
      const completedAtChanged = existing.completedAt !== updatedEvaluation.completed_at;

      const hasChanges = statusChanged || progressCurrentChanged || progressTotalChanged || completedAtChanged;

      if (!hasChanges) {
        console.log('✅ No changes detected, keeping same reference', {
          existingStatus: existing.status,
          newStatus: updatedEvaluation.status,
          existingProgress: existing.progress?.current,
          newProgress: updatedEvaluation.completed_prompts,
          existingTotal: existing.progress?.total,
          newTotal: updatedEvaluation.total_prompts
        });
        return prev; // No changes, return same reference to prevent re-render
      }

      console.log('🔄 Updating evaluation in list:', {
        id: updatedEvaluation.id,
        statusChanged,
        progressCurrentChanged,
        progressTotalChanged,
        completedAtChanged
      });

      // Create updated evaluation with new values
      const updated: EvaluationTest = {
        ...existing,
        status: updatedEvaluation.status,
        startedAt: updatedEvaluation.started_at || existing.startedAt,
        completedAt: updatedEvaluation.completed_at,
        progress: {
          current: updatedEvaluation.completed_prompts || 0,
          total: updatedEvaluation.total_prompts || 0,
          currentPrompt: updatedEvaluation.current_prompt_text || ''
        },
        result: updatedEvaluation.summary_metrics ? {
          overallMetrics: updatedEvaluation.summary_metrics,
          promptResults: []
        } : existing.result
      };

      // Return new array with updated evaluation
      const newList = [...prev];
      newList[index] = updated;
      return newList;
    });
  }, []);

  // Throttled update function - max once per 500ms
  const throttledUpdate = useRef(
    throttle((evaluation: any) => {
      console.log('🔄 Real-time update received:', {
        id: evaluation.id,
        status: evaluation.status,
        completed: evaluation.completed_prompts,
        total: evaluation.total_prompts
      });
      updateEvaluationInList(evaluation);
    }, 500)
  ).current;

  // Load initial history
  useEffect(() => {
    if (!aiSystem) {
      setEvaluationHistory([]);
      setHasEvaluations(false);
      setLoading(false);
      return;
    }

    // Reset loading state when AI system changes
    setLoading(true);

    const loadHistory = async () => {
      try {
        const supabaseHistory = await EvaluationService.getEvaluationsForAISystem(aiSystem.name);
        const history = mapSupabaseToEvaluationTests(supabaseHistory, aiSystem);

        // Update both states together to prevent race condition
        setEvaluationHistory(history);
        setHasEvaluations(history.length > 0);
        setLoading(false);
      } catch (error) {
        console.error('Failed to load evaluation history:', error);
        setEvaluationHistory([]);
        setHasEvaluations(false);
        setLoading(false);
      }
    };

    loadHistory();
  }, [aiSystem?.name]);

  // Set up real-time subscription for evaluations
  useEffect(() => {
    if (!aiSystem) return;

    // Store the AI system ID for filtering
    aiSystemIdRef.current = aiSystem.id;

    console.log('📡 Setting up real-time subscription for AI system:', aiSystem.name);

    // Create a channel for this AI system's evaluations
    const channel = supabase
      .channel(`evaluations:${aiSystem.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'evaluations',
          filter: `ai_system_id=eq.${aiSystem.id}`
        },
        (payload) => {
          console.log('📨 Evaluation update event:', payload);
          // Use throttled update to prevent excessive re-renders
          throttledUpdate(payload.new);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'evaluations',
          filter: `ai_system_id=eq.${aiSystem.id}`
        },
        (payload) => {
          console.log('📨 New evaluation created:', payload);
          // Reload full history when new evaluation is created
          reloadHistory();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'evaluations',
          filter: `ai_system_id=eq.${aiSystem.id}`
        },
        (payload) => {
          console.log('📨 Evaluation deleted:', payload);
          // Remove from list
          setEvaluationHistory(prev => prev.filter(e => e.id !== payload.old.id));
          setHasEvaluations(prev => {
            const newCount = evaluationHistory.length - 1;
            return newCount > 0;
          });
        }
      )
      .subscribe((status) => {
        console.log('📡 Subscription status:', status);
      });

    channelRef.current = channel;

    // Cleanup function
    return () => {
      console.log('🔌 Unsubscribing from evaluations channel');
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [aiSystem?.id, throttledUpdate]);

  const reloadHistory = async () => {
    if (!aiSystem) return;

    const supabaseHistory = await EvaluationService.getEvaluationsForAISystem(aiSystem.name);
    const history = mapSupabaseToEvaluationTests(supabaseHistory, aiSystem);
    setEvaluationHistory(history);
    setHasEvaluations(history.length > 0);
  };

  return {
    evaluationHistory,
    hasEvaluations,
    loading,
    reloadHistory,
    setEvaluationHistory
  };
}