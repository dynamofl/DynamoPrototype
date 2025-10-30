"""
FastAPI backend for Insight Agent with OpenAI Agents SDK and MCP
"""
import os
from typing import Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

from agents import HostedMCPTool, Agent, ModelSettings, TResponseInputItem, Runner, RunConfig, trace
from openai.types.shared.reasoning import Reasoning

# Load environment variables
load_dotenv()

app = FastAPI(title="Insight Agent API", version="1.0.0")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"],  # Add your frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request/Response models
class InsightRequest(BaseModel):
    message: str
    evaluationId: Optional[str] = None

class InsightResponse(BaseModel):
    success: bool
    output_text: Optional[str] = None
    output_parsed: Optional[dict] = None
    error: Optional[str] = None


# Get environment variables
openai_api_key = os.getenv("OPENAI_API_KEY")
supabase_service_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not openai_api_key:
    raise ValueError("OPENAI_API_KEY environment variable is required")
if not supabase_service_key:
    raise ValueError("SUPABASE_SERVICE_ROLE_KEY environment variable is required")

# Configure MCP tool for Supabase
# Use direct bearer token from environment variable
auth_string = supabase_service_key

mcp = HostedMCPTool(tool_config={
    "type": "mcp",
    "server_label": "supabase_server",
    "allowed_tools": [
        "search_docs",
        "list_tables",
        "execute_sql",
        "get_logs",
        "get_project_url"
    ],
    "authorization": auth_string,
    "require_approval": "never",
    "server_url": "https://mcp.supabase.com/mcp?project_ref=uabbbzzrwgfxiamvnunr"
})

# Define agent output schema
class InsightGatheringSchema(BaseModel):
    title: str
    type: str
    data: str

# Create the insight agent
insight_gathering = Agent(
    name="Insight Gathering",
    instructions="""{
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
        \"data\\":\"chart\",
        \"data\\":\"table\",
        \"data\\":\"text\"
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
""",
    model="gpt-5-nano",
    tools=[mcp],
    output_type=InsightGatheringSchema,
    model_settings=ModelSettings(
        store=True,
        reasoning=Reasoning(
            effort="medium",
            summary="auto"
        )
    )
)


@app.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "healthy", "service": "insight-agent-api"}


@app.post("/api/insight", response_model=InsightResponse)
async def get_insight(request: InsightRequest):
    """
    Get AI-powered insights from evaluation data
    """
    try:
        print(f"Processing query: {request.message}")

        # Create conversation history
        conversation_history: list[TResponseInputItem] = [
            {
                "role": "user",
                "content": [
                    {
                        "type": "input_text",
                        "text": request.message
                    }
                ]
            }
        ]

        # Run the agent
        with trace("Eval Insights"):
            insight_gathering_result_temp = await Runner.run(
                insight_gathering,
                input=conversation_history,
                run_config=RunConfig(trace_metadata={
                    "__trace_source__": "agent-builder",
                    "workflow_id": "wf_68e4aba672b4819087ce1361f88a77be0640a27def78c363"
                })
            )

        if not insight_gathering_result_temp.final_output:
            raise HTTPException(
                status_code=500,
                detail="Agent did not produce a final output"
            )

        print(f"Agent result: {insight_gathering_result_temp.final_output}")

        return InsightResponse(
            success=True,
            output_text=insight_gathering_result_temp.final_output.json(),
            output_parsed=insight_gathering_result_temp.final_output.model_dump()
        )

    except Exception as e:
        print(f"Error processing insight request: {str(e)}")
        import traceback
        traceback.print_exc()
        return InsightResponse(
            success=False,
            error=str(e)
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
