// Evaluation Service - handles all evaluation-related API calls

import { supabase, getAuthToken, ensureAuthenticated } from './client';
import type { EvaluationCreationData } from '@/features/ai-system-evaluation/types/evaluation-creation';
import { ModelAssignmentStorage } from '@/features/settings/lib/model-assignment-storage';
import { EvaluationModelStorage } from '@/features/settings/lib/evaluation-model-storage';
import { getEvaluationStrategy } from '@/features/ai-system-evaluation/strategies/strategy-factory';
import type { BaseEvaluationOutput } from '@/features/ai-system-evaluation/types/base-evaluation';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';

// Checkpoint-based progress tracking types
export interface CheckpointStatus {
  status: 'pending' | 'in_progress' | 'completed';
  started_at?: string;
  completed_at?: string;
  data?: Record<string, any>;
}

export interface PolicyProgress {
  id: string;
  name: string;
  current: number;
  total: number;
  status: 'pending' | 'in_progress' | 'completed';
}

export interface CheckpointState {
  current_checkpoint: 'topics' | 'prompts' | 'evaluation' | 'summary' | null;
  checkpoints: {
    topics: CheckpointStatus;
    prompts: CheckpointStatus;
    evaluation: CheckpointStatus;
    summary: CheckpointStatus;
  };
  policies: PolicyProgress[];
}

export interface EvaluationProgress {
  total: number;
  completed: number;
  percentage: number;
  currentStage?: string;
  currentPrompt?: string;
  status: string;
  // New checkpoint-based fields
  currentCheckpoint?: string | null;
  checkpoints?: CheckpointState['checkpoints'];
  policies?: PolicyProgress[];
}

/**
 * Calculate overall progress percentage across all checkpoints
 * Weights: Topics (5%), Prompts (5%), Evaluation (85%), Summary (5%)
 */
export function calculateCheckpointPercentage(checkpointState: CheckpointState | null | undefined): number {
  if (!checkpointState?.checkpoints) {
    return 0;
  }

  const { checkpoints } = checkpointState;
  let totalProgress = 0;

  // Topics checkpoint: 5% weight
  if (checkpoints.topics?.status === 'completed') {
    totalProgress += 5;
  } else if (checkpoints.topics?.status === 'in_progress') {
    totalProgress += 2.5; // Half of 5%
  }

  // Prompts checkpoint: 5% weight
  if (checkpoints.prompts?.status === 'completed') {
    totalProgress += 5;
  } else if (checkpoints.prompts?.status === 'in_progress') {
    totalProgress += 2.5; // Half of 5%
  }

  // Evaluation checkpoint: 85% weight (main phase)
  if (checkpoints.evaluation?.status === 'completed') {
    totalProgress += 85;
  } else if (checkpoints.evaluation?.status === 'in_progress') {
    const evalData = checkpoints.evaluation.data;
    const evalPercentage = evalData?.total_prompts && evalData.total_prompts > 0
      ? (evalData.completed_prompts || 0) / evalData.total_prompts
      : 0;
    totalProgress += 85 * evalPercentage;
  }

  // Summary checkpoint: 5% weight
  if (checkpoints.summary?.status === 'completed') {
    totalProgress += 5;
  } else if (checkpoints.summary?.status === 'in_progress') {
    totalProgress += 2.5; // Half of 5%
  }

  return Math.round(totalProgress);
}

export interface EvaluationSummary {
  id: string;
  name: string;
  status: string;
  evaluationType?: string;
  aiSystemId: string;
  totalPrompts: number;
  completedPrompts: number;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  summaryMetrics?: any;
  // Metrics JSONB column - structure varies by evaluation type
  metrics?: Record<string, any>;
  guardrailsCount?: number;
  // Checkpoint state for progress tracking
  checkpointState?: CheckpointState;
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
          testType: data.type || 'jailbreak', // Add testType to config for backend prompt generation
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
      evaluationType: evaluation.evaluation_type,
      aiSystemId: evaluation.ai_system_id,
      totalPrompts: evaluation.total_prompts,
      completedPrompts: evaluation.completed_prompts,
      createdAt: evaluation.created_at,
      startedAt: evaluation.started_at,
      completedAt: evaluation.completed_at,
      summaryMetrics: evaluation.summary_metrics,
      // Metrics JSONB column
      metrics: evaluation.metrics || {},
      guardrailsCount: evaluation.guardrails_count,
      // Checkpoint state for progress tracking
      checkpointState: evaluation.checkpoint_state
    }));
  }

  /**
   * Get evaluation results with multi-test-type support
   * Uses strategy pattern to handle different test types (jailbreak, compliance, etc.)
   */
  static async getEvaluationResults(evaluationId: string): Promise<BaseEvaluationOutput> {
    await ensureAuthenticated();

    // Get evaluation config to determine test type
    const { data: evaluation, error: evalError } = await supabase
      .from('evaluations')
      .select('*')
      .eq('id', evaluationId)
      .single();

    if (evalError || !evaluation) {
      throw new Error('Evaluation not found');
    }

    // Determine test type from config (default to jailbreak for backward compatibility)
    const testType = evaluation.config?.testType || evaluation.config?.test_type || 'jailbreak';

    // Route to correct table based on test type
    let tableName: string;
    switch (testType) {
      case 'compliance':
        tableName = 'compliance_prompts';
        break;
      case 'hallucination':
        tableName = 'hallucination_prompts';
        break;
      default:
        tableName = 'jailbreak_prompts';
    }

    // Fetch prompts from the appropriate table
    const { data: prompts, error: promptsError } = await supabase
      .from(tableName)
      .select('*')
      .eq('evaluation_id', evaluationId)
      .order('prompt_index');

    if (promptsError) {
      console.error(`Failed to fetch prompts from ${tableName}:`, promptsError);
      throw new Error(`Failed to fetch prompts: ${promptsError.message}`);
    }

    // Fetch full policies from guardrails
    let policies: any[] = [];
    const policyIds = evaluation.config?.policyIds || evaluation.config?.policy_ids || [];

    if (policyIds && policyIds.length > 0) {
      const { data: guardrails, error: guardrailsError } = await supabase
        .from('guardrails')
        .select('id, name, type, category, policies, created_at, updated_at')
        .in('id', policyIds);

      if (!guardrailsError && guardrails) {
        // Extract policies from guardrails (each guardrail has a policies array)
        // The policies JSONB field stores allowedBehavior and disallowedBehavior as newline-separated strings
        policies = guardrails.map(guardrail => {
          const policyData = Array.isArray(guardrail.policies) && guardrail.policies.length > 0
            ? guardrail.policies[0]
            : {};

          // Parse behaviors from newline-separated strings to arrays
          const parseBehaviors = (text: string): string[] => {
            if (!text || !text.trim()) return [];
            return text
              .split('\n')
              .map(line => line.trim())
              .filter(line => line.length > 0 && line.startsWith('•'))
              .map(line => line.replace(/^•\s*/, '')); // Remove bullet point
          };

          return {
            id: guardrail.id,
            name: guardrail.name,
            description: policyData.description || '',
            allowed: parseBehaviors(policyData.allowedBehavior || ''),
            disallowed: parseBehaviors(policyData.disallowedBehavior || ''),
            type: guardrail.type || '',
            category: guardrail.category || '',
            createdAt: guardrail.created_at?.split('T')[0] || '',
            updatedAt: guardrail.updated_at?.split('T')[0] || ''
          };
        });
      }
    }

    // Get strategy for this test type
    const strategy = getEvaluationStrategy(testType);

    // Transform prompts using strategy
    const results = strategy.transformPrompts(prompts || []);

    // Calculate or retrieve summary
    // For hallucination: Use pre-calculated metrics from database if available
    // For jailbreak/compliance: Always calculate to ensure correct structure and field names
    let summary;
    if (testType === 'hallucination' && evaluation.metrics && Object.keys(evaluation.metrics).length > 0) {
      // Use pre-calculated metrics from database (hallucination only)
      summary = {
        total_tests: results.length,
        by_policy: {},
        by_behavior_type: {},
        ...evaluation.metrics
      };
    } else {
      // Calculate summary from results using strategy
      summary = strategy.calculateSummary(results);
    }

    // Merge database-stored analytics into summary
    // For jailbreak evaluations, include risk_combinations and risk_predictions if present
    const enrichedSummary = {
      ...summary,
      ...(testType === 'jailbreak' && evaluation.risk_combinations && {
        riskCombinations: evaluation.risk_combinations
      }),
      ...(testType === 'jailbreak' && evaluation.risk_predictions && {
        riskPredictions: evaluation.risk_predictions
      })
    };

    // Return standardized BaseEvaluationOutput
    return {
      evaluation_id: evaluationId,
      test_type: testType,
      timestamp: evaluation.created_at,
      results,
      summary: enrichedSummary,
      config: {
        ...evaluation.config,
        test_type: testType,
        policy_ids: evaluation.config?.policyIds || evaluation.config?.policy_ids,
        guardrail_ids: evaluation.config?.guardrailIds || evaluation.config?.guardrail_ids,
        policies // Add the full policies array
      },
      topic_analysis: evaluation.topic_analysis
    };
  }

  /**
   * Legacy method for backward compatibility
   * @deprecated Use getEvaluationResults() which returns BaseEvaluationOutput
   */
  static async getEvaluationResultsLegacy(evaluationId: string): Promise<{
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

    // Determine table based on test type
    const testType = evaluation.config?.testType || evaluation.config?.test_type || 'jailbreak';
    let tableName: string;
    switch (testType) {
      case 'compliance':
        tableName = 'compliance_prompts';
        break;
      case 'hallucination':
        tableName = 'hallucination_prompts';
        break;
      default:
        tableName = 'jailbreak_prompts';
    }

    // Get all prompts
    const { data: prompts, error: promptsError } = await supabase
      .from(tableName)
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
          const checkpointState = evaluation.checkpoint_state || {};

          // Use checkpoint data as primary source, fallback to legacy fields
          const total = checkpointState.checkpoints?.evaluation?.data?.total_prompts
            || evaluation.total_prompts
            || 0;
          const completed = checkpointState.checkpoints?.evaluation?.data?.completed_prompts
            || evaluation.completed_prompts
            || 0;

          // Calculate percentage using checkpoint-aware function if checkpoint state exists
          // This includes all phases: Topics (5%), Prompts (5%), Evaluation (85%), Summary (5%)
          const percentage = checkpointState.checkpoints
            ? calculateCheckpointPercentage(checkpointState)
            : (total > 0 ? Math.round((completed / total) * 100) : 0);

          const progressData: EvaluationProgress = {
            total,
            completed,
            percentage,
            currentStage: evaluation.current_stage,
            currentPrompt: evaluation.current_prompt_text,
            status: evaluation.status,
            // Checkpoint-based fields
            currentCheckpoint: checkpointState.current_checkpoint,
            checkpoints: checkpointState.checkpoints,
            policies: checkpointState.policies || []
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
   * Resume a stopped/cancelled evaluation from its last checkpoint
   */
  static async resumeEvaluation(evaluationId: string): Promise<{
    success: boolean;
    message: string;
    resumePoint?: string;
  }> {
    await ensureAuthenticated();
    const token = await getAuthToken();

    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${SUPABASE_URL}/functions/v1/resume-evaluation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ evaluationId })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to resume evaluation');
    }

    return await response.json();
  }

  /**
   * Restart evaluation from a specific checkpoint
   * This will clear all data from that checkpoint onwards and restart from there
   */
  static async restartFromCheckpoint(
    evaluationId: string,
    checkpointId: 'topics' | 'prompts' | 'evaluation' | 'summary'
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    await ensureAuthenticated();
    const token = await getAuthToken();

    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${SUPABASE_URL}/functions/v1/restart-from-checkpoint`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ evaluationId, checkpointId })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to restart from checkpoint');
    }

    return await response.json();
  }

  /**
   * Get unique topics and attack areas across all evaluations for an AI system
   * Separated by test type (jailbreak/compliance/hallucination)
   */
  static async getUniqueTopicsAndAttackAreas(aiSystemName: string): Promise<{
    jailbreak: {
      uniqueTopics: number;
      uniqueAttackAreas: number;
    };
    compliance: {
      uniqueTopics: number;
      uniqueAttackAreas: number;
    };
    hallucination: {
      uniqueTopics: number;
      uniqueCategories: number;
    };
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
      return {
        jailbreak: { uniqueTopics: 0, uniqueAttackAreas: 0 },
        compliance: { uniqueTopics: 0, uniqueAttackAreas: 0 },
        hallucination: { uniqueTopics: 0, uniqueCategories: 0 }
      };
    }

    // Get all evaluation IDs for this AI system, separated by type
    const { data: evaluations, error: evaluationsError } = await supabase
      .from('evaluations')
      .select('id, evaluation_type')
      .eq('ai_system_id', aiSystem.id);

    if (evaluationsError || !evaluations || evaluations.length === 0) {
      console.error('Failed to fetch evaluations or no evaluations found:', evaluationsError);
      return {
        jailbreak: { uniqueTopics: 0, uniqueAttackAreas: 0 },
        compliance: { uniqueTopics: 0, uniqueAttackAreas: 0 },
        hallucination: { uniqueTopics: 0, uniqueCategories: 0 }
      };
    }

    // Separate evaluation IDs by type
    const jailbreakEvaluationIds = evaluations
      .filter(e => (e.evaluation_type || 'jailbreak') === 'jailbreak')
      .map(e => e.id);
    const complianceEvaluationIds = evaluations
      .filter(e => e.evaluation_type === 'compliance')
      .map(e => e.id);
    const hallucinationEvaluationIds = evaluations
      .filter(e => e.evaluation_type === 'hallucination')
      .map(e => e.id);

    // Query jailbreak prompts for unique topics and attack areas
    let jailbreakMetrics = { uniqueTopics: 0, uniqueAttackAreas: 0 };
    if (jailbreakEvaluationIds.length > 0) {
      const { data: jailbreakTopicsData } = await supabase
        .from('jailbreak_prompts')
        .select('topic')
        .in('evaluation_id', jailbreakEvaluationIds)
        .not('topic', 'is', null);

      const { data: jailbreakAttackTypesData } = await supabase
        .from('jailbreak_prompts')
        .select('attack_type')
        .in('evaluation_id', jailbreakEvaluationIds)
        .not('attack_type', 'is', null);

      jailbreakMetrics = {
        uniqueTopics: jailbreakTopicsData
          ? new Set(jailbreakTopicsData.map((row) => row.topic)).size
          : 0,
        uniqueAttackAreas: jailbreakAttackTypesData
          ? new Set(jailbreakAttackTypesData.map((row) => row.attack_type)).size
          : 0
      };
    }

    // Query compliance prompts for unique topics
    let complianceMetrics = { uniqueTopics: 0, uniqueAttackAreas: 0 };
    if (complianceEvaluationIds.length > 0) {
      const { data: complianceTopicsData } = await supabase
        .from('compliance_prompts')
        .select('topic')
        .in('evaluation_id', complianceEvaluationIds)
        .not('topic', 'is', null);

      complianceMetrics = {
        uniqueTopics: complianceTopicsData
          ? new Set(complianceTopicsData.map((row) => row.topic)).size
          : 0,
        uniqueAttackAreas: 0 // Compliance doesn't have attack areas
      };
    }

    // Query hallucination prompts for unique topics and categories
    let hallucinationMetrics = { uniqueTopics: 0, uniqueCategories: 0 };
    if (hallucinationEvaluationIds.length > 0) {
      const { data: hallucinationTopicsData } = await supabase
        .from('hallucination_prompts')
        .select('topic')
        .in('evaluation_id', hallucinationEvaluationIds)
        .not('topic', 'is', null);

      const { data: hallucinationCategoriesData } = await supabase
        .from('hallucination_prompts')
        .select('violated_category')
        .in('evaluation_id', hallucinationEvaluationIds)
        .not('violated_category', 'is', null);

      hallucinationMetrics = {
        uniqueTopics: hallucinationTopicsData
          ? new Set(hallucinationTopicsData.map((row) => row.topic)).size
          : 0,
        uniqueCategories: hallucinationCategoriesData
          ? new Set(hallucinationCategoriesData.map((row) => row.violated_category)).size
          : 0
      };
    }

    return {
      jailbreak: jailbreakMetrics,
      compliance: complianceMetrics,
      hallucination: hallucinationMetrics
    };
  }
}
