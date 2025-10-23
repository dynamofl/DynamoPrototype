// Edge Function: create-evaluation
// Purpose: Initialize a new evaluation and queue it for execution

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, handleCors } from '../_shared/cors.ts';
import { generatePromptsFromPolicies } from '../_shared/prompt-generator.ts';
import type { CreateEvaluationRequest, CreateEvaluationResponse } from '../_shared/types.ts';

serve(async (req: Request) => {
  // Handle CORS
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // Parse request body
    const { name, aiSystemId, evaluationType, policyIds, guardrailIds, config, internalModels }: CreateEvaluationRequest = await req.json();

    // Validate input
    if (!name || !aiSystemId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: name, aiSystemId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate that at least one policy is selected (required for test generation)
    if (!policyIds || policyIds.length === 0) {
      return new Response(
        JSON.stringify({ error: 'At least one policy must be selected to generate test prompts' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Combine policyIds and guardrailIds for database fetch
    // policyIds: Used for prompt generation (MANDATORY)
    // guardrailIds: Used for response evaluation (OPTIONAL)
    const allGuardrailIds = [...new Set([...(guardrailIds || []), ...(policyIds || [])])];

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user ID from JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authorization token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch guardrails from database (both policies and guardrails)
    let guardrails: any[] = [];
    if (allGuardrailIds.length > 0) {
      const { data: fetchedGuardrails, error: guardrailsError } = await supabase
        .from('guardrails')
        .select('*')
        .in('id', allGuardrailIds);

      if (guardrailsError) {
        throw new Error(`Failed to fetch guardrails: ${guardrailsError.message}`);
      }

      if (!fetchedGuardrails || fetchedGuardrails.length === 0) {
        return new Response(
          JSON.stringify({ error: `No policies/guardrails found with IDs: ${allGuardrailIds.join(', ')}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      guardrails = fetchedGuardrails;
    }

    // Log internal models if configured
    if (internalModels) {
      console.log('📋 Using Internal Models Configuration:');
      if (internalModels.topicGeneration) {
        console.log(`   Topic Generation: ${internalModels.topicGeneration.provider}/${internalModels.topicGeneration.modelId}`);
      }
      if (internalModels.promptGeneration) {
        console.log(`   Prompt Generation: ${internalModels.promptGeneration.provider}/${internalModels.promptGeneration.modelId}`);
      }
      if (internalModels.inputGuardrail) {
        console.log(`   Input Guardrail: ${internalModels.inputGuardrail.provider}/${internalModels.inputGuardrail.modelId}`);
      }
      if (internalModels.outputGuardrail) {
        console.log(`   Output Guardrail: ${internalModels.outputGuardrail.provider}/${internalModels.outputGuardrail.modelId}`);
      }
      if (internalModels.judgeModel) {
        console.log(`   Judge Model: ${internalModels.judgeModel.provider}/${internalModels.judgeModel.modelId}`);
      }
    }

    // PHASE 1: Create evaluation record IMMEDIATELY with total_prompts: 0
    // This allows the frontend to navigate to the evaluation page right away
    // Set started_at NOW to track total runtime including prompt generation
    const { data: evaluation, error: evalError } = await supabase
      .from('evaluations')
      .insert({
        name,
        ai_system_id: aiSystemId,
        evaluation_type: evaluationType,
        status: 'pending',
        started_at: new Date().toISOString(), // Start runtime timer NOW
        config: {
          ...config,
          testType: config?.testType || evaluationType || 'jailbreak', // Ensure testType is in config
          policyIds,
          guardrailIds,
          internalModels // Store internal models in config for run-evaluation to use
        },
        total_prompts: 0, // Will be updated after prompt generation
        completed_prompts: 0,
        created_by: user.id
      })
      .select()
      .single();

    if (evalError) {
      throw new Error(`Failed to create evaluation: ${evalError.message}`);
    }

    console.log(`✅ Evaluation ${evaluation.id} created at ${evaluation.started_at}, starting background prompt generation`);

    // PHASE 2: Generate prompts in BACKGROUND (fire-and-forget)
    // This runs asynchronously without blocking the response
    (async () => {
      try {
        console.log(`🔄 [BACKGROUND] Starting prompt generation for evaluation ${evaluation.id}...`);
        console.log(`📋 [BACKGROUND] Internal models config:`, internalModels ? Object.keys(internalModels) : 'None');

        // Validate internal models are configured
        if (!internalModels || Object.keys(internalModels).length === 0) {
          console.warn('⚠️  [BACKGROUND] No internal models configured - will try environment fallback');
        }

        // Validate API keys are present if models are configured
        if (internalModels) {
          const missingKeys: string[] = [];
          if (internalModels.topicGeneration && !internalModels.topicGeneration.apiKey && !Deno.env.get('OPENAI_API_KEY')) {
            missingKeys.push('topicGeneration');
          }
          if (internalModels.promptGeneration && !internalModels.promptGeneration.apiKey && !Deno.env.get('OPENAI_API_KEY')) {
            missingKeys.push('promptGeneration');
          }

          if (missingKeys.length > 0) {
            const errorMsg = `Missing API keys for internal models: ${missingKeys.join(', ')}. Please configure them in Settings → Internal Models Usage.`;
            console.error(`❌ [BACKGROUND] ${errorMsg}`);
            throw new Error(errorMsg);
          }
        }

        console.log(`🔄 [BACKGROUND] Generating prompts from ${policyIds.length} policies...`);

        // Update evaluation status to show preparation starting
        await supabase
          .from('evaluations')
          .update({
            current_stage: 'Preparing to generate test prompts...'
          })
          .eq('id', evaluation.id);

        // Generate prompts based on POLICIES ONLY (not guardrails)
        // Pass evaluationId, supabase, and evaluation config for real-time progress updates
        const prompts = await generatePromptsFromPolicies(
          policyIds,
          guardrails,
          internalModels,
          evaluation.id,
          supabase,
          evaluation.config // Pass evaluation config for test type and evaluation type
        );

        if (prompts.length === 0) {
          console.error('❌ [BACKGROUND] No prompts generated from selected policies');
          // Update evaluation status to failed
          await supabase
            .from('evaluations')
            .update({
              status: 'failed',
              current_stage: 'Failed: No prompts generated'
            })
            .eq('id', evaluation.id);

          await supabase.from('evaluation_logs').insert({
            evaluation_id: evaluation.id,
            level: 'error',
            message: 'No prompts generated from selected policies',
            metadata: { policyIds }
          });
          return;
        }

        console.log(`✅ [BACKGROUND] Generated ${prompts.length} prompts for evaluation ${evaluation.id}`);

        // Determine which table to insert into based on test type
        const testType = evaluation.config?.testType || 'jailbreak';
        const tableName = testType === 'compliance' ? 'compliance_prompts' : 'jailbreak_prompts';

        console.log(`📊 [BACKGROUND] Inserting prompts into ${tableName} table...`);

        // Create prompt records
        const promptRecords = prompts.map((prompt) => ({
          evaluation_id: evaluation.id,
          ...prompt
        }));

        const { error: promptsError } = await supabase
          .from(tableName)
          .insert(promptRecords);

        if (promptsError) {
          console.error(`❌ [BACKGROUND] Failed to insert prompts into ${tableName}:`, promptsError);
          // Update evaluation status to failed (don't delete - user already navigated)
          await supabase
            .from('evaluations')
            .update({
              status: 'failed',
              current_stage: 'Failed: Could not save prompts'
            })
            .eq('id', evaluation.id);

          await supabase.from('evaluation_logs').insert({
            evaluation_id: evaluation.id,
            level: 'error',
            message: `Failed to create prompts: ${promptsError.message}`,
            metadata: { error: promptsError }
          });
          return;
        }

        // Update total_prompts - this will trigger real-time subscription on frontend
        await supabase
          .from('evaluations')
          .update({
            total_prompts: prompts.length,
            current_stage: 'Prompts generated, starting execution...'
          })
          .eq('id', evaluation.id);

        console.log(`✅ [BACKGROUND] Updated evaluation ${evaluation.id} with ${prompts.length} prompts`);

        // Log evaluation creation
        await supabase.from('evaluation_logs').insert({
          evaluation_id: evaluation.id,
          level: 'info',
          message: `Evaluation created with ${prompts.length} prompts`,
          metadata: { policyIds, guardrailIds, promptCount: prompts.length }
        });

        // Trigger async execution (invoke run-evaluation function)
        console.log(`🚀 [BACKGROUND] Triggering run-evaluation for ${evaluation.id}...`);
        const triggerResponse = await fetch(`${supabaseUrl}/functions/v1/run-evaluation`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`
          },
          body: JSON.stringify({ evaluationId: evaluation.id })
        });

        if (!triggerResponse.ok) {
          const errorText = await triggerResponse.text();
          console.error(`❌ [BACKGROUND] Failed to trigger run-evaluation:`, errorText);
          await supabase.from('evaluation_logs').insert({
            evaluation_id: evaluation.id,
            level: 'error',
            message: `Failed to trigger run-evaluation: ${errorText}`,
            metadata: { statusCode: triggerResponse.status }
          });
        } else {
          console.log(`✅ [BACKGROUND] Successfully triggered run-evaluation`);
        }

      } catch (error) {
        console.error('❌ [BACKGROUND] Prompt generation failed with error:', error);
        console.error('❌ [BACKGROUND] Error stack:', error instanceof Error ? error.stack : 'No stack trace');

        // CRITICAL: Always update status to failed so evaluation doesn't get stuck
        try {
          await supabase
            .from('evaluations')
            .update({
              status: 'failed',
              current_stage: `Failed: ${error instanceof Error ? error.message : 'Unknown error'}`
            })
            .eq('id', evaluation.id);

          await supabase.from('evaluation_logs').insert({
            evaluation_id: evaluation.id,
            level: 'error',
            message: `Background prompt generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            metadata: {
              error: error instanceof Error ? { message: error.message, stack: error.stack } : { error: String(error) }
            }
          });
        } catch (updateError) {
          console.error('❌❌ [BACKGROUND] CRITICAL: Could not update evaluation status to failed:', updateError);
        }
      }
    })();

    // Return response IMMEDIATELY with evaluation ID
    // Frontend can navigate right away, background processing continues
    const response: CreateEvaluationResponse = {
      evaluationId: evaluation.id,
      status: 'pending',
      totalPrompts: 0 // Will be updated via real-time subscription
    };

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in create-evaluation:', error);

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
