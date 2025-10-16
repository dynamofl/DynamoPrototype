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

    // Generate prompts based on POLICIES ONLY (not guardrails)
    // policyIds: Used to generate test prompts
    // guardrails: Full list of fetched guardrail records (filtered inside generator)
    // internalModels: Model configurations for topic and prompt generation
    const prompts = await generatePromptsFromPolicies(policyIds, guardrails, internalModels);

    if (prompts.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No prompts generated from selected policies' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create evaluation record with internal models in config
    const { data: evaluation, error: evalError } = await supabase
      .from('evaluations')
      .insert({
        name,
        ai_system_id: aiSystemId,
        evaluation_type: evaluationType,
        status: 'pending',
        config: {
          ...config,
          policyIds,
          guardrailIds,
          internalModels // Store internal models in config for run-evaluation to use
        },
        total_prompts: prompts.length,
        completed_prompts: 0,
        created_by: user.id
      })
      .select()
      .single();

    if (evalError) {
      throw new Error(`Failed to create evaluation: ${evalError.message}`);
    }

    // Create prompt records
    const promptRecords = prompts.map((prompt) => ({
      evaluation_id: evaluation.id,
      ...prompt
    }));

    const { error: promptsError } = await supabase
      .from('evaluation_prompts')
      .insert(promptRecords);

    if (promptsError) {
      // Rollback evaluation if prompts failed
      await supabase.from('evaluations').delete().eq('id', evaluation.id);
      throw new Error(`Failed to create prompts: ${promptsError.message}`);
    }

    // Log evaluation creation
    await supabase.from('evaluation_logs').insert({
      evaluation_id: evaluation.id,
      level: 'info',
      message: `Evaluation created with ${prompts.length} prompts`,
      metadata: { policyIds, guardrailIds, promptCount: prompts.length }
    });

    // Trigger async execution (invoke run-evaluation function)
    // Note: This is fire-and-forget, we don't wait for the response
    fetch(`${supabaseUrl}/functions/v1/run-evaluation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`
      },
      body: JSON.stringify({ evaluationId: evaluation.id })
    }).catch((error) => {
      console.error('Failed to trigger run-evaluation:', error);
    });

    // Return response
    const response: CreateEvaluationResponse = {
      evaluationId: evaluation.id,
      status: 'pending',
      totalPrompts: prompts.length
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
