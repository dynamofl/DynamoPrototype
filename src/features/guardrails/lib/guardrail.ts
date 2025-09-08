export interface GuardrailPolicyCheck {
  guardrailId: string;
  guardrailName: string;
  policyDescription: string;
  status: "passed" | "blocked";
  timestamp: string;
}

// Create OpenAI client similar to evalRunner
const createOpenAIClient = (apiKey: string) => {
  return {
    responses: {
      create: async (params: any) => {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: params.model,
            messages: params.input,
            response_format: params.response_format,
            temperature: 0.1,
            max_tokens: 100
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || response.statusText}`);
        }

        const data = await response.json();
        
        // Transform the response to match the expected format
        return {
          output: [{
            content: [{
              text: data.choices[0].message.content
            }]
          }]
        };
      }
    }
  };
};

export async function customPolicyCheck({
  text,
  policyDescription,
  apiKey,
}: { 
  text: string; 
  policyDescription: string;
  apiKey: string;
}): Promise<"passed" | "blocked"> {
  const client = createOpenAIClient(apiKey);

  try {
    const res = await client.responses.create({
      model: "gpt-4o-mini",
      input: [
        {
          role: "system",
          content: "You are a compliance classifier. Return ONLY valid JSON that matches the schema.",
        },
        {
          role: "user",
          content: `Guardrail:
${policyDescription}

Task: Decide if the message violates this Guardrail.
Message: """${text}"""

Return JSON:
- status: string ("passed" or "blocked")`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "CustomModeration",
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              status: { type: "string", enum: ["passed", "blocked"] },
            },
            required: ["status"],
          },
          strict: true,
        },
      },
    });

    // Extract JSON safely
    const json = JSON.parse(res.output[0].content[0].text);
    return json.status; // returns just "passed" or "blocked"
  } catch (error) {
    console.error("Error in customPolicyCheck:", error);
    // Default to blocked if there's an error for safety
    return "blocked";
  }
}

export async function evaluatePromptAgainstGuardrails(
  prompt: string,
  guardrails: Array<{ id: string; name: string; description: string }>,
  apiKey: string
): Promise<GuardrailPolicyCheck[]> {
  const results: GuardrailPolicyCheck[] = [];

  for (const Guardrail of guardrails) {
    try {
      const status = await customPolicyCheck({
        text: prompt,
        policyDescription: Guardrail.description,
        apiKey,
      });

      results.push({
        guardrailId: Guardrail.id,
        guardrailName: Guardrail.name,
        policyDescription: Guardrail.description,
        status,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error(`Error evaluating Guardrail ${Guardrail.name}:`, error);
      // Add failed result
      results.push({
        guardrailId: Guardrail.id,
        guardrailName: Guardrail.name,
        policyDescription: Guardrail.description,
        status: "blocked", // Default to blocked on error
        timestamp: new Date().toISOString(),
      });
    }
  }

  return results;
}
