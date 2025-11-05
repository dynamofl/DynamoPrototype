/**
 * Types for service layer utilities
 */

/**
 * Enriched prompt data fetched from backend
 * This is the full data for a prompt including all metadata
 */
export interface EnrichedPromptData {
  prompt_id: string;
  base_prompt: string;
  topic: string;
  attack_type: string;
  attack_outcome: string;
  [key: string]: any; // Allow additional fields from backend
}

/**
 * Options for prompt enrichment
 */
export interface PromptEnrichmentOptions {
  evaluationId: string;
  evaluationType?: 'jailbreak' | 'compliance';
  promptIds: string[];
}

/**
 * Result of enrichment operation
 */
export interface EnrichmentResult {
  success: boolean;
  enrichedData?: Record<string, EnrichedPromptData>;
  error?: string;
  failedPromptIds?: string[];
}

/**
 * Table cell render context
 */
export interface TableCellRenderContext {
  value: any;
  rowData: Record<string, any>;
  columnKey: string;
}
