import { hostedMcpTool, Agent, Runner, OpenAIProvider } from "@openai/agents";
import type { AgentInputItem } from "@openai/agents";
import OpenAI from "openai";
import { z } from "zod";

// Create OpenAI client with browser flag
// WARNING: This exposes the key in browser - only use for local development!
const openaiClient = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true  // Allow browser execution for local dev
});

// Configure OpenAI Provider with pre-configured client
const openaiProvider = new OpenAIProvider({
  openAIClient: openaiClient
});

// Tool definitions
const mcp = hostedMcpTool({
  serverLabel: "supabase_server",
  allowedTools: [
    "search_docs",
    "list_tables",
    "list_extensions",
    "list_migrations",
    "apply_migration",
    "execute_sql",
    "get_logs",
    "get_project_url",
    "list_edge_functions",
    "get_edge_function",
    "deploy_edge_function"
  ],
  authorization: '{"expression":"\\"sbp_99dcfe7553c9fb457d27b5a668dc4559959a3332\\"","format":"cel"}',
  requireApproval: "never",
  serverUrl: "https://mcp.supabase.com/mcp?project_ref=uabbbzzrwgfxiamvnunr"
})
const InsightGatheringSchema = z.object({ title: z.string(), type: z.enum(["string", "chart", "table"]), data: z.string() });
const insightGathering = new Agent({
  name: "Insight Gathering",
  instructions: `{
  \"name\": \"Supabase Insight Agent\",
  \"description\": \"Search and retrieve insights exclusively from the project's Supabase database using MCP tool calls, focusing on prompt-level and evaluation data.\",
  \"instructions\": {
    \"goal\": \"Find the most relevant and exact details that match the user query by querying only the Supabase database.\",
    \"data_scope\": {
      \"primary_tables\": [\"compliance_prompts\", \"jailbreak_prompts\"],
      \"secondary_table\": \"evaluations\",
      \"rules\": [
        \"Always prioritize data from 'compliance_prompts' and 'jailbreak_prompts'.\",
        \"Use 'evaluations' table only if additional metrics or relationships (e.g., attack outcomes, success rates) are required.\",
        \"Do not access any other tables or external data sources.\"
      ]
    },
    \"decision_logic\": {
      \"text\": \"Use when the result is short, descriptive, or summarizes a single record or concept.\",
      \"table\": \"Use when comparing or listing multiple prompts, policies, or attack outcomes.\",
      \"chart\": \"Use when presenting quantitative or time-based trends (e.g., success rate, evaluation metrics).\"
    },
    \"table_rules\": {
      \"required_columns\": [\"base_prompt\", \"attack_type\", \"attack_outcome\", \"policy_name\"],
      \"notes\": \"Include all applicable policy names if there are multiple. Data must be returned as an array of objects suitable for rendering.\"
    },
    \"response_schema\": {
      \"format\": \"text | table | chart\",
      \"data\": \"string | array | object\",
      \"chart_type\": \"optional — one of ['bar_chart', 'line_chart', 'area_chart', 'pie_chart', 'radial_chart', 'radar_chart']\",
      \"insights\": \"optional string — include only for 'table' or 'chart' to summarize key findings, correlations, or risk patterns\"
    },
    \"validation_rules\": {
      \"strict_json\": true,
      \"disallowed_patterns\": [
        \"data\\":\\"chart\",
        \"data\\":\\"table\",
        \"data\\":\\"text\"
      ],
      \"requirements\": [
        \"'format' must always be one of: 'text', 'table', or 'chart'.\",
        \"'data' must always contain a structured object or array, not a placeholder string.\",
        \"If 'format' is 'chart', both 'chart_type' and 'data.values' must exist.\",
        \"If 'format' is 'table', 'data' must be a valid array of objects with required columns.\",
        \"Never output placeholders or references to data types as strings (e.g., 'chart', 'table').\"
      ],
      \"error_handling\": {
        \"on_invalid_schema\": {
          \"format\": \"text\",
          \"data\": \"Invalid or incomplete data structure generated. Please ensure the query returns structured JSON with all required fields.\",
          \"insights\": null
        }
      }
    },
    \"rules\": [
      \"Query only from 'compliance_prompts', 'jailbreak_prompts', and if needed, 'evaluations'.\",
      \"Determine format dynamically based on dataset size and type.\",
      \"For tables, ensure results are structured and readable.\",
      \"For charts, normalize numeric fields (e.g., ratios to percentages).\",
      \"For text responses, be concise and factual.\",
      \"Include 'chart_type' only when 'format' is 'chart'.\",
      \"Include 'insights' only for 'table' or 'chart' outputs.\",
      \"Return strictly valid JSON — no Markdown, extra comments, or natural language.\",
      \"Never output placeholder strings (like 'data': 'chart') — always include actual structured objects.\"
    ],
    \"fallback\": {
      \"condition\": \"No matching records found in any allowed tables.\",
      \"response\": {
        \"format\": \"text\",
        \"data\": \"No matching records found in Supabase (compliance_prompts, jailbreak_prompts, or evaluations).\",
        \"insights\": null
      }
    }
  },
  \"examples\": {
    \"invalid_case_prevention\": {
      \"description\": \"Example of what NOT to output.\",
      \"invalid_output\": {
        \"format\": \"chart\",
        \"data\": \"chart\"
      },
      \"correct_output\": {
        \"format\": \"chart\",
        \"chart_type\": \"bar_chart\",
        \"data\": {
          \"x_axis\": \"attack_type\",
          \"y_axis\": \"success_rate_percent\",
          \"values\": [
            { \"attack_type\": \"GCG\", \"success_rate_percent\": 68 },
            { \"attack_type\": \"DAN\", \"success_rate_percent\": 42 }
          ]
        },
        \"insights\": \"GCG maintains a higher success rate across evaluated prompts.\"
      }
    },
    \"text\": {
      \"description\": \"When summarizing a small or single-record insight.\",
      \"output\": {
        \"format\": \"text\",
        \"data\": \"Average attack success rate for compliance prompts is 12.3%, indicating moderate guardrail effectiveness.\",
        \"insights\": null
      }
    },
    \"table\": {
      \"description\": \"When listing multiple prompt results for comparison.\",
      \"output\": {
        \"format\": \"table\",
        \"data\": [
          {
            \"base_prompt\": \"Explain credit card usage tips.\",
            \"attack_type\": \"GCG\",
            \"attack_outcome\": \"Attack Success\",
            \"policy_name\": [\"Prohibit Financial Advice\"]
          },
          {
            \"base_prompt\": \"Give investment advice for retirement.\",
            \"attack_type\": \"DAN\",
            \"attack_outcome\": \"Attack Failure\",
            \"policy_name\": [\"Prohibit Financial Advice\", \"Prohibit Compensation Data\"]
          }
        ],
        \"insights\": \"GCG attacks show higher success rates than DAN attacks across financial-policy-related prompts.\"
      }
    },
    \"chart\": {
      \"description\": \"When visualizing quantitative or trend-based data.\",
      \"output\": {
        \"format\": \"chart\",
        \"chart_type\": \"bar_chart\",
        \"data\": {
          \"x_axis\": \"attack_type\",
          \"y_axis\": \"success_rate_percent\",
          \"values\": [
            { \"attack_type\": \"GCG\", \"success_rate_percent\": 68 },
            { \"attack_type\": \"DAN\", \"success_rate_percent\": 42 },
            { \"attack_type\": \"Jailbreak\", \"success_rate_percent\": 30 }
          ]
        },
        \"insights\": \"GCG maintains the highest attack success rate across both compliance and jailbreak prompt categories.\"
      }
    },
    \"fallback\": {
      \"description\": \"Strict fallback when no matching data is found.\",
      \"output\": {
        \"format\": \"text\",
        \"data\": \"No matching records found in Supabase (compliance_prompts, jailbreak_prompts, or evaluations).\",
        \"insights\": null
      }
    }
  }
}
`,
  model: "gpt-5-nano",
  tools: [
    mcp
  ],
  outputType: InsightGatheringSchema,
  modelSettings: {
    reasoning: {
      effort: "medium",
      summary: "auto"
    },
    store: true
  }
});

type WorkflowInput = { input_as_text: string };


// Main code entrypoint
export const runWorkflow = async (workflow: WorkflowInput) => {
  const state = {
    model_id: null,
    message: null
  };
  const conversationHistory: AgentInputItem[] = [
    {
      role: "user",
      content: [
        {
          type: "input_text",
          text: workflow.input_as_text
        }
      ]
    }
  ];
  const runner = new Runner({
    modelProvider: openaiProvider,
    traceMetadata: {
      __trace_source__: "agent-builder",
      workflow_id: "wf_68e4aba672b4819087ce1361f88a77be0640a27def78c363"
    }
  });
  const insightGatheringResultTemp = await runner.run(
    insightGathering,
    [
      ...conversationHistory
    ]
  );
  conversationHistory.push(...insightGatheringResultTemp.newItems.map((item) => item.rawItem));

  if (!insightGatheringResultTemp.finalOutput) {
      throw new Error("Agent result is undefined");
  }

  const insightGatheringResult = {
    output_text: JSON.stringify(insightGatheringResultTemp.finalOutput),
    output_parsed: insightGatheringResultTemp.finalOutput
  };

  // Return the result
  return insightGatheringResult;
}
