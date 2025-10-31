import type { AgentServiceResponse, InsightResponse, InsightGatheringOutput } from "./types";

// FastAPI endpoint
const AGENT_API_URL = import.meta.env.VITE_AGENT_API_URL || 'http://localhost:8000';

/**
 * Service for interacting with the Insight Agent via FastAPI backend
 *
 * This calls the FastAPI service which runs the OpenAI Agent with MCP tools.
 */
export class InsightAgentService {
  /**
   * Send a message to the insight gathering agent
   *
   * @param message - User's query message
   * @param evaluationId - Optional evaluation ID for context
   * @param evaluationType - Optional evaluation type (jailbreak or compliance)
   * @returns Agent response with structured insight data
   */
  static async sendMessage(
    message: string,
    evaluationId?: string,
    evaluationType?: string
  ): Promise<AgentServiceResponse> {
    try {
      console.log("Agent query:", message, "Evaluation:", evaluationId, "Type:", evaluationType);

      // Call the FastAPI endpoint
      const response = await fetch(`${AGENT_API_URL}/api/insight`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          evaluationId,
          evaluationType,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Edge function error response:', errorText);
        throw new Error(`Edge function error (${response.status}): ${errorText}`);
      }

      const result = await response.json();
      console.log('Edge function result:', result);

      if (!result.success) {
        throw new Error(result.error || 'Unknown error from edge function');
      }

      // Parse the agent output
      const agentOutput: InsightGatheringOutput = result.output_parsed;

      // Determine the format (backend uses different type names)
      const rawType = agentOutput.type;
      const format = rawType === "string" ? "text" : rawType as "text" | "table" | "chart";

      // For text type, data is already a plain string
      // For table/chart types, data might be stringified JSON
      let responseData: any;

      if (rawType === "string") {
        // Text type - data is already a string
        responseData = {
          data: agentOutput.data,
          insights: null,
        };
      } else {
        // Table or chart type - parse data if it's a string
        try {
          let parsedData = agentOutput.data;

          // If data is a string, parse it
          if (typeof agentOutput.data === 'string') {
            parsedData = JSON.parse(agentOutput.data);
          }

          // Set the response data with parsed content
          responseData = {
            data: parsedData,
            insights: null,
          };
        } catch (error) {
          console.error("Failed to parse data:", error);
          responseData = { data: agentOutput.data };
        }
      }

      // Construct the InsightResponse
      const insightResponse: InsightResponse = {
        title: agentOutput.title,
        format,
        ...responseData,
      };

      return {
        success: true,
        response: insightResponse,
      };
    } catch (error) {
      console.error("Agent service error:", error);

      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get response from agent",
      };
    }
  }

  /**
   * Validate and parse agent response
   *
   * @param response - Raw response from agent
   * @returns Parsed InsightResponse or null if invalid
   */
  static parseAgentResponse(response: unknown): InsightResponse | null {
    try {
      // Validate response structure
      if (
        typeof response !== "object" ||
        response === null ||
        !("format" in response) ||
        !("data" in response)
      ) {
        return null;
      }

      const { format, data, insights } = response as {
        format: string;
        data: unknown;
        insights?: string | null;
      };

      // Validate format
      if (!["text", "table", "chart"].includes(format)) {
        return null;
      }

      return response as InsightResponse;
    } catch (error) {
      console.error("Failed to parse agent response:", error);
      return null;
    }
  }
}
