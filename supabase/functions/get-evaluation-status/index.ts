// Edge Function: get-evaluation-status
// Purpose: Get current status and progress of an evaluation

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, handleCors } from '../_shared/cors.ts';
import type { EvaluationStatusResponse } from '../_shared/types.ts';

serve(async (req: Request) => {
  // Handle CORS
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // Get evaluation ID from query params
    const url = new URL(req.url);
    const evaluationId = url.searchParams.get('id');

    if (!evaluationId) {
      return new Response(
        JSON.stringify({ error: 'Missing evaluation ID' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      {
        global: {
          headers: { Authorization: `Bearer ${token}` }
        }
      }
    );

    // Fetch evaluation
    const { data: evaluation, error: evalError } = await supabase
      .from('evaluations')
      .select('*')
      .eq('id', evaluationId)
      .single();

    if (evalError || !evaluation) {
      return new Response(
        JSON.stringify({ error: 'Evaluation not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build response
    const response: EvaluationStatusResponse = {
      id: evaluation.id,
      name: evaluation.name,
      status: evaluation.status,
      progress: {
        total: evaluation.total_prompts || 0,
        completed: evaluation.completed_prompts || 0,
        percentage: evaluation.total_prompts > 0
          ? (evaluation.completed_prompts / evaluation.total_prompts) * 100
          : 0,
        currentStage: evaluation.current_stage,
        currentPrompt: evaluation.current_prompt_text
      }
    };

    // Include results if completed
    if (evaluation.status === 'completed' && evaluation.summary_metrics) {
      response.results = evaluation.summary_metrics;
    }

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in get-evaluation-status:', error);

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
