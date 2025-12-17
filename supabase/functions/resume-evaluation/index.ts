// Resume Evaluation Edge Function
// Purpose: Resume a stopped or failed evaluation from its last checkpoint

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, handleCors } from '../_shared/cors.ts';
import { CheckpointManager } from '../_shared/checkpoint-manager.ts';

interface ResumeEvaluationRequest {
  evaluationId: string;
}

interface CheckpointState {
  current_checkpoint: 'topics' | 'prompts' | 'evaluation' | 'summary' | null;
  checkpoints: {
    topics: { status: string };
    prompts: { status: string };
    evaluation: { status: string };
    summary: { status: string };
  };
  policies: Array<{
    id: string;
    name: string;
    current: number;
    total: number;
    status: string;
  }>;
}

/**
 * Determine where to resume evaluation based on checkpoint state
 */
function getResumePoint(checkpointState: CheckpointState): 'prompts' | 'evaluation' | 'summary' | 'completed' {
  if (!checkpointState?.checkpoints) {
    // No checkpoint state - start from beginning (prompts)
    return 'prompts';
  }

  const { checkpoints } = checkpointState;

  // Check each checkpoint in reverse order to find where we should resume
  if (checkpoints.summary?.status === 'in_progress') {
    return 'summary';
  }

  if (checkpoints.evaluation?.status === 'in_progress' || checkpoints.evaluation?.status === 'completed') {
    // If evaluation was in progress or completed but summary not done, resume from summary
    if (checkpoints.summary?.status === 'pending') {
      return 'summary';
    }
    // Otherwise resume evaluation to process any pending prompts
    return 'evaluation';
  }

  if (checkpoints.prompts?.status === 'in_progress' || checkpoints.prompts?.status === 'completed') {
    // If prompts were generated, resume from evaluation
    return 'evaluation';
  }

  if (checkpoints.topics?.status === 'in_progress' || checkpoints.topics?.status === 'completed') {
    // If topics were generated, resume from prompt generation
    return 'prompts';
  }

  // Default to prompts if unclear
  return 'prompts';
}

/**
 * Call run-evaluation function to process pending prompts
 */
async function triggerRunEvaluation(supabase: any, evaluationId: string) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  const response = await fetch(`${supabaseUrl}/functions/v1/run-evaluation`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${serviceRoleKey}`,
    },
    body: JSON.stringify({ evaluationId }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to trigger run-evaluation: ${error}`);
  }

  return await response.json();
}

serve(async (req: Request) => {
  // Handle CORS
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // Parse request body
    const { evaluationId }: ResumeEvaluationRequest = await req.json();

    if (!evaluationId) {
      return new Response(
        JSON.stringify({ error: 'evaluationId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📥 Resume evaluation request for: ${evaluationId}`);

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Get evaluation and its checkpoint state
    const { data: evaluation, error: evalError } = await supabase
      .from('evaluations')
      .select('id, status, checkpoint_state, config, total_prompts')
      .eq('id', evaluationId)
      .single();

    if (evalError || !evaluation) {
      return new Response(
        JSON.stringify({ error: 'Evaluation not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if evaluation is already running
    if (evaluation.status === 'running') {
      return new Response(
        JSON.stringify({ error: 'Evaluation is already running', evaluationId }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if evaluation is already completed
    if (evaluation.status === 'completed') {
      return new Response(
        JSON.stringify({
          message: 'Evaluation already completed',
          evaluationId,
          status: 'completed'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Determine resume point from checkpoint state
    const checkpointState = evaluation.checkpoint_state as CheckpointState;
    const resumePoint = getResumePoint(checkpointState);

    console.log(`🔄 Resuming evaluation from checkpoint: ${resumePoint}`);

    // Update evaluation status to running
    await supabase
      .from('evaluations')
      .update({
        status: 'running',
        current_stage: `Resuming from ${resumePoint}...`
      })
      .eq('id', evaluationId);

    // Resume based on checkpoint
    switch (resumePoint) {
      case 'prompts':
        // Need to regenerate prompts - this would require re-running create-evaluation logic
        // For now, we'll return an error as this is an edge case
        return new Response(
          JSON.stringify({
            error: 'Cannot resume from prompts phase. Please create a new evaluation.',
            resumePoint
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      case 'evaluation':
        // Resume evaluation - process pending prompts
        console.log(`▶️ Triggering run-evaluation for pending prompts...`);

        // Determine which table to use based on test type
        const testType = evaluation.config?.testType || 'jailbreak';
        const promptTable = testType === 'compliance' ? 'compliance_prompts' : 'jailbreak_prompts';

        // Reset stuck prompts (status='running') back to 'pending'
        // These are prompts that were being evaluated when the evaluation was stopped
        // Do NOT touch 'completed' prompts - we want to keep partial results
        console.log(`🔄 Resetting stuck prompts in ${promptTable}...`);
        const { data: resetData, error: resetError } = await supabase
          .from(promptTable)
          .update({
            status: 'pending',
            output: null,
            input_guard_rails_triggered: null,
            output_guard_rails_triggered: null,
            judge_evaluation: null,
            outcome: null
          })
          .eq('evaluation_id', evaluationId)
          .eq('status', 'running');

        if (resetError) {
          console.error(`❌ Error resetting stuck prompts:`, resetError);
        } else {
          console.log(`✅ Reset stuck prompts successfully`);
        }

        // Use CheckpointManager to mark evaluation as in_progress
        const checkpointManager = new CheckpointManager();
        const evalStatus = await checkpointManager.getCheckpointStatus(evaluationId, 'evaluation');
        if (evalStatus === 'pending') {
          await checkpointManager.markCheckpointStarted(evaluationId, 'evaluation');
        }

        // Trigger run-evaluation in the background
        triggerRunEvaluation(supabase, evaluationId).catch(error => {
          console.error(`❌ Error triggering run-evaluation:`, error);
        });

        return new Response(
          JSON.stringify({
            success: true,
            message: 'Evaluation resumed - processing pending prompts',
            evaluationId,
            resumePoint
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      case 'summary':
        // Recalculate summary - trigger run-evaluation which will finalize
        console.log(`▶️ Triggering summary generation...`);

        // Note: CheckpointManager will mark summary as 'in_progress' when finalizeEvaluation actually starts
        // We don't need to mark it here - just trigger run-evaluation

        // Trigger run-evaluation which will detect all prompts are done and finalize
        triggerRunEvaluation(supabase, evaluationId).catch(error => {
          console.error(`❌ Error triggering summary generation:`, error);
        });

        return new Response(
          JSON.stringify({
            success: true,
            message: 'Evaluation resumed - generating summary',
            evaluationId,
            resumePoint
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      case 'completed':
        return new Response(
          JSON.stringify({
            message: 'Evaluation is already completed',
            evaluationId,
            status: 'completed'
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      default:
        return new Response(
          JSON.stringify({
            error: 'Unknown resume point',
            resumePoint
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

  } catch (error) {
    console.error('❌ Error in resume-evaluation:', error);

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
