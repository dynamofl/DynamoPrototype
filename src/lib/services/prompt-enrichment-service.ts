/**
 * Prompt Enrichment Service
 * Enriches table data containing prompt_id by fetching full prompt details from backend
 */

import { EvaluationService } from '@/lib/supabase/evaluation-service';
import type { EnrichedPromptData, PromptEnrichmentOptions, EnrichmentResult } from './types';

// Simple in-memory cache for enriched data
const enrichmentCache = new Map<string, Map<string, EnrichedPromptData>>();

export class PromptEnrichmentService {
  /**
   * Check if table data contains prompt_id column
   */
  static hasPromptIdColumn(tableData: any[]): boolean {
    if (!Array.isArray(tableData) || tableData.length === 0) {
      return false;
    }

    const firstRow = tableData[0];
    return typeof firstRow === 'object' && 'prompt_id' in firstRow;
  }

  /**
   * Extract unique prompt IDs from table data
   */
  static extractPromptIds(tableData: any[]): string[] {
    if (!Array.isArray(tableData)) {
      return [];
    }

    const uniqueIds = new Set<string>();
    tableData.forEach((row) => {
      if (row.prompt_id) {
        uniqueIds.add(row.prompt_id);
      }
    });

    return Array.from(uniqueIds);
  }

  /**
   * Enrich table data with full prompt details
   * Fetches prompt data from backend and merges with existing table data
   */
  static async enrichTableData(
    tableData: any[],
    options: PromptEnrichmentOptions
  ): Promise<EnrichmentResult> {
    const logPrefix = `[PromptEnrichment] Eval: ${options.evaluationId}`;

    try {
      console.log(`${logPrefix} Starting enrichment process...`);

      // Check if enrichment is needed
      if (!this.hasPromptIdColumn(tableData)) {
        console.log(`${logPrefix} No prompt_id column detected, skipping enrichment`);
        return { success: true, enrichedData: {} };
      }

      // Extract unique prompt IDs
      const promptIds = this.extractPromptIds(tableData);
      console.log(`${logPrefix} Extracted ${promptIds.length} unique prompt IDs:`, promptIds);

      if (promptIds.length === 0) {
        console.log(`${logPrefix} No prompt IDs found, skipping enrichment`);
        return { success: true, enrichedData: {} };
      }

      // Check cache first
      const cacheKey = `${options.evaluationId}`;
      let cachedData = enrichmentCache.get(cacheKey);
      const neededIds = cachedData
        ? promptIds.filter((id) => !cachedData!.has(id))
        : promptIds;

      console.log(`${logPrefix} Cache check:`, {
        hasCachedData: !!cachedData,
        cachedCount: cachedData?.size || 0,
        neededIds: neededIds.length,
      });

      if (neededIds.length === 0 && cachedData) {
        // All data is cached
        console.log(`${logPrefix} All data found in cache, returning cached results`);
        return { success: true, enrichedData: Object.fromEntries(cachedData) };
      }

      // Fetch results for this evaluation
      console.log(`${logPrefix} Fetching evaluation results for ${neededIds.length} needed IDs...`);
      const results = await EvaluationService.getEvaluationResults(
        options.evaluationId
      );

      console.log(`${logPrefix} Fetch results:`, {
        resultType: typeof results,
        isArray: Array.isArray(results),
        resultCount: Array.isArray(results) ? results.length : 'N/A',
      });

      if (!results || !Array.isArray(results)) {
        const errorMsg = `Results is not an array. Type: ${typeof results}, Value: ${JSON.stringify(results).substring(0, 100)}`;
        console.error(`${logPrefix} ${errorMsg}`);
        return {
          success: false,
          error: `Failed to fetch evaluation results: ${errorMsg}`,
          failedPromptIds: promptIds,
        };
      }

      console.log(`${logPrefix} Processing ${results.length} evaluation results...`);

      // Create map of prompt_id -> enriched data
      const enrichedMap = new Map<string, EnrichedPromptData>();

      results.forEach((result: any, index: number) => {
        const promptId = result.id;

        // Extract relevant fields from result
        const enrichedData: EnrichedPromptData = {
          prompt_id: promptId,
          base_prompt: result.base_prompt || '',
          topic: result.topic || '',
          attack_type: result.attack_type || result.perturbation_type || '',
          attack_outcome: result.attack_outcome || result.final_outcome || '',
        };

        enrichedMap.set(promptId, enrichedData);

        if (index < 3) {
          console.log(`${logPrefix} Sample result ${index + 1}:`, enrichedData);
        }
      });

      console.log(`${logPrefix} Mapped ${enrichedMap.size} prompts for enrichment`);

      // Update cache
      if (!cachedData) {
        cachedData = new Map();
        enrichmentCache.set(cacheKey, cachedData);
      }

      enrichedMap.forEach((data, id) => {
        cachedData!.set(id, data);
      });

      // Track failed IDs
      const failedIds = promptIds.filter((id) => !enrichedMap.has(id));

      if (failedIds.length > 0) {
        console.warn(`${logPrefix} ${failedIds.length} prompt IDs not found in results:`, failedIds);
      }

      console.log(`${logPrefix} Enrichment complete. Success: ${failedIds.length === 0}`);

      return {
        success: failedIds.length === 0,
        enrichedData: Object.fromEntries(enrichedMap),
        failedPromptIds: failedIds.length > 0 ? failedIds : undefined,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error during enrichment';
      const stack = error instanceof Error ? error.stack : '';
      console.error(`${logPrefix} ERROR:`, { errorMessage, stack });

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Merge enriched data back into table rows
   * Adds enriched columns to original table data
   */
  static mergeEnrichedData(
    originalData: any[],
    enrichedMap: Record<string, EnrichedPromptData>
  ): any[] {
    if (!Array.isArray(originalData)) {
      return originalData;
    }

    return originalData.map((row) => {
      if (!row.prompt_id || !enrichedMap[row.prompt_id]) {
        return row;
      }

      const enrichedData = enrichedMap[row.prompt_id];

      // Merge enriched fields into row, prioritizing enriched data
      return {
        ...row,
        base_prompt: enrichedData.base_prompt,
        topic: enrichedData.topic,
        attack_type: enrichedData.attack_type,
        attack_outcome: enrichedData.attack_outcome,
      };
    });
  }

  /**
   * Clear cache for a specific evaluation or all cache
   */
  static clearCache(evaluationId?: string): void {
    if (evaluationId) {
      enrichmentCache.delete(evaluationId);
    } else {
      enrichmentCache.clear();
    }
  }
}
