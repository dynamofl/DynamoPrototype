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
   * @returns Agent response with structured insight data
   */
  static async sendMessage(
    message: string,
    evaluationId?: string
  ): Promise<AgentServiceResponse> {
    try {
      console.log("Agent query:", message, "Evaluation:", evaluationId);

      // Call the FastAPI endpoint
      const response = await fetch(`${AGENT_API_URL}/api/insight`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          evaluationId,
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

      // The agent returns title, type, and data (stringified JSON)
      // Parse the data field which contains the actual response structure
      const parsedData = JSON.parse(agentOutput.data);

      // Map type to format (the agent uses 'string' but instructions use 'text')
      const format = agentOutput.type === "string" ? "text" : agentOutput.type;

      // Construct the InsightResponse
      const insightResponse: InsightResponse = {
        title: agentOutput.title,
        format,
        ...parsedData,
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
