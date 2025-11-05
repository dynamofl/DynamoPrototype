import type { InsightResponse } from "@/lib/agents/types";

/**
 * Parsed response from the agent, with data properly typed and ready to use
 */
export type ParsedInsightResponse =
  | {
      format: "text";
      title: string;
      data: string;
      insights?: string;
      answered: boolean;
    }
  | {
      format: "table";
      title: string;
      data: Array<Record<string, any>>;
      insights?: string;
      answered: boolean;
    }
  | {
      format: "chart";
      title: string;
      chart_type: "bar_chart" | "line_chart" | "area_chart" | "pie_chart" | "radial_chart" | "radar_chart";
      data: {
        x_axis: string;
        y_axis: string;
        values: Array<Record<string, string | number>>;
      };
      insights?: string;
      answered: boolean;
    };

/**
 * Safely parses JSON, handling both single and double-stringified content
 * Keeps parsing until we get a non-string value
 *
 * @param value - Value to parse (can be string or object)
 * @returns Parsed value (object, array, or string if not JSON)
 */
function parseJSON(value: any): any {
  if (typeof value !== "string") {
    return value;
  }

  try {
    let parsed = JSON.parse(value);

    // Keep parsing if result is still a string (handles double-stringification)
    while (typeof parsed === "string") {
      parsed = JSON.parse(parsed);
    }

    return parsed;
  } catch {
    // If parsing fails, return the original value
    return value;
  }
}

/**
 * Parses the raw InsightResponse from the agent and formats it into properly typed objects
 * Handles JSON string parsing based on format type, including double-stringified data
 *
 * @param response - Raw InsightResponse from the agent
 * @returns ParsedInsightResponse with properly typed data
 * @throws Error if data cannot be parsed or is invalid
 */
export function parseAgentResponse(response: InsightResponse): ParsedInsightResponse {
  try {
    // Handle text format - data is plain string, no parsing needed
    if (response.format === "text") {
      return {
        format: "text",
        title: response.title,
        data: response.data as string,
        insights: response.insights || undefined,
        answered: (response as any).answered ?? true,
      };
    }

    // Handle table format - data is JSON stringified array (may be double-stringified)
    if (response.format === "table") {
      const tableData = parseJSON(response.data);

      if (!Array.isArray(tableData)) {
        throw new Error(`Table data must be an array, got ${typeof tableData}`);
      }

      return {
        format: "table",
        title: response.title,
        data: tableData,
        insights: response.insights || undefined,
        answered: (response as any).answered ?? true,
      };
    }

    // Handle chart format - data is JSON stringified object with chart metadata (may be double-stringified)
    if (response.format === "chart") {
      console.log("Parsing chart response. Raw response:", response);
      console.log("Raw data type:", typeof response.data);

      const chartData = parseJSON(response.data);

      console.log("After parseJSON, chartData type:", typeof chartData, "keys:",
        typeof chartData === "object" && chartData ? Object.keys(chartData) : "N/A");

      // Validate chart data structure
      if (!chartData || typeof chartData !== "object") {
        throw new Error(`Chart data must be a valid object, got ${typeof chartData}`);
      }

      // Extract chart_type - try multiple ways to access it
      let chartType: string | undefined;

      // Try 1: Direct property access
      if ((response as any).chart_type) {
        chartType = (response as any).chart_type;
        console.log("Found chart_type via direct property:", chartType);
      }
      // Try 2: Object.keys search
      else if (Object.keys(response).find(key => key === "chart_type")) {
        chartType = (Object.entries(response).find(([key]) => key === "chart_type")?.[1] as string);
        console.log("Found chart_type via Object.keys:", chartType);
      }
      // Try 3: Within chart data
      else if (chartData.chart_type) {
        chartType = chartData.chart_type;
        console.log("Found chart_type within chart data:", chartType);
      }
      // Default fallback
      else {
        chartType = "bar_chart";
        console.warn("chart_type not found, defaulting to bar_chart");
      }

      console.log("Final extracted chart_type:", chartType);

      if (!chartData.x_axis || !chartData.y_axis || !Array.isArray(chartData.values)) {
        throw new Error(
          `Chart data must contain x_axis, y_axis, and values array. Got: x_axis=${chartData.x_axis}, y_axis=${chartData.y_axis}, values=${Array.isArray(chartData.values) ? "array" : typeof chartData.values}`
        );
      }

      const parsed = {
        format: "chart" as const,
        title: response.title,
        chart_type: chartType as "bar_chart" | "line_chart" | "area_chart" | "pie_chart" | "radial_chart" | "radar_chart",
        data: {
          x_axis: chartData.x_axis,
          y_axis: chartData.y_axis,
          values: chartData.values,
        },
        insights: response.insights || undefined,
        answered: (response as any).answered ?? true,
      };

      console.log("Parsed chart response:", parsed);
      return parsed;
    }

    throw new Error(`Unknown format: ${response.format}`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Failed to parse agent response:", errorMessage);
    throw new Error(`Failed to parse agent response: ${errorMessage}`);
  }
}

/**
 * Safely parses agent response, returning a fallback text response on error
 * Useful for rendering something even if parsing fails
 *
 * @param response - Raw InsightResponse from the agent
 * @returns ParsedInsightResponse or fallback text response
 */
export function parseAgentResponseSafe(response: InsightResponse): ParsedInsightResponse {
  try {
    return parseAgentResponse(response);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error parsing agent response, using fallback:", errorMessage);

    return {
      format: "text",
      title: response.title || "Error Processing Response",
      data: `Failed to process response: ${errorMessage}`,
      answered: false,
    };
  }
}
