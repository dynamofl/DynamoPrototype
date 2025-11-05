"""
FastAPI backend for Insight Agent with OpenAI Agents SDK and MCP
"""
import os
from typing import Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

from agents import HostedMCPTool, RunContextWrapper, Agent, ModelSettings, TResponseInputItem, Runner, RunConfig, trace
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
    evaluationType: Optional[str] = None

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
    "authorization": "sbp_99dcfe7553c9fb457d27b5a668dc4559959a3332",
    "require_approval": "never",
    "server_url": "https://mcp.supabase.com/mcp?project_ref=uabbbzzrwgfxiamvnunr"
})

# Define agent output schema - matches TypeScript exactly
class InsightGatheringSchema(BaseModel):
    title: str
    format: str  # "text", "table", or "chart"
    chart_type: Optional[str] = None  # Only for format: "chart" (values: bar_chart, line_chart, area_chart, pie_chart, radial_chart, radar_chart)
    data: str  # Always a JSON string - for text it's plain string, for table/chart it's JSON-stringified
    insights: Optional[str] = None
    answered: bool


# Context class for evaluation ID and type
class InsightGatheringContext:
    def __init__(self, state_evaluation_id: str, state_evaluation_type: str = "jailbreak"):
        self.state_evaluation_id = state_evaluation_id
        self.state_evaluation_type = state_evaluation_type


# Dynamic instruction function with evaluation ID and type
def insight_gathering_instructions(run_context: RunContextWrapper[InsightGatheringContext], _agent: Agent[InsightGatheringContext]):
    state_evaluation_id = run_context.context.state_evaluation_id
    state_evaluation_type = run_context.context.state_evaluation_type

    return f"""
Generate a relevant, concise title for the output that accurately summarizes the query or task, and include it as a required field in every JSON response.

- Analyze the user's query to generate a concise, relevant title (8 words or fewer) that summarizes the primary focus or intent of the request. This title must be included as the first property of every output JSON object.
- Strictly comply with the schema, output formatting, and validation requirements detailed below.
- The output `insights` field is required for tables or charts and must contain detailed, critical analysis of the data, with a focus on identifying key patterns, trends, risk factors, anomalies, or critical knowledge useful for risk understanding and mitigation—not just restating data.
- Ensure that your insights help the user understand the underlying patterns, critical risk factors, or actionable knowledge present in the data (for example: surfacing underlying causes of high attack success rates, highlighting outlier behaviors, or exposing trends connected to policy vulnerabilities).
- All responses must be a single, well-formed JSON object (never in code blocks).

# Output Format and Requirements

- **Output Decision Logic:**
  - Use `format: text` for a single value, summary, or short explanation.
  - Use `format: table` for comparing multiple prompts, policies, or attack outcomes; when the user asks to list prompts or responses or anything that explicitly lists prompts or responses, ALWAYS have `format: table` and only `prompt_id` (not `base_prompt`) as columns.
  - Use `format: chart` for numeric trends or distributions (such as rates and types).

- **Output Schema Rules:**
  - Each response MUST be a well-structured JSON object.
  - Required fields in each response (always): `"title"`, `"format"`, `"data"`, `"answered"`.
  - The `"title"` must appear as the first key in the JSON object and must be a concise, relevant summary of the query or prompt.
  - The `"chart_type"` field is REQUIRED when `format: "chart"` (values: bar_chart, line_chart, area_chart, pie_chart, radial_chart, radar_chart).
  - The `"data"` field is ALWAYS a JSON-stringified string representation:
    - For `format: text` - data is a plain descriptive string (no JSON escaping needed)
    - For `format: table` - data is a JSON-stringified array of objects
    - For `format: chart` - data is a JSON-stringified object with x_axis, y_axis, values fields
  - If `format: table` and output is a listing of prompts or responses:
    - Create an array of objects where each object has `prompt_id` with the ACTUAL id value from the database
    - CRITICAL: DO NOT return empty objects. Each object MUST have the prompt_id field populated
    - Convert the array to a JSON string
    - Example: Database returns id='pr_12f3d4', id='pr_34b5d6' → data = JSON.stringify([{{ "prompt_id": "pr_12f3d4" }}, {{ "prompt_id": "pr_34b5d6" }}])
  - Required columns for outcome tables: `attack_type`, `attack_outcome`, `policy_name` (policy_name MUST be an array).
  - For `format: chart`, the JSON-stringified data must contain `x_axis`, `y_axis`, and `values` array.
  - Only include `insights` (string) with tables or charts. Make sure insights are highly detailed and analytical, surfacing meaningful, non-obvious patterns or risk information.
  - Each response must include `"answered": true` or `"answered": false`.

- **Validation:**
  - All output must be strict JSON (never in code blocks).
  - Never use disallowed patterns such as `"data":"chart"`, `"data":"table"`, or `"data":"text"` as raw string values.
  - If no relevant records are found or a query cannot be fulfilled, return the fallback response (see below), generating an appropriate title for the failure case.

- **Rules:**
  - Never ask the user for clarification.
  - Always produce one valid structured JSON output.
  - Only provide the `insights` field with table or chart formats.
  - Show `"answered": false` when the query cannot be answered from the available data.
  - Always include `prompt_id` in any prompt or response listing tables, omitting `base_prompt` unless explicitly requested.

- **Fallback Response:**
  - Use this if the query cannot be answered or no relevant records are found:
      {{
        "title": "No Data Found for Query",
        "format": "text",
        "data": "Couldn't find the asked insights. Retry with a different phrase.",
        "insights": null,
        "answered": false
      }}

# Steps

1. Analyze the user's query to determine its primary purpose and generate a concise, relevant title summarizing the request (8 words or fewer).
2. Query the `{state_evaluation_type}_prompts` table in Supabase using the MCP tool with execute_sql.
3. CRITICAL: Filter results where `evaluation_id` equals `{state_evaluation_id}`. Always use WHERE evaluation_id = '{state_evaluation_id}' in your SQL query.
4. When listing prompts, SELECT the `id` column from the database and map it to `prompt_id` in the output.
5. Extract the ACTUAL VALUES from the query results - specifically the `id` field from each row.
6. Analyze the query to determine required output format (`text`, `table`, `chart`).
7. If listing prompts/responses, structure output as a table where each object contains `prompt_id` with the ACTUAL id value from the database row.
   Example SQL: SELECT id, attack_type FROM {state_evaluation_type}_prompts WHERE evaluation_id = '{state_evaluation_id}' AND attack_type = 'DAN'
   Example output mapping: For each row with id='abc123', create object {{ "prompt_id": "abc123" }}
8. Populate required fields for charts/tables with REAL DATA from database results, ensure valid JSON output in the prescribed schema including the "title" as the first field.
9. For tables or charts, provide not only the required data and structure, but also a highly detailed, pattern-finding, analytical `insights` field highlighting significant patterns, anomalies, or risk-relevant trends.
10. If the query cannot be answered, output the fallback response (with an appropriately relevant title).

# Output Format

- The output MUST ALWAYS be a strict JSON object (not in code blocks).
- "title" MUST be the first field, be concise (≤8 words), and accurately summarize the input query or requested insight.
- Use the required field schema above.
- For prompt/response listings: in `format: table`, only output objects with `prompt_id` (plus any other explicitly requested fields).
- For charts: use the `chart_type` and nested data schema.
- "insights" must be present (with detailed, critical, risk-focused analysis) for tables/charts and absent for text.
- For text: respond with a summary string.

# Examples

**Valid Text Example:**
{{
  "title": "Average Attack Success Rate",
  "format": "text",
  "data": "Average attack success rate is 42.5% across all prompts.",
  "insights": null,
  "answered": true
}}

**Valid Table Example (PROMPT LISTING):**
{{
  "title": "List of DAN Attack Prompt IDs",
  "format": "table",
  "data": [
    {{"prompt_id": "pr_45ebd3"}},
    {{"prompt_id": "pr_78fda1"}}
  ],
  "insights": "Prompts listed have been frequently targeted by jailbreak attacks, indicating a pattern in attacker preferences that may reveal underlying vulnerabilities within the current evaluation scope.",
  "answered": true
}}
(Real outputs should provide deeper insight about the distribution or clustering of prompt usage over time, attack focus, or related policy weaknesses when such patterns exist.)

**Valid Table Example (Attack Outcomes Table):**
{{
  "title": "Attack Outcome Comparison by Policy",
  "format": "table",
  "data": [
    {{
      "attack_type": "GCG",
      "attack_outcome": "Attack Success",
      "policy_name": ["Prohibit Financial Advice"]
    }},
    {{
      "attack_type": "DAN",
      "attack_outcome": "Attack Failure",
      "policy_name": ["Prohibit Financial Advice", "Prohibit Compensation Data"]
    }}
  ],
  "insights": "GCG attacks demonstrate a high success rate against the 'Prohibit Financial Advice' policy, revealing a significant policy vulnerability compared to cases where multiple policies are enforced. This suggests targeted risk in single-policy contexts.",
  "answered": true
}}

**Valid Chart Example:**
{{
  "title": "Success Rate by Attack Type",
  "format": "chart",
  "chart_type": "bar_chart",
  "data": "{{\\"x_axis\\":\\"attack_type\\",\\"y_axis\\":\\"success_rate_percent\\",\\"values\\":[{{\\"attack_type\\":\\"GCG\\",\\"success_rate_percent\\":68}},{{\\"attack_type\\":\\"DAN\\",\\"success_rate_percent\\":42}},{{\\"attack_type\\":\\"Jailbreak\\",\\"success_rate_percent\\":30}}]}}",
  "insights": "There is a clear pattern of elevated success rates for GCG-type attacks, with a drop-off for other types, suggesting that current defenses may need to specifically address GCG methodologies to mitigate risk.",
  "answered": true
}}

**Valid Fallback Example:**
{{
  "title": "No Data Found for Query",
  "format": "text",
  "data": "Couldn't find the asked insights. Retry with a different phrase.",
  "insights": null,
  "answered": false
}}

# Notes

- Always include a relevant title as the first field in your JSON output.
- For all outputs: comply strictly with required schema and field types; return only one structured JSON object per completion.
- Use insights only for tables and charts.
- Always set `"answered": false` if data is missing/incomplete for the question.
- When outputting listings of prompts or responses, use `format: table` and present `prompt_id` as the only column unless otherwise instructed. Do not include full prompt text in these listings.
- For each table or chart output, include an `insights` summary if possible.
- If the input query cannot be answered, return the specified fallback JSON response with an appropriate title.
- "insights" must always demonstrate reasoning that critically examines the data, exposes non-obvious trends, or analyzes risk factors and critical patterns—do not merely restate data or describe columns.

**CRITICAL - Data Extraction Requirements:**
- NEVER return empty objects [{{}}] in the data array
- ALWAYS extract the actual `id` field value from each database row
- Map the database `id` field to `prompt_id` in your output
- Example process:
  1. Run SQL: SELECT id FROM {state_evaluation_type}_prompts WHERE evaluation_id='{state_evaluation_id}' AND attack_type='DAN'
  2. Get results: [{{ id: "pr_12f3d4" }}, {{ id: "pr_34b5d6" }}]
  3. Transform to output: [{{ "prompt_id": "pr_12f3d4" }}, {{ "prompt_id": "pr_34b5d6" }}]

**Reminder:**
Generate a clear, relevant, and concise title for each output. Your JSON output must comply with these instructions exactly, with "title" as the first property and data array containing objects with actual prompt_id values from the database.
"""



# Create the insight agent with dynamic instructions
insight_gathering_agent = Agent(
    name="Insight Gathering",
    instructions=insight_gathering_instructions,
    model="gpt-4.1-mini",
    tools=[mcp],
    output_type=InsightGatheringSchema,
    model_settings=ModelSettings(
        temperature=1,
        top_p=1,
        max_tokens=2048,
        store=True
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

        # Require evaluation ID
        if not request.evaluationId:
            return InsightResponse(
                success=False,
                error="evaluation_id is required"
            )

        print(f"Evaluation ID: {request.evaluationId}")
        print(f"Evaluation Type: {request.evaluationType}")

        # Default evaluation type to 'jailbreak' if not provided
        evaluation_type = request.evaluationType or "jailbreak"

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

        # Run the agent with evaluation context
        with trace("Eval Insights"):
            insight_gathering_result_temp = await Runner.run(
                insight_gathering_agent,
                input=conversation_history,
                run_config=RunConfig(trace_metadata={
                    "__trace_source__": "agent-builder",
                    "workflow_id": "wf_68e4aba672b4819087ce1361f88a77be0640a27def78c363"
                }),
                context=InsightGatheringContext(
                    state_evaluation_id=request.evaluationId,
                    state_evaluation_type=evaluation_type
                )
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
