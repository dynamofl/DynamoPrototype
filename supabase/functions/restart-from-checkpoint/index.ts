// Restart from Checkpoint Edge Function
// Purpose: Clear data from selected checkpoint onwards and restart evaluation

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, handleCors } from '../_shared/cors.ts';

interface RestartFromCheckpointRequest {
  evaluationId: string;
  checkpointId: 'topics' | 'prompts' | 'evaluation' | 'summary';
}

/**
 * Trigger create-evaluation to restart from beginning
 */
async function triggerCreateEvaluation(supabase: any, evaluationId: string) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  const response = await fetch(`${supabaseUrl}/functions/v1/create-evaluation`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${serviceRoleKey}`,
    },
    body: JSON.stringify({ evaluationId }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to trigger create-evaluation: ${error}`);
  }

  return await response.json();
}

/**
 * Trigger run-evaluation to continue evaluation
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
    const { evaluationId, checkpointId }: RestartFromCheckpointRequest = await req.json();

    if (!evaluationId || !checkpointId) {
      return new Response(
        JSON.stringify({ error: 'evaluationId and checkpointId are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📥 Restart from checkpoint request: ${evaluationId} @ ${checkpointId}`);

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Get evaluation
    const { data: evaluation, error: evalError } = await supabase
      .from('evaluations')
      .select('id, status, config, checkpoint_state')
      .eq('id', evaluationId)
      .single();

    if (evalError || !evaluation) {
      return new Response(
        JSON.stringify({ error: 'Evaluation not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if evaluation is currently running
    if (evaluation.status === 'running') {
      return new Response(
        JSON.stringify({ error: 'Cannot restart while evaluation is running. Please stop it first.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Determine which table to use based on test type
    const testType = evaluation.config?.testType || 'jailbreak';
    const promptTable = testType === 'compliance' ? 'compliance_prompts' : 'jailbreak_prompts';

    // Clear data based on checkpoint selection
    switch (checkpointId) {
      case 'topics': {
        console.log('🔄 Restarting from Topics - clearing all data');

        // Delete all prompts
        const { error: deletePromptsError } = await supabase
          .from(promptTable)
          .delete()
          .eq('evaluation_id', evaluationId);

        if (deletePromptsError) {
          throw new Error(`Failed to delete prompts: ${deletePromptsError.message}`);
        }

        // Reset evaluation to initial state
        await supabase
          .from('evaluations')
          .update({
            status: 'pending',
            current_stage: 'Starting evaluation...',
            completed_prompts: 0,
            total_prompts: 0,
            topic_analysis: null,
            checkpoint_state: {
              current_checkpoint: null,
              checkpoints: {
                topics: { status: 'pending' },
                prompts: { status: 'pending' },
                evaluation: { status: 'pending' },
                summary: { status: 'pending' }
              },
              policies: []
            }
          })
          .eq('id', evaluationId);

        // Trigger create-evaluation to restart from beginning
        triggerCreateEvaluation(supabase, evaluationId).catch(error => {
          console.error(`❌ Error triggering create-evaluation:`, error);
        });

        return new Response(
          JSON.stringify({
            success: true,
            message: 'Restarting from Topics checkpoint',
            evaluationId,
            checkpointId
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'prompts': {
        console.log('🔄 Restarting from Prompts - keeping topics, clearing prompts onwards');

        // Delete all prompts
        const { error: deletePromptsError } = await supabase
          .from(promptTable)
          .delete()
          .eq('evaluation_id', evaluationId);

        if (deletePromptsError) {
          throw new Error(`Failed to delete prompts: ${deletePromptsError.message}`);
        }

        // Update checkpoint state - keep topics data but reset other checkpoints
        const checkpointState = evaluation.checkpoint_state || {};
        const topicsCheckpoint = checkpointState.checkpoints?.topics || { status: 'completed' };

        await supabase
          .from('evaluations')
          .update({
            status: 'pending',
            current_stage: 'Generating prompts...',
            completed_prompts: 0,
            total_prompts: 0,
            topic_analysis: null, // Clear summary
            checkpoint_state: {
              current_checkpoint: 'prompts',
              checkpoints: {
                topics: topicsCheckpoint, // Keep topics
                prompts: { status: 'pending' },
                evaluation: { status: 'pending' },
                summary: { status: 'pending' }
              },
              policies: []
            }
          })
          .eq('id', evaluationId);

        // Trigger create-evaluation to regenerate prompts
        triggerCreateEvaluation(supabase, evaluationId).catch(error => {
          console.error(`❌ Error triggering create-evaluation:`, error);
        });

        return new Response(
          JSON.stringify({
            success: true,
            message: 'Restarting from Prompts checkpoint',
            evaluationId,
            checkpointId
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'evaluation': {
        console.log('🔄 Restarting from Evaluation - keeping topics and prompts, clearing evaluation results');

        // Get current checkpoint state to preserve topics and prompts data
        const checkpointState = evaluation.checkpoint_state || {};
        const topicsCheckpoint = checkpointState.checkpoints?.topics || { status: 'completed' };
        const promptsCheckpoint = checkpointState.checkpoints?.prompts || { status: 'completed' };
        const totalPrompts = checkpointState.checkpoints?.prompts?.data?.prompt_count || 0;

        // Reset all prompts to pending (clear evaluation results)
        const { error: resetPromptsError } = await supabase
          .from(promptTable)
          .update({
            status: 'pending',
            output: null,
            input_guard_rails_triggered: null,
            output_guard_rails_triggered: null,
            judge_evaluation: null,
            outcome: null
          })
          .eq('evaluation_id', evaluationId);

        if (resetPromptsError) {
          throw new Error(`Failed to reset prompts: ${resetPromptsError.message}`);
        }

        // Update checkpoint state - keep topics and prompts, reset evaluation and summary
        await supabase
          .from('evaluations')
          .update({
            status: 'pending',
            current_stage: 'Starting evaluation...',
            completed_prompts: 0,
            total_prompts: totalPrompts,
            topic_analysis: null, // Clear summary
            checkpoint_state: {
              current_checkpoint: 'evaluation',
              checkpoints: {
                topics: topicsCheckpoint, // Keep topics
                prompts: promptsCheckpoint, // Keep prompts
                evaluation: {
                  status: 'pending',
                  data: {
                    completed_prompts: 0,
                    total_prompts: totalPrompts
                  }
                },
                summary: { status: 'pending' }
              },
              policies: checkpointState.policies?.map((p: any) => ({
                ...p,
                current: 0,
                status: 'pending'
              })) || []
            }
          })
          .eq('id', evaluationId);

        // Trigger run-evaluation to start evaluation
        triggerRunEvaluation(supabase, evaluationId).catch(error => {
          console.error(`❌ Error triggering run-evaluation:`, error);
        });

        return new Response(
          JSON.stringify({
            success: true,
            message: 'Restarting from Evaluation checkpoint',
            evaluationId,
            checkpointId
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'summary': {
        console.log('🔄 Restarting from Summary - keeping all evaluation data, regenerating summary');

        // Get current checkpoint state to preserve all data except summary
        const checkpointState = evaluation.checkpoint_state || {};
        const topicsCheckpoint = checkpointState.checkpoints?.topics || { status: 'completed' };
        const promptsCheckpoint = checkpointState.checkpoints?.prompts || { status: 'completed' };
        const evaluationCheckpoint = checkpointState.checkpoints?.evaluation || { status: 'completed' };

        // Update checkpoint state - keep everything except summary
        await supabase
          .from('evaluations')
          .update({
            status: 'pending',
            current_stage: 'Generating summary...',
            topic_analysis: null, // Clear existing summary
            checkpoint_state: {
              ...checkpointState,
              current_checkpoint: 'summary',
              checkpoints: {
                topics: topicsCheckpoint,
                prompts: promptsCheckpoint,
                evaluation: evaluationCheckpoint,
                summary: { status: 'pending' }
              }
            }
          })
          .eq('id', evaluationId);

        // Trigger run-evaluation to regenerate summary
        triggerRunEvaluation(supabase, evaluationId).catch(error => {
          console.error(`❌ Error triggering run-evaluation:`, error);
        });

        return new Response(
          JSON.stringify({
            success: true,
            message: 'Restarting from Summary checkpoint',
            evaluationId,
            checkpointId
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid checkpoint ID' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

  } catch (error) {
    console.error('❌ Error in restart-from-checkpoint:', error);

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
