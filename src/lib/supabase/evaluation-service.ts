// Evaluation Service - handles all evaluation-related API calls

import { supabase, getAuthToken, ensureAuthenticated } from './client';
import type { EvaluationCreationData } from '@/features/ai-system-evaluation/types/evaluation-creation';
import { ModelAssignmentStorage } from '@/features/settings/lib/model-assignment-storage';
import { EvaluationModelStorage } from '@/features/settings/lib/evaluation-model-storage';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';

export interface EvaluationProgress {
  total: number;
  completed: number;
  percentage: number;
  currentStage?: string;
  currentPrompt?: string;
  status: string;
}

export interface EvaluationSummary {
  id: string;
  name: string;
  status: string;
  aiSystemId: string;
  totalPrompts: number;
  completedPrompts: number;
  createdAt: string;
  completedAt?: string;
  summaryMetrics?: any;
}

export class EvaluationService {
  /**
   * Create a new evaluation
   */
  static async createEvaluation(
    data: EvaluationCreationData,
    aiSystemId: string
  ): Promise<{ evaluationId: string; status: string; totalPrompts: number }> {
    await ensureAuthenticated();
    const token = await getAuthToken();

    if (!token) {
      throw new Error('Authentication required');
    }

    // Get test execution model and its API key
    const assignments = ModelAssignmentStorage.load();
    let testExecutionApiKey: string | undefined;
    let testExecutionModelName: string | undefined;

    if (assignments.testExecution) {
      const model = EvaluationModelStorage.load().find(
        m => m.id === assignments.testExecution
      );

      if (model) {
        testExecutionApiKey = model.apiKey;
        testExecutionModelName = model.name;
        console.log(`📝 Using test execution model: ${model.name} (${model.provider}/${model.modelId})`);
      } else {
        console.warn('⚠️  Test execution model not found. API key will not be included.');
      }
    } else {
      console.warn('⚠️  No test execution model assigned. Please configure it in Settings > Internal Models Usage.');
    }

    const response = await fetch(`${SUPABASE_URL}/functions/v1/create-evaluation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: data.name,
        aiSystemId,
        evaluationType: data.type || 'jailbreak',
        policyIds: data.policyIds || [],
        guardrailIds: data.guardrailIds || [],
        config: {
          temperature: 0.7,
          maxTokens: 1000,
          testExecutionApiKey,
          testExecutionModelName
        }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create evaluation');
    }

    return await response.json();
  }

  /**
   * Get evaluation status
   */
  static async getEvaluationStatus(evaluationId: string): Promise<{
    id: string;
    name: string;
    status: string;
    progress: EvaluationProgress;
    results?: any;
  }> {
    await ensureAuthenticated();
    const token = await getAuthToken();

    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/get-evaluation-status?id=${evaluationId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get evaluation status');
    }

    return await response.json();
  }

  /**
   * Get all evaluations for an AI system
   */
  static async getEvaluationsForAISystem(aiSystemName: string): Promise<EvaluationSummary[]> {
    await ensureAuthenticated();

    // Get AI system ID first
    const { data: aiSystem } = await supabase
      .from('ai_systems')
      .select('id')
      .eq('name', aiSystemName)
      .single();

    if (!aiSystem) {
      return [];
    }

    const { data: evaluations, error } = await supabase
      .from('evaluations')
      .select('*')
      .eq('ai_system_id', aiSystem.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching evaluations:', error);
      return [];
    }

    return (evaluations || []).map(evaluation => ({
      id: evaluation.id,
      name: evaluation.name,
      status: evaluation.status,
      aiSystemId: evaluation.ai_system_id,
      totalPrompts: evaluation.total_prompts,
      completedPrompts: evaluation.completed_prompts,
      createdAt: evaluation.created_at,
      completedAt: evaluation.completed_at,
      summaryMetrics: evaluation.summary_metrics
    }));
  }

  /**
   * Get evaluation results
   */
  static async getEvaluationResults(evaluationId: string): Promise<{
    evaluation: any;
    prompts: any[];
  }> {
    await ensureAuthenticated();

    // Get evaluation
    const { data: evaluation, error: evalError } = await supabase
      .from('evaluations')
      .select('*')
      .eq('id', evaluationId)
      .single();

    if (evalError || !evaluation) {
      throw new Error('Evaluation not found');
    }

    // Get all prompts
    const { data: prompts, error: promptsError } = await supabase
      .from('evaluation_prompts')
      .select('*')
      .eq('evaluation_id', evaluationId)
      .order('prompt_index');

    if (promptsError) {
      throw new Error('Failed to fetch prompts');
    }

    return {
      evaluation,
      prompts: prompts || []
    };
  }

  /**
   * Subscribe to evaluation progress updates
   */
  static subscribeToEvaluation(
    evaluationId: string,
    onProgress: (progress: EvaluationProgress) => void
  ): () => void {
    const channel = supabase
      .channel(`evaluation:${evaluationId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'evaluations',
          filter: `id=eq.${evaluationId}`
        },
        (payload) => {
          const evaluation = payload.new;
          const progressData = {
            total: evaluation.total_prompts || 0,
            completed: evaluation.completed_prompts || 0,
            percentage: evaluation.total_prompts > 0
              ? (evaluation.completed_prompts / evaluation.total_prompts) * 100
              : 0,
            currentStage: evaluation.current_stage,
            currentPrompt: evaluation.current_prompt_text,
            status: evaluation.status
          };

          onProgress(progressData);
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }

  /**
   * Delete an evaluation
   */
  static async deleteEvaluation(evaluationId: string): Promise<void> {
    await ensureAuthenticated();

    const { error } = await supabase
      .from('evaluations')
      .delete()
      .eq('id', evaluationId);

    if (error) {
      throw new Error(`Failed to delete evaluation: ${error.message}`);
    }
  }

  /**
   * Cancel a running evaluation
   */
  static async cancelEvaluation(evaluationId: string): Promise<void> {
    await ensureAuthenticated();

    const { error } = await supabase
      .from('evaluations')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('id', evaluationId);

    if (error) {
      throw new Error(`Failed to cancel evaluation: ${error.message}`);
    }
  }
}
