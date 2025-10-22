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
  startedAt?: string;
  completedAt?: string;
  summaryMetrics?: any;
  // NEW: Individual summary metric columns
  aiSystemAttackSuccessRate?: number;
  aiSystemGuardrailAttackSuccessRate?: number;
  guardrailSuccessRate?: number | null;
  uniqueTopics?: number;
  uniqueAttackAreas?: number;
  guardrailsCount?: number;
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

    // Validate that at least one policy is selected (required for test generation)
    if (!data.policyIds || data.policyIds.length === 0) {
      throw new Error('At least one policy must be selected to generate test prompts');
    }

    // Get all assigned models and their configurations
    const assignments = ModelAssignmentStorage.load();
    const models = EvaluationModelStorage.load();

    // Build internal models configuration
    const internalModels: any = {};

    // Topic Generation Model
    if (assignments.topicGeneration) {
      const topicModel = models.find(m => m.id === assignments.topicGeneration);
      if (topicModel) {
        internalModels.topicGeneration = {
          provider: topicModel.provider,
          modelId: topicModel.modelId,
          apiKey: topicModel.apiKey
        };
        console.log(`📝 Topic Generation Model: ${topicModel.name} (${topicModel.provider}/${topicModel.modelId})`);
      }
    }

    // Prompt Generation Model
    if (assignments.promptGeneration) {
      const promptModel = models.find(m => m.id === assignments.promptGeneration);
      if (promptModel) {
        internalModels.promptGeneration = {
          provider: promptModel.provider,
          modelId: promptModel.modelId,
          apiKey: promptModel.apiKey
        };
        console.log(`📝 Prompt Generation Model: ${promptModel.name} (${promptModel.provider}/${promptModel.modelId})`);
      }
    }

    // Input Guardrail Model
    if (assignments.inputGuardrail) {
      const inputGuardrailModel = models.find(m => m.id === assignments.inputGuardrail);
      if (inputGuardrailModel) {
        internalModels.inputGuardrail = {
          provider: inputGuardrailModel.provider,
          modelId: inputGuardrailModel.modelId,
          apiKey: inputGuardrailModel.apiKey
        };
        console.log(`🛡️ Input Guardrail Model: ${inputGuardrailModel.name} (${inputGuardrailModel.provider}/${inputGuardrailModel.modelId})`);
      }
    }

    // Output Guardrail Model
    if (assignments.outputGuardrail) {
      const outputGuardrailModel = models.find(m => m.id === assignments.outputGuardrail);
      if (outputGuardrailModel) {
        internalModels.outputGuardrail = {
          provider: outputGuardrailModel.provider,
          modelId: outputGuardrailModel.modelId,
          apiKey: outputGuardrailModel.apiKey
        };
        console.log(`��️ Output Guardrail Model: ${outputGuardrailModel.name} (${outputGuardrailModel.provider}/${outputGuardrailModel.modelId})`);
      }
    }

    // Judge Model
    if (assignments.judgeModel) {
      const judgeModel = models.find(m => m.id === assignments.judgeModel);
      if (judgeModel) {
        internalModels.judgeModel = {
          provider: judgeModel.provider,
          modelId: judgeModel.modelId,
          apiKey: judgeModel.apiKey
        };
        console.log(`⚖️ Judge Model: ${judgeModel.name} (${judgeModel.provider}/${judgeModel.modelId})`);
      }
    }

    // Topic Insight Model
    if (assignments.topicInsightModel) {
      const topicInsightModel = models.find(m => m.id === assignments.topicInsightModel);
      if (topicInsightModel) {
        internalModels.topicInsightModel = {
          provider: topicInsightModel.provider,
          modelId: topicInsightModel.modelId,
          apiKey: topicInsightModel.apiKey
        };
        console.log(`💡 Topic Insight Model: ${topicInsightModel.name} (${topicInsightModel.provider}/${topicInsightModel.modelId})`);
      }
    }

    // Test Execution Model (for backward compatibility)
    let testExecutionApiKey: string | undefined;
    let testExecutionModelName: string | undefined;

    if (assignments.testExecution) {
      const model = models.find(m => m.id === assignments.testExecution);

      if (model) {
        testExecutionApiKey = model.apiKey;
        testExecutionModelName = model.name;
        console.log(`📝 Test Execution Model: ${model.name} (${model.provider}/${model.modelId})`);
      } else {
        console.warn('⚠️  Test execution model not found. API key will not be included.');
      }
    } else {
      console.warn('⚠️  No test execution model assigned. Please configure it in Settings > Internal Models Usage.');
    }

    if (!internalModels.topicGeneration && !internalModels.promptGeneration) {
      console.warn('⚠️  No topic/prompt generation models configured. Will use environment fallback.');
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
        },
        internalModels: Object.keys(internalModels).length > 0 ? internalModels : undefined
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
      startedAt: evaluation.started_at,
      completedAt: evaluation.completed_at,
      summaryMetrics: evaluation.summary_metrics,
      // NEW: Map individual summary metric columns
      aiSystemAttackSuccessRate: evaluation.ai_system_attack_success_rate,
      aiSystemGuardrailAttackSuccessRate: evaluation.ai_system_guardrail_attack_success_rate,
      guardrailSuccessRate: evaluation.guardrail_success_rate,
      uniqueTopics: evaluation.unique_topics,
      uniqueAttackAreas: evaluation.unique_attack_areas,
      guardrailsCount: evaluation.guardrails_count
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

  /**
   * Get unique topics and attack areas across all evaluations for an AI system
   */
  static async getUniqueTopicsAndAttackAreas(aiSystemName: string): Promise<{
    uniqueTopics: number;
    uniqueAttackAreas: number;
  }> {
    await ensureAuthenticated();

    // Get the AI system to find its ID
    const { data: aiSystem, error: aiSystemError } = await supabase
      .from('ai_systems')
      .select('id')
      .eq('name', aiSystemName)
      .single();

    if (aiSystemError || !aiSystem) {
      console.error('Failed to find AI system:', aiSystemError);
      return { uniqueTopics: 0, uniqueAttackAreas: 0 };
    }

    // Get all evaluation IDs for this AI system
    const { data: evaluations, error: evaluationsError } = await supabase
      .from('evaluations')
      .select('id')
      .eq('ai_system_id', aiSystem.id);

    if (evaluationsError || !evaluations || evaluations.length === 0) {
      console.error('Failed to fetch evaluations or no evaluations found:', evaluationsError);
      return { uniqueTopics: 0, uniqueAttackAreas: 0 };
    }

    const evaluationIds = evaluations.map(e => e.id);

    // Query to get unique topics across all evaluations for this AI system
    const { data: topicsData, error: topicsError } = await supabase
      .from('evaluation_prompts')
      .select('topic')
      .in('evaluation_id', evaluationIds)
      .not('topic', 'is', null);

    if (topicsError) {
      console.error('Failed to fetch topics:', topicsError);
    }

    // Query to get unique attack types across all evaluations for this AI system
    const { data: attackTypesData, error: attackTypesError } = await supabase
      .from('evaluation_prompts')
      .select('attack_type')
      .in('evaluation_id', evaluationIds)
      .not('attack_type', 'is', null);

    if (attackTypesError) {
      console.error('Failed to fetch attack types:', attackTypesError);
    }

    // Count unique values
    const uniqueTopics = topicsData
      ? new Set(topicsData.map((row) => row.topic)).size
      : 0;

    const uniqueAttackAreas = attackTypesData
      ? new Set(attackTypesData.map((row) => row.attack_type)).size
      : 0;

    console.log('📊 [getUniqueTopicsAndAttackAreas] Results:', {
      aiSystemName,
      evaluationCount: evaluations.length,
      totalTopicRows: topicsData?.length || 0,
      uniqueTopics,
      totalAttackRows: attackTypesData?.length || 0,
      uniqueAttackAreas
    });

    return { uniqueTopics, uniqueAttackAreas };
  }
}
