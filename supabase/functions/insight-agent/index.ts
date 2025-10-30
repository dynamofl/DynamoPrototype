// Edge Function: insight-agent
// Simplified version - queries Supabase directly and uses OpenAI for formatting

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders, handleCors } from '../_shared/cors.ts'

interface InsightRequest {
  message: string
  evaluationId?: string
}

serve(async (req: Request) => {
  // Handle CORS
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request
    const { message, evaluationId }: InsightRequest = await req.json()

    if (!message) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: message' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Processing query:', message);

    // Query evaluations from Supabase
    const { data: evaluations, error: evalError } = await supabase
      .from('evaluations')
      .select('id, name, status, summary_metrics, created_at')
      .order('created_at', { ascending: false })
      .limit(10);

    if (evalError) {
      console.error('Error fetching evaluations:', evalError);
      throw new Error(`Database error: ${evalError.message}`);
    }

    console.log(`Found ${evaluations?.length || 0} evaluations`);

    if (!evaluations || evaluations.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          output_parsed: {
            title: "No Evaluations Found",
            type: "string",
            data: JSON.stringify({
              format: "text",
              data: "No evaluations found in the database.",
              insights: null
            })
          },
          output_text: "{\"title\":\"No Evaluations Found\",\"type\":\"string\"}"
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use OpenAI to format the response
    const prompt = `Given this evaluation data and user query, generate a structured insight response.

User Query: ${message}

Evaluation Data (${evaluations.length} evaluations):
${JSON.stringify(evaluations.map(e => ({
  id: e.id,
  name: e.name,
  status: e.status,
  attack_success_rate: e.summary_metrics?.attack_success_rate,
  total_prompts: e.summary_metrics?.total_prompts,
  created_at: e.created_at
})), null, 2)}

Generate a response in ONE of these formats:

1. TEXT format (for simple summaries):
{
  "format": "text",
  "data": "Your summary text here",
  "insights": null
}

2. TABLE format (for comparisons):
{
  "format": "table",
  "data": [
    {"evaluation_name": "...", "attack_success_rate": 85, "total_prompts": 100, "status": "completed"}
  ],
  "insights": "Key findings summary"
}

3. CHART format (for visualizations):
{
  "format": "chart",
  "chart_type": "bar_chart",
  "data": {
    "x_axis": "evaluation_name",
    "y_axis": "attack_success_rate",
    "values": [{"evaluation_name": "...", "attack_success_rate": 85}]
  },
  "insights": "Key findings summary"
}

Return ONLY valid JSON without markdown formatting.`;

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a data analyst that generates structured JSON responses about evaluation data. Always return valid JSON without markdown.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' }
      })
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error('OpenAI error:', errorText);
      throw new Error(`OpenAI API error: ${openaiResponse.statusText}`);
    }

    const openaiResult = await openaiResponse.json();
    const formattedResponse = JSON.parse(openaiResult.choices[0].message.content);

    console.log('Formatted response:', formattedResponse);

    // Determine type based on format
    let type: 'string' | 'chart' | 'table' = 'string';
    if (formattedResponse.format === 'chart') type = 'chart';
    else if (formattedResponse.format === 'table') type = 'table';

    // Generate title
    const title = message.split(' ').slice(0, 6).join(' ');
    const titleCased = title.charAt(0).toUpperCase() + title.slice(1);

    return new Response(
      JSON.stringify({
        success: true,
        output_parsed: {
          title: titleCased,
          type,
          data: JSON.stringify(formattedResponse)
        },
        output_text: JSON.stringify({ title: titleCased, type, data: JSON.stringify(formattedResponse) })
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
