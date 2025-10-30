import { z } from "zod";

// Schema for agent insight responses (matches OpenAI Agent SDK output)
export const InsightGatheringSchema = z.object({
  title: z.string(),
  type: z.enum(["string", "chart", "table"]),
  data: z.string(), // This is a stringified JSON
});

export type InsightGatheringOutput = z.infer<typeof InsightGatheringSchema>;

// Parsed response types (after parsing the data string)
export type TextInsightResponse = {
  title: string;
  format: "text";
  data: string;
  insights?: string | null;
};

export type TableInsightResponse = {
  title: string;
  format: "table";
  data: Array<{
    base_prompt: string;
    attack_type: string;
    attack_outcome: string;
    policy_name: string[];
  }>;
  insights?: string;
};

export type ChartInsightResponse = {
  title: string;
  format: "chart";
  chart_type: "bar_chart" | "line_chart" | "area_chart" | "pie_chart" | "radial_chart" | "radar_chart";
  data: {
    x_axis: string;
    y_axis: string;
    values: Array<{
      [key: string]: string | number;
    }>;
  };
  insights?: string;
};

export type InsightResponse =
  | TextInsightResponse
  | TableInsightResponse
  | ChartInsightResponse;

// Message types for chat history
export type ChatMessage = {
  id: string;
  role: "user" | "agent";
  content: string;
  response?: InsightResponse;
  timestamp: Date;
  isLoading?: boolean;
  error?: string;
};

// Agent service response
export type AgentServiceResponse = {
  success: boolean;
  response?: InsightResponse;
  error?: string;
};
